from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    google_id: Optional[str] = None
    full_name: str
    email: str
    profile_picture: Optional[str] = None
    role: str
    school_id: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    contact_number: Optional[str] = None
    department: Optional[str] = None
    course: Optional[str] = None
    member_type: Optional[str] = None
    graduation_year: Optional[int] = None
    profile_complete: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}
