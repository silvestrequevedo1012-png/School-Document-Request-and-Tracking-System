from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.document_request import DocumentRequest
from ..models.status_history import StatusHistory


TRANSITIONS = {
    "Pending": {"Processing", "Cancelled", "Rejected"},
    "Processing": {"On Hold", "Rejected", "Ready for Claim"},
    "On Hold": {"Processing", "Rejected"},
    "Ready for Claim": {"Released", "Cancelled"},
    "Released": set(),
    "Cancelled": set(),
    "Rejected": set(),
}


def validate_transition(request: DocumentRequest, new_status: str):
    if new_status not in TRANSITIONS.get(request.status, set()):
        raise HTTPException(400, f"Invalid status transition: {request.status} to {new_status}")


def change_status(db: Session, request: DocumentRequest, new_status: str, changed_by: int, reason=None):
    validate_transition(request, new_status)
    previous = request.status
    request.status = new_status
    request.updated_at = datetime.now(timezone.utc)
    db.add(StatusHistory(
        request_id=request.id,
        previous_status=previous,
        new_status=new_status,
        reason=reason,
        changed_by=changed_by,
    ))
