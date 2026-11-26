from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from ..database import Base


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True)
    request_id = Column(Integer, ForeignKey("document_requests.id"), nullable=False, index=True)
    previous_status = Column(String)
    new_status = Column(String, nullable=False)
    reason = Column(Text)
    changed_by = Column(Integer, ForeignKey("users.id"))
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
