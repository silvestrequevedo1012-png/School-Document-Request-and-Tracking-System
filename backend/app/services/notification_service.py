from sqlalchemy.orm import Session
from ..models.notification import Notification


def create_notification(db: Session, user_id: int, request_id: int, title: str, message: str):
    item = Notification(user_id=user_id, request_id=request_id, title=title, message=message)
    db.add(item)
    db.flush()
    return item
