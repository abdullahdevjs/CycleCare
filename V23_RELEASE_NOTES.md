# CycleCare V23 — Blueprint Final Product Pass

The uploaded blue dashboard blueprint is the visual source of truth.

## Included
- Blueprint-style blue/white dashboard hierarchy.
- Sidebar navigation: Dashboard, Calendar, Log Period, History & Insights, Wellness Library, Reminders, Profile, Settings.
- Cycle Plan with actual/predicted cycle data and phase timeline.
- At-a-Glance metrics use real history; no fabricated averages.
- Calendar with month navigation, actual period, predicted period, fertile window and ovulation states.
- Daily wellness check-in with same-day update behavior.
- Period logging with blank date/length fields and duplicate-date protection.
- History & Insights and Wellness Library entry points.
- Account/Profile/Settings workspace preview on the dashboard plus full Account Center.
- Reminder settings and daily countdown controls.
- PDF-only export actions.
- Private-by-design account/session behavior.
- Mobile responsive and keyboard focus states.

## Database
No new SQL migration is required for this UI/product pass. Keep the existing successful CycleCare migrations already applied in Supabase.

## Environment
Create `frontend/.env` from `.env.example` and provide:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (or legacy `VITE_SUPABASE_ANON_KEY`)
