from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    admin_id: int
    request_id: Optional[int] = None
    action: str
    description: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EmailLogResponse(BaseModel):
    id: int
    request_id: Optional[int] = None
    user_id: Optional[int] = None
    recipient_email: str
    email_type: str
    subject: str
    status: str
    error_message: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TestEmailRequest(BaseModel):
    email: str
