# CycleCare V32 — Final Product Polish

## Product behavior
- Active cycle remains anchored to the latest **actual logged period**.
- The expected period date is not silently rolled forward after it passes.
- Dashboard explicitly shows **Estimated period is due today** or **X days late** when appropriate.
- Estimated period is displayed as a window, not a guaranteed date.
- Calendar distinguishes actual period, estimated period, fertile window, ovulation, and possible early/late days.
- Logging an actual period refreshes the active cycle and future estimates.
- One wellness record per user per calendar day; updating today's check-in updates the existing record.
- Historical cycle records are preserved and are not used to silently overwrite current cycle preferences.

## UI / UX
- Blue CycleCare product language aligned across Dashboard, Calendar, History & Insights, and Account Center.
- Dashboard loading/auth bootstrap uses a branded compact state instead of raw loading copy.
- Sidebar uses a scroll-safe layout so Profile remains reachable.
- Calendar modal has clear status labels and a compact legend.
- History & Insights uses clear blue tabs, statistics, range, wellness analytics, trend, and history sections.
- Account Center keeps profile, cycle preferences, reminders, privacy/security, appearance, and PDF data controls in a consistent hierarchy.

## Export
- PDF-only personal data export is retained.
- PDF includes account, cycle profile, reminders, period history, and wellness check-ins.

## Supabase
No new V32 migration is required by the frontend changes. Keep the previously applied CycleCare migrations and the unique wellness constraint for `user_id + checkin_date`.

## Run
```bash
cd frontend
npm install
npm run build
npm run preview
```

Then deploy the generated `frontend/dist` directory to the chosen static host.

## Environment
Copy `frontend/.env.example` to `frontend/.env` and provide:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon key supported by the app)
