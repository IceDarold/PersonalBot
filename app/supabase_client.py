import base64
import json
from functools import lru_cache

from supabase import Client, create_client

from app.config import get_settings


def _decode_role(jwt: str) -> str | None:
    try:
        payload_b64 = jwt.split(".")[1]
        padding = "=" * ((4 - len(payload_b64) % 4) % 4)
        payload_json = base64.urlsafe_b64decode(payload_b64 + padding).decode()
        data = json.loads(payload_json)
        return data.get("role")
    except Exception:
        return None


@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError("Supabase credentials are not configured.")

    role = _decode_role(settings.supabase_service_key)
    if role != "service_role":
        raise RuntimeError(
            "SUPABASE_SERVICE_KEY must be a service-role key."
            " Полученный токен имеет роль:"
            f" {role or 'unknown'}. Загрузите ключ 'service_role' из Supabase Project Settings → API."
        )

    client = create_client(settings.supabase_url, settings.supabase_service_key)
    client.postgrest.auth(settings.supabase_service_key)
    return client
