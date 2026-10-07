"""Password hashing, random tokens and cross-site request protection."""

import hashlib
import hmac
import re
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.config import Settings, get_settings

_hasher = PasswordHasher()  # Argon2id with the library's recommended parameters
# Constant-time-ish verification for unknown emails (avoids user enumeration by timing).
_DUMMY_HASH = _hasher.hash("not-a-real-password")

ANON_TOKEN_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    try:
        return _hasher.verify(password_hash or _DUMMY_HASH, password) and password_hash is not None
    except (VerificationError, InvalidHashError):
        return False


def new_token() -> str:
    """URL-safe random token, 256 bits of entropy."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Keyed hash (HMAC-SHA256 with SESSION_SECRET) of a session / email / reset / anonymous
    token. Only this digest is stored, so a database dump yields no usable token."""
    key = get_settings().session_secret.encode()
    return hmac.new(key, token.encode(), hashlib.sha256).hexdigest()


def enforce_same_origin(request: Request, settings: Settings) -> JSONResponse | None:
    """CSRF protection for cookie-authenticated requests: a state-changing request whose
    Origin header is present must come from an allowed origin. Combined with
    SameSite=Lax cookies and a JSON-only API, this blocks cross-site form posts."""
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return None
    origin = request.headers.get("origin")
    if origin is None or origin in settings.cors_origins:
        return None
    return JSONResponse(
        status_code=403,
        content={"error": {"code": "forbidden_origin", "message": "Requête refusée."}},
    )
