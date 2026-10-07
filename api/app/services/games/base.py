from dataclasses import dataclass, field
from typing import Any


@dataclass
class Draw:
    won: bool
    points: int
    outcome: dict[str, Any] = field(default_factory=dict)
