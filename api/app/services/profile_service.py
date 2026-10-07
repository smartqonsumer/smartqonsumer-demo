"""Progressive profiling: every optional field the member fills can earn points, defined by
the brand's EarningRule rows (code = "profile.<field>" or "pet.<field>"). Points for a
code are credited once per account (ledger source "profile:<code>"), even if the field
is later cleared and filled again. "profile.complete" pays a bonus when every
profile_field rule is filled.
"""

from dataclasses import dataclass
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Brand, EarningRule, LoyaltyAccount, Pet, PointTransaction, User, UserProfile
from app.services import analytics_service, loyalty_service

PROFILE_FIELDS = ("first_name", "last_name", "birth_date", "city", "has_dog", "dog_count")
PET_FIELDS = ("name", "age_years", "size", "breed", "food_preferences")


@dataclass
class ProfileUpdateResult:
    points_awarded: int
    completed_codes: list[str]


def primary_pet(user: User) -> Pet | None:
    return user.pets[0] if user.pets else None


def field_value(user: User, code: str) -> Any:
    scope, _, name = code.partition(".")
    if scope == "profile":
        return getattr(user.profile, name, None) if user.profile else None
    if scope == "pet":
        pet = primary_pet(user)
        return getattr(pet, name, None) if pet else None
    return None


def _filled(value: Any) -> bool:
    return value is not None and value != ""


def rules(db: Session, brand: Brand) -> list[EarningRule]:
    return list(
        db.scalars(
            select(EarningRule)
            .where(EarningRule.brand_id == brand.id, EarningRule.active.is_(True))
            .order_by(EarningRule.sort_order)
        )
    )


def credited_codes(db: Session, user: User, brand: Brand) -> set[str]:
    rows = db.scalars(
        select(PointTransaction.source_id)
        .join(LoyaltyAccount, PointTransaction.account_id == LoyaltyAccount.id)
        .where(
            LoyaltyAccount.user_id == user.id,
            LoyaltyAccount.brand_id == brand.id,
            PointTransaction.source_type == "profile",
        )
    )
    return set(rows)


def update_profile(
    db: Session, user: User, brand: Brand, profile: dict[str, Any], pet: dict[str, Any] | None
) -> ProfileUpdateResult:
    if user.profile is None:
        user.profile = UserProfile(user_id=user.id)
    for name, value in profile.items():
        if name in PROFILE_FIELDS:
            setattr(user.profile, name, value)
    if pet:
        current = primary_pet(user)
        if current is None:
            current = Pet(user_id=user.id, species="dog")
            db.add(current)
            user.pets.append(current)
        for name, value in pet.items():
            if name in PET_FIELDS:
                setattr(current, name, value)
    db.flush()

    awarded = 0
    completed: list[str] = []
    brand_rules = rules(db, brand)
    field_rules = [r for r in brand_rules if r.kind == "profile_field"]
    for rule in field_rules:
        if _filled(field_value(user, rule.code)) and _award(db, user, brand, rule):
            awarded += rule.points
            completed.append(rule.code)
    if field_rules and all(_filled(field_value(user, r.code)) for r in field_rules):
        for rule in (r for r in brand_rules if r.kind == "profile_complete"):
            if _award(db, user, brand, rule):
                awarded += rule.points
                completed.append(rule.code)
                analytics_service.track(db, "profile_completed", brand_id=brand.id, user_id=user.id)
    analytics_service.track(db, "profile_updated", brand_id=brand.id, user_id=user.id, points=awarded)
    return ProfileUpdateResult(points_awarded=awarded, completed_codes=completed)


def _award(db: Session, user: User, brand: Brand, rule: EarningRule) -> bool:
    tx = loyalty_service.credit(
        db,
        user_id=user.id,
        brand_id=brand.id,
        amount=rule.points,
        source_type="profile",
        source_id=rule.code,
        description=f"Profil : {rule.label}",
    )
    if tx is not None:
        analytics_service.track(db, "points_earned", brand_id=brand.id, user_id=user.id, points=tx.amount)
    return tx is not None
