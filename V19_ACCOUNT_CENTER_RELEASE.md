# CycleCare V19 — Account Center Polish

- Blue/white blueprint-aligned account center.
- Added section navigation for Personal info, Cycle preferences, Reminders, Privacy & security, and Data & export.
- Added secure password-reset action using Supabase Auth.
- Added session protection/status and sign-out action.
- Added local interface preference selector.
- Added stronger save/export feedback and responsive/mobile polish.
- Preserved existing period-only reminder logic, daily countdown, PDF export, data deletion and cycle profile safeguards.
- No database schema migration is required for this UI/account-center update.

## Environment

Create `frontend/.env` from `.env.example` and set:
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
