"""Wheel of fortune: weighted draw of a segment on the server. The frontend receives the
winning segment index and spins the wheel until it stops there."""

import secrets
from typing import Any

from app.core.errors import AppError
from app.services.games.base import Draw

_rng = secrets.SystemRandom()


def segments(config: dict[str, Any]) -> list[dict[str, Any]]:
    items = config.get("segments") or []
    if (
        not items
        or any(int(s.get("weight", 0)) < 0 for s in items)
        or sum(int(s["weight"]) for s in items) <= 0
    ):
        raise AppError("game_misconfigured", "Ce jeu n'est pas disponible pour le moment.", status_code=503)
    return list(items)


def public_display(config: dict[str, Any]) -> dict[str, Any]:
    return {
        "segments": [
            {"label": s["label"], "points": int(s.get("points", 0)), "color": s.get("color")}
            for s in segments(config)
        ]
    }


def draw(config: dict[str, Any], choice: str | None = None) -> Draw:
    items = segments(config)
    index = _rng.choices(range(len(items)), weights=[int(s["weight"]) for s in items], k=1)[0]
    points = int(items[index].get("points", 0))
    return Draw(
        won=points > 0, points=points, outcome={"segment_index": index, "label": items[index]["label"]}
    )
