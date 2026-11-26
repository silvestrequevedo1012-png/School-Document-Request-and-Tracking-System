from datetime import date, datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.document_request import DocumentRequest
from ..models.status_history import StatusHistory
from ..schemas.request import RequestCreate, CancelRequest
from ..schemas.request import DOCUMENT_TYPES
from ..utils.security import get_current_user
from ..services.request_service import change_status
from ..services.notification_service import create_notification
from ..services.email_service import send_request_submitted_email, send_cancelled_email

router = APIRouter(prefix="/api/requests", tags=["Requests"])


def serialize_request(db: Session, request: DocumentRequest):
    user = db.query(User).filter(User.id == request.user_id).first()
    return {
        "id": request.id,
        "request_id": request.request_id,
        "user_id": request.user_id,
        "requester_name": user.full_name if user else None,
        "document_type": request.document_type,
        "purpose": request.purpose,
        "number_of_copies": request.number_of_copies,
        "additional_notes": request.additional_notes,
        "preferred_release_date": request.preferred_release_date,
        "status": request.status,
        "submitted_at": request.submitted_at,
        "updated_at": request.updated_at,
        "release_date": request.release_date,
        "released_at": request.released_at,
        "cancellation_reason": request.cancellation_reason,
        "rejected_at": request.rejected_at,
        "rejection_reason": request.rejection_reason,
    }


@router.post("")
def create_request(payload: RequestCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.document_type not in DOCUMENT_TYPES:
        raise HTTPException(400, "Invalid document type")
    if payload.preferred_release_date and payload.preferred_release_date < date.today():
        raise HTTPException(400, "Preferred release date cannot be in the past")
    last = db.query(DocumentRequest).order_by(DocumentRequest.id.desc()).first()
    number = (int(last.request_id.split("-")[1]) + 1) if last else 1
    request = DocumentRequest(
        request_id=f"REQ-{number:06d}",
        user_id=user.id,
        document_type=payload.document_type,
        purpose=payload.purpose.strip(),
        number_of_copies=payload.number_of_copies,
        additional_notes=payload.additional_notes,
        preferred_release_date=payload.preferred_release_date,
        status="Pending",
    )
    db.add(request)
    db.flush()
    db.add(StatusHistory(request_id=request.id, previous_status=None, new_status="Pending", reason="Request submitted", changed_by=user.id))
    create_notification(db, user.id, request.id, "Request submitted", f"{request.request_id} - {request.document_type} was submitted successfully.")
    db.commit()
    db.refresh(request)
    send_request_submitted_email(db, request)
    return {"detail": "Request Submitted Successfully", "request_id": request.request_id, "request": serialize_request(db, request)}


@router.get("/history")
def history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: str = Query("All"),
    document: str = Query("All"),
    date_filter: str = Query("All"),
    date_from: date | None = None,
    date_to: date | None = None,
    search: str = "",
    sort: str = "newest",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(DocumentRequest)
    if user.role != "Administrator":
        query = query.filter(DocumentRequest.user_id == user.id)
    if status != "All":
        query = query.filter(DocumentRequest.status == status)
    if document != "All":
        query = query.filter(DocumentRequest.document_type == document)
    if search:
        query = query.filter(or_(DocumentRequest.request_id.ilike(f"%{search}%"), DocumentRequest.document_type.ilike(f"%{search}%")))
    today = date.today()
    if date_filter == "Today":
        query = query.filter(and_(DocumentRequest.submitted_at >= datetime.combine(today, datetime.min.time()), DocumentRequest.submitted_at < datetime.combine(today + timedelta(days=1), datetime.min.time())))
    elif date_filter == "Last 7 days":
        query = query.filter(DocumentRequest.submitted_at >= datetime.now(timezone.utc) - timedelta(days=7))
    elif date_filter == "Last 30 days":
        query = query.filter(DocumentRequest.submitted_at >= datetime.now(timezone.utc) - timedelta(days=30))
    elif date_filter == "Custom" and date_from and date_to:
        query = query.filter(and_(DocumentRequest.submitted_at >= datetime.combine(date_from, datetime.min.time()), DocumentRequest.submitted_at < datetime.combine(date_to + timedelta(days=1), datetime.min.time())))
    sort_options = {
        "oldest": DocumentRequest.submitted_at.asc(),
        "request_asc": DocumentRequest.request_id.asc(),
        "request_desc": DocumentRequest.request_id.desc(),
        "release_asc": DocumentRequest.release_date.asc(),
        "release_desc": DocumentRequest.release_date.desc(),
    }
    query = query.order_by(sort_options.get(sort, DocumentRequest.submitted_at.desc()))
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [serialize_request(db, item) for item in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, (total + page_size - 1) // page_size),
    }


@router.get("")
def list_requests(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(DocumentRequest)
    if user.role != "Administrator":
        query = query.filter(DocumentRequest.user_id == user.id)
    return [serialize_request(db, item) for item in query.order_by(DocumentRequest.submitted_at.desc()).all()]


@router.get("/{request_id}")
def request_detail(request_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    request = db.query(DocumentRequest).filter(DocumentRequest.request_id == request_id.upper()).first()
    if not request:
        raise HTTPException(404, "Request not found")
    if user.role != "Administrator" and request.user_id != user.id:
        raise HTTPException(403, "You cannot view another user's request")
    history = db.query(StatusHistory).filter(StatusHistory.request_id == request.id).order_by(StatusHistory.changed_at.asc()).all()
    result = serialize_request(db, request)
    result["status_history"] = history
    return result


@router.patch("/{request_id}/cancel")
def cancel_request(request_id: str, payload: CancelRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    request = db.query(DocumentRequest).filter(DocumentRequest.request_id == request_id.upper()).first()
    if not request:
        raise HTTPException(404, "Request not found")
    if user.role != "Administrator" and request.user_id != user.id:
        raise HTTPException(403, "You cannot cancel another user's request")
    if user.role != "Administrator" and request.status not in {"Pending", "On Hold"}:
        raise HTTPException(400, "This request can no longer be cancelled")
    change_status(db, request, "Cancelled", user.id, payload.reason)
    request.cancelled_at = datetime.now(timezone.utc)
    request.cancelled_by = user.id
    request.cancellation_reason = payload.reason
    create_notification(db, request.user_id, request.id, "Request cancelled", f"{request.request_id} was cancelled.")
    db.commit()
    db.refresh(request)
    send_cancelled_email(db, request)
    return serialize_request(db, request)
