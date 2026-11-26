from sqlalchemy import Boolean, Column, DateTime, Integer, String
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
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))

    requests = relationship("DocumentRequest", back_populates="user", foreign_keys="DocumentRequest.user_id")
