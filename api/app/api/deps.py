from typing import Annotated

from fastapi import Depends, Header, Request
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db
from app.core.errors import Unauthorized
from app.models import User
from app.services import auth_service

DbSession = Annotated[Session, Depends(get_db)]
AnonToken = Annotated[str | None, Header(alias="X-Anon-Token")]
IdempotencyKey = Annotated[str | None, Header(alias="Idempotency-Key", max_length=80)]


def get_optional_user(request: Request, db: DbSession) -> User | None:
    token = request.cookies.get(get_settings().session_cookie_name)
    return auth_service.user_from_session_token(db, token) if token else None


def get_current_user(user: Annotated[User | None, Depends(get_optional_user)]) -> User:
    if user is None:
        raise Unauthorized("not_authenticated", "Veuillez vous connecter.")
    return user


OptionalUser = Annotated[User | None, Depends(get_optional_user)]
CurrentUser = Annotated[User, Depends(get_current_user)]


def client_key(request: Request) -> str:
    """Rate-limit key. The client IP is used in memory only, never persisted."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
