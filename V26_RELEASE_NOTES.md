# CycleCare V26 — Data Integrity & Product Hardening

- Fixed a real period-history bug: logging an older/back-filled period no longer overwrites the current cycle anchor with the older date. The profile anchor is recalculated from the newest saved period.
- Preserved support for multiple period records in the same calendar month, while blocking duplicate identical start dates.
- Added a small SQL hardening migration for one wellness record per user/day. If the existing `daily_checkins_user_date_unique` index from V12 is already present, no additional database change is needed.
- Kept the V25 blue blueprint UI and sidebar/profile fixes intact.
