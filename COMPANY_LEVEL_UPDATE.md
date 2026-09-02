# CycleCare Company-Level Update

## Included
- Privacy-first Supabase auth session using sessionStorage: refresh survives, closing the tab clears the client session.
- Auth bootstrap detects whether a user has completed cycle setup.
- First-time authenticated users are sent directly to Cycle Setup.
- Returning users with saved cycle data go directly to Dashboard.
- Cycle Setup pre-fills typical cycle length (28) and period length (5) when no saved values exist and loads saved values when available.
- New Account Settings page for profile, cycle preferences, reminders, logout and permanent data deletion.
- Dashboard Settings/Profile buttons now open Account Settings.
- Dashboard Reminders opens the existing notification popover and Wellness opens the daily check-in.
- RLS SQL for profiles and reminder preferences.

## Supabase
Run `CycleCare_auth_settings.sql` once in the Supabase SQL Editor.
