from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    profile_picture = Column(String)
    role = Column(String, nullable=False, default="Student")
    school_id = Column(String)
    address = Column(Text)
    age = Column(Integer)
    contact_number = Column(String(30))
    department = Column(String(120))
    course = Column(String(120))
    member_type = Column(String(20))
    graduation_year = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))

    requests = relationship("DocumentRequest", back_populates="user", foreign_keys="DocumentRequest.user_id")

    @property
    def profile_complete(self):
        if not (self.email or "").lower().endswith("@gmail.com"):
            return True
        required = (self.full_name, self.address, self.age, self.contact_number,
                    self.school_id, self.department, self.member_type)
        if any(value is None or (isinstance(value, str) and not value.strip()) for value in required):
            return False
        if self.member_type in {"Student", "Graduated"} and not (self.course or "").strip():
            return False
        if self.member_type == "Graduated" and not self.graduation_year:
            return False
        return True
