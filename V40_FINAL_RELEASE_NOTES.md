# CycleCare V40 — Final Company UI / Calendar Clarity Pass

## Final polish
- Estimated period date is now explicitly emphasized in red/pink so users can distinguish it from actual bleeding.
- The instruction to **log the actual first day of bleeding** is emphasized as the key action.
- Calendar events now use distinct visual treatments:
  - Actual bleeding: red/pink filled state
  - Fertile window: green filled state
  - Estimated ovulation: green outlined state
  - Estimated period: purple/lavender state
  - Possible early/late: blue dashed state
- Actual bleeding takes visual precedence if event ranges overlap, avoiding misleading mixed states.
- Today retains a visible focus/outline while preserving the event's semantic color.
- Calendar legend includes all states and text labels, so meaning is not communicated by color alone.
- Calendar selected-day status remains textual in addition to the color treatment.
- Prediction messaging remains explicit that estimates are not actual bleeding records.

## Logic / integrity audit
- Retained V39 date validation and local-calendar date handling.
- Retained future-date protection and actual-vs-estimated separation.
- Retained duplicate/overlap protections and period-end calculation.
- Retained user-scoped Supabase operations and existing reminder/export/auth flows.

## Additional audit hardening
- Updated `CycleCare_reminder_access_fix.sql` so a fresh setup includes the current `daily_countdown` field and the 5-argument reminder RPC used by the frontend.
- Updated `CYCLECARE_FINAL_SETUP.md` to include the final reminder database update explicitly, removing setup-order ambiguity.

## Verification
- Source balance scan completed for JS/JSX/CSS source files.
- ZIP integrity verified with `unzip -t`.
- Production Vite build was not run because dependencies are not installed in the sandbox; no build-pass claim is made.

The color coding also uses text labels and status text rather than relying on color alone, consistent with W3C guidance on use of color. See: https://www.w3.org/WAI/WCAG21/Understanding/use-of-color
