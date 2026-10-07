"""Member area endpoints: one loyalty engine for every acquisition journey."""

import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Query

from app.api.deps import AnonToken, CurrentUser, DbSession, IdempotencyKey, OptionalUser
from app.core.errors import NotFound
from app.models import Brand, Game, PromoCode, Reward, User
from app.schemas.club import (
    EarningAction,
    EarningActions,
    GamePlayRequest,
    GamePlayResponse,
    LoyaltySummary,
    MemberGame,
    MyReward,
    NextReward,
    PointTransactionPublic,
    RewardPublic,
    RewardRedemptionResponse,
)
from app.services import (
    campaign_service,
    game_service,
    games,
    loyalty_service,
    profile_service,
    reward_service,
)
from app.services.email_service import EmailService

router = APIRouter(tags=["club"])

BrandSlug = Annotated[str, Query(alias="brand", max_length=64)]
SLUG_BY_TYPE = {v: k for k, v in games.SLUGS.items()}


def _points_hint(game: Game) -> str:
    if game.type == "roulette":
        best = max((int(s.get("points", 0)) for s in game.config.get("segments", [])), default=0)
        return f"Jusqu'à +{best} points"
    return f"+{int(game.config.get('win_points', 0))} points"


def _member_games(db: DbSession, brand: Brand, user: User) -> list[MemberGame]:
    result = []
    for game, campaign in game_service.member_games(db, brand):
        can_play = game_service.can_play(db, game, f"user:{user.id}")
        result.append(
            MemberGame(
                type=game.type,
                slug=SLUG_BY_TYPE[game.type],
                name=game.name,
                campaign_slug=campaign.slug,
                play_limit=game.play_limit,
                can_play=can_play,
                message=None if can_play else game_service.LIMIT_MESSAGES.get(game.play_limit),
                points_hint=_points_hint(game),
                display=games.public_display(game.type, game.config),
            )
        )
    return result


# --------------------------------------------------------------------------- loyalty


@router.get("/loyalty/summary", response_model=LoyaltySummary)
def loyalty_summary(brand_slug: BrandSlug, db: DbSession, user: CurrentUser) -> LoyaltySummary:
    brand = campaign_service.get_brand(db, brand_slug)
    balance = loyalty_service.balance(db, user.id, brand.id)
    reward = loyalty_service.next_reward(db, brand.id, balance)
    return LoyaltySummary(
        brand_slug=brand.slug,
        balance=balance,
        next_reward=NextReward(
            title=reward.title,
            cost_points=reward.cost_points,
            missing_points=reward.cost_points - balance,
            progress=round(balance / reward.cost_points, 4) if reward.cost_points else 1.0,
        )
        if reward
        else None,
    )


@router.get("/loyalty/transactions", response_model=list[PointTransactionPublic])
def loyalty_transactions(
    brand_slug: BrandSlug, db: DbSession, user: CurrentUser
) -> list[PointTransactionPublic]:
    brand = campaign_service.get_brand(db, brand_slug)
    return [
        PointTransactionPublic.model_validate(t) for t in loyalty_service.transactions(db, user.id, brand.id)
    ]


@router.get("/loyalty/earning-actions", response_model=EarningActions)
def earning_actions(brand_slug: BrandSlug, db: DbSession, user: CurrentUser) -> EarningActions:
    brand = campaign_service.get_brand(db, brand_slug)
    done = profile_service.credited_codes(db, user, brand)
    return EarningActions(
        profile=[
            EarningAction(
                code=r.code,
                kind=r.kind,
                label=r.label,
                description=r.description,
                points=r.points,
                done=r.code in done,
            )
            for r in profile_service.rules(db, brand)
        ],
        games=_member_games(db, brand, user),
    )


# --------------------------------------------------------------------------- games


@router.get("/games", response_model=list[MemberGame])
def member_games(brand_slug: BrandSlug, db: DbSession, user: CurrentUser) -> list[MemberGame]:
    return _member_games(db, campaign_service.get_brand(db, brand_slug), user)


@router.post("/games/{game_slug}/play", response_model=GamePlayResponse)
def play_game(
    game_slug: str,
    body: GamePlayRequest,
    db: DbSession,
    user: OptionalUser,
    background: BackgroundTasks,
    anon_token: AnonToken = None,
) -> GamePlayResponse:
    """The server draws the result; the client only animates it."""
    game_type = games.SLUGS.get(game_slug)
    if game_type is None:
        raise NotFound("game_unavailable", "Ce jeu n'existe pas.")
    session, claim = game_service.play(
        db,
        game_type=game_type,
        campaign_slug=body.campaign_slug,
        user=user,
        anon_token=anon_token,
        scan_id=body.scan_id,
        choice=body.choice,
    )
    if claim is not None and claim.reward_title and user is not None and user.email:
        background.add_task(EmailService().reward_confirmation, user.email, claim.reward_title)
    pending = session.won and session.claimed_at is None
    if session.won:
        message = (
            f"Vos {session.points_awarded} points ont été ajoutés 🎉"
            if session.claimed_at and session.points_awarded
            else "Vous avez gagné ! 🎉"
        )
    else:
        message = "Pas de chance cette fois… Retentez votre chance bientôt !"
    return GamePlayResponse(
        game_session_id=session.id,
        game_type=game_type,
        won=session.won,
        outcome=session.outcome,
        points_awarded=session.points_awarded,
        pending_claim=pending,
        reward_title=claim.reward_title if claim else None,
        message=message,
    )


# --------------------------------------------------------------------------- rewards


@router.get("/rewards", response_model=list[RewardPublic])
def rewards_catalogue(brand_slug: BrandSlug, db: DbSession, user: CurrentUser) -> list[RewardPublic]:
    brand = campaign_service.get_brand(db, brand_slug)
    balance = loyalty_service.balance(db, user.id, brand.id)
    return [
        RewardPublic(
            id=r.id,
            slug=r.slug,
            title=r.title,
            description=r.description,
            cost_points=r.cost_points,
            affordable=balance >= r.cost_points,
            in_stock=stock > 0,
        )
        for r, stock in reward_service.catalogue(db, brand)
    ]


@router.post("/rewards/{reward_id}/redeem", response_model=RewardRedemptionResponse)
def redeem_reward(
    reward_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    background: BackgroundTasks,
    idempotency_key: IdempotencyKey = None,
) -> RewardRedemptionResponse:
    redemption = reward_service.redeem(db, user=user, reward_id=reward_id, idempotency_key=idempotency_key)
    db.commit()
    reward, code = redemption_details(db, redemption.reward_id, redemption.promo_code_id)
    if user.email:
        background.add_task(EmailService().reward_confirmation, user.email, reward.title)
    return RewardRedemptionResponse(
        redemption_id=redemption.id,
        reward_title=reward.title,
        code=code.code,
        cost_points=redemption.cost_points,
        balance=loyalty_service.balance(db, user.id, reward.brand_id),
        expires_at=redemption.expires_at,
    )


def redemption_details(
    db: DbSession, reward_id: uuid.UUID, promo_code_id: uuid.UUID
) -> tuple[Reward, PromoCode]:
    reward = db.get(Reward, reward_id)
    code = db.get(PromoCode, promo_code_id)
    assert reward is not None and code is not None
    return reward, code


@router.get("/rewards/my", response_model=list[MyReward])
def my_rewards(db: DbSession, user: CurrentUser) -> list[MyReward]:
    return [
        MyReward(
            redemption_id=redemption.id,
            reward_title=reward.title,
            reward_description=reward.description,
            code=code.code,
            status=code.status,
            source=redemption.source,
            cost_points=redemption.cost_points,
            granted_at=redemption.created_at,
            expires_at=redemption.expires_at,
            used_at=code.used_at,
        )
        for redemption, reward, code in reward_service.my_rewards(db, user)
    ]
