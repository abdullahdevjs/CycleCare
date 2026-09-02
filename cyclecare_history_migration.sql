-- CycleCare production cycle history migration
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.cycle_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start_date date not null,
  period_end_date date,
  cycle_length integer not null check (cycle_length between 21 and 45),
  period_length integer not null check (period_length between 1 and 10),
  created_at timestamptz not null default now()
);

create unique index if not exists cycle_history_user_period_unique
on public.cycle_history (user_id, period_start_date);

create index if not exists cycle_history_user_date_idx
on public.cycle_history (user_id, period_start_date desc);

alter table public.cycle_history enable row level security;

drop policy if exists "Users can view their own cycle history" on public.cycle_history;
drop policy if exists "Users can insert their own cycle history" on public.cycle_history;
drop policy if exists "Users can update their own cycle history" on public.cycle_history;
drop policy if exists "Users can delete their own cycle history" on public.cycle_history;

create policy "Users can view their own cycle history"
on public.cycle_history for select
using (auth.uid() = user_id);

create policy "Users can insert their own cycle history"
on public.cycle_history for insert
with check (auth.uid() = user_id);

create policy "Users can update their own cycle history"
on public.cycle_history for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own cycle history"
on public.cycle_history for delete
using (auth.uid() = user_id);

-- Helpful constraints for the existing profile table if it already exists.
alter table if exists public.cycle_profiles
  add column if not exists updated_at timestamptz;

-- Ensure the current-profile upsert used by the frontend has a unique user key.
create unique index if not exists cycle_profiles_user_id_unique
on public.cycle_profiles (user_id);

alter table if exists public.cycle_profiles enable row level security;

drop policy if exists "Users can view their own cycle profile" on public.cycle_profiles;
drop policy if exists "Users can insert their own cycle profile" on public.cycle_profiles;
drop policy if exists "Users can update their own cycle profile" on public.cycle_profiles;

create policy "Users can view their own cycle profile"
on public.cycle_profiles for select
using (auth.uid() = user_id);

create policy "Users can insert their own cycle profile"
on public.cycle_profiles for insert
with check (auth.uid() = user_id);

create policy "Users can update their own cycle profile"
on public.cycle_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
