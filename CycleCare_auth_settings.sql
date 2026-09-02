-- CycleCare account + reminder foundation
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
