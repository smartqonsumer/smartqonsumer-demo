"""Anonymous visitors (ported from smartqonsumer-poc-qr-scan-checker).

The browser keeps a random UUID in localStorage and sends it in the X-Anon-Token header.
It is not a fingerprint: no IP, no user agent is stored, only a keyed hash of the token.
"""

import uuid

from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.core.db import utcnow
from app.core.errors import AppError
from app.core.security import ANON_TOKEN_RE, hash_token
from app.models import GameSession, Participation, Scan, Visitor


def require_anon_token(anon_token: str | None) -> str:
    if anon_token is None or not ANON_TOKEN_RE.match(anon_token):
        raise AppError("invalid_anon_token", "Session de visite invalide. Rechargez la page.")
    return anon_token.lower()


def get_or_create_visitor(db: Session, anon_token: str) -> Visitor:
    token_hash = hash_token(require_anon_token(anon_token))
    now = utcnow()
    db.execute(
        insert(Visitor)
        .values(id=uuid.uuid4(), anon_token_hash=token_hash, last_seen_at=now)
        .on_conflict_do_update(index_elements=[Visitor.anon_token_hash], set_={"last_seen_at": now})
    )
    visitor = db.scalar(select(Visitor).where(Visitor.anon_token_hash == token_hash))
    assert visitor is not None
    return visitor


def find_visitor(db: Session, anon_token: str | None) -> Visitor | None:
    if anon_token is None or not ANON_TOKEN_RE.match(anon_token):
        return None
    return db.scalar(select(Visitor).where(Visitor.anon_token_hash == hash_token(anon_token.lower())))


def attach_anonymous_history_to_user(db: Session, visitor: Visitor, user_id: uuid.UUID) -> None:
    """Link a visitor's anonymous scans / participations / games to the account that was
    just created or logged in (equivalent of attachAnonymousHistoryToUser in the POC)."""
    visitor.user_id = user_id
    for model in (Scan, Participation, GameSession):
        db.execute(
            update(model)
            .where(model.visitor_id == visitor.id, model.user_id.is_(None))
            .values(user_id=user_id)
        )
