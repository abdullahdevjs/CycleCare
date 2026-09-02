# CycleCare V30 — Product Logic & UX Hardening

V30 continues the blue blueprint baseline and focuses on correctness rather than another visual rewrite.

## Changes
- Active cycle predictions now use the current `cycle_profiles` preferences as the source of truth. Historical cycle rows remain historical facts and feed averages.
- Period reminder notification is constrained to the configured future reminder window; it never creates a stale alert from an invalid negative countdown.
- Calendar opening resets to the current month and clears stale selected-day state.
- Notification toggle exposes `aria-expanded` for accessible state.
- Existing same-day wellness upsert and period-history duplicate protections remain intact.
- No database schema changes are required for V30.

## Verification
- Source package extracted successfully.
- ZIP archive integrity verified after packaging.
- `npm install` could not be completed in the build container because package download timed out; no claim of a container-side production build is made.
