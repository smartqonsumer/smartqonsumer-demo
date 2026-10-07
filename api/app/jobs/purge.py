"""Retention job (cron): python -m app.jobs.purge"""

from app.core.db import SessionLocal
from app.services.account_service import purge_stale_anonymous_data


def main() -> None:
    with SessionLocal() as db:
        print(f"Purged {purge_stale_anonymous_data(db)} stale anonymous visitor(s).")


if __name__ == "__main__":
    main()
