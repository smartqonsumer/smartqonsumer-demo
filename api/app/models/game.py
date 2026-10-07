"""Games. The outcome is ALWAYS drawn server-side and stored before the frontend animates it.

Play limits are enforced by the UNIQUE (game_id, limit_key) constraint: the key is derived
from the game's play_limit (player, player+day, player+play number...), so two concurrent
plays computing the same key cannot both be inserted. `unlimited` uses a NULL key.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models._common import CreatedAt, Json, UuidPk, tz

GAME_TYPES = ("dog_race", "roulette")
PLAY_LIMITS = ("unlimited", "once", "once_per_day", "once_per_campaign", "max_count")


class Game(Base):
    __tablename__ = "games"
    __table_args__ = (
        UniqueConstraint("campaign_id", "type"),
        CheckConstraint(f"type IN {GAME_TYPES}", name="type"),
        CheckConstraint(f"play_limit IN {PLAY_LIMITS}", name="play_limit"),
    )

    id: Mapped[UuidPk]
    campaign_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(String(30))
    name: Mapped[str] = mapped_column(String(120))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    # Anonymous play (welcome game right after a scan) or members only.
    requires_account: Mapped[bool] = mapped_column(Boolean, default=True)
    play_limit: Mapped[str] = mapped_column(String(30), default="once_per_day")
    max_plays: Mapped[int | None] = mapped_column(Integer)
    # dog_race: {"win_probability": 1.0, "win_points": 100, "dogs": [...]}
    # roulette: {"segments": [{"label": "+10", "points": 10, "weight": 40}, ...]}
    config: Mapped[Json]
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[CreatedAt]


class GameSession(Base):
    __tablename__ = "game_sessions"
    __table_args__ = (UniqueConstraint("game_id", "limit_key"),)

    id: Mapped[UuidPk]
    game_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"), index=True)
    campaign_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"))
    visitor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("visitors.id", ondelete="SET NULL"))
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    scan_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("scans.id", ondelete="SET NULL"))
    limit_key: Mapped[str | None] = mapped_column(String(160))
    won: Mapped[bool] = mapped_column(Boolean)
    # What the frontend needs to animate the result (winning dog, segment index...).
    outcome: Mapped[Json]
    points_awarded: Mapped[int] = mapped_column(Integer, default=0)
    # Anonymous wins are "pending" until claimed by the account created right after.
    claimed_at: Mapped[datetime | None] = mapped_column(tz())
    created_at: Mapped[CreatedAt]
