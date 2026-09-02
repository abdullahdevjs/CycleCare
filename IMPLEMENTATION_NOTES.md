# CycleCare — implementation checkpoint

## What was implemented in this pass

- Added a real **Log a new period** flow to the authenticated dashboard.
- The period logger saves the period start into `cycle_history` and updates `cycle_profiles`.
- Existing period entries are upserted instead of duplicated.
- Dashboard history is refreshed immediately after saving.
- Added a quick-access **Log a period** action.
- Fixed cycle-message period-length reference and made calendar cycle-day calculations use the same historical anchor as the dashboard cycle engine.

## Existing foundation retained

- Supabase authentication and protected dashboard
- Cycle setup and persistent cycle history
- Daily wellness check-ins
- Calendar and cycle predictions
- History & Insights
- Responsive dashboard UI

## Next production feature sequence

1. Reminders + notification preferences
2. Wellness library + phase-aware guidance
3. Full settings/profile experience
4. More robust cycle history editing and period-end dates
5. Improved analytics and trend visualizations
6. Final accessibility, error states, and deployment hardening

## Local setup

From `frontend/`:

```bash
npm install
npm run dev
```

Run the SQL migration in Supabase SQL Editor before using the authenticated tracking flows.
