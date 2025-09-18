import logging
from functools import lru_cache

from app.config import get_settings
from app.db import Database
from app.services.area_service import SupabaseAreaService
from app.services.sqlite_task_service import SQLiteTaskService
from app.services.task_service import SupabaseTaskService
from app.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)


@lru_cache
def get_task_service():
    settings = get_settings()
    try:
        client = get_supabase_client()
    except RuntimeError as exc:
        logger.warning("Supabase unavailable (%s). Falling back to local SQLite storage.", exc)
        database = Database(settings.database_path)
        return SQLiteTaskService(database, default_timezone=settings.default_timezone)

    return SupabaseTaskService(client, default_timezone=settings.default_timezone)


@lru_cache
def get_area_service():
    task_service = get_task_service()
    if not isinstance(task_service, SupabaseTaskService):
        raise RuntimeError("Areas API доступна только при подключенном Supabase")
    client = get_supabase_client()
    return SupabaseAreaService(client, task_service)
