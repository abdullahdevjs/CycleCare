import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Content-Type": "application/json" };

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: cors });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("CYCLECARE_FROM_EMAIL") || "CycleCare <reminders@yourdomain.com>";

  if (!resendKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), { status: 500, headers: cors });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);

  // Production policy: CycleCare sends ONLY period-related reminders.
  // Wellness reminders are intentionally excluded from email delivery.
  const { data: prefs, error } = await supabase
    .from("reminder_preferences")
    .select("user_id, period_reminder, reminder_days_before, reminder_time")
    .eq("period_reminder", true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
  }

  let sent = 0;

  for (const pref of prefs || []) {
    const { data: auth } = await supabase.auth.admin.getUserById(pref.user_id);
    const email = auth?.user?.email;
    if (!email) continue;

    const { data: profile } = await supabase
      .from("cycle_profiles")
      .select("last_period_date, cycle_length")
      .eq("user_id", pref.user_id)
      .maybeSingle();

    if (!profile?.last_period_date || !profile?.cycle_length) continue;

    const start = new Date(`${profile.last_period_date}T00:00:00`);
    const next = new Date(start);
    next.setDate(next.getDate() + Number(profile.cycle_length));

    const diff = Math.round((next.getTime() - today.getTime()) / 86400000);
    const before = Math.max(1, Math.min(7, Number(pref.reminder_days_before ?? 3)));

    // Send once on the user's selected lead-time day, not on every day
    // inside the window. This keeps notifications predictable and quiet.
    if (diff !== before) continue;

    const subject = `CycleCare: period estimated in ${diff} day${diff === 1 ? "" : "s"}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#302a2e;line-height:1.6">
        <div style="padding:28px;border:1px solid #eee3e8;border-radius:20px;background:#fffafb">
          <div style="font-size:12px;font-weight:700;letter-spacing:.12em;color:#a85b78">CYCLECARE</div>
          <h2 style="margin:10px 0 8px">Your period is coming up</h2>
          <p>Your next period is estimated in ${diff} day${diff === 1 ? "" : "s"}, based on your saved cycle.</p>
          <p style="font-size:13px;color:#7f737a">This is an estimate and may change when you log a new period.</p>
        </div>
      </div>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [email], subject, html }),
    });

    if (response.ok) sent++;
  }

  return new Response(JSON.stringify({ sent, date: todayKey }), { headers: cors });
});
