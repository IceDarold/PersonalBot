"""Manual rollover runner for cron jobs.

Usage:
    python scripts/rollover_daily.py

The script loads all Telegram users from Supabase and
invokes the rollover logic so that unfinished tasks move from «Вчера» в
«Сегодня». Can be wired to a scheduler (e.g. Windows Task Scheduler,
cron, GitHub Actions) at 00:10 локального времени.
"""

from __future__ import annotations

from app.services import get_task_service
from app.supabase_client import get_supabase_client


def main() -> None:
    client = get_supabase_client()
    service = get_task_service()

    users_response = client.table("app_user").select("tg_id").order("tg_id").execute()
    users = users_response.data or []

    if not users:
        print("No users registered yet. Nothing to rollover.")
        return

    for row in users:
        tg_id = row["tg_id"]
        result = service.rollover(tg_id)
        print(f"tg_id={tg_id}: {result}")


if __name__ == "__main__":
    main()
