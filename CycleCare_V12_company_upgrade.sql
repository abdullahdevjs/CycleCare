-- CycleCare V12 company-level data upgrade
-- Safe to run once after the existing CycleCare schema.

create extension if not exists pgcrypto;

-- One wellness record per user per calendar day.
create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  mood text,
  energy integer check (energy between 0 and 5),
  pain integer check (pain between 0 and 5),
  sleep integer check (sleep between 0 and 5),
  notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- If older data contains duplicates, keep the most recently updated row.
delete from public.daily_checkins a
using public.daily_checkins b
where a.user_id = b.user_id
  and a.checkin_date = b.checkin_date
  and a.id <> b.id
  and coalesce(a.updated_at, a.created_at) < coalesce(b.updated_at, b.created_at);

create unique index if not exists daily_checkins_user_date_unique
on public.daily_checkins (user_id, checkin_date);

create index if not exists daily_checkins_user_date_idx
on public.daily_checkins (user_id, checkin_date desc);

alter table public.daily_checkins enable row level security;

drop policy if exists "Users can view own checkins" on public.daily_checkins;
drop policy if exists "Users can insert own checkins" on public.daily_checkins;
drop policy if exists "Users can update own checkins" on public.daily_checkins;
drop policy if exists "Users can delete own checkins" on public.daily_checkins;

create policy "Users can view own checkins"
on public.daily_checkins for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own checkins"
on public.daily_checkins for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own checkins"
on public.daily_checkins for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own checkins"
on public.daily_checkins for delete to authenticated
using (auth.uid() = user_id);

-- Period-only reminders + daily countdown.
alter table if exists public.reminder_preferences
  add column if not exists daily_countdown boolean not null default true;

update public.reminder_preferences
set wellness_reminder = false,
    daily_countdown = coalesce(daily_countdown, true);

notify pgrst, 'reload schema';
