# CycleCare V33 — final product polish

## Included
- Prediction semantics now distinguish upcoming, within-likely-window, and past-window states.
- Estimated period is presented as an estimate plus a transparent possible early/late window.
- Calendar highlights the estimated start date separately from the possible early/late start window.
- Dashboard At a Glance avoids calling a single saved cycle an "average".
- History & Insights requires multiple real cycle intervals before showing an average cycle length.
- History & Insights adds a 14-day Energy / Sleep / Pain trend visualization.
- Account Center loading state is branded and polished.
- Account Center uses a stable two-column product layout on desktop and one column on mobile.
- Existing one-record-per-user-per-day wellness upsert behavior is preserved.
- PDF export remains PDF-only and client-generated.

## Supabase
Run `CycleCare_final_database_update.sql` once in the Supabase SQL editor so the reminder RPC accepts `p_daily_countdown`.

## Local install
From `frontend/`:

```bash
npm install
npm run build
```

Do not commit or deploy `node_modules`; install dependencies in the deployment environment.
