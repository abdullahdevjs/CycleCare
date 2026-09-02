# CycleCare V12 — company-level product polish

## Dashboard
- Replaced repetitive "Your Cycle Plan" copy with a useful "Your Cycle at a Glance" plan.
- Added a dedicated cycle-plan visual and phase/estimate/reminder status cards.
- Reworked "Your tracking" into actionable "Your care overview" with Wellness Library access.
- Wellness Library now opens the History & Insights wellness view.

## Wellness Library
- One record per user per calendar day is enforced by a unique `(user_id, checkin_date)` index.
- Saving the same day's check-in updates the existing record instead of creating a duplicate.
- Existing wellness records can be edited or deleted from the library.
- Added section navigation for Cycle History, Wellness Library and Trends & Insights.

## PDF export
- Export remains PDF-only.
- Replaced the minimal exporter with a structured multi-page report containing account, cycle, reminder, period history and wellness history sections.
- Includes wellness notes and readable section headers.

## Supabase
- Added `CycleCare_V12_company_upgrade.sql` for the one-record-per-day wellness constraint and period-only reminder defaults.
- `supabase.js` now accepts both `VITE_SUPABASE_PUBLISHABLE_KEY` and legacy `VITE_SUPABASE_ANON_KEY`.
- Added `.env.example` for deployment setup.
