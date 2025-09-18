from __future__ import annotations

import hashlib
import sqlite3
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from typing import Any, Sequence
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.db import Database


VALID_STATUSES = {"todo", "in_progress", "done"}
ROLLOVER_CUTOFF = time(hour=0, minute=10)


@dataclass
class Occurrence:
    occurrence_id: int
    task_id: int
    text: str
    area: str | None
    area_id: str | None
    status: str
    order_index: int
    target_date: str
    rolled_from: int | None
    created_at: str
    updated_at: str


class SQLiteTaskService:
    def __init__(self, database: Database, default_timezone: str = "Asia/Nicosia") -> None:
        self._db = database
        self._default_timezone = default_timezone

    def ensure_user(self, tg_id: int, tz: str | None = None) -> dict[str, Any]:
        with self._db.connect() as conn:
            return self._ensure_user(conn, tg_id, tz)

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

        with self._db.connect() as conn:
            user = self._ensure_user(conn, tg_id, tz)
            tz_name = user["tz"]
            normalized_date = self._normalize_date(target_date, tz_name)
            fingerprint = self._fingerprint(tg_id, cleaned_text, cleaned_area, normalized_date)

            duplicate = self._find_duplicate(conn, user["id"], fingerprint)
            if duplicate:
                existing = self._fetch_occurrence(conn, duplicate["occurrence_id"])
                return existing, True

            task_id = conn.execute(
                """
                INSERT INTO task (user_id, text, area)
                VALUES (?, ?, ?)
                """,
                (user["id"], cleaned_text, cleaned_area),
            ).lastrowid

            order_index = self._next_order_index(conn, user["id"], normalized_date)
            occurrence_id = conn.execute(
                """
                INSERT INTO occurrence (user_id, task_id, target_date, status, order_index)
                VALUES (?, ?, ?, 'todo', ?)
                """,
                (user["id"], task_id, normalized_date.isoformat(), order_index),
            ).lastrowid

            conn.execute(
                """
                INSERT INTO idempotency_log (user_id, fingerprint, occurrence_id)
                VALUES (?, ?, ?)
                """,
                (user["id"], fingerprint, occurrence_id),
            )

            occurrence = self._fetch_occurrence(conn, occurrence_id)
            return occurrence, False

    def list_tasks(
        self,
        tg_id: int,
        target_date: date | datetime | str | None,
        include_done: bool = False,
        tz: str | None = None,
        auto_rollover: bool = True,
    ) -> dict[str, Any]:
        with self._db.connect() as conn:
            user = self._ensure_user(conn, tg_id, tz)
            tz_name = user["tz"]
            normalized_date = self._normalize_date(target_date, tz_name)

            rollover_info: dict[str, Any] | None = None
            if auto_rollover:
                now_local = self._local_now(tz_name)
                if normalized_date == now_local.date():
                    rollover_info = self._rollover(conn, user, now_local)

            condition = "" if include_done else " AND o.status <> 'done'"
            rows = conn.execute(
                f"""
                SELECT
                    o.id AS occurrence_id,
                    o.task_id,
                    t.text,
                    t.area,
                    NULL AS area_id,
                    o.status,
                    o.order_index,
                    o.target_date,
                    o.rolled_from,
                    o.created_at,
                    o.updated_at
                FROM occurrence o
                JOIN task t ON t.id = o.task_id
                WHERE o.user_id = ? AND o.target_date = ? {condition}
                ORDER BY o.order_index ASC, o.id ASC
                """,
                (user["id"], normalized_date.isoformat()),
            ).fetchall()

            tasks = [self._row_to_occurrence_dict(row) for row in rows]
            summary = {
                "total": len(tasks),
                "by_status": {status: 0 for status in VALID_STATUSES},
                "rolled_over": sum(1 for row in tasks if row["rolled_from"] is not None),
            }
            for row in tasks:
                summary["by_status"][row["status"]] = summary["by_status"].get(row["status"], 0) + 1

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

        with self._db.connect() as conn:
            user = self._ensure_user(conn, tg_id, tz)
            belongs = conn.execute(
                """
                SELECT o.id
                FROM occurrence o
                WHERE o.id = ? AND o.user_id = ?
                """,
                (occurrence_id, user["id"]),
            ).fetchone()

            if not belongs:
                raise LookupError("Occurrence not found for this user")

            conn.execute(
                """
                UPDATE occurrence
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (status, occurrence_id),
            )

            return self._fetch_occurrence(conn, occurrence_id)

    def reorder(self, tg_id: int, updates: Sequence[tuple[int, int]], tz: str | None = None) -> list[Occurrence]:
        if not updates:
            return []

        with self._db.connect() as conn:
            user = self._ensure_user(conn, tg_id, tz)
            occurrence_ids = [occ_id for occ_id, _ in updates]

            rows = conn.execute(
                """
                SELECT id
                FROM occurrence
                WHERE id IN ({placeholders}) AND user_id = ?
                """.format(placeholders=",".join("?" for _ in occurrence_ids)),
                (*occurrence_ids, user["id"]),
            ).fetchall()

            if len(rows) != len(occurrence_ids):
                raise LookupError("One or more occurrences not found for this user")

            conn.executemany(
                """
                UPDATE occurrence
                SET order_index = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                [(order, occ_id) for occ_id, order in updates],
            )

            return [self._fetch_occurrence(conn, occ_id) for occ_id, _ in updates]

    def rollover(self, tg_id: int, tz: str | None = None) -> dict[str, Any]:
        with self._db.connect() as conn:
            user = self._ensure_user(conn, tg_id, tz)
            now_local = self._local_now(user["tz"])
            return self._rollover(conn, user, now_local)

    def _ensure_user(self, conn: sqlite3.Connection, tg_id: int, tz: str | None) -> sqlite3.Row:
        row = conn.execute("SELECT * FROM app_user WHERE tg_id = ?", (tg_id,)).fetchone()
        tz_name = self._resolve_timezone(tz or (row["tz"] if row else None))

        if row:
            if row["tz"] != tz_name:
                conn.execute("UPDATE app_user SET tz = ? WHERE id = ?", (tz_name, row["id"]))
                row = conn.execute("SELECT * FROM app_user WHERE id = ?", (row["id"],)).fetchone()
            return row

        conn.execute("INSERT INTO app_user (tg_id, tz) VALUES (?, ?)", (tg_id, tz_name))
        return conn.execute("SELECT * FROM app_user WHERE tg_id = ?", (tg_id,)).fetchone()

    def _normalize_date(self, target_date: date | datetime | str | None, tz_name: str) -> date:
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

    def _find_duplicate(self, conn: sqlite3.Connection, user_id: int, fingerprint: str) -> sqlite3.Row | None:
        conn.execute("DELETE FROM idempotency_log WHERE created_at < datetime('now', '-1 hour')")
        return conn.execute(
            """
            SELECT occurrence_id, created_at
            FROM idempotency_log
            WHERE user_id = ?
              AND fingerprint = ?
              AND created_at >= datetime('now', '-10 seconds')
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (user_id, fingerprint),
        ).fetchone()

    def _next_order_index(self, conn: sqlite3.Connection, user_id: int, target_date: date) -> int:
        row = conn.execute(
            """
            SELECT COALESCE(MAX(order_index), 0) AS max_index
            FROM occurrence
            WHERE user_id = ? AND target_date = ?
            """,
            (user_id, target_date.isoformat()),
        ).fetchone()
        return row["max_index"] + 100 if row and row["max_index"] else 100

    def _fetch_occurrence(self, conn: sqlite3.Connection, occurrence_id: int) -> Occurrence:
        row = conn.execute(
            """
            SELECT
                o.id AS occurrence_id,
                o.task_id,
                t.text,
                t.area,
                NULL AS area_id,
                o.status,
                o.order_index,
                o.target_date,
                o.rolled_from,
                o.created_at,
                o.updated_at
            FROM occurrence o
            JOIN task t ON t.id = o.task_id
            WHERE o.id = ?
            """,
            (occurrence_id,),
        ).fetchone()

        if not row:
            raise LookupError("Occurrence not found")

        return Occurrence(**{key: row[key] for key in row.keys()})

    @staticmethod
    def _row_to_occurrence_dict(row: sqlite3.Row) -> dict[str, Any]:
        data = {key: row[key] for key in row.keys()}
        data.setdefault('area_id', None)
        return data

    def _rollover(self, conn: sqlite3.Connection, user: sqlite3.Row, now_local: datetime) -> dict[str, Any]:
        today = now_local.date()
        if now_local.time() < ROLLOVER_CUTOFF:
            return {"created": 0, "skipped": "before_cutoff", "today": today.isoformat()}

        yesterday = today - timedelta(days=1)

        undone = conn.execute(
            """
            SELECT id, task_id
            FROM occurrence
            WHERE user_id = ? AND target_date = ? AND status <> 'done'
            ORDER BY order_index ASC
            """,
            (user["id"], yesterday.isoformat()),
        ).fetchall()

        created = 0
        for row in undone:
            present = conn.execute(
                """
                SELECT 1
                FROM occurrence
                WHERE user_id = ?
                  AND target_date = ?
                  AND task_id = ?
                LIMIT 1
                """,
                (user["id"], today.isoformat(), row["task_id"]),
            ).fetchone()

            if present:
                continue

            order_index = self._next_order_index(conn, user["id"], today)
            conn.execute(
                """
                INSERT INTO occurrence (user_id, task_id, target_date, status, order_index, rolled_from)
                VALUES (?, ?, ?, 'todo', ?, ?)
                """,
                (user["id"], row["task_id"], today.isoformat(), order_index, row["id"]),
            )
            conn.execute(
                "UPDATE occurrence SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (row["id"],),
            )
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
