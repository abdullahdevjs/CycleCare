-- CycleCare reminder preferences: secure access for the authenticated user.
-- Run once in Supabase SQL Editor.

create table if not exists public.reminder_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  period_reminder boolean not null default true,
  wellness_reminder boolean not null default false,
  reminder_days_before integer not null default 3 check (reminder_days_before between 1 and 7),
  daily_countdown boolean not null default true,
  reminder_time time not null default '09:00',
  updated_at timestamptz not null default now()
);

alter table public.reminder_preferences enable row level security;
alter table public.reminder_preferences add column if not exists daily_countdown boolean not null default true;
update public.reminder_preferences set wellness_reminder = false, daily_countdown = coalesce(daily_countdown, true);

-- Direct table access is intentionally not required by the frontend.
-- The RPCs below enforce auth.uid() ownership server-side.

drop function if exists public.get_my_reminder_preferences();
drop function if exists public.save_my_reminder_preferences(boolean, boolean, integer, time, boolean);
drop function if exists public.save_my_reminder_preferences(boolean, boolean, integer, time);

create function public.get_my_reminder_preferences()
returns table (
  period_reminder boolean,
  wellness_reminder boolean,
  reminder_days_before integer,
  reminder_time time,
  daily_countdown boolean
)
language sql
security definer
set search_path = public
as $$
  select
    r.period_reminder,
    false as wellness_reminder,
    r.reminder_days_before,
    r.reminder_time,
    coalesce(r.daily_countdown, true)
  from public.reminder_preferences r
  where r.user_id = auth.uid();
$$;

create function public.save_my_reminder_preferences(
  p_period_reminder boolean,
  p_wellness_reminder boolean,
  p_reminder_days_before integer,
  p_reminder_time time,
  p_daily_countdown boolean default true
)
returns public.reminder_preferences
language plpgsql
security definer
set search_path = public
as $$
declare result public.reminder_preferences;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if p_reminder_days_before < 1 or p_reminder_days_before > 7 then
    raise exception 'Reminder days must be between 1 and 7';
  end if;
  insert into public.reminder_preferences
    (user_id, period_reminder, wellness_reminder, reminder_days_before, reminder_time, daily_countdown, updated_at)
  values
    (auth.uid(), coalesce(p_period_reminder, true), false, p_reminder_days_before, coalesce(p_reminder_time, '09:00'::time), coalesce(p_daily_countdown, true), now())
  on conflict (user_id) do update set
    period_reminder = excluded.period_reminder,
    wellness_reminder = false,
    reminder_days_before = excluded.reminder_days_before,
    reminder_time = excluded.reminder_time,
    daily_countdown = excluded.daily_countdown,
    updated_at = now()
  returning * into result;
  return result;
end;
$$;

revoke all on function public.get_my_reminder_preferences() from public;
revoke all on function public.save_my_reminder_preferences(boolean, boolean, integer, time, boolean) from public;
grant execute on function public.get_my_reminder_preferences() to authenticated;
grant execute on function public.save_my_reminder_preferences(boolean, boolean, integer, time, boolean) to authenticated;

notify pgrst, 'reload schema';
