from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Any, Iterable, Sequence

from supabase import Client

from app.services.task_service import Occurrence, SupabaseTaskService


@dataclass
class AreaSummary:
    id: str
    name: str
    slug: str
    icon: str | None
    short_desc: str | None
    priority: int
    health_score: int
    warning_flag: bool
    tasks_today: int
    last_activity_ts: str | None
    last_occurrence_ts: str | None
    stagnation_days: int
    status: str


@dataclass
class AreaGoal:
    id: str
    horizon: str
    title: str
    progress: float
    due_date: str | None


@dataclass
class AreaEvent:
    id: str
    type: str
    ts: str
    payload: dict[str, Any] | None


class SupabaseAreaService:
    """High level orchestration for "areas" (life spheres) domain on Supabase."""

    def __init__(self, client: Client, task_service: SupabaseTaskService) -> None:
        self._client = client
        self._task_service = task_service

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def list_areas(self, tg_id: int, tz: str | None = None) -> dict[str, Any]:
        user = self._task_service.ensure_user(tg_id, tz)
        user_id = user["id"]
        tz_name = user["tz"]
        now_local = self._task_service._local_now(tz_name)
        today = now_local.date()

        areas = (
            self._client.table("area")
            .select(
                "id, name, slug, icon, short_desc, priority, health_score, warning_flag, last_activity_ts, created_at, archived_at"
            )
            .eq("user_id", user_id)
            .is_("archived_at", None)
            .order("priority", desc=False)
            .order("name", desc=False)
            .execute()
        ).data or []

        area_ids = [row["id"] for row in areas]
        rollups = self._fetch_rollups(user_id, area_ids)

        summaries: list[AreaSummary] = []
        for row in areas:
            rollup = rollups.get(row["id"], {})
            last_activity_dt = _parse_ts(row.get("last_activity_ts"))
            if not last_activity_dt:
                last_activity_dt = _parse_ts(row.get("created_at"))
            stagnation_days = _stagnation_days(last_activity_dt, today)
            status = _detect_status(row.get("health_score"), bool(row.get("warning_flag")))
            summaries.append(
                AreaSummary(
                    id=row["id"],
                    name=row.get("name", ""),
                    slug=row.get("slug", ""),
                    icon=row.get("icon"),
                    short_desc=row.get("short_desc"),
                    priority=int(row.get("priority", 3)),
                    health_score=int(row.get("health_score", 70)),
                    warning_flag=bool(row.get("warning_flag")),
                    tasks_today=int(rollup.get("tasks_today", 0)),
                    last_activity_ts=_format_ts(last_activity_dt),
                    last_occurrence_ts=_format_ts(_parse_ts(rollup.get("last_occurrence_ts"))),
                    stagnation_days=stagnation_days,
                    status=status,
                )
            )

        return {
            "areas": [asdict(summary) for summary in summaries],
            "today": today.isoformat(),
            "timezone": tz_name,
            "now": now_local.isoformat(),
        }

    def get_area_detail(self, tg_id: int, area_id: str, tz: str | None = None) -> dict[str, Any]:
        user = self._task_service.ensure_user(tg_id, tz)
        user_id = user["id"]
        tz_name = user["tz"]
        now_local = self._task_service._local_now(tz_name)
        today = now_local.date()

        area_row = (
            self._client.table("area")
            .select(
                "id, name, slug, icon, short_desc, priority, health_score, warning_flag, last_activity_ts, created_at, one_thing"
            )
            .eq("user_id", user_id)
            .eq("id", area_id)
            .single()
            .execute()
        ).data
        if not area_row:
            raise LookupError("Area not found")

        occurrences = self._load_occurrences(user_id, area_id)
        next_actions = _pick_next_actions(occurrences)

        goals = self._fetch_goals(user_id, area_id)
        events = self._fetch_events(user_id, area_id)
        notes = [asdict(evt) for evt in events if evt.type == "note"]
        timeline = [asdict(evt) for evt in events[:50]]

        metrics = self._compute_metrics(occurrences, events, now_local)
        health_score = metrics["health_score"]
        rollup = self._fetch_rollups(user_id, [area_id]).get(area_id, {})
        last_activity_dt = _parse_ts(area_row.get("last_activity_ts")) or _parse_ts(area_row.get("created_at"))
        stagnation_days = _stagnation_days(last_activity_dt, today)
        signals = _build_signals(stagnation_days, next_actions, health_score, bool(area_row.get("warning_flag")))

        return {
            "area": {
                "id": area_row["id"],
                "name": area_row.get("name", ""),
                "slug": area_row.get("slug", ""),
                "icon": area_row.get("icon"),
                "short_desc": area_row.get("short_desc"),
                "priority": int(area_row.get("priority", 3)),
                "health_score": health_score,
                "warning_flag": bool(area_row.get("warning_flag")),
                "last_activity_ts": _format_ts(last_activity_dt),
                "stagnation_days": stagnation_days,
                "tasks_today": int(rollup.get("tasks_today", 0)),
            },
            "overview": {
                "one_thing": area_row.get("one_thing"),
                "next_actions": [asdict(item) for item in next_actions],
                "goals": {goal.horizon: asdict(goal) for goal in goals},
                "signals": signals,
            },
            "tasks": {
                "all": [asdict(item) for item in occurrences],
                "active": [asdict(item) for item in occurrences if item.status != "done"],
                "completed": [asdict(item) for item in occurrences if item.status == "done"],
            },
            "metrics": metrics,
            "timeline": timeline,
            "notes": notes,
            "context": {
                "timezone": tz_name,
                "generated_at": now_local.isoformat(),
            },
        }

    def touch_area(self, tg_id: int, area_id: str, note: str | None = None, tz: str | None = None) -> None:
        user = self._task_service.ensure_user(tg_id, tz)
        payload = {
            "p_user": user["id"],
            "p_area": area_id,
            "p_note": note,
        }
        self._client.rpc("rpc_area_touch", payload).execute()

    def upsert_area(
        self,
        tg_id: int,
        *,
        area_id: str | None = None,
        name: str,
        icon: str | None = None,
        short_desc: str | None = None,
        priority: int | None = None,
        one_thing: str | None = None,
        tz: str | None = None,
    ) -> str:
        user = self._task_service.ensure_user(tg_id, tz)
        payload = {
            "p_user": user["id"],
            "p_id": area_id,
            "p_name": name,
            "p_icon": icon,
            "p_short_desc": short_desc,
            "p_priority": priority,
            "p_one_thing": one_thing,
        }
        response = self._client.rpc("rpc_area_upsert", payload).execute()
        if not response.data:
            raise RuntimeError("Failed to upsert area")
        return str(response.data)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _fetch_rollups(self, user_id: int, area_ids: list[str]) -> dict[str, dict[str, Any]]:
        if not area_ids:
            return {}
        response = (
            self._client.table("mv_area_rollup")
            .select("area_id, tasks_today, last_occurrence_ts, health_score")
            .eq("user_id", user_id)
            .in_("area_id", area_ids)
            .execute()
        )
        rows = response.data or []
        return {row["area_id"]: row for row in rows}

    def _load_occurrences(self, user_id: int, area_id: str) -> list[Occurrence]:
        response = (
            self._client.table("occurrence")
            .select(
                "id, task_id, status, order_index, target_date, rolled_from, created_at, updated_at, "
                "task!inner(id, text, area, area_id)"
            )
            .eq("user_id", user_id)
            .eq("task.area_id", area_id)
            .order("target_date", desc=False)
            .order("order_index", desc=False)
            .execute()
        )
        rows = response.data or []
        return [self._task_service._row_to_occurrence(row) for row in rows]

    def _fetch_goals(self, user_id: int, area_id: str) -> list[AreaGoal]:
        response = (
            self._client.table("area_goal")
            .select("id, horizon, title, progress, due_date")
            .eq("user_id", user_id)
            .eq("area_id", area_id)
            .execute()
        )
        rows = response.data or []
        return [
            AreaGoal(
                id=row["id"],
                horizon=row.get("horizon", ""),
                title=row.get("title", ""),
                progress=float(row.get("progress", 0)),
                due_date=row.get("due_date"),
            )
            for row in rows
        ]

    def _fetch_events(self, user_id: int, area_id: str) -> list[AreaEvent]:
        response = (
            self._client.table("area_event")
            .select("id, type, ts, payload")
            .eq("user_id", user_id)
            .eq("area_id", area_id)
            .order("ts", desc=True)
            .limit(100)
            .execute()
        )
        rows = response.data or []
        return [
            AreaEvent(
                id=row["id"],
                type=row.get("type", "unknown"),
                ts=str(row.get("ts")),
                payload=row.get("payload") or {},
            )
            for row in rows
        ]

    def _compute_metrics(
        self,
        occurrences: Sequence[Occurrence],
        events: Sequence[AreaEvent],
        now_local: datetime,
    ) -> dict[str, Any]:
        seven_days_ago = now_local - timedelta(days=7)
        thirty_days_ago = now_local - timedelta(days=30)

        done_7d = 0
        total_7d = 0
        todo_count = 0
        in_progress_count = 0
        done_total = 0
        next_active = 0
        activity_by_day: dict[str, int] = {}

        for occ in occurrences:
            updated_dt = _parse_ts(occ.updated_at)
            if occ.status == "done":
                done_total += 1
            if occ.status == "todo":
                todo_count += 1
            elif occ.status == "in_progress":
                in_progress_count += 1
            if occ.status != "done":
                next_active += 1
            if updated_dt and updated_dt >= seven_days_ago:
                total_7d += 1
                if occ.status == "done":
                    done_7d += 1

        events_7d = 0
        events_30d = 0
        for event in events:
            ts_dt = _parse_ts(event.ts)
            if not ts_dt:
                continue
            day_key = ts_dt.date().isoformat()
            activity_by_day[day_key] = activity_by_day.get(day_key, 0) + 1
            if ts_dt >= seven_days_ago:
                events_7d += 1
            if ts_dt >= thirty_days_ago:
                events_30d += 1

        activity_score = min(1.0, events_7d / 5) if events_7d else 0.0
        completion_rate = done_7d / max(1, total_7d)
        focus_ratio = min(1.0, next_active / 3) if next_active else 0.0
        health_score = round(
            max(0.0, min(1.0, 0.4 * activity_score + 0.4 * completion_rate + 0.2 * focus_ratio)) * 100
        )

        return {
            "health_score": health_score,
            "activity_last_7": events_7d,
            "activity_last_30": events_30d,
            "completion_rate_7d": round(completion_rate * 100),
            "focus_ratio": round(focus_ratio * 100),
            "counts": {
                "todo": todo_count,
                "in_progress": in_progress_count,
                "done": done_total,
            },
            "activity_spark": sorted(activity_by_day.items()),
        }


def _parse_ts(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    try:
        text = str(value)
        if text.endswith("Z"):
            text = text.replace("Z", "+00:00")
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def _format_ts(value: datetime | None) -> str | None:
    if not value:
        return None
    return value.astimezone(timezone.utc).isoformat()


def _stagnation_days(last_activity: datetime | None, today: date) -> int:
    if not last_activity:
        return 0
    delta = today - last_activity.astimezone(timezone.utc).date()
    return max(delta.days, 0)


def _detect_status(health_score: Any, warning_flag: bool) -> str:
    try:
        score = int(health_score)
    except (TypeError, ValueError):
        score = 70
    if warning_flag:
        return "warning"
    if score >= 70:
        return "ok"
    if score >= 40:
        return "watch"
    return "critical"


def _pick_next_actions(occurrences: Sequence[Occurrence]) -> list[Occurrence]:
    window = [occ for occ in occurrences if occ.status != "done"]
    window.sort(key=lambda item: (item.target_date, item.order_index, item.occurrence_id))
    return window[:3]


def _build_signals(
    stagnation_days: int,
    next_actions: Sequence[Occurrence],
    health_score: int,
    warning_flag: bool,
) -> list[dict[str, Any]]:
    signals: list[dict[str, Any]] = []
    if warning_flag or stagnation_days >= 7:
        label = f"Не двигалось {stagnation_days} дн." if stagnation_days else "Стагнация"
        signals.append({"type": "stagnation", "label": label})
    if not next_actions:
        signals.append({"type": "no_next_actions", "label": "Нет Next Action"})
    if health_score < 50:
        signals.append({"type": "health_low", "label": f"Health Score {health_score}"})
    return signals
