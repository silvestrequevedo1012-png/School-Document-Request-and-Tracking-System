from datetime import date, datetime, timezone
from types import SimpleNamespace
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.document_request import DocumentRequest
from ..models.audit_log import AuditLog
from ..models.email_log import EmailLog
from ..schemas.request import RejectRequest, ReleaseDateUpdate
from ..schemas.admin import TestEmailRequest
from ..utils.security import require_admin
from ..services.request_service import change_status
from ..services.notification_service import create_notification
from ..services.email_service import (
    send_processing_email, send_hold_email, send_rejection_email,
    send_ready_for_claim_email, send_release_email, send_cancelled_email,
    send_release_date_changed_email, send_test_email,
)
from ..algorithms.queue import FIFOQueue
from ..algorithms.searching import linear_search_by_requester, binary_search_by_request_id
from ..algorithms.sorting import bubble_sort

router = APIRouter(prefix="/api/admin", tags=["Administration"])


def audit(db, admin, request, action, description):
    db.add(AuditLog(admin_id=admin.id, request_id=request.id if request else None, action=action, description=description))


def serialize(db, request):
    user = db.query(User).filter(User.id == request.user_id).first()
    return {
        "id": request.id, "request_id": request.request_id, "user_id": request.user_id,
        "requester_name": user.full_name if user else None, "document_type": request.document_type,
        "purpose": request.purpose, "number_of_copies": request.number_of_copies,
        "additional_notes": request.additional_notes, "preferred_release_date": request.preferred_release_date,
        "status": request.status, "submitted_at": request.submitted_at, "updated_at": request.updated_at,
        "release_date": request.release_date, "released_at": request.released_at,
        "cancellation_reason": request.cancellation_reason, "rejected_at": request.rejected_at,
        "rejection_reason": request.rejection_reason,
    }


def get_request(db, request_id):
    item = db.query(DocumentRequest).filter(DocumentRequest.request_id == request_id.upper()).first()
    if not item:
        raise HTTPException(404, "Request not found")
    return item


@router.get("/requests")
def admin_requests(status: str = "All", document: str = "All", search: str = "", page: int = 1, page_size: int = 10,
                   db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(DocumentRequest)
    if status != "All":
        query = query.filter(DocumentRequest.status == status)
    if document != "All":
        query = query.filter(DocumentRequest.document_type == document)
    if search:
        ids = db.query(User.id).filter(or_(User.full_name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
        query = query.filter(or_(DocumentRequest.request_id.ilike(f"%{search}%"), DocumentRequest.document_type.ilike(f"%{search}%"), DocumentRequest.user_id.in_(ids)))
    total = query.count()
    items = query.order_by(DocumentRequest.submitted_at.asc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"items": [serialize(db, item) for item in items], "total": total, "page": page, "page_size": page_size, "pages": max(1, (total + page_size - 1) // page_size)}


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    statuses = ["Pending", "Processing", "On Hold", "Ready for Claim", "Released", "Cancelled", "Rejected"]
    counts = {name: db.query(DocumentRequest).filter(DocumentRequest.status == name).count() for name in statuses}
    counts["total"] = db.query(DocumentRequest).count()
    pending = db.query(DocumentRequest).filter(DocumentRequest.status == "Pending").order_by(DocumentRequest.submitted_at.asc()).all()
    queue = FIFOQueue()
    for item in pending:
        queue.enqueue(serialize(db, item))
    return {"counts": counts, "queue": queue.all()}


@router.post("/requests/{request_id}/process")
def process_request(request_id: str = None, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if request_id is None:
        item = db.query(DocumentRequest).filter(DocumentRequest.status == "Pending").order_by(DocumentRequest.submitted_at.asc()).first()
    else:
        item = get_request(db, request_id)
    if not item:
        raise HTTPException(404, "There are no pending requests")
    change_status(db, item, "Processing", admin.id)
    create_notification(db, item.user_id, item.id, "Request processing", f"{item.request_id} is now being processed.")
    audit(db, admin, item, "PROCESS_REQUEST", "Changed status from Pending to Processing")
    db.commit()
    db.refresh(item)
    send_processing_email(db, item)
    return serialize(db, item)


@router.post("/requests/process-next")
def process_next(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return process_request(db=db, admin=admin)


@router.post("/requests/{request_id}/hold")
def hold_request(request_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    item = get_request(db, request_id)
    change_status(db, item, "On Hold", admin.id, "Administrator placed request on hold")
    create_notification(db, item.user_id, item.id, "Request on hold", f"{item.request_id} has been placed on hold.")
    audit(db, admin, item, "HOLD_REQUEST", "Changed status to On Hold")
    db.commit()
    send_hold_email(db, item)
    return serialize(db, item)


@router.post("/requests/{request_id}/resume")
def resume_request(request_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    item = get_request(db, request_id)
    change_status(db, item, "Processing", admin.id, "Administrator resumed processing")
    create_notification(db, item.user_id, item.id, "Request resumed", f"{item.request_id} returned to processing.")
    audit(db, admin, item, "RESUME_REQUEST", "Changed status back to Processing")
    db.commit()
    send_processing_email(db, item)
    return serialize(db, item)


@router.post("/requests/{request_id}/reject")
def reject_request(request_id: str, payload: RejectRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    item = get_request(db, request_id)
    change_status(db, item, "Rejected", admin.id, payload.reason)
    item.rejected_at = datetime.now(timezone.utc)
    item.rejected_by = admin.id
    item.rejection_reason = payload.reason
    create_notification(db, item.user_id, item.id, "Request rejected", f"{item.request_id} was rejected: {payload.reason}")
    audit(db, admin, item, "REJECT_REQUEST", payload.reason)
    db.commit()
    send_rejection_email(db, item)
    return serialize(db, item)


@router.post("/requests/{request_id}/cancel")
def admin_cancel(request_id: str, payload: RejectRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    item = get_request(db, request_id)
    change_status(db, item, "Cancelled", admin.id, payload.reason)
    item.cancelled_at = datetime.now(timezone.utc)
    item.cancelled_by = admin.id
    item.cancellation_reason = payload.reason
    create_notification(db, item.user_id, item.id, "Request cancelled", f"{item.request_id} was cancelled: {payload.reason}")
    audit(db, admin, item, "CANCEL_REQUEST", payload.reason)
    db.commit()
    send_cancelled_email(db, item)
    return serialize(db, item)


@router.patch("/requests/{request_id}/release-date")
def set_release_date(request_id: str, payload: ReleaseDateUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    item = get_request(db, request_id)
    if payload.release_date < date.today():
        raise HTTPException(400, "Release date cannot be in the past")
    item.release_date = payload.release_date
    item.updated_at = datetime.now(timezone.utc)
    create_notification(db, item.user_id, item.id, "Release date changed", f"{item.request_id} release date: {payload.release_date.strftime('%B %d, %Y')}")
    audit(db, admin, item, "SET_RELEASE_DATE", f"Release date set to {payload.release_date.isoformat()}")
    db.commit()
    send_release_date_changed_email(db, item)
    return serialize(db, item)


@router.post("/requests/{request_id}/ready")
def ready_request(request_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    item = get_request(db, request_id)
    if not item.release_date:
        raise HTTPException(400, "A document release date is required before marking Ready for Claim")
    change_status(db, item, "Ready for Claim", admin.id)
    create_notification(db, item.user_id, item.id, "Ready for claim", f"{item.request_id} is ready for claim. Release date: {item.release_date.strftime('%B %d, %Y')}")
    audit(db, admin, item, "READY_FOR_CLAIM", "Changed status to Ready for Claim")
    db.commit()
    send_ready_for_claim_email(db, item)
    return serialize(db, item)


@router.post("/requests/{request_id}/release")
def release_request(request_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    item = get_request(db, request_id)
    change_status(db, item, "Released", admin.id)
    item.released_at = datetime.now(timezone.utc)
    create_notification(db, item.user_id, item.id, "Document released", f"{item.request_id} has been released.")
    audit(db, admin, item, "RELEASE_DOCUMENT", "Changed status to Released")
    db.commit()
    send_release_email(db, item)
    return serialize(db, item)


@router.get("/users")
def users(search: str = "", role: str = "All", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(User)
    if search:
        query = query.filter(or_(User.full_name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
    if role != "All":
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()


@router.get("/audit-logs")
def audit_logs(search: str = "", action: str = "All", page: int = 1, page_size: int = 10,
               db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(AuditLog)
    if action != "All":
        query = query.filter(AuditLog.action == action)
    if search:
        query = query.filter(AuditLog.description.ilike(f"%{search}%"))
    total = query.count()
    items = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total, "page": page, "page_size": page_size, "pages": max(1, (total + page_size - 1) // page_size)}


@router.get("/email-logs")
def email_logs(status: str = "All", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(EmailLog)
    if status != "All":
        query = query.filter(EmailLog.status == status)
    return query.order_by(EmailLog.created_at.desc()).all()


@router.post("/email/test")
def test_email(payload: TestEmailRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    sent = send_test_email(db, payload.email)
    return {"detail": "Test email sent" if sent else "Test email failed", "sent": sent}


@router.get("/dsa")
def dsa_demo(search_name: str = "", search_request_id: str = "", sort_key: str = "request_id",
             db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    records = db.query(DocumentRequest).order_by(DocumentRequest.submitted_at.asc()).all()
    serial = [serialize(db, item) for item in records]
    for item in serial:
        item["submitted_at"] = str(item["submitted_at"])
        item["release_date"] = str(item["release_date"]) if item["release_date"] else None
    rows = []
    for item in serial:
        row = SimpleNamespace(**item)
        rows.append(row)
    queue = FIFOQueue()
    for item in records:
        if item.status == "Pending":
            queue.enqueue(item.request_id)
    linear = linear_search_by_requester(rows, search_name) if search_name else []
    request_sorted = bubble_sort(rows, "request_id")
    binary = binary_search_by_request_id(request_sorted, search_request_id) if search_request_id else None
    before = serial
    after_rows = bubble_sort(rows, sort_key)
    after = [{key: getattr(row, key) for key in ("request_id", "requester_name", "submitted_at", "release_date")} for row in after_rows]
    return {
        "queue": queue.all(),
        "linear_search": [serialize_row(row) for row in linear],
        "binary_search": serialize_row(binary) if binary else None,
        "before_sort": before,
        "after_sort": after,
        "complexities": {"fifo": "O(1) enqueue/dequeue", "linear": "O(n)", "binary": "O(log n)", "bubble": "O(n²)"},
    }


def serialize_row(row):
    if row is None:
        return None
    return {
        "request_id": getattr(row, "request_id", None),
        "requester_name": getattr(row, "requester_name", None),
        "submitted_at": getattr(row, "submitted_at", None),
        "release_date": getattr(row, "release_date", None),
        "status": getattr(row, "status", None),
        "document_type": getattr(row, "document_type", None),
    }
