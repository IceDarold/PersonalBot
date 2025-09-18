from __future__ import annotations
import html
from datetime import date, datetime, timedelta
from typing import Any, Iterable
from aiogram import F, Router
from aiogram.filters import Command, CommandObject, CommandStart
from aiogram.filters.callback_data import CallbackData
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from app.config import get_settings
from app.services import get_area_service, get_task_service
from app.services.task_service import Occurrence
router = Router()
settings = get_settings()
task_service = get_task_service()
class TaskStatusCallbackFactory(CallbackData, prefix="task"):
    occurrence_id: int
    status: str
    date: str
TASK_STATUS_CB = TaskStatusCallbackFactory
class AreaActionCallbackFactory(CallbackData, prefix="area"):
    area_id: str
    action: str
AREA_ACTION_CB = AreaActionCallbackFactory
MAX_TASKS_PREVIEW = 10
STATUS_EMOJI = {
    "todo": "⬜️",
    "in_progress": "🟡",
    "done": "✅",
}
def build_webapp_keyboard() -> InlineKeyboardMarkup:
    button = InlineKeyboardButton(
        text="Открыть mini-app",
        web_app=WebAppInfo(url=settings.webapp_url),
    )
    return InlineKeyboardMarkup(inline_keyboard=[[button]])
def _escape(text: str) -> str:
    return html.escape(text, quote=False)
def _format_occurrence_line(index: int, occurrence: dict[str, object]) -> str:
    status_icon = STATUS_EMOJI.get(str(occurrence["status"]), "⬜️")
    rolled = " ↺" if occurrence.get("rolled_from") else ""
    area = occurrence.get("area") or ""
    area_part = f" · #{_escape(str(area))}" if area else ""
    short_id = format(int(occurrence["occurrence_id"]), "X")[:4]
    title = _escape(str(occurrence["text"]))
    return f"{index}. {status_icon}{rolled} <b>{title}</b>{area_part} · <code>{short_id}</code>"
def _resolve_date_token(token: str | None, tz_name: str) -> date:
    try:
        now_local = datetime.now(ZoneInfo(tz_name))
    except ZoneInfoNotFoundError:
        now_local = datetime.now()
    if not token:
        return now_local.date()
    normalized = token.strip().lower()
    if normalized in {"today", "сегодня", "segodnya"}:
        return now_local.date()
    if normalized in {"tomorrow", "завтра", "zavtra"}:
        return now_local.date() + timedelta(days=1)
    if normalized in {"yesterday", "вчера", "vchera"}:
        return now_local.date() - timedelta(days=1)
    return date.fromisoformat(normalized)
def _parse_task_add_args(args: str) -> tuple[str, str | None, str | None]:
    tokens = args.strip().split()
    text_parts: list[str] = []
    area: str | None = None
    date_token: str | None = None
    for token in tokens:
        if token.startswith("#") and len(token) > 1:
            area = token[1:]
            continue
        if token.startswith("@") and len(token) > 1:
            date_token = token[1:]
            continue
        text_parts.append(token)
    return " ".join(text_parts).strip(), area, date_token
def _build_task_preview(
    payload: dict[str, object],
    limit: int = MAX_TASKS_PREVIEW,
) -> tuple[str, InlineKeyboardMarkup | None]:
    tasks: list[dict[str, object]] = payload.get("tasks", [])  # type: ignore[assignment]
    total = len(tasks)
    header = payload.get("date", "")
    lines = [f"<b>{header}</b> — задач: {total}"]
    rollover = payload.get("rollover")
    if isinstance(rollover, dict) and rollover.get("created"):
        lines.append(f"↺ Перенесено со вчера: {rollover['created']}")
    preview = tasks[:limit]
    if not preview:
        lines.append("Нет задач. Используйте /task add или mini-app.")
        return "\n".join(lines), None
    for idx, task in enumerate(preview, start=1):
        lines.append(_format_occurrence_line(idx, task))
    if total > limit:
        lines.append(f"…и ещё {total - limit} в mini-app")
    keyboard_rows: list[list[InlineKeyboardButton]] = []
    for idx, task in enumerate(preview, start=1):
        occurrence_id = int(task["occurrence_id"])
        date_str = str(payload.get("date"))
        keyboard_rows.append(
            [
                InlineKeyboardButton(
                    text=f"{idx}✅",
                    callback_data=TaskStatusCallbackFactory(
                        occurrence_id=occurrence_id, status="done", date=date_str
                    ).pack(),
                ),
                InlineKeyboardButton(
                    text=f"{idx}▶️",
                    callback_data=TaskStatusCallbackFactory(
                        occurrence_id=occurrence_id, status="in_progress", date=date_str
                    ).pack(),
                ),
                InlineKeyboardButton(
                    text=f"{idx}↩️",
                    callback_data=TaskStatusCallbackFactory(
                        occurrence_id=occurrence_id, status="todo", date=date_str
                    ).pack(),
                ),
            ]
        )
    return "\n".join(lines), InlineKeyboardMarkup(inline_keyboard=keyboard_rows)
@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    keyboard = build_webapp_keyboard()
    text = (
        "Привет! \n"
        "Я - Jarvis, твой персональный ассистент по любым жизенным вопросам.\n"
        "*Что я умею?*"
        "• /task add &lt;текст&gt; [#сфера] [@сегодня|@завтра|@YYYY-MM-DD]\n"
        "• /tasks today — показать 10 ближайших задач.\n"
        "• /areas — обзор сфер и быстрые действия.\n"
        "• /area add work #Описание !2 — создать сферу.\n"
        "Mini-app поможет управлять списком, статусами и сортировкой."
    )
    await message.answer(text, reply_markup=keyboard)
@router.message(Command("task"))
async def cmd_task(message: Message, command: CommandObject) -> None:
    tg_id = message.from_user.id if message.from_user else None
    if tg_id is None:
        await message.answer("Не удалось определить пользователя.")
        return
    args = (command.args or "").strip()
    if not args:
        await message.answer(
            "Использование: /task add <текст> [#сфера] [@сегодня|@завтра|@YYYY-MM-DD]"
        )
        return
    parts = args.split(maxsplit=1)
    action = parts[0].lower()
    remainder = parts[1] if len(parts) > 1 else ""
    if action != "add":
        await message.answer("Поддерживается только /task add.")
        return
    text, area, date_token = _parse_task_add_args(remainder)
    if not text:
        await message.answer("Текст задачи пустой. Укажите описание после команды.")
        return
    user = task_service.ensure_user(tg_id)
    tz_name = user["tz"]
    try:
        target_date = _resolve_date_token(date_token, tz_name)
    except ValueError:
        await message.answer("Дата должна быть в формате YYYY-MM-DD или @сегодня/@завтра.")
        return
    try:
        occurrence, duplicate = task_service.add_task(
            tg_id=tg_id,
            text=text,
            area=area,
            target_date=target_date,
            tz=tz_name,
        )
    except ValueError as exc:
        await message.answer(str(exc))
        return
    status = "уже была" if duplicate else "добавлена"
    area_part = f" (#{area})" if area else ""
    response = (
        f"Задача {status}: <b>{_escape(occurrence.text)}</b>{area_part}\n"
        f"Дата: {target_date.isoformat()}"
    )
    await message.answer(response)
@router.message(Command("tasks"))
async def cmd_tasks(message: Message, command: CommandObject) -> None:
    tg_id = message.from_user.id if message.from_user else None
    if tg_id is None:
        await message.answer("Не удалось определить пользователя.")
        return
    token = (command.args or "").strip() or "today"
    user = task_service.ensure_user(tg_id)
    tz_name = user["tz"]
    try:
        target_date = _resolve_date_token(token, tz_name)
    except ValueError:
        await message.answer("Дата должна быть @today/@сегодня/@вчера или YYYY-MM-DD.")
        return
    try:
        payload = task_service.list_tasks(
            tg_id=tg_id,
            target_date=target_date,
            include_done=True,
            tz=tz_name,
            auto_rollover=True,
        )
    except ValueError as exc:
        await message.answer(str(exc))
        return
    text, keyboard = _build_task_preview(payload)
    await message.answer(text, reply_markup=keyboard or build_webapp_keyboard())
@router.callback_query(TaskStatusCallbackFactory.filter(), ~F.message.as_(None))
async def callback_update_status(
    callback: CallbackQuery, callback_data: TaskStatusCallbackFactory
) -> None:
    tg_id = callback.from_user.id if callback.from_user else None
    if tg_id is None:
        await callback.answer("Неизвестный пользователь", show_alert=True)
        return
    occurrence_id = int(callback_data.occurrence_id)
    status = callback_data.status
    date_str = callback_data.date
    try:
        task_service.set_status(
            tg_id=tg_id,
            occurrence_id=occurrence_id,
            status=status,
        )
    except ValueError as exc:
        await callback.answer(str(exc), show_alert=True)
        return
    except LookupError:
        await callback.answer("Задача не найдена", show_alert=True)
        return
    payload = task_service.list_tasks(
        tg_id=tg_id,
        target_date=date_str,
        include_done=True,
    )
    text, keyboard = _build_task_preview(payload)
    if callback.message:
        await callback.message.edit_text(text, reply_markup=keyboard)
    await callback.answer("Статус обновлён")
@router.message()
async def fallback(message: Message) -> None:
    keyboard = build_webapp_keyboard()
    await message.answer(
        "Отправьте /tasks для просмотра или /task add чтобы добавить новую задачу.",
        reply_markup=keyboard,
    )
def _format_area_card(area: dict[str, Any]) -> str:
    status = area.get("status") or ("warning" if area.get("warning_flag") else "ok")
    status_icon = AREA_STATUS_EMOJI.get(status, "🔹")
    icon = area.get("icon") or status_icon
    name = _escape(str(area.get("name", "")))
    short_desc = area.get("short_desc")
    health = int(area.get("health_score", 0))
    tasks_today = int(area.get("tasks_today", 0))
    stagnation = int(area.get("stagnation_days", 0))
    lines = [f"{icon} <b>{name}</b> · HS {health}", f"Сегодня: {tasks_today} · Стагнация: {stagnation} дн"]
    if short_desc:
        lines.insert(1, _escape(str(short_desc)))
    return "\n".join(lines)
def _build_area_keyboard(area: dict[str, Any]) -> InlineKeyboardMarkup:
    area_id = str(area.get("id"))
    rows: list[list[InlineKeyboardButton]] = []
    if area_id:
        rows.append(
            [
                InlineKeyboardButton(
                    text="Touch",
                    callback_data=AREA_ACTION_CB(area_id=area_id, action="touch").pack(),
                ),
                InlineKeyboardButton(
                    text="Next Action",
                    callback_data=AREA_ACTION_CB(area_id=area_id, action="next").pack(),
                ),
            ]
        )
        slug = area.get("slug")
        add_payload = f"/task add #{slug} " if slug else "/task add "
        rows.append(
            [
                InlineKeyboardButton(
                    text="Добавить задачу",
                    switch_inline_query_current_chat=add_payload,
                ),
                InlineKeyboardButton(
                    text="В mini-app",
                    web_app=WebAppInfo(url=f"{settings.webapp_url}/areas/{area_id}"),
                ),
            ]
        )
    if not rows:
        rows = [[InlineKeyboardButton(text="Mini-app", web_app=WebAppInfo(url=settings.webapp_url))]]
    return InlineKeyboardMarkup(inline_keyboard=rows)
def _parse_area_add_args(args: str) -> tuple[str, str | None, int | None, str | None]:
    raw = args.strip()
    if not raw:
        return "", None, None, None
    tokens = raw.split()
    icon: str | None = None
    if tokens and _looks_like_emoji(tokens[0]):
        icon = tokens.pop(0)
    name_parts: list[str] = []
    desc_parts: list[str] = []
    priority: int | None = None
    for token in tokens:
        if token.startswith("#") and len(token) > 1:
            desc_parts.append(token[1:])
            continue
        if token.startswith("!") and len(token) > 1:
            try:
                priority = int(token[1:])
            except ValueError:
                continue
            continue
        name_parts.append(token)
    name = " ".join(name_parts).strip()
    short_desc = " ".join(desc_parts).strip() or None
    if priority is not None and not (1 <= priority <= 5):
        priority = None
    return name, short_desc, priority, icon
def _looks_like_emoji(token: str) -> bool:
    if not token:
        return False
    if len(token) <= 2 and not token.isalnum():
        return True
    return False
def _find_area_summary(areas_payload: dict[str, Any], query: str) -> dict[str, Any] | None:
    normalized = query.strip().lower()
    for area in areas_payload.get("areas", []):
        if str(area.get("id")) == query:
            return area
        slug = str(area.get("slug", ""))
        if slug and slug.lower() == normalized:
            return area
        name = str(area.get("name", ""))
        if name and name.lower() == normalized:
            return area
    return None
def _format_area_detail(detail: dict[str, Any]) -> str:
    area = detail.get("area", {})
    overview = detail.get("overview", {})
    metrics = detail.get("metrics", {})
    icon = area.get("icon") or AREA_STATUS_EMOJI.get("warning" if area.get("warning_flag") else "ok", "🔹")
    name = _escape(str(area.get("name", "")))
    short_desc = area.get("short_desc")
    health = int(area.get("health_score", metrics.get("health_score", 0)))
    stagnation = int(area.get("stagnation_days", 0))
    tasks_today = int(area.get("tasks_today", 0))
    lines = [f"{icon} <b>{name}</b> · HS {health}"]
    if short_desc:
        lines.append(_escape(str(short_desc)))
    lines.append(f"Сегодня: {tasks_today} · Стагнация: {stagnation} дн")
    one_thing = overview.get("one_thing")
    if one_thing:
        lines.append(f"🎯 {_escape(str(one_thing))}")
    next_actions = overview.get("next_actions", [])
    if next_actions:
        lines.append("")
        lines.append("Next Actions:")
        for idx, action in enumerate(next_actions, start=1):
            status = STATUS_EMOJI.get(action.get("status"), "•")
            text = _escape(str(action.get("text", "")))
            lines.append(f"{idx}. {status} {text}")
    else:
        lines.append("")
        lines.append("Next Actions: не назначены.")
    signals = overview.get("signals", [])
    if signals:
        labels = ", ".join(str(signal.get("label")) for signal in signals if signal.get("label"))
        if labels:
            lines.append(f"⚠️ {labels}")
    activity = metrics.get("activity_last_7")
    completion = metrics.get("completion_rate_7d")
    if activity is not None and completion is not None:
        lines.append(f"Активность 7д: {activity} · Завершено 7д: {completion}%")
    counts = metrics.get("counts", {})
    if counts:
        lines.append(
            "Статусы: "
            f"todo {counts.get('todo', 0)} · in_progress {counts.get('in_progress', 0)} · done {counts.get('done', 0)}"
        )
    return "\n".join(lines)
def _format_next_actions_message(area_name: str, next_actions: list[dict[str, Any]]) -> str:
    escaped = _escape(area_name)
    if not next_actions:
        return f"Для <b>{escaped}</b> нет активных Next Actions."
    lines = [f"<b>{escaped}</b> — Next Actions"]
    for idx, action in enumerate(next_actions, start=1):
        status = STATUS_EMOJI.get(action.get("status"), "•")
        text = _escape(str(action.get("text", "")))
        target = action.get("target_date")
        suffix = f" · {target}" if target else ""
        lines.append(f"{idx}. {status} {text}{suffix}")
    return "\n".join(lines)
@router.message(Command("areas"))
async def cmd_areas(message: Message) -> None:
    if area_service is None:
        await message.answer("Сферы недоступны в офлайн-режиме. Подключите Supabase.")
        return
    tg_id = message.from_user.id if message.from_user else None
    if tg_id is None:
        await message.answer("Не удалось определить пользователя.")
        return
    try:
        payload = area_service.list_areas(tg_id)
    except RuntimeError as exc:
        await message.answer(f"Не удалось получить список сфер: {exc}")
        return
    areas = payload.get("areas", [])
    if not areas:
        await message.answer("Сферы ещё не созданы. Используйте /area add <имя> для добавления.")
        return
    limit = 6
    await message.answer(f"<b>Сферы</b> — {len(areas)}")
    for area in areas[:limit]:
        text_block = _format_area_card(area)
        keyboard = _build_area_keyboard(area)
        await message.answer(text_block, reply_markup=keyboard)
    if len(areas) > limit:
        await message.answer(f"Показаны первые {limit}. Полный список в mini-app.")
@router.message(Command("area"))
async def cmd_area(message: Message, command: CommandObject) -> None:
    if area_service is None:
        await message.answer("Сферы недоступны в офлайн-режиме. Подключите Supabase.")
        return
    tg_id = message.from_user.id if message.from_user else None
    if tg_id is None:
        await message.answer("Не удалось определить пользователя.")
        return
    args = (command.args or "").strip()
    if not args:
        await message.answer(
            "Использование: /area <имя|id> или /area add <имя> [#описание] [!приоритет]"
        )
        return
    parts = args.split(maxsplit=1)
    keyword = parts[0].lower()
    remainder = parts[1] if len(parts) > 1 else ""
    if keyword == "add":
        name, short_desc, priority, icon = _parse_area_add_args(remainder)
        if not name:
            await message.answer("Укажите название: /area add <имя> [#описание] [!приоритет]")
            return
        try:
            area_service.upsert_area(
                tg_id=tg_id,
                name=name,
                short_desc=short_desc,
                priority=priority,
                icon=icon,
            )
        except RuntimeError as exc:
            await message.answer(f"Не удалось сохранить сферу: {exc}")
            return
        await message.answer(f"Сфера <b>{_escape(name)}</b> сохранена. Используйте /areas для списка.")
        return
    lookup = args
    try:
        areas_payload = area_service.list_areas(tg_id)
    except RuntimeError as exc:
        await message.answer(f"Не удалось получить список сфер: {exc}")
        return
    area_summary = _find_area_summary(areas_payload, lookup)
    if not area_summary:
        await message.answer("Сфера не найдена. Проверьте название или используйте /areas.")
        return
    try:
        detail = area_service.get_area_detail(tg_id, area_summary["id"])
    except LookupError as exc:
        await message.answer(f"Сфера не найдена: {exc}")
        return
    except RuntimeError as exc:
        await message.answer(f"Не удалось получить данные сферы: {exc}")
        return
    text_block = _format_area_detail(detail)
    keyboard = _build_area_keyboard(area_summary)
    await message.answer(text_block, reply_markup=keyboard)
@router.callback_query(AreaActionCallbackFactory.filter())
async def area_action_callback(query: CallbackQuery, callback_data: AreaActionCallbackFactory) -> None:
    if area_service is None:
        await query.answer("Сферы недоступны", show_alert=True)
        return
    tg_id = query.from_user.id if query.from_user else None
    if tg_id is None:
        await query.answer("Не удалось определить пользователя", show_alert=True)
        return
    area_id = callback_data.area_id
    action = callback_data.action
    if action == "touch":
        try:
            area_service.touch_area(tg_id, area_id)
        except RuntimeError as exc:
            await query.answer(str(exc), show_alert=True)
            return
        await query.answer("Зафиксировано")
        return
    if action == "next":
        try:
            detail = area_service.get_area_detail(tg_id, area_id)
        except LookupError as exc:
            await query.answer(str(exc), show_alert=True)
            return
        except RuntimeError as exc:
            await query.answer(str(exc), show_alert=True)
            return
        area_name = str(detail.get("area", {}).get("name", ""))
        next_actions = detail.get("overview", {}).get("next_actions", [])
        message_text = _format_next_actions_message(area_name, next_actions)
        await query.answer()
        if query.message:
            await query.message.answer(message_text)
        return
    await query.answer()
