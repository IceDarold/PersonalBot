# PersonalBot — ежедневные задачи

Телеграм‑бот и mini‑app для ведения ежедневных задач. Бот принимает команды `/task add`, показывает топ‑10 задач и позволяет менять статусы инлайн‑кнопками. Mini‑app даёт полный доступ к списку: выбор даты, drag‑and‑drop сортировка, фильтрация выполненных и быстрый ввод новой задачи. Невыполненные задачи автоматически «перекатываются» на следующий день.

## Возможности

- **Бот**: `/task add <текст> [#сфера] [@сегодня|@завтра|@YYYY-MM-DD]`, `/tasks today|yesterday|YYYY-MM-DD`, inline‑кнопки `✅/▶️/↩️` для смены статуса.
- **Mini‑app**: дата‑пикер, отображение Today/Yesterday, фильтр выполненных, drag‑and‑drop порядок, форма добавления задачи, тосты и адаптация под тему Telegram.
- **Rollover**: в 00:10 локального времени невыполненные задачи автоматически попадают в «Сегодня». Реализовано на уровне сервиса + REST `/api/rollover` (можно запускать cron‑задачей).
- **Хранилище**: Supabase (Postgres) с таблицами `app_user`, `task`, `occurrence`, `idempotency_log`. Порядок хранится в `order_index` (шаг 100), есть защита от повторных `/task add` в течение 10 секунд.
- **API**: `/api/tasks`, `/api/tasks` (POST), `/api/occurrences/{id}` (PATCH), `/api/occurrences/reorder`, `/api/rollover`.

## Подготовка среды

1. Установите **Python 3.11+**.
2. Склонируйте репозиторий и создайте виртуальное окружение:
   ```powershell
   py -3 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Установите зависимости:
   ```powershell
   pip install -r requirements.txt
   ```
4. Создайте `.env` из `.env.example` и заполните переменные:
   ```env
   BOT_TOKEN=123456:ABCDEF
   WEBAPP_URL=https://<ваш-домен>/
   WEBAPP_HOST=127.0.0.1
   WEBAPP_PORT=8000
   DEFAULT_TZ=Asia/Nicosia
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

> Для локальной разработки нужен HTTPS. Поднимите туннель (`ngrok http 8000`) и укажите публичный URL в `WEBAPP_URL`.

## Запуск

В двух терминалах (виртуальное окружение должно быть активировано):

1. **FastAPI + mini‑app**
   ```powershell
   uvicorn app.webapp.server:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Telegram‑бот**
   ```powershell
   python -m app.bot
   ```

После старта бот отвечает `/start` кнопкой «Открыть mini-app». Mini‑app доступна и по прямой ссылке `WEBAPP_URL`.

## Работа с задачами

### Команды бота

- `/task add Сделать стендап #work @сегодня`
- `/tasks today`, `/tasks yesterday`, `/tasks 2024-05-12`
- Inline‑кнопки в ответе `/tasks` меняют статус без новых сообщений.

### Mini‑app

- Левая/правая кнопка или вввод даты выбирают день, «Показывать выполненные» фильтрует список.
- Drag‑and‑drop меняет порядок (результат сохраняется через API).
- Кнопка «Добавить задачу» открывает modal с полями текст/сфера/дата.
- Тосты сигнализируют об успешных операциях или ошибках.

## Rollover и планировщик

Rollover выполняется при запросе `/api/tasks` для «Сегодня», но для гарантии можно запустить скрипт по расписанию:

```powershell
python scripts/rollover_daily.py
```

Скрипт проходит по всем пользователям и вызывает логику переноса.

## Структура проекта

```
app/
├── bot.py                 # точка входа aiogram
├── config.py              # настройки и .env
├── handlers/basic.py      # команды бота + inline‑кнопки
├── services/
│   ├── __init__.py
│   └── task_service.py    # доменная логика (CRUD, rollover, idempotency)
├── supabase_client.py     # фабрика Supabase клиента
└── webapp/
    ├── server.py          # FastAPI + REST API + статика
    └── static/
        ├── index.html     # mini-app
        ├── script.js      # клиентская логика, drag-drop, fetch API
        └── styles.css     # оформление
scripts/
└── rollover_daily.py      # запуск переноса задач по cron
supabase_schema.sql        # DDL для развёртывания таблиц в Supabase
```

## Полезно знать

- Supabase клиент работает под сервис‑ролью (используется `SUPABASE_SERVICE_KEY`). Mini-app и бот общаются только через FastAPI.
- Идемпотентность `/task add` работает по `(tg_id, текст, дата, сфера)` с тайм-аутом 10 секунд (`idempotency_log`).
- Полный DDL для Supabase лежит в `supabase_schema.sql`. Выполните его через SQL Editor или CLI.
- API возвращает `summary`, `rollover`, `tasks` — ими пользуется mini-app и бот.

## Дальнейшие шаги

- Вынести rollover в отдельную асинхронную edge function / cron job.
- Добавить авторизацию mini-app через `initData` Telegram и Supabase JWT.
- Покрыть сервис unit‑тестами и добавить webhooks вместо long polling при деплое.
