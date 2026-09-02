# CycleCare V7 — Product Integrity Release

## Critical cycle-history fix
- `Setup My Cycle` now updates only `cycle_profiles` for existing users.
- Setup creates one history record only when the user has no history yet.
- Editing Setup from one date to another no longer creates a fake second period.
- `Log Period` remains the only action that creates a new historical period.
- Multiple real periods in the same month are supported because history uses a unique `(user_id, period_start_date)` key rather than a month key.
- Current prediction uses the current cycle profile as its authoritative baseline, so a legitimate setup correction immediately affects predictions without rewriting history.

## Calendar
- Stable 42-cell / 6-week layout for every month.
- Adjacent-month dates are never rendered; blank cells remain blank.
- Actual, estimated and estimated-ovulation states are explicit.
- Period start labels show `PERIOD`; estimated start shows `EST.`.
- Premium event cards and selected-date details remain visible.
- Mobile modal sizing and calendar cells are tightened so the complete month remains visible.
