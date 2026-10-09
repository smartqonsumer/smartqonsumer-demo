"""Reproducible demo data: brand "Maison de la Croquette" (fictional pet-food brand, slug "croquin"), its two campaigns,
two demo GTINs, earning rules, games, rewards and a stock of DEMO promo codes.

Idempotent: re-running updates the configuration in place (matched by slug / code) and
never duplicates rows nor touches users, scans or transactions.

    python -m seeds.demo
"""

from datetime import timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.core.db import SessionLocal, utcnow
from app.models import Brand, Campaign, EarningRule, Game, Gtin, PromoCode, Reward

BRAND_SLUG = "croquin"
GTIN_DOG_RACE = "09506000164908"
GTIN_SIMPLE = "09506000164915"
DEMO_CODES_PER_REWARD = 50

# The visual theme lives in the frontend design system (web/src/lib/brand/themes/);
# the brand row only names the preset to apply.
CROQUIN_THEME: dict[str, Any] = {"preset": "maison-croquette"}

LEGAL_URLS = {
    "privacy": "/legal/confidentialite/",
    "legal_notice": "/legal/mentions-legales/",
    "rules": "/legal/reglement-club-croquin/",
}

PARTICIPATION_CONSENT = {
    "type": "participation_terms",
    "required": True,
    "version": "2026-10-v1",
    "label": "J'accepte le règlement de l'opération et le traitement de mes données nécessaire "
    "à ma participation et à la gestion de mon compte fidélité.",
}
MARKETING_CONSENT = {
    "type": "marketing_brand",
    "required": False,
    "version": "2026-10-v1",
    "label": "J'accepte de recevoir les actualités et offres de Maison de la Croquette par email.",
}

DOGS = [
    {"id": "filou", "name": "Filou", "coat": "#C98B4B"},
    {"id": "praline", "name": "Praline", "coat": "#3B2A20"},
]

CAMPAIGNS: list[dict[str, Any]] = [
    {
        "slug": "croquin-dog-race",
        "name": "La Grande Course",
        "journey": "gamified",
        "destination_path": "/club-croquin/",
        "scan_policy": "once_per_user",
        "registration_points": 100,
        "registration_points_on": "registration",
        "gtin": (GTIN_DOG_RACE, "Maison de la Croquette Adulte Poulet 2 kg (démo)"),
        "welcome_reward": "friandise-offerte",
        "config": {
            "texts": {
                "hero_title": "La Grande Course",
                "hero_subtitle": "Choisissez votre champion et tentez de remporter votre cadeau !",
                "win_title": "Bravo ! 🎉",
                "win_text": "Votre chien a remporté la course ! Votre cadeau vous attend.",
                "lose_title": "Pas cette fois…",
                "lose_text": "Votre chien a fait de son mieux. Rejoignez le club pour retenter votre chance !",
                "confirmation_title": "🎉 C'est enregistré !",
                "confirmation_text": "Votre participation a bien été prise en compte.",
            },
            "consents": [PARTICIPATION_CONSENT, MARKETING_CONSENT],
            # The winner lands in the club right after the form (email confirmed later).
            "session_on_registration": True,
        },
        "games": [
            {
                "type": "dog_race",
                "name": "Course de chiens",
                "requires_account": False,
                "play_limit": "once",
                # 100 % for the first demo — change here (or in DB), never in React.
                "config": {"win_probability": 1.0, "win_points": 0, "dogs": DOGS, "obstacles": 3},
            }
        ],
    },
    {
        "slug": "croquin-simple-loyalty",
        "name": "Club Maison de la Croquette",
        "journey": "simple",
        "destination_path": "/club-croquin-simple/",
        "scan_policy": "once_per_user",
        "registration_points": 100,
        "registration_points_on": "email_verified",
        "gtin": (GTIN_SIMPLE, "Maison de la Croquette Senior Saumon 3 kg (démo)"),
        "welcome_reward": None,
        "config": {
            "texts": {
                "hero_title": "Rejoignez le Club",
                "hero_subtitle": "Créez votre compte et commencez à gagner des points.",
                "verify_title": "Vérifiez votre boîte mail 📬",
                "verify_text": "Nous vous avons envoyé un lien pour confirmer votre adresse email.",
            },
            "consents": [PARTICIPATION_CONSENT, MARKETING_CONSENT],
        },
        "games": [
            {
                "type": "dog_race",
                "name": "Course de chiens",
                "requires_account": True,
                "play_limit": "once_per_day",
                "config": {"win_probability": 1.0, "win_points": 50, "dogs": DOGS, "obstacles": 3},
            },
            {
                "type": "roulette",
                "name": "Roue de la chance",
                "requires_account": True,
                "play_limit": "once_per_day",
                "config": {
                    "segments": [
                        {"label": "+10", "points": 10, "weight": 40, "color": "#B0002F"},
                        {"label": "+20", "points": 20, "weight": 30, "color": "#141414"},
                        {"label": "+50", "points": 50, "weight": 20, "color": "#6E9E00"},
                        {"label": "+100", "points": 100, "weight": 10, "color": "#F2B705"},
                    ]
                },
            },
        ],
    },
]

EARNING_RULES: list[dict[str, Any]] = [
    {"code": "profile.birth_date", "kind": "profile_field", "label": "Votre date de naissance", "points": 10},
    {"code": "profile.city", "kind": "profile_field", "label": "Votre ville", "points": 10},
    {"code": "profile.has_dog", "kind": "profile_field", "label": "Avez-vous un chien ?", "points": 10},
    {"code": "pet.name", "kind": "profile_field", "label": "Le prénom de votre chien", "points": 20},
    {"code": "pet.age_years", "kind": "profile_field", "label": "Son âge", "points": 10},
    {"code": "pet.size", "kind": "profile_field", "label": "Sa taille", "points": 10},
    {"code": "pet.breed", "kind": "profile_field", "label": "Sa race", "points": 10},
    {"code": "pet.food_preferences", "kind": "profile_field", "label": "Ses préférences", "points": 10},
    {
        "code": "profile.complete",
        "kind": "profile_complete",
        "label": "Profil complet",
        "description": "Bonus quand toutes les informations ci-dessus sont renseignées.",
        "points": 50,
    },
]

REWARDS: list[dict[str, Any]] = [
    {
        "slug": "friandise-offerte",
        "title": "Friandise offerte",
        "description": "Un sachet de friandises offert pour votre prochaine commande.",
        "cost_points": 0,
        "redeemable": False,
        "prefix": "DEMO-CROQ-GIFT",
        "valid_days": 60,
    },
    {
        "slug": "livraison-offerte",
        "title": "Livraison offerte",
        "description": "Frais de livraison offerts sur la boutique.",
        "cost_points": 100,
        "prefix": "DEMO-CROQ-LIV",
        "valid_days": 90,
    },
    {
        "slug": "reduction-10",
        "title": "Réduction de 10 %",
        "description": "10 % de réduction sur votre prochaine commande.",
        "cost_points": 250,
        "prefix": "DEMO-CROQ-10",
        "valid_days": 90,
    },
    {
        "slug": "reduction-20",
        "title": "Réduction de 20 %",
        "description": "20 % de réduction sur votre prochaine commande.",
        "cost_points": 500,
        "prefix": "DEMO-CROQ-20",
        "valid_days": 90,
    },
]


def _upsert(db: Session, model: Any, match: dict[str, Any], values: dict[str, Any]) -> Any:
    row = db.scalar(select(model).filter_by(**match))
    if row is None:
        row = model(**match, **values)
        db.add(row)
    else:
        for key, value in values.items():
            setattr(row, key, value)
    db.flush()
    return row


def seed(db: Session) -> Brand:
    brand = _upsert(
        db,
        Brand,
        {"slug": BRAND_SLUG},
        {"name": "Maison de la Croquette", "logo_url": None, "theme": CROQUIN_THEME, "config": {"legal_urls": LEGAL_URLS}},
    )

    rewards: dict[str, Reward] = {}
    for order, item in enumerate(REWARDS):
        reward = _upsert(
            db,
            Reward,
            {"brand_id": brand.id, "slug": item["slug"]},
            {
                "title": item["title"],
                "description": item["description"],
                "cost_points": item["cost_points"],
                "redeemable": item.get("redeemable", True),
                "active": True,
                "code_source": "pool",
                "valid_days": item["valid_days"],
                "sort_order": order,
            },
        )
        rewards[item["slug"]] = reward
        expires_at = utcnow() + timedelta(days=365)
        db.execute(
            insert(PromoCode)
            .values(
                [
                    {
                        "reward_id": reward.id,
                        "code": f"{item['prefix']}-{n:04d}",
                        "is_demo": True,
                        "status": "available",
                        "expires_at": expires_at,
                    }
                    for n in range(1, DEMO_CODES_PER_REWARD + 1)
                ]
            )
            .on_conflict_do_nothing(index_elements=[PromoCode.code])
        )

    for order, item in enumerate(CAMPAIGNS):
        welcome = rewards[item["welcome_reward"]] if item["welcome_reward"] else None
        campaign = _upsert(
            db,
            Campaign,
            {"slug": item["slug"]},
            {
                "brand_id": brand.id,
                "name": item["name"],
                "journey": item["journey"],
                "destination_path": item["destination_path"],
                "active": True,
                "start_at": None,
                "end_at": None,
                "scan_policy": item["scan_policy"],
                "registration_points": item["registration_points"],
                "registration_points_on": item["registration_points_on"],
                "welcome_reward_id": welcome.id if welcome else None,
                "config": item["config"],
            },
        )
        gtin, label = item["gtin"]
        _upsert(db, Gtin, {"gtin": gtin}, {"brand_id": brand.id, "campaign_id": campaign.id, "label": label})
        for game_order, game in enumerate(item["games"]):
            _upsert(
                db,
                Game,
                {"campaign_id": campaign.id, "type": game["type"]},
                {
                    "name": game["name"],
                    "active": True,
                    "requires_account": game["requires_account"],
                    "play_limit": game["play_limit"],
                    "max_plays": game.get("max_plays"),
                    "config": game["config"],
                    "sort_order": order * 10 + game_order,
                },
            )

    for order, rule in enumerate(EARNING_RULES):
        _upsert(
            db,
            EarningRule,
            {"brand_id": brand.id, "code": rule["code"]},
            {
                "kind": rule["kind"],
                "label": rule["label"],
                "description": rule.get("description"),
                "points": rule["points"],
                "active": True,
                "sort_order": order,
                "config": {},
            },
        )
    db.commit()
    return brand


def main() -> None:
    with SessionLocal() as db:
        seed(db)
    print(f"Demo data seeded: brand '{BRAND_SLUG}', GTINs {GTIN_DOG_RACE} and {GTIN_SIMPLE}.")


if __name__ == "__main__":
    main()
