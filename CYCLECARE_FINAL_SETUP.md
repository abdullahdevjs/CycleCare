# CycleCare Final Product Setup

## Run

From `frontend`:

```bash
npm install
npm run dev
```

## Supabase SQL

If the base schema/migrations are already installed, do not rerun them unnecessarily.
For a fresh Supabase project, run the schema files in this order:

1. `cyclecare_history_migration.sql`
2. `CycleCare_data_permissions.sql`
3. `CycleCare_profile_access.sql`
4. `CycleCare_reminder_access_fix.sql`
5. `CycleCare_final_database_update.sql`

The period history migration already contains the unique constraint on `(user_id, period_start_date)`.

## Reminder behavior

CycleCare now exposes only period reminders in the UI. The user chooses a lead time (1, 2, 3, 4, 5, or 7 days) and a reminder time. When Daily countdown is enabled (the default), the in-app reminder starts on the selected lead-time day and updates once per day until the estimated period date. Browser notifications require browser permission and the app page/context to be available. Email reminders require the Supabase Edge Function plus a configured email provider such as Resend.

The Edge Function remains period-only; configure its schedule separately if you want email countdowns. Browser/in-app notifications require the app context or push infrastructure for background delivery.

## Product behavior

- Setup My Cycle updates the current baseline. Editing the baseline does not create a second historical period when the only history row is the original setup baseline.
- Log a Period creates a separate actual history event. Different dates in the same month are allowed; duplicate same-user/same-date entries are blocked by the unique index.
- Log Period opens with an empty date selection.
- Calendar renders a complete month without adjacent-month dates.
- Profile access uses secure authenticated RPC helpers.
- Data export and delete-my-data remain available in Account Settings.

## Export

Account Settings exports a formatted PDF only. JSON is not offered in the product UI.
