# CycleCare V31 — Final Deploy Candidate

## Product fixes
- Added an explicit estimated-period window: the app keeps the predicted date as the center estimate and communicates that a period may arrive earlier or later.
- Prediction variability is derived from saved cycle intervals when at least three valid intervals exist; otherwise a conservative +/- 2-day window is used, capped at +/- 4 days.
- Dashboard At a Glance now labels the next period as an estimate instead of implying an exact appointment date.
- Calendar distinguishes actual period, estimated period, fertile window, ovulation, and possible early/late days.
- Full calendar detail shows the estimated date and likely window.
- Fixed calendar weekday alignment so Sunday starts the first column correctly.
- History & Insights now includes a prediction-range/confidence metric and an estimate-not-a-guarantee guidance banner.
- Editing a period now prevents duplicate dates and refreshes the current profile from the true latest saved period after edits.

## Data integrity
- Existing one-record-per-user-per-day wellness behavior is preserved.
- Existing unique period-date protection is preserved.
- No new SQL is required for V31 UI/logic changes.

## Deployment
1. Keep your existing `frontend/.env` with Supabase URL and publishable key.
2. `cd frontend`
3. `npm install`
4. `npm run build`
5. Deploy the generated `dist` folder to your hosting provider.

## Important
Cycle predictions are estimates and should not be treated as medical certainty or contraception guidance.
