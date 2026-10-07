from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import utcnow
from app.core.security import hash_token, new_token
from app.models import User, UserSession


def create_session(db: Session, user: User) -> str:
    token = new_token()
    db.add(
        UserSession(
            user_id=user.id,
            token_hash=hash_token(token),
            expires_at=utcnow() + timedelta(hours=get_settings().session_ttl_hours),
        )
    )
    return token


def user_from_session_token(db: Session, token: str) -> User | None:
    row = db.scalar(select(UserSession).where(UserSession.token_hash == hash_token(token)))
    if row is None or row.revoked_at is not None or row.expires_at <= utcnow():
        return None
    user = db.get(User, row.user_id)
    if user is None or user.status == "deleted":
        return None
    return user


def revoke_session(db: Session, token: str) -> None:
    row = db.scalar(select(UserSession).where(UserSession.token_hash == hash_token(token)))
    if row is not None and row.revoked_at is None:
        row.revoked_at = utcnow()
