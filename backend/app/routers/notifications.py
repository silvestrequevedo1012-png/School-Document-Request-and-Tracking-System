from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.notification import Notification
from ..utils.security import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("")
def list_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()
    unread = sum(1 for item in items if not item.is_read)
    return {"items": items, "unread_count": unread}


@router.patch("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user.id).first()
    if not item:
        raise HTTPException(404, "Notification not found")
    item.is_read = True
    db.commit()
    return item


@router.patch("/read-all")
def mark_all_read(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"detail": "All notifications marked as read"}
