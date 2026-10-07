"""Game registry. Adding a game = a module exposing `public_display(config)` and
`draw(config, choice)`, registered here, plus its frontend component."""

from collections.abc import Callable
from types import ModuleType
from typing import Any

from app.services.games import dog_race, roulette
from app.services.games.base import Draw

REGISTRY: dict[str, ModuleType] = {"dog_race": dog_race, "roulette": roulette}

# URL slug (/games/dog-race/play) → game type
SLUGS = {"dog-race": "dog_race", "roulette": "roulette"}


def drawer(game_type: str) -> Callable[[dict[str, Any], str | None], Draw]:
    return REGISTRY[game_type].draw  # type: ignore[no-any-return]


def public_display(game_type: str, config: dict[str, Any]) -> dict[str, Any]:
    return REGISTRY[game_type].public_display(config)  # type: ignore[no-any-return]
