import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Check, LogOut, ShieldCheck, Trash2, UserRound, LockKeyhole, Download, ChevronRight, CircleHelp, Palette, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { downloadUserData } from "../lib/dataExport";
import { downloadCycleCarePdf } from "../lib/pdfExport";
import "../styles/account-settings.css";

function AccountSettings({ onBack, onLogout }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [cycleLength, setCycleLength] = useState("");
  const [periodLength, setPeriodLength] = useState("");
  const [savedLastPeriodDate, setSavedLastPeriodDate] = useState("");
  const [periodReminder, setPeriodReminder] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [dailyCountdown, setDailyCountdown] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("cyclecare-theme") || "light");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth?.user;
      if (!active) return;
      if (!currentUser) { setError("Your session has expired. Please sign in again."); setLoading(false); return; }
      setUser(currentUser);

      const [profile, cycle, reminders] = await Promise.all([
        supabase.rpc("get_my_profile"),
        supabase.from("cycle_profiles").select("last_period_date,cycle_length,period_length").eq("user_id", currentUser.id).maybeSingle(),
        supabase.rpc("get_my_reminder_preferences"),
      ]);

      if (!active) return;
      if (profile.error) console.warn("Profile helper unavailable:", profile.error.message);
      const profileRow = Array.isArray(profile.data) ? profile.data[0] : profile.data;
      setFullName(profileRow?.full_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "");
      setDob(profileRow?.date_of_birth || "");
      setSavedLastPeriodDate(cycle.data?.last_period_date || "");
      setCycleLength(cycle.data?.cycle_length != null ? Number(cycle.data.cycle_length) : "");
      setPeriodLength(cycle.data?.period_length != null ? Number(cycle.data.period_length) : "");
      const reminderRow = Array.isArray(reminders.data) ? reminders.data[0] : reminders.data;
      setPeriodReminder(reminderRow?.period_reminder ?? true);
      setReminderDays(Number(reminderRow?.reminder_days_before) || 3);
      setReminderTime(reminderRow?.reminder_time || "09:00");
      setDailyCountdown(reminderRow?.daily_countdown ?? true);
      setLoading(false);
    };
    load();
    document.documentElement.dataset.theme = localStorage.getItem("cyclecare-theme") || "light";
    return () => { active = false; };
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setSaved(false); setError("");
    const { error: profileError } = await supabase.rpc("save_my_profile", {
      p_full_name: fullName.trim() || null,
      p_date_of_birth: dob || null,
    });
    if (profileError) { setError("We couldn't save your profile details. Please run CycleCare_profile_access.sql in Supabase once."); setSaving(false); return; }

    // Settings must never erase the user's current period date. The database
    // keeps last_period_date as the current-cycle anchor, so preserve it when
    // saving cycle preferences. If the user has not completed Cycle Setup yet,
    // don't create an incomplete cycle profile from Settings.
    if (savedLastPeriodDate) {
      const cycle = Number(cycleLength);
      const period = Number(periodLength);
      if (!Number.isInteger(cycle) || cycle < 21 || cycle > 45) {
        setError("Cycle length must be between 21 and 45 days.");
        setSaving(false);
        return;
      }
      if (!Number.isInteger(period) || period < 1 || period > 10) {
        setError("Period length must be between 1 and 10 days.");
        setSaving(false);
        return;
      }

      const { error: cycleError } = await supabase.from("cycle_profiles").upsert({
        user_id: user.id,
        last_period_date: savedLastPeriodDate,
        cycle_length: cycle,
        period_length: period,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (cycleError) { setError(cycleError.message); setSaving(false); return; }
    }

    const { error: reminderError } = await supabase.rpc("save_my_reminder_preferences", {
      p_period_reminder: periodReminder,
      p_wellness_reminder: false,
      p_reminder_days_before: reminderDays,
      p_reminder_time: reminderTime,
      p_daily_countdown: dailyCountdown,
    });
    if (reminderError) {
      setError("We couldn't save your reminder preferences. Please run CycleCare_final_database_update.sql in Supabase once.");
      setSaving(false);
      return;
    }

    setSaved(true); setSaving(false);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const handleExport = async () => {
    if (!user || exporting) return;
    setExporting(true);
    setExportMessage("");
    try {
      const result = await downloadUserData(user);
      downloadCycleCarePdf(result.payload);
      setExportMessage(result.unavailable?.length
        ? `Your PDF was downloaded. ${result.unavailable.length} optional data source(s) were unavailable.`
        : "Your complete CycleCare PDF has been downloaded.");
    } catch (exportError) {
      console.error("Data export error:", exportError);
      setExportMessage("We couldn't create your export. Please try again.");
    } finally {
      setExporting(false);
    }
  };


  const sendPasswordReset = async () => {
    if (!user?.email || passwordLoading) return;
    setPasswordLoading(true);
    setPasswordMessage("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin,
    });
    setPasswordMessage(resetError ? "We couldn't send the reset email. Please try again." : "Password reset instructions have been sent to your email.");
    setPasswordLoading(false);
  };

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem("cyclecare-theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const section = (id) => {
    setActiveSection(id);
    window.requestAnimationFrame(() => document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const deleteData = async () => {
    if (!user) return;
    setError("");
    setSaving(true);

    // Prefer the database-side deletion function. It runs as one controlled
    // operation and avoids a chain of client-side deletes being interrupted.
    const { error: rpcError } = await supabase.rpc("delete_my_cyclecare_data");

    if (rpcError) {
      console.error("Delete data error:", rpcError);
      setError("We couldn't delete your data. Please make sure the CycleCare data permissions SQL has been run in Supabase, then try again.");
      setSaving(false);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <main className="account-settings-page"><div className="account-loading-screen"><div className="account-loading-brand"><span>C</span><div><strong>CycleCare</strong><small>Securely loading your account</small></div></div><div className="account-loading-skeleton"><i/><i/><i/></div></div></main>;

  return (
    <main className="account-settings-page">
      <div className="account-settings-shell">
        <header className="account-settings-header">
          <button className="account-back" onClick={onBack}><ArrowLeft size={17} /> Back to dashboard</button>
          <div className="account-brand"><span>C</span> CycleCare</div>
          <div className="account-private"><ShieldCheck size={14} /> Private by design</div>
        </header>

        <div className="account-settings-profile-hero">
          <div className="account-avatar">{(fullName || user?.email || "C").trim().charAt(0).toUpperCase()}</div>
          <div><small>PRIVATE MEMBER</small><strong>{fullName || user?.email?.split("@")[0] || "CycleCare member"}</strong><span>{user?.email || ""}</span></div>
        </div>

        <div className="account-settings-title">
          <span>ACCOUNT CENTER</span>
          <h1>Make CycleCare <em>yours.</em></h1>
          <p>Manage your profile, cycle preferences, notifications, privacy and data from one secure place.</p>
        </div>

        <nav className="account-settings-nav" aria-label="Account settings sections">
          {[['profile','Personal info'],['cycle','Cycle preferences'],['notifications','Reminders'],['security','Privacy & security'],['data','Data & export']].map(([id,label]) => (
            <button type="button" key={id} className={activeSection===id ? 'active' : ''} onClick={() => section(id)}>{label}<ChevronRight size={13}/></button>
          ))}
        </nav>

        <form className="account-settings-grid" onSubmit={save}>
          <section id="settings-profile" className="account-settings-card">
            <div className="account-card-heading"><UserRound size={18} /><div><span>PROFILE</span><h2>Personal details</h2></div></div>
            <label>Full name<input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" /></label>
            <label>Email<input value={user?.email || ""} disabled /></label>
            <label>Date of birth<input type="date" value={dob} onChange={e => setDob(e.target.value)} /></label>
          </section>

          <section id="settings-cycle" className="account-settings-card">
            <div className="account-card-heading"><span className="account-heading-mark">C</span><div><span>CYCLE</span><h2>Cycle preferences</h2>
            {savedLastPeriodDate && <div className="account-saved-cycle-anchor"><span>Current cycle anchor</span><strong>{new Date(`${savedLastPeriodDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></div>}</div></div>
            <label>Typical cycle length <input type="number" min="21" max="45" value={cycleLength} onChange={e => setCycleLength(Number(e.target.value))} /></label>
            <label>Typical period length <input type="number" min="1" max="10" value={periodLength} onChange={e => setPeriodLength(Number(e.target.value))} /></label>
            <p className="account-help">These values are used to personalize your predictions. Estimates are not medical advice.</p>
          </section>

          <section id="settings-notifications" className="account-settings-card">
            <div className="account-card-heading"><Bell size={18} /><div><span>NOTIFICATIONS</span><h2>Reminder preferences</h2></div></div>
            <label className="account-toggle"><span><strong>Period reminder</strong><small>Only period alerts are sent. Choose when the reminder window begins.</small></span><input type="checkbox" checked={periodReminder} onChange={e => { setPeriodReminder(e.target.checked); setSaved(false); }} /></label>
            <div className="account-inline-fields">
              <label>Remind me <select value={reminderDays} onChange={e => { setReminderDays(Number(e.target.value)); setSaved(false); }} disabled={!periodReminder}>
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
                <option value="4">4 days before</option>
                <option value="5">5 days before</option>
                <option value="7">7 days before</option>
              </select></label>
              <label>Reminder time<input type="time" value={reminderTime} onChange={e => { setReminderTime(e.target.value); setSaved(false); }} disabled={!periodReminder} /></label>
            </div>
            <div className="account-reminder-preview"><Bell size={15}/><span>{periodReminder ? `You’ll see a period reminder ${reminderDays} day${reminderDays === 1 ? "" : "s"} before your estimated period.` : "Period reminders are currently off."}</span>{saved && <strong className="account-inline-saved"><Check size={13}/> Saved</strong>}</div>
            <label className="account-toggle account-countdown-toggle"><span><strong>Daily countdown</strong><small>When enabled, show a daily countdown from your selected reminder window until the estimated period date.</small></span><input type="checkbox" checked={dailyCountdown} onChange={e => { setDailyCountdown(e.target.checked); setSaved(false); }} disabled={!periodReminder} /></label>
          </section>

          
          <section id="settings-security" className="account-settings-card account-security-card">
            <div className="account-card-heading"><LockKeyhole size={18}/><div><span>PRIVACY & SECURITY</span><h2>Account protection</h2></div></div>
            <div className="account-security-row"><div className="account-security-icon"><ShieldCheck size={17}/></div><div><strong>Private account</strong><small>Your CycleCare records are scoped to your signed-in account.</small></div><span className="account-status-chip">Protected</span></div>
            <div className="account-security-row"><div className="account-security-icon"><LockKeyhole size={17}/></div><div><strong>Password & sign-in</strong><small>Send a secure password reset link to your current email address.</small>{passwordMessage && <p className="account-security-message">{passwordMessage}</p>}</div><button type="button" className="account-secondary-button" onClick={sendPasswordReset} disabled={passwordLoading}>{passwordLoading ? 'Sending…' : 'Reset password'}</button></div>
            <div className="account-security-row"><div className="account-security-icon"><RefreshCw size={17}/></div><div><strong>Current session</strong><small>Signed in as {user?.email || 'your account'}.</small></div><button type="button" className="account-secondary-button" onClick={onLogout}>Sign out</button></div>
          </section>

          <section className="account-settings-card account-preferences-card">
            <div className="account-card-heading"><Palette size={18}/><div><span>APPEARANCE</span><h2>Interface preferences</h2></div></div>
            <div className="account-theme-options" role="group" aria-label="Theme">
              {[['light','Light','Clean and bright'],['soft','Soft','Warm low-contrast']].map(([value,label,sub]) => <button type="button" key={value} className={theme===value?'selected':''} onClick={()=>changeTheme(value)}><span className="theme-swatch" data-theme-swatch={value}/><span><strong>{label}</strong><small>{sub}</small></span>{theme===value && <Check size={15}/>}</button>)}
            </div>
            <p className="account-help">Your preference is saved on this device and does not change your CycleCare data.</p>
          </section>

          <section id="settings-data" className="account-settings-card account-danger-card">
            <div className="account-card-heading"><Trash2 size={18} /><div><span>DATA CONTROL</span><h2>Your data</h2></div></div>
            <p>Download a beautifully formatted PDF copy of your CycleCare data or permanently remove it from your account.</p>
            <div className="account-data-actions">
              <button type="button" className="account-secondary-button" onClick={handleExport} disabled={exporting}>
                {exporting ? "Preparing export…" : <><Download size={15}/> Download PDF</>}
              </button>
              <button type="button" className="account-danger-button" onClick={() => setDeleteOpen(true)}>Delete my CycleCare data</button>
            </div>
            {exportMessage && <p className="account-export-message">{exportMessage}</p>}
          </section>

          {error && <div className="account-error">{error}</div>}
          <div className="account-actions"><button type="button" className="account-logout" onClick={onLogout}><LogOut size={16}/> Log out</button><button className="account-save" disabled={saving}>{saved ? <><Check size={16}/> Saved</> : saving ? "Saving…" : "Save changes"}</button></div>
        </form>
      </div>

      {saved && <div className="account-save-toast" role="status"><span><Check size={15}/></span><div><strong>Changes saved</strong><small>Your profile and period reminder preferences are up to date.</small></div></div>}

      {deleteOpen && <div className="account-modal-backdrop" onClick={() => setDeleteOpen(false)}><div className="account-confirm" onClick={e => e.stopPropagation()}><Trash2 size={22}/><h2>Delete all your data?</h2><p>Your cycle history, wellness check-ins, reminders and profile will be permanently removed.</p><div><button onClick={() => setDeleteOpen(false)}>Cancel</button><button className="account-danger-button" onClick={deleteData}>Delete permanently</button></div></div></div>}
    </main>
  );
}

export default AccountSettings;
