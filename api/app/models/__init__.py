"""SQLAlchemy models. Importing this package registers every table on Base.metadata."""

from app.models.brand import Brand, Campaign, Gtin
from app.models.event import Event
from app.models.game import Game, GameSession
from app.models.loyalty import EarningRule, LoyaltyAccount, PointTransaction
from app.models.reward import PromoCode, Reward, RewardRedemption
from app.models.scan import Participation, Scan, Visitor
from app.models.user import AuthToken, Consent, Pet, User, UserProfile, UserSession

__all__ = [
    "AuthToken",
    "Brand",
    "Campaign",
    "Consent",
    "EarningRule",
    "Event",
    "Game",
    "GameSession",
    "Gtin",
    "LoyaltyAccount",
    "Participation",
    "Pet",
    "PointTransaction",
    "PromoCode",
    "Reward",
    "RewardRedemption",
    "Scan",
    "User",
    "UserProfile",
    "UserSession",
    "Visitor",
]
