-- CycleCare V26: enforce one wellness record per user per day.
-- Run once in Supabase SQL Editor if this unique index is not already present.
-- This migration is safe when V12's daily_checkins_user_date_unique already exists.

create unique index if not exists daily_checkins_user_date_unique
on public.daily_checkins (user_id, checkin_date);

create index if not exists cycle_history_user_date_idx
on public.cycle_history (user_id, period_start_date desc);
