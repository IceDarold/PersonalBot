from dataclasses import asdict
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.config import get_settings
from app.services import get_task_service
from app.services.task_service import Occurrence


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Task Mini App")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

task_service = get_task_service()


def occurrence_to_dict(occurrence: Occurrence) -> dict[str, Any]:
    return asdict(occurrence)


class TaskCreateRequest(BaseModel):
    tg_id: int = Field(..., description="Telegram user id")
    text: str
    date: str | None = Field(None, description="ISO date (YYYY-MM-DD)")
    area: str | None = None
    tz: str | None = None


class StatusUpdateRequest(BaseModel):
    tg_id: int
    status: str
    tz: str | None = None


class ReorderItem(BaseModel):
    occurrence_id: int
    order_index: int


class ReorderRequest(BaseModel):
    tg_id: int
    items: list[ReorderItem]
    tz: str | None = None


class RolloverRequest(BaseModel):
    tg_id: int
    tz: str | None = None


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/config")
async def api_config() -> JSONResponse:
    settings = get_settings()
    data: dict[str, Any] = {
        "webAppUrl": settings.webapp_url,
    }
    return JSONResponse(content=data)


@app.get("/api/tasks")
async def api_list_tasks(
    tg_id: int,
    date: str | None = Query(None, description="ISO date (defaults to user today)"),
    include_done: bool = Query(False),
    tz: str | None = None,
) -> JSONResponse:
    try:
        payload = task_service.list_tasks(
            tg_id=tg_id,
            target_date=date,
            include_done=include_done,
            tz=tz,
            auto_rollover=True,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return JSONResponse(content=payload)


@app.post("/api/tasks")
async def api_create_task(request: TaskCreateRequest) -> JSONResponse:
    try:
        occurrence, duplicate = task_service.add_task(
            tg_id=request.tg_id,
            text=request.text,
            target_date=request.date,
            area=request.area,
            tz=request.tz,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return JSONResponse(
        content={
            "occurrence": occurrence_to_dict(occurrence),
            "duplicate": duplicate,
        }
    )


@app.patch("/api/occurrences/{occurrence_id}")
async def api_update_status(occurrence_id: int, request: StatusUpdateRequest) -> JSONResponse:
    try:
        occurrence = task_service.set_status(
            tg_id=request.tg_id,
            occurrence_id=occurrence_id,
            status=request.status,
            tz=request.tz,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return JSONResponse(content=occurrence_to_dict(occurrence))


@app.post("/api/occurrences/reorder")
async def api_reorder(request: ReorderRequest) -> JSONResponse:
    updates = [(item.occurrence_id, item.order_index) for item in request.items]
    try:
        updated = task_service.reorder(request.tg_id, updates, tz=request.tz)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return JSONResponse(
        content={"updated": [occurrence_to_dict(occ) for occ in updated]}
    )


@app.post("/api/rollover")
async def api_rollover(request: RolloverRequest) -> JSONResponse:
    result = task_service.rollover(request.tg_id, tz=request.tz)
    return JSONResponse(content=result)
