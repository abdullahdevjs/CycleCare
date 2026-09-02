# CycleCare V39 — Logic Audit & Integrity Fixes

- Added client-side protection against overlapping bleeding intervals when logging a new period.
- Added the same overlap, future-date, and numeric-range validation when editing period history.
- Fixed first-time/edit setup records so `period_end_date` is derived from the selected bleeding duration instead of being left null.
- Fixed date-only calculations in Cycle Setup to use local calendar dates rather than UTC `toISOString()` extraction. This prevents an India/positive-timezone off-by-one-day bug around midnight and keeps the date picker max date correct.
- Preserved existing authentication, Supabase RLS, reminders, cycle prediction, wellness, history, and PDF export behavior.

Validation note: archive integrity checked. A production Vite build was not claimed because the sandbox does not have the project's dependency tree installed and package installation previously timed out.
