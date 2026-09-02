# CycleCare Blueprint Final Dashboard

This release treats the supplied blue dashboard blueprint as the visual source of truth for the authenticated dashboard.

## Dashboard structure
- Blue gradient sidebar with CycleCare brand, Dashboard, Calendar, Log Period, History & Insights, Wellness Library, Reminders, Profile and Settings.
- Premium upgrade card and user profile card in the sidebar.
- Header with date range, Export PDF, notifications and user avatar.
- Cycle Plan card with phase timeline and fertility callout.
- At a Glance cards for next period, ovulation, cycle length and period length.
- Calendar card with month navigation, Today, legend and full-calendar modal.
- Today's Insights card.
- Tracking card with Log Period, Log Symptoms, Log Wellness and View History actions.
- Wellness Library categories matching the supplied blueprint.
- Private-by-design footer and PDF export.

## Functional behavior
- Log Period starts with blank date and blank period-length fields.
- Existing period start dates are protected from accidental duplicate creation.
- Same-day wellness updates the existing daily record; it does not intentionally create a second record.
- Wellness data is loaded for the current day and can be updated from the dashboard.
- Calendar distinguishes actual, predicted, fertile-window and ovulation states.
- Period reminder remains period-only and uses the saved reminder lead time.
- Supabase credentials are never embedded in the release archive.
