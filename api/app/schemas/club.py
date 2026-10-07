"""Schemas of the member area (loyalty engine shared by every journey)."""

import uuid
from datetime import date, datetime
from typing import Any, Literal

from pydantic import Field

from app.schemas.common import ApiModel, RequestModel

# --------------------------------------------------------------------------- loyalty


class NextReward(ApiModel):
    title: str
    cost_points: int
    missing_points: int
    progress: float


class LoyaltySummary(ApiModel):
    brand_slug: str
    balance: int
    next_reward: NextReward | None


class PointTransactionPublic(ApiModel):
    id: uuid.UUID
    amount: int
    balance_after: int
    type: str
    source_type: str
    description: str
    created_at: datetime


class EarningAction(ApiModel):
    code: str
    kind: str
    label: str
    description: str | None
    points: int
    done: bool


class MemberGame(ApiModel):
    type: str
    slug: str
    name: str
    campaign_slug: str
    play_limit: str
    can_play: bool
    message: str | None
    points_hint: str
    display: dict[str, Any]


class EarningActions(ApiModel):
    profile: list[EarningAction]
    games: list[MemberGame]


# --------------------------------------------------------------------------- games


class GamePlayRequest(RequestModel):
    campaign_slug: str = Field(max_length=80)
    scan_id: uuid.UUID | None = None
    choice: str | None = Field(default=None, max_length=40)


class GamePlayResponse(ApiModel):
    game_session_id: uuid.UUID
    game_type: str
    won: bool
    outcome: dict[str, Any]
    points_awarded: int
    # Anonymous win: the gift waits for the account created right after.
    pending_claim: bool
    reward_title: str | None
    message: str


class ClaimResponse(ApiModel):
    points_awarded: int
    reward_title: str | None


# --------------------------------------------------------------------------- rewards


class RewardPublic(ApiModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str | None
    cost_points: int
    affordable: bool
    in_stock: bool


class RewardRedemptionResponse(ApiModel):
    redemption_id: uuid.UUID
    reward_title: str
    code: str
    cost_points: int
    balance: int
    expires_at: datetime | None


class MyReward(ApiModel):
    redemption_id: uuid.UUID
    reward_title: str
    reward_description: str | None
    code: str
    status: str
    source: str
    cost_points: int
    granted_at: datetime
    expires_at: datetime | None
    used_at: datetime | None


# --------------------------------------------------------------------------- profile

PetSize = Literal["small", "medium", "large"]


class PetUpdate(RequestModel):
    name: str | None = Field(default=None, max_length=80)
    age_years: int | None = Field(default=None, ge=0, le=30)
    size: PetSize | None = None
    breed: str | None = Field(default=None, max_length=80)
    food_preferences: str | None = Field(default=None, max_length=300)


class ProfileUpdate(RequestModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str | None = Field(default=None, min_length=1, max_length=80)
    birth_date: date | None = None
    city: str | None = Field(default=None, max_length=120)
    has_dog: bool | None = None
    dog_count: int | None = Field(default=None, ge=0, le=20)
    pet: PetUpdate | None = None


class PetPublic(ApiModel):
    name: str | None
    age_years: int | None
    size: str | None
    breed: str | None
    food_preferences: str | None


class ProfilePublic(ApiModel):
    email: str
    email_verified: bool
    first_name: str | None
    last_name: str | None
    birth_date: date | None
    city: str | None
    has_dog: bool | None
    dog_count: int | None
    pet: PetPublic | None


class ProfileUpdateResponse(ApiModel):
    profile: ProfilePublic
    points_awarded: int
    balance: int


class ConsentPublic(ApiModel):
    type: str
    version: str
    granted: bool
    active: bool
    date: datetime
    withdrawn_at: datetime | None
