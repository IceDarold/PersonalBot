from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Optional

import os

from dotenv import load_dotenv


load_dotenv()


@dataclass
class Settings:
    bot_token: str
    webapp_url: str
    webapp_host: str = "127.0.0.1"
    webapp_port: int = 8000
    supabase_url: Optional[str] = None
    supabase_service_key: Optional[str] = None
    default_timezone: str = "Asia/Nicosia"
    database_path: Path = Path("data/personalbot.db")


@lru_cache
def get_settings() -> Settings:
    token = os.getenv("BOT_TOKEN")
    if not token:
        raise RuntimeError("BOT_TOKEN is missing. Set the bot token via .env or environment variables.")

    url = os.getenv("WEBAPP_URL", "http://127.0.0.1:8000")
    host = os.getenv("WEBAPP_HOST", "127.0.0.1")
    port_str: Optional[str] = os.getenv("WEBAPP_PORT", "8000")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")
    default_tz = os.getenv("DEFAULT_TZ", "Asia/Nicosia")
    db_path_value = os.getenv("DATABASE_PATH")

    try:
        port = int(port_str)
    except ValueError as exc:
        raise RuntimeError("WEBAPP_PORT must be an integer.") from exc

    if db_path_value:
        db_path = Path(db_path_value).expanduser()
    else:
        base_dir = Path(__file__).resolve().parent.parent
        db_path = base_dir / "data" / "personalbot.db"

    db_path.parent.mkdir(parents=True, exist_ok=True)

    return Settings(
        bot_token=token,
        webapp_url=url.rstrip("/"),
        webapp_host=host,
        webapp_port=port,
        supabase_url=supabase_url.rstrip("/") if supabase_url else None,
        supabase_service_key=supabase_service_key,
        default_timezone=default_tz,
        database_path=db_path,
    )
