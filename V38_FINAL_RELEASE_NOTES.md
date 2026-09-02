# CycleCare V38 — Final company-level logic + actual bleeding UX pass

## Product/UX
- Reworked Log Period messaging to make the distinction between actual bleeding and predictions explicit.
- Highlighted the exact rule: log the first day real bleeding began; do not log the estimated period date.
- Added a live confirmation summary before save showing actual bleeding start date and duration.
- Upgraded the date picker copy and made its weekday alignment consistent with the dashboard calendar (Sunday-first).
- Improved primary action contrast and focus states.
- Fixed account/settings secondary buttons so they cannot render blue text on a blue background.

## Logic integrity
- Added validation for bleeding duration and future dates when logging a period.
- Historical period edits now always recalculate `period_end_date` from the edited start date + duration.
- Calendar copy explicitly separates actual bleeding from estimated period dates.
- Replaced hard-coded Today’s Insights feelings with either the member’s real wellness log or clearly labeled non-personalized phase guidance.
- Corrected the History & Insights wellness signal label so a count of saved check-ins is not presented as guaranteed calendar-day coverage.
- Protected cycle phase display for edge cases where the estimated ovulation day can overlap the bleeding period.

## Verification
- ZIP integrity should be checked after packaging.
- A production Vite build could not be executed in the sandbox because the dependency installation timed out and the Vite package was not cached. No build-success claim is made.
