-- CycleCare: complete data permissions + missing tables
-- Run once in Supabase SQL Editor.

create extension if not exists pgcrypto;

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
  created_at timestamptz not null default now(),
  unique(user_id, checkin_date)
);

alter table public.daily_checkins enable row level security;
drop policy if exists "Users can view own checkins" on public.daily_checkins;
drop policy if exists "Users can insert own checkins" on public.daily_checkins;
drop policy if exists "Users can update own checkins" on public.daily_checkins;
drop policy if exists "Users can delete own checkins" on public.daily_checkins;
create policy "Users can view own checkins" on public.daily_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.daily_checkins for insert with check (auth.uid() = user_id);
create policy "Users can update own checkins" on public.daily_checkins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own checkins" on public.daily_checkins for delete using (auth.uid() = user_id);

-- Cycle history
alter table if exists public.cycle_history enable row level security;
drop policy if exists "Users can view their own cycle history" on public.cycle_history;
drop policy if exists "Users can insert their own cycle history" on public.cycle_history;
drop policy if exists "Users can update their own cycle history" on public.cycle_history;
drop policy if exists "Users can delete their own cycle history" on public.cycle_history;
create policy "Users can view their own cycle history" on public.cycle_history for select using (auth.uid() = user_id);
create policy "Users can insert their own cycle history" on public.cycle_history for insert with check (auth.uid() = user_id);
create policy "Users can update their own cycle history" on public.cycle_history for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own cycle history" on public.cycle_history for delete using (auth.uid() = user_id);

-- Current cycle profile
alter table if exists public.cycle_profiles enable row level security;
drop policy if exists "Users can view their own cycle profile" on public.cycle_profiles;
drop policy if exists "Users can insert their own cycle profile" on public.cycle_profiles;
drop policy if exists "Users can update their own cycle profile" on public.cycle_profiles;
drop policy if exists "Users can delete their own cycle profile" on public.cycle_profiles;
create policy "Users can view their own cycle profile" on public.cycle_profiles for select using (auth.uid() = user_id);
create policy "Users can insert their own cycle profile" on public.cycle_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update their own cycle profile" on public.cycle_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own cycle profile" on public.cycle_profiles for delete using (auth.uid() = user_id);

-- Profile
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  date_of_birth date,
  avatar_url text,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = id);

-- Reminder preferences
create table if not exists public.reminder_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  period_reminder boolean not null default true,
  wellness_reminder boolean not null default true,
  reminder_days_before integer not null default 2 check (reminder_days_before between 0 and 7),
  reminder_time time not null default '09:00',
  updated_at timestamptz not null default now()
);
alter table public.reminder_preferences enable row level security;
drop policy if exists "Users can view own reminders" on public.reminder_preferences;
drop policy if exists "Users can insert own reminders" on public.reminder_preferences;
drop policy if exists "Users can update own reminders" on public.reminder_preferences;
drop policy if exists "Users can delete own reminders" on public.reminder_preferences;
create policy "Users can view own reminders" on public.reminder_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own reminders" on public.reminder_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own reminders" on public.reminder_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own reminders" on public.reminder_preferences for delete using (auth.uid() = user_id);

-- One-click account deletion. The function is intentionally limited to the
-- currently authenticated user's rows and cannot accept another user id.
create or replace function public.delete_my_cyclecare_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.daily_checkins where user_id = auth.uid();
  delete from public.cycle_history where user_id = auth.uid();
  delete from public.reminder_preferences where user_id = auth.uid();
  delete from public.cycle_profiles where user_id = auth.uid();
  delete from public.profiles where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_cyclecare_data() from public;
grant execute on function public.delete_my_cyclecare_data() to authenticated;
