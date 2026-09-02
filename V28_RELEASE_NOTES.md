# CycleCare V28 — Product Logic & UX Hardening

- Uses the newest saved period history entry as the active cycle anchor when it is newer than the profile anchor.
- Prevents a backdated/older history entry from silently moving the active cycle backwards.
- Uses the latest logged cycle length/period length when available, otherwise falls back to the saved cycle profile.
- Handles a future cycle anchor explicitly instead of clamping it to today/cycle day 1.
- Keeps ovulation countdown truthful: future, today, or past.
- Hides the mini calendar timeline when a future anchor makes the current phase undefined.
- Preserves V27 blue blueprint UI and Supabase schema.
