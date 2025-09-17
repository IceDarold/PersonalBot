from __future__ import annotations

import hashlib
from dataclasses import asdict, dataclass
from datetime import date, datetime, time, timedelta, timezone
from typing import Any, Sequence

from supabase import Client
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


VALID_STATUSES = {"todo", "in_progress", "done"}
ROLLOVER_CUTOFF = time(hour=0, minute=10)


@dataclass
class Occurrence:
    occurrence_id: int
    task_id: int
    text: str
    area: str | None
    status: str
    order_index: int
    target_date: str
    rolled_from: int | None
    created_at: str
    updated_at: str


class TaskService:
    """Task orchestration on top of Supabase/Postgres tables."""

    def __init__(self, client: Client, default_timezone: str = "Asia/Nicosia") -> None:
        self._client = client
        self._default_timezone = default_timezone

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def ensure_user(self, tg_id: int, tz: str | None = None) -> dict[str, Any]:
        return self._ensure_user(tg_id, tz)

    def add_task(
        self,
        tg_id: int,
        text: str,
        target_date: date | datetime | str | None = None,
        area: str | None = None,
        tz: str | None = None,
    ) -> tuple[Occurrence, bool]:
        if not text or not text.strip():
            raise ValueError("Task text must not be empty")

        cleaned_text = text.strip()
        cleaned_area = area.strip() if area else None

        user = self._ensure_user(tg_id, tz)
        tz_name = user["tz"]
        normalized_date = self._normalize_date(target_date, tz_name)
        fingerprint = self._fingerprint(tg_id, cleaned_text, cleaned_area, normalized_date)

        duplicate = self._find_duplicate(user["id"], fingerprint)
        if duplicate:
            existing = self._fetch_occurrence(duplicate["occurrence_id"])
            return existing, True

        task = self._client.table("task")
        inserted_task = task.insert(
            {
                "user_id": user["id"],
                "text": cleaned_text,
                "area": cleaned_area,
            }
        ).execute()
        if not inserted_task.data:
            raise RuntimeError("Failed to insert task")
        task_row = inserted_task.data[0]

        order_index = self._next_order_index(user["id"], normalized_date)
        occurrence_payload = {
            "user_id": user["id"],
            "task_id": task_row["id"],
            "target_date": normalized_date.isoformat(),
            "status": "todo",
            "order_index": order_index,
        }
        occurrence_resp = (
            self._client.table("occurrence")
            .insert(occurrence_payload)
            .execute()
        )
        if not occurrence_resp.data:
            raise RuntimeError("Failed to insert occurrence")
        occurrence_id = self._to_int(occurrence_resp.data[0]["id"])

        self._client.table("idempotency_log").insert(
            {
                "user_id": user["id"],
                "fingerprint": fingerprint,
                "occurrence_id": occurrence_id,
                "created_at": self._now_utc_iso(),
            }
        ).execute()

        occurrence = self._fetch_occurrence(occurrence_id)
        return occurrence, False

    def list_tasks(
        self,
        tg_id: int,
        target_date: date | datetime | str | None,
        include_done: bool = False,
        tz: str | None = None,
        auto_rollover: bool = True,
    ) -> dict[str, Any]:
        user = self._ensure_user(tg_id, tz)
        tz_name = user["tz"]
        normalized_date = self._normalize_date(target_date, tz_name)

        rollover_info: dict[str, Any] | None = None
        if auto_rollover:
            now_local = self._local_now(tz_name)
            if normalized_date == now_local.date():
                rollover_info = self._rollover(user, now_local)

        query = (
            self._client.table("occurrence")
            .select("id, task_id, status, order_index, target_date, rolled_from, created_at, updated_at, task(text, area)")
            .eq("user_id", user["id"])
            .eq("target_date", normalized_date.isoformat())
            .order("order_index", desc=False)
            .order("id", desc=False)
        )
        if not include_done:
            query = query.neq("status", "done")
        rows = query.execute().data or []

        occurrences = [self._row_to_occurrence(row) for row in rows]

        summary = {
            "total": len(occurrences),
            "by_status": {status: 0 for status in VALID_STATUSES},
            "rolled_over": sum(1 for occ in occurrences if occ.rolled_from is not None),
        }
        tasks = []
        for occ in occurrences:
            summary["by_status"][occ.status] = summary["by_status"].get(occ.status, 0) + 1
            tasks.append(asdict(occ))

        tz_now = self._local_now(tz_name)
        response = {
            "date": normalized_date.isoformat(),
            "timezone": tz_name,
            "yesterday": (normalized_date - timedelta(days=1)).isoformat(),
            "tomorrow": (normalized_date + timedelta(days=1)).isoformat(),
            "tasks": tasks,
            "summary": summary,
            "now": tz_now.isoformat(),
        }
        if rollover_info:
            response["rollover"] = rollover_info

        return response

    def set_status(self, tg_id: int, occurrence_id: int, status: str, tz: str | None = None) -> Occurrence:
        if status not in VALID_STATUSES:
            raise ValueError(f"Unsupported status: {status}")

        user = self._ensure_user(tg_id, tz)
        ownership = (
            self._client.table("occurrence")
            .select("id")
            .eq("id", occurrence_id)
            .eq("user_id", user["id"])
            .execute()
        ).data
        if not ownership:
            raise LookupError("Occurrence not found for this user")

        self._client.table("occurrence").update(
            {
                "status": status,
                "updated_at": self._now_utc_iso(),
            }
        ).eq("id", occurrence_id).execute()

        return self._fetch_occurrence(occurrence_id)

    def reorder(self, tg_id: int, updates: Sequence[tuple[int, int]], tz: str | None = None) -> list[Occurrence]:
        if not updates:
            return []

        user = self._ensure_user(tg_id, tz)
        occurrence_ids = [occ_id for occ_id, _ in updates]

        existing = (
            self._client.table("occurrence")
            .select("id")
            .eq("user_id", user["id"])
            .in_("id", occurrence_ids)
            .execute()
        ).data or []
        if len(existing) != len(updates):
            raise LookupError("One or more occurrences not found for this user")

        payload = [
            {
                "id": occ_id,
                "order_index": order,
                "updated_at": self._now_utc_iso(),
            }
            for occ_id, order in updates
        ]
        self._client.table("occurrence").upsert(payload, on_conflict="id").execute()

        return [self._fetch_occurrence(occ_id) for occ_id, _ in updates]

    def rollover(self, tg_id: int, tz: str | None = None) -> dict[str, Any]:
        user = self._ensure_user(tg_id, tz)
        now_local = self._local_now(user["tz"])
        return self._rollover(user, now_local)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _ensure_user(self, tg_id: int, tz: str | None) -> dict[str, Any]:
        response = (
            self._client.table("app_user")
            .select("*")
            .eq("tg_id", tg_id)
            .execute()
        )
        data = response.data or []
        desired_tz = self._resolve_timezone((data[0]["tz"] if data else None) or tz)

        if data:
            user = data[0]
            if user["tz"] != desired_tz:
                update_resp = (
                    self._client.table("app_user")
                    .update({"tz": desired_tz})
                    .eq("id", user["id"])
                    .execute()
                )
                user = update_resp.data[0] if update_resp.data else user
            return user

        inserted = (
            self._client.table("app_user")
            .insert({"tg_id": tg_id, "tz": desired_tz})
            .execute()
        )
        if not inserted.data:
            raise RuntimeError("Failed to create user")
        return inserted.data[0]

    def _normalize_date(
        self, target_date: date | datetime | str | None, tz_name: str
    ) -> date:
        if target_date is None:
            return self._local_now(tz_name).date()
        if isinstance(target_date, datetime):
            return target_date.date()
        if isinstance(target_date, date):
            return target_date
        if isinstance(target_date, str):
            return date.fromisoformat(target_date)
        raise ValueError("Unsupported date format")

    @staticmethod
    def _fingerprint(tg_id: int, text: str, area: str | None, target_date: date) -> str:
        payload = "|".join([str(tg_id), text.lower(), (area or "").lower(), target_date.isoformat()])
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def _find_duplicate(self, user_id: int, fingerprint: str) -> dict[str, Any] | None:
        cutoff_older = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        self._client.table("idempotency_log").delete().lt("created_at", cutoff_older).execute()

        since_iso = (datetime.now(timezone.utc) - timedelta(seconds=10)).isoformat()
        response = (
            self._client.table("idempotency_log")
            .select("occurrence_id, created_at")
            .eq("user_id", user_id)
            .eq("fingerprint", fingerprint)
            .gte("created_at", since_iso)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        data = response.data or []
        return data[0] if data else None

    def _next_order_index(self, user_id: int, target_date: date) -> int:
        response = (
            self._client.table("occurrence")
            .select("order_index")
            .eq("user_id", user_id)
            .eq("target_date", target_date.isoformat())
            .order("order_index", desc=True)
            .limit(1)
            .execute()
        )
        data = response.data or []
        if not data:
            return 100
        return self._to_int(data[0]["order_index"]) + 100

    def _fetch_occurrence(self, occurrence_id: int) -> Occurrence:
        response = (
            self._client.table("occurrence")
            .select("id, task_id, status, order_index, target_date, rolled_from, created_at, updated_at, task(text, area)")
            .eq("id", occurrence_id)
            .single()
            .execute()
        )
        if not response.data:
            raise LookupError("Occurrence not found")
        return self._row_to_occurrence(response.data)

    def _row_to_occurrence(self, row: dict[str, Any]) -> Occurrence:
        task_data = row.get("task") or {}
        return Occurrence(
            occurrence_id=self._to_int(row["id"]),
            task_id=self._to_int(row["task_id"]),
            text=str(task_data.get("text", "")),
            area=task_data.get("area"),
            status=str(row["status"]),
            order_index=self._to_int(row["order_index"]),
            target_date=str(row["target_date"]),
            rolled_from=self._to_int(row["rolled_from"]) if row.get("rolled_from") is not None else None,
            created_at=str(row["created_at"]),
            updated_at=str(row["updated_at"]),
        )

    def _rollover(self, user: dict[str, Any], now_local: datetime) -> dict[str, Any]:
        today = now_local.date()
        if now_local.time() < ROLLOVER_CUTOFF:
            return {"created": 0, "skipped": "before_cutoff", "today": today.isoformat()}

        yesterday = today - timedelta(days=1)
        undone = (
            self._client.table("occurrence")
            .select("id, task_id")
            .eq("user_id", user["id"])
            .eq("target_date", yesterday.isoformat())
            .neq("status", "done")
            .order("order_index", desc=False)
            .execute()
        ).data or []

        created = 0
        for row in undone:
            present = (
                self._client.table("occurrence")
                .select("id")
                .eq("user_id", user["id"])
                .eq("target_date", today.isoformat())
                .eq("task_id", row["task_id"])
                .limit(1)
                .execute()
            ).data
            if present:
                continue

            order_index = self._next_order_index(user["id"], today)
            self._client.table("occurrence").insert(
                {
                    "user_id": user["id"],
                    "task_id": row["task_id"],
                    "target_date": today.isoformat(),
                    "status": "todo",
                    "order_index": order_index,
                    "rolled_from": row["id"],
                }
            ).execute()
            self._client.table("occurrence").update(
                {"updated_at": self._now_utc_iso()}
            ).eq("id", row["id"]).execute()
            created += 1

        return {
            "created": created,
            "today": today.isoformat(),
            "yesterday": yesterday.isoformat(),
        }

    def _resolve_timezone(self, tz_name: str | None) -> str:
        if tz_name:
            try:
                ZoneInfo(tz_name)
                return tz_name
            except ZoneInfoNotFoundError:
                pass
        return self._default_timezone

    @staticmethod
    def _local_now(tz_name: str) -> datetime:
        try:
            return datetime.now(ZoneInfo(tz_name))
        except ZoneInfoNotFoundError:
            return datetime.now()

    @staticmethod
    def _now_utc_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _to_int(value: Any) -> int:
        return int(value)
