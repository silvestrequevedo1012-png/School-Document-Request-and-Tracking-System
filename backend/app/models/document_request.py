from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


class DocumentRequest(Base):
    __tablename__ = "document_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_type = Column(String, nullable=False, index=True)
    purpose = Column(Text, nullable=False)
    number_of_copies = Column(Integer, nullable=False)
    additional_notes = Column(Text)
    preferred_release_date = Column(Date)
    status = Column(String, nullable=False, default="Pending", index=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    release_date = Column(Date)
    released_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    cancelled_by = Column(Integer, ForeignKey("users.id"))
    cancellation_reason = Column(Text)
    rejected_at = Column(DateTime(timezone=True))
    rejected_by = Column(Integer, ForeignKey("users.id"))
    rejection_reason = Column(Text)

    user = relationship("User", back_populates="requests", foreign_keys=[user_id])
