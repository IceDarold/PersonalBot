from functools import lru_cache

from app.config import get_settings
from app.supabase_client import get_supabase_client
from app.services.task_service import TaskService


@lru_cache
def get_task_service() -> TaskService:
    settings = get_settings()
    client = get_supabase_client()
    return TaskService(client, default_timezone=settings.default_timezone)
