# CycleCare v5 — Product-level update

- Authenticated users now land on Dashboard after sign-in. Cycle Setup is an optional dashboard action, not a forced route.
- Premium calendar now labels estimated period start days with `EST.` and actual starts with `PERIOD`, with responsive month-only layout.
- History & Insights adds period edit/delete, wellness analytics, seven-day wellness trend, loading/error states and confirmation modals.
- Notification center now surfaces a period alert when the configured reminder window is reached.
- Added Supabase Edge Function `supabase/functions/send-cyclecare-reminders/index.ts` for email reminders via Resend.
- Added `supabase/email_reminders.sql` with deployment/scheduling notes. Actual email delivery requires a verified sending domain and RESEND_API_KEY; the frontend never stores a service-role key.
