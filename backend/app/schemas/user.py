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
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}
