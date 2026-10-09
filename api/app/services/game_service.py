"""Game engine shared by every journey (welcome game after a scan, member games in the club).

The server draws the result, stores the GameSession, credits points (members) and only
then answers; the frontend animates what it receives. Play limits are checked here and
guaranteed by UNIQUE (game_id, limit_key).
"""

import logging
import uuid
from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.db import utcnow
from app.core.errors import AppError, NotFound, Unauthorized
from app.models import Brand, Campaign, Game, GameSession, Reward, User
from app.services import (
    analytics_service,
    campaign_service,
    games,
    loyalty_service,
    reward_service,
    scan_service,
    visitor_service,
)

logger = logging.getLogger("smartqonsumer.games")

LIMIT_MESSAGES = {
    "once": "Vous avez déjà participé à ce jeu.",
    "once_per_campaign": "Vous avez déjà participé à ce jeu pour cette opération.",
    "once_per_day": "Vous avez déjà joué aujourd'hui. Vous pourrez rejouer demain.",
    "max_count": "Vous avez utilisé toutes vos parties.",
}


class PlayLimitReached(AppError):
    status_code = 409


@dataclass
class Claim:
    points: int
    reward_title: str | None


def limit_key(db: Session, game: Game, player: str) -> str | None:
    if game.play_limit == "unlimited":
        return None
    if game.play_limit in ("once", "once_per_campaign"):
        return player
    if game.play_limit == "once_per_day":
        return f"{player}:day:{utcnow().date().isoformat()}"
    # max_count: the n-th play has key player:#n; two concurrent plays computing the same
    # n collide on the unique constraint, so the cap can never be exceeded.
    played = db.scalar(
        select(func.count())
        .select_from(GameSession)
        .where(GameSession.game_id == game.id, GameSession.limit_key.like(f"{player}:#%"))
    )
    number = (played or 0) + 1
    if game.max_plays is not None and number > game.max_plays:
        raise PlayLimitReached("play_limit_reached", LIMIT_MESSAGES["max_count"])
    return f"{player}:#{number}"


def can_play(db: Session, game: Game, player: str) -> bool:
    try:
        key = limit_key(db, game, player)
    except PlayLimitReached:
        return False
    if key is None:
        return True
    return (
        db.scalar(select(GameSession.id).where(GameSession.game_id == game.id, GameSession.limit_key == key))
        is None
    )


def get_game(db: Session, campaign: Campaign, game_type: str) -> Game:
    game = db.scalar(select(Game).where(Game.campaign_id == campaign.id, Game.type == game_type))
    if game is None or not game.active or not campaign_service.is_running(campaign):
        raise NotFound("game_unavailable", "Ce jeu n'est pas disponible pour le moment.")
    return game


def play(
    db: Session,
    *,
    game_type: str,
    campaign_slug: str,
    user: User | None,
    anon_token: str | None,
    scan_id: uuid.UUID | None,
    choice: str | None,
) -> tuple[GameSession, Claim | None]:
    campaign = campaign_service.get_campaign(db, campaign_slug)
    game = get_game(db, campaign, game_type)
    visitor = visitor_service.get_or_create_visitor(db, anon_token) if anon_token else None

    if game.requires_account:
        if user is None:
            raise Unauthorized("not_authenticated", "Connectez-vous pour jouer.")
        player = f"user:{user.id}"
    else:
        # Welcome game: only reachable through an accepted scan of this campaign, once
        # per browser. The participation (scan policy) already limits who gets here.
        if visitor is None or scan_id is None:
            raise AppError("scan_required", "Scannez le QR Code présent sur le produit pour jouer.")
        scan = scan_service.get_visitor_scan(db, scan_id, visitor)
        if scan.campaign_id != campaign.id or scan.status != "accepted":
            raise AppError("scan_not_eligible", "Ce QR Code a déjà été utilisé pour cette opération.", 409)
        player = f"visitor:{visitor.id}"
        if scan_service.is_bypass(db, scan):
            player = f"{player}:scan:{scan.id}"  # demo replay: one more welcome game

    key = limit_key(db, game, player)
    if not can_play(db, game, player):
        raise PlayLimitReached("play_limit_reached", LIMIT_MESSAGES[game.play_limit])

    draw = games.drawer(game.type)(game.config, choice)
    session = GameSession(
        game_id=game.id,
        campaign_id=campaign.id,
        visitor_id=visitor.id if visitor else None,
        user_id=user.id if game.requires_account and user else None,
        scan_id=None if game.requires_account else scan_id,
        limit_key=key,
        won=draw.won,
        outcome=draw.outcome,
        points_awarded=draw.points,
    )
    try:
        with db.begin_nested():
            db.add(session)
    except IntegrityError as exc:
        raise PlayLimitReached(
            "play_limit_reached", LIMIT_MESSAGES.get(game.play_limit, "Partie déjà jouée.")
        ) from exc

    ids = {"brand_id": campaign.brand_id, "campaign_id": campaign.id, "user_id": user.id if user else None}
    analytics_service.track(
        db, "game_started", visitor_id=visitor.id if visitor else None, game=game.type, **ids
    )
    analytics_service.track(db, "game_completed", game=game.type, won=draw.won, **ids)
    if draw.won:
        analytics_service.track(db, "game_won", game=game.type, points=draw.points, **ids)

    claim = None
    if game.requires_account and user is not None:
        _credit_game_points(db, session, user, campaign, game)
        session.claimed_at = utcnow()
    elif user is not None and draw.won:
        # A member already logged in wins the welcome game: no form, the gift is theirs now.
        db.flush()
        claim = claim_welcome_win(db, game_session_id=session.id, user=user, anon_token=anon_token)
    db.commit()
    return session, claim


def _credit_game_points(db: Session, session: GameSession, user: User, campaign: Campaign, game: Game) -> int:
    tx = loyalty_service.credit(
        db,
        user_id=user.id,
        brand_id=campaign.brand_id,
        amount=session.points_awarded,
        source_type="game",
        source_id=str(session.id),
        description=f"{game.name} — gagné",
    )
    if tx is None:
        return 0
    analytics_service.track(
        db,
        "points_earned",
        brand_id=campaign.brand_id,
        campaign_id=campaign.id,
        user_id=user.id,
        points=tx.amount,
    )
    return tx.amount


def claim_welcome_win(
    db: Session, *, game_session_id: uuid.UUID, user: User, anon_token: str | None
) -> Claim | None:
    """Give the gift of an anonymous win to the account created right after it.
    The session is locked, must belong to the same browser and can be claimed only once."""
    session = db.scalar(select(GameSession).where(GameSession.id == game_session_id).with_for_update())
    visitor = visitor_service.find_visitor(db, anon_token)
    if (
        session is None
        or visitor is None
        or session.visitor_id != visitor.id
        or not session.won
        or session.claimed_at is not None
        or session.user_id not in (None, user.id)
    ):
        logger.info("Welcome win not claimable (session=%s)", game_session_id)
        return None
    session.user_id = user.id
    session.claimed_at = utcnow()
    campaign = db.get(Campaign, session.campaign_id)
    assert campaign is not None
    game = db.get(Game, session.game_id)
    assert game is not None
    points = _credit_game_points(db, session, user, campaign, game) if session.points_awarded else 0
    reward_title = None
    if campaign.welcome_reward_id:
        reward = db.get(Reward, campaign.welcome_reward_id)
        if reward is not None and reward.active:
            reward_service.grant(db, user=user, reward=reward, source="game_win", source_ref=str(session.id))
            reward_title = reward.title
    return Claim(points=points, reward_title=reward_title)


def member_games(db: Session, brand: Brand) -> list[tuple[Game, Campaign]]:
    rows = db.execute(
        select(Game, Campaign)
        .join(Campaign, Game.campaign_id == Campaign.id)
        .where(Campaign.brand_id == brand.id, Game.active.is_(True), Game.requires_account.is_(True))
        .order_by(Game.sort_order)
    ).all()
    return [(g, c) for g, c in rows if campaign_service.is_running(c)]


def session_brand_id(db: Session, game_session_id: uuid.UUID) -> uuid.UUID | None:
    return db.scalar(
        select(Campaign.brand_id)
        .join(GameSession, GameSession.campaign_id == Campaign.id)
        .where(GameSession.id == game_session_id)
    )
