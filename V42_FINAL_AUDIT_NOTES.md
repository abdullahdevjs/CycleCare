# CycleCare V42 — Final SQL Audit

- Re-audited all bundled SQL files and frontend Supabase table/RPC usage.
- Fixed one migration-quality issue in `CycleCare_final_database_update.sql`: rerunning the migration previously reset every user's `daily_countdown` preference to `true`. It now preserves the user's saved value while disabling the retired wellness reminder.
- Reminder RPC signature matches the frontend 5-argument call.
- RLS policies are user-scoped for profiles, cycle profiles, cycle history, daily check-ins, and reminder preferences.
- Account deletion RPC is restricted to `auth.uid()`.
- Duplicate period dates and daily wellness records have unique constraints.
- Existing/base `cycle_profiles` schema is still assumed to be present; the bundled migrations intentionally do not invent or replace the application's original cycle profile schema.
