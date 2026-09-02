# CycleCare V9 — Product polish

- Added a premium, non-pre-filled period date picker for Log Period.
- Kept Setup My Cycle separate from actual period history.
- Added profile access RPCs to reduce direct-profile RLS friction in settings/export.
- Refined premium calendar event cards, actual/estimated/ovulation states and responsive layouts.
- Refined History & Insights and Account Settings visual hierarchy and mobile behavior.
- Added a minute-level clock refresh so in-app period reminders can appear while the app remains open.
- Included `CycleCare_profile_access.sql` for the secure profile helper functions.

## Reminder limitation
Browser notifications require the user to grant browser permission and the web app to be running/open. Automatic email reminders require a server-side scheduler and an email provider such as Resend/SMTP; no provider credentials are included in the client.
