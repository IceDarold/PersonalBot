from functools import lru_cache

from supabase import Client, create_client

from app.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()
    client = create_client(settings.supabase_url, settings.supabase_service_key)
    # Ensure PostgREST queries run under the service role (bypasses RLS policies meant for anon key).
    client.postgrest.auth(settings.supabase_service_key)
    return client
