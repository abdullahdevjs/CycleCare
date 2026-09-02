# CycleCare V10 — Product Release Notes

- Daily countdown period reminders are ON by default and show a countdown from the selected lead time through the estimated period date.
- Only period notifications are supported in the product reminder center; wellness reminders are disabled by default and forced off by the save RPC.
- Daily wellness check-ins use a unique `(user_id, checkin_date)` record, so one record exists per user per day; saving again updates that day's record.
- Log Period remains a separate actual-event workflow and starts with an empty date and duration.
- Added a dependency-free PDF export with multi-page support for account, cycle, reminders, period history, and wellness data.
- Added premium product polish for period logging, history/insights, settings, and mobile layouts.
