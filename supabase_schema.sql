-- Supabase schema for PersonalBot task manager
-- Run inside the Supabase SQL Editor or via `supabase db push`.

create extension if not exists pgcrypto;

create type task_status as enum ('todo', 'in_progress', 'done');

create table if not exists app_user (
    id bigint generated always as identity primary key,
    tg_id bigint not null unique,
    tz text not null default 'Asia/Nicosia',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists task (
    id bigint generated always as identity primary key,
    user_id bigint not null references app_user(id) on delete cascade,
    text text not null,
    area text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists occurrence (
    id bigint generated always as identity primary key,
    user_id bigint not null references app_user(id) on delete cascade,
    task_id bigint not null references task(id) on delete cascade,
    target_date date not null,
    status task_status not null default 'todo',
    order_index integer not null,
    rolled_from bigint references occurrence(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint occurrence_user_task_date_unique unique (user_id, task_id, target_date)
);

create table if not exists idempotency_log (
    id bigint generated always as identity primary key,
    user_id bigint not null references app_user(id) on delete cascade,
    fingerprint text not null,
    occurrence_id bigint not null references occurrence(id) on delete cascade,
    created_at timestamptz not null default now()
);

create index if not exists idx_occurrence_user_date on occurrence (user_id, target_date);
create index if not exists idx_occurrence_task on occurrence (task_id);
create index if not exists idx_idempotency_user_fingerprint on idempotency_log (user_id, fingerprint, created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_app_user_updated_at on app_user;
create trigger trg_app_user_updated_at
before update on app_user
for each row execute procedure set_updated_at();

drop trigger if exists trg_task_updated_at on task;
create trigger trg_task_updated_at
before update on task
for each row execute procedure set_updated_at();

drop trigger if exists trg_occurrence_updated_at on occurrence;
create trigger trg_occurrence_updated_at
before update on occurrence
for each row execute procedure set_updated_at();

alter table app_user enable row level security;
alter table task enable row level security;
alter table occurrence enable row level security;
alter table idempotency_log enable row level security;

create policy "service-role-full-access" on app_user
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service-role-full-access" on task
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service-role-full-access" on occurrence
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service-role-full-access" on idempotency_log
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Example user-scoped policies (optional):
-- create policy "user-can-select-own-tasks" on occurrence
--     for select using (auth.uid()::bigint = user_id);
