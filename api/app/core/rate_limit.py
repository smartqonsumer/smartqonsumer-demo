"""In-memory sliding-window rate limiter for sensitive endpoints (login, registration,
password reset). Enough for a single API process; swap for a shared store (Postgres or
Redis) when running several workers — the call sites would not change."""

import threading
import time
from collections import defaultdict, deque

from app.core.errors import TooManyRequests


class RateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: str, limit: int, window_seconds: int) -> None:
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and hits[0] <= now - window_seconds:
                hits.popleft()
            if len(hits) >= limit:
                raise TooManyRequests(
                    "too_many_requests", "Trop de tentatives. Veuillez patienter quelques minutes."
                )
            hits.append(now)

    def reset(self, key: str | None = None) -> None:
        with self._lock:
            if key is None:
                self._hits.clear()
            else:
                self._hits.pop(key, None)


limiter = RateLimiter()
