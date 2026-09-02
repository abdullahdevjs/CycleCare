# CycleCare V14 — Blue Blueprint

The dashboard visual system has been updated to follow the approved blue SaaS reference direction: white surfaces, airy spacing, blue accents, rounded cards, compact navigation, cycle plan, wellness, history, profile and settings hierarchy.

## Supabase environment
Create `frontend/.env` with:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The app also accepts the legacy variable name `VITE_SUPABASE_ANON_KEY`.

Do not put a `service_role`/secret key in the frontend.

## Run

```bash
cd frontend
npm install
npm run dev
```

## Database
No new table is required by the visual update. Keep the existing five tables and the reminder/wellness migrations already applied.
