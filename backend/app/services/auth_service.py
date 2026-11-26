from datetime import datetime, timezone
from urllib.parse import urlencode

import requests
from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..config import settings
from ..models.user import User


def google_authorization_url():
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    return "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)


def exchange_google_code(code: str, db: Session) -> User:
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(503, "Google OAuth is not configured")
    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_exchange",
        },
        timeout=20,
    )
    # Google uses authorization_code as the grant type.
    if token_response.status_code != 200:
        token_response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=20,
        )
    token_response.raise_for_status()
    access_token = token_response.json().get("access_token")
    profile_response = requests.get(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=20,
    )
    profile_response.raise_for_status()
    profile = profile_response.json()
    google_id = profile.get("sub")
    email = profile.get("email", "").lower()
    if not google_id or not email:
        raise HTTPException(400, "Google account did not provide required profile information")
    if settings.google_allowed_domain:
        allowed = [item.strip().lower() for item in settings.google_allowed_domain.split(",") if item.strip()]
        if not email.endswith(tuple("." + domain if not domain.startswith(".") else domain for domain in allowed)):
            raise HTTPException(403, "Your Google account domain is not allowed")
    if email.endswith("@gmail.com") and not settings.google_allow_personal_gmail:
        raise HTTPException(403, "Personal Gmail accounts are not allowed")
    user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).first()
    if user:
        user.google_id = google_id
        user.full_name = profile.get("name") or user.full_name
        user.profile_picture = profile.get("picture") or user.profile_picture
        user.last_login = datetime.now(timezone.utc)
    else:
        user = User(
            google_id=google_id,
            full_name=profile.get("name") or email.split("@")[0],
            email=email,
            profile_picture=profile.get("picture"),
            role="Student",
            last_login=datetime.now(timezone.utc),
        )
        db.add(user)
    db.commit()
    db.refresh(user)
    return user
