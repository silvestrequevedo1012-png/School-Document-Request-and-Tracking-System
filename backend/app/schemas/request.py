from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


DOCUMENT_TYPES = [
    "Certificate of Enrollment", "Certificate of Grades", "Transcript of Records",
    "Good Moral Certificate", "Certificate of Graduation", "Diploma",
    "School Clearance", "Service Record", "Other",
]


class RequestCreate(BaseModel):
    document_type: str = Field(min_length=1)
    purpose: str = Field(min_length=3, max_length=1000)
    number_of_copies: int = Field(gt=0, le=20)
    additional_notes: Optional[str] = Field(default=None, max_length=2000)
    preferred_release_date: Optional[date] = None


class RequestResponse(BaseModel):
    id: int
    request_id: str
    user_id: int
    requester_name: Optional[str] = None
    document_type: str
    purpose: str
    number_of_copies: int
    additional_notes: Optional[str] = None
    preferred_release_date: Optional[date] = None
    status: str
    submitted_at: datetime
    updated_at: datetime
    release_date: Optional[date] = None
    released_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    cancellation_reason_visible: Optional[str] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    model_config = {"from_attributes": True}


class CancelRequest(BaseModel):
    reason: Optional[str] = Field(default="Cancelled by requester", max_length=1000)


class RejectRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=1000)


class ReleaseDateUpdate(BaseModel):
    release_date: date


class StatusHistoryResponse(BaseModel):
    id: int
    previous_status: Optional[str] = None
    new_status: str
    reason: Optional[str] = None
    changed_by: Optional[int] = None
    changed_at: datetime

    model_config = {"from_attributes": True}


class RequestDetail(RequestResponse):
    status_history: List[StatusHistoryResponse] = []


class PaginatedRequests(BaseModel):
    items: List[RequestResponse]
    total: int
    page: int
    page_size: int
    pages: int
