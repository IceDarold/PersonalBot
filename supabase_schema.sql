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
-- ---------------------------------------------------------------------------
-- Areas domain (life spheres)
-- ---------------------------------------------------------------------------

create table if not exists area (
    id uuid default gen_random_uuid() primary key,
    user_id bigint not null references app_user(id) on delete cascade,
    name text not null,
    slug text generated always as (regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')) stored,
    icon text,
    short_desc text,
    priority smallint not null default 3 check (priority between 1 and 5),
    health_score smallint not null default 70 check (health_score between 0 and 100),
    last_activity_ts timestamptz,
    warning_flag boolean not null default false,
    one_thing text,
    archived_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, name)
);

create index if not exists idx_area_user_priority on area (user_id, priority desc, name);

drop trigger if exists trg_area_updated_at on area;
create trigger trg_area_updated_at
    before update on area
    for each row execute procedure set_updated_at();

alter table task
    add column if not exists area_id uuid references area(id) on delete set null;

create index if not exists idx_task_area on task (area_id);

create or replace function task_area_sync()
returns trigger as $$
declare
    matched_area record;
begin
    if new.area_id is not null then
        return new;
    end if;

    if new.area is null then
        return new;
    end if;

    select id
      into matched_area
      from area
     where user_id = new.user_id
       and (lower(name) = lower(new.area)
            or slug = regexp_replace(lower(new.area), '[^a-z0-9]+', '-', 'g'))
     limit 1;

    if found then
        new.area_id := matched_area.id;
    end if;

    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_task_area_sync on task;
create trigger trg_task_area_sync
    before insert or update on task
    for each row execute procedure task_area_sync();

create table if not exists area_goal (
    id uuid default gen_random_uuid() primary key,
    area_id uuid not null references area(id) on delete cascade,
    user_id bigint not null references app_user(id) on delete cascade,
    horizon text not null check (horizon in ('week','month','year')),
    title text not null,
    progress numeric not null default 0 check (progress between 0 and 1),
    due_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (area_id, horizon)
);

create index if not exists idx_area_goal_area on area_goal (area_id);

drop trigger if exists trg_area_goal_updated_at on area_goal;
create trigger trg_area_goal_updated_at
    before update on area_goal
    for each row execute procedure set_updated_at();

create table if not exists area_event (
    id uuid default gen_random_uuid() primary key,
    area_id uuid not null references area(id) on delete cascade,
    user_id bigint not null references app_user(id) on delete cascade,
    ts timestamptz not null default now(),
    type text not null check (type in ('touch','note','status_change','goal_update','task_created')),
    payload jsonb
);

create index if not exists idx_area_event_area_ts on area_event (area_id, ts desc);

alter table area enable row level security;
alter table area_goal enable row level security;
alter table area_event enable row level security;

create policy "service-role-full-access" on area
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service-role-full-access" on area_goal
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service-role-full-access" on area_event
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create materialized view if not exists mv_area_rollup as
select
    a.id as area_id,
    a.user_id,
    coalesce(a.health_score, 70) as health_score,
    a.priority,
    a.last_activity_ts,
    (
        select count(*)
          from occurrence o
          join task t on t.id = o.task_id
         where t.area_id = a.id
           and o.target_date = current_date
           and o.status <> 'done'
    ) as tasks_today,
    (
        select max(o.updated_at)
          from occurrence o
          join task t on t.id = o.task_id
         where t.area_id = a.id
    ) as last_occurrence_ts
from area a;

create index if not exists idx_mv_area_rollup_user on mv_area_rollup (user_id, priority desc);

create or replace function refresh_mv_area_rollup()
returns void as $$
begin
    refresh materialized view mv_area_rollup;
end;
$$ language plpgsql;

create or replace function rpc_area_upsert(
    p_user bigint,
    p_id uuid,
    p_name text,
    p_icon text default null,
    p_short_desc text default null,
    p_priority smallint default 3,
    p_one_thing text default null
) returns uuid as $$
declare
    v_id uuid;
begin
    if p_id is null then
        insert into area (user_id, name, icon, short_desc, priority, one_thing)
        values (p_user, p_name, p_icon, p_short_desc, coalesce(p_priority, 3), p_one_thing)
        returning id into v_id;
    else
        update area
           set name = p_name,
               icon = p_icon,
               short_desc = p_short_desc,
               priority = coalesce(p_priority, priority),
               one_thing = coalesce(p_one_thing, one_thing),
               updated_at = now()
         where id = p_id and user_id = p_user
        returning id into v_id;
    end if;

    return v_id;
end;
$$ language plpgsql security definer;

create or replace function rpc_area_touch(
    p_user bigint,
    p_area uuid,
    p_note text default null
) returns void as $$
begin
    update area
       set last_activity_ts = now(),
           warning_flag = false,
           updated_at = now()
     where id = p_area and user_id = p_user;

    insert into area_event (area_id, user_id, type, payload)
    values (p_area, p_user, 'touch', jsonb_build_object('note', p_note));
end;
$$ language plpgsql security definer;

