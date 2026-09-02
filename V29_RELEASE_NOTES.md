# CycleCare V29 — Data Truth & Export Polish

## Product fixes
- Dashboard period-length metric now distinguishes a single current logged period from a true multi-record average; no fake "average" is shown from one record.
- Dashboard wellness export now includes all fetched daily check-ins rather than only today's check-in.
- Dashboard PDF export accepts both Supabase row objects and array-shaped export payloads, preventing profile/cycle sections from being silently blank.
- Wellness check-in save uses a user/date upsert, matching the intended one-record-per-user-per-day model while still allowing same-day edits.
- Existing blue blueprint UI, responsive layout, and Supabase data model are preserved.

## Database
- No new SQL is required if `daily_checkins_user_date_unique` from the existing V12/V26 migration is already present.
