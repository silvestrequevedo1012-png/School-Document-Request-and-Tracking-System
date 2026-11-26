from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from ..database import Base


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True)
    request_id = Column(Integer, ForeignKey("document_requests.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    recipient_email = Column(String, nullable=False)
    email_type = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    status = Column(String, nullable=False, index=True)
    error_message = Column(Text)
    sent_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
