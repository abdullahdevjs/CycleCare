-- CycleCare email reminders (requires Supabase Edge Functions + Resend).
-- The Edge Function reads the authenticated user's email, so users never
-- enter or expose another email address. Only period-related reminders are sent.
-- Deploy: supabase functions deploy send-cyclecare-reminders
-- Set secrets: supabase secrets set RESEND_API_KEY=... CYCLECARE_FROM_EMAIL="CycleCare <reminders@yourdomain.com>"
-- Then schedule the function daily using your Supabase scheduler/pg_cron setup.
-- The function is safe to invoke once per day and sends only the period alert
-- on the exact configured lead-time day (for example, 3 days before).

create extension if not exists pg_net;

-- If pg_cron is enabled in your Supabase project, schedule a daily HTTP call
-- to your deployed function. Replace PROJECT_REF and SERVICE_ROLE_KEY with
-- your project values in the SQL below; never expose the service role key in
-- frontend code.
--
-- select cron.schedule(
--   'cyclecare-daily-email-reminders',
--   '0 9 * * *',
--   $$ select net.http_post(
--     url := 'https://PROJECT_REF.supabase.co/functions/v1/send-cyclecare-reminders',
--     headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer SERVICE_ROLE_KEY'),
--     body := '{}'::jsonb
--   ); $$
-- );
