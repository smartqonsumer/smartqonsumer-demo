"""Dog race: the player picks a dog, the server decides whether the player's dog wins
(probability from the game config) and returns the full script of the race so the
frontend only plays it back."""

import secrets
from typing import Any

from app.core.errors import AppError
from app.services.games.base import Draw

DEFAULT_DOGS = [{"id": "dog_1", "name": "Chien 1"}, {"id": "dog_2", "name": "Chien 2"}]
_rng = secrets.SystemRandom()


def dogs(config: dict[str, Any]) -> list[dict[str, Any]]:
    return list(config.get("dogs") or DEFAULT_DOGS)


def public_display(config: dict[str, Any]) -> dict[str, Any]:
    return {"dogs": dogs(config), "win_points": int(config.get("win_points", 0))}


def validate_choice(config: dict[str, Any], choice: str | None) -> str:
    ids = [d["id"] for d in dogs(config)]
    if choice not in ids:
        raise AppError("invalid_choice", "Choisissez votre chien pour lancer la course.")
    return choice


def draw(config: dict[str, Any], choice: str | None) -> Draw:
    chosen = validate_choice(config, choice)
    probability = min(max(float(config.get("win_probability", 0.0)), 0.0), 1.0)
    won = _rng.random() < probability
    others = [d["id"] for d in dogs(config) if d["id"] != chosen]
    winner = chosen if won else _rng.choice(others)
    # Which obstacle each dog stumbles on: purely cosmetic, but decided here so that the
    # animation is a faithful replay of the server result.
    obstacles = int(config.get("obstacles", 3))
    stumbles = {d["id"]: _rng.randrange(obstacles) for d in dogs(config) if d["id"] != winner}
    return Draw(
        won=won,
        points=int(config.get("win_points", 0)) if won else 0,
        outcome={"chosen_dog": chosen, "winner_dog": winner, "stumbles": stumbles, "obstacles": obstacles},
    )
