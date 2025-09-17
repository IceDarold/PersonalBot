import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from app.config import get_settings
from app.handlers.basic import router as basic_router


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)


def create_dispatcher() -> Dispatcher:
    dp = Dispatcher()
    dp.include_router(basic_router)
    return dp


async def main() -> None:
    settings = get_settings()
    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = create_dispatcher()

    logging.info("Starting long polling")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
