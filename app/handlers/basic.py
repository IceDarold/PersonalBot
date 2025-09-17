from __future__ import annotations

import html
from datetime import date, datetime, timedelta
from typing import Iterable

from aiogram import F, Router
from aiogram.filters import Command, CommandObject, CommandStart
from aiogram.filters.callback_data import CallbackData
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.config import get_settings
from app.services import get_task_service
from app.services.task_service import Occurrence


router = Router()
settings = get_settings()
task_service = get_task_service()

class TaskStatusCallbackFactory(CallbackData, prefix="task"):
    occurrence_id: int
    status: str
    date: str


TASK_STATUS_CB = TaskStatusCallbackFactory
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
        "Привет! Я веду ежедневные задачи.\n"
        "• /task add &lt;текст&gt; [#сфера] [@сегодня|@завтра|@YYYY-MM-DD]\n"
        "• /tasks today — показать 10 ближайших задач.\n"
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
