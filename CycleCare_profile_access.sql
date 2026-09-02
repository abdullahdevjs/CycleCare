-- CycleCare profile access helper
-- Run once in Supabase SQL Editor after the profiles table exists.

grant usage on schema public to authenticated;

create or replace function public.get_my_profile()
returns table (
  id uuid,
  full_name text,
  date_of_birth date,
  avatar_url text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.date_of_birth, p.avatar_url
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.save_my_profile(
  p_full_name text,
  p_date_of_birth date
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare result public.profiles;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  insert into public.profiles (id, full_name, date_of_birth, updated_at)
  values (auth.uid(), nullif(trim(p_full_name), ''), p_date_of_birth, now())
  on conflict (id) do update set
    full_name = excluded.full_name,
    date_of_birth = excluded.date_of_birth,
    updated_at = now()
  returning * into result;
  return result;
end;
$$;

revoke all on function public.get_my_profile() from public;
revoke all on function public.save_my_profile(text, date) from public;
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.save_my_profile(text, date) to authenticated;
