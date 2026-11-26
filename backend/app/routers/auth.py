from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models.user import User
from ..services.auth_service import exchange_google_code, google_authorization_url
from ..schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from ..utils.security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists. Sign in instead.")
    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        role="Student",
        last_login=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_access_token(user.id), "user": user}


@router.post("/login", response_model=TokenResponse)
def password_login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account is inactive. Contact your school administrator.")
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    return {"access_token": create_access_token(user.id), "user": user}


@router.get("/google")
def google_login():
    return RedirectResponse(google_authorization_url())


@router.get("/google/callback")
def google_callback(code: str = Query(...), db: Session = Depends(get_db)):
    user = exchange_google_code(code, db)
    token = create_access_token(user.id)
    return RedirectResponse(f"{settings.frontend_url}/login?token={token}")


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/logout")
def logout():
    return {"detail": "Logged out"}
