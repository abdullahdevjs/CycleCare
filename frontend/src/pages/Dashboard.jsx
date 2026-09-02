import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Download,
  Droplets,
  Heart,
  HeartPulse,
  Home,
  Info,
  LineChart,
  Menu,
  Pencil,
  Settings,
  ShieldCheck,
  CircleHelp,
  Sparkles,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import PremiumDatePicker from "../components/PremiumDatePicker";
import { downloadCycleCarePdf } from "../lib/pdfExport";
import "../styles/dashboard.css";

const MOODS = [
  ["great", "😊", "Great"],
  ["good", "🙂", "Good"],
  ["okay", "😐", "Okay"],
  ["low", "🙁", "Low"],
  ["difficult", "😔", "Difficult"],
];

const pad = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = (v) => {
  if (!v) return null;
  const [y, m, d] = String(v).split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const formatDate = (v, options = { day: "numeric", month: "short", year: "numeric" }) => {
  const d = typeof v === "string" ? parseDate(v) : v;
  return d ? d.toLocaleDateString("en-IN", options) : "—";
};
const daysBetween = (a, b) => Math.round((b - a) / 86400000);

function Dashboard({ onSetupCycle, onOpenHistory, onOpenWellness, onOpenSettings }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [allCheckins, setAllCheckins] = useState([]);
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [periodDate, setPeriodDate] = useState("");
  const [periodLength, setPeriodLength] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [checkinForm, setCheckinForm] = useState({ mood: "", energy: 0, pain: 0, sleep: 0, notes: "" });

  const load = async () => {
    setLoading(true);
    setMessage("");
    const { data: auth } = await supabase.auth.getUser();
    const currentUser = auth?.user;
    if (!currentUser) { setLoading(false); return; }
    setUser(currentUser);
    const today = dateKey(new Date());
    const [profileRes, historyRes, checkinRes, reminderRes] = await Promise.all([
      supabase.from("cycle_profiles").select("last_period_date, cycle_length, period_length").eq("user_id", currentUser.id).maybeSingle(),
      supabase.from("cycle_history").select("id, period_start_date, period_end_date, cycle_length, period_length, created_at").eq("user_id", currentUser.id).order("period_start_date", { ascending: false }),
      supabase.from("daily_checkins").select("id, checkin_date, mood, energy, pain, sleep, notes, updated_at").eq("user_id", currentUser.id).order("checkin_date", { ascending: false }),
      supabase.rpc("get_my_reminder_preferences"),
    ]);
    setProfile(profileRes.data || null);
    setHistory(historyRes.data || []);
    const checkinRows = checkinRes.data || [];
    setAllCheckins(checkinRows);
    setTodayCheckin(checkinRows.find((row) => row.checkin_date === today) || null);
    const rr = Array.isArray(reminderRes.data) ? reminderRes.data[0] : reminderRes.data;
    setReminder(rr || { period_reminder: true, reminder_days_before: 3, daily_countdown: true, reminder_time: "09:00" });
    if (profileRes.error) console.warn("Cycle profile:", profileRes.error.message);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") { setCalendarOpen(false); setCheckinOpen(false); setPeriodOpen(false); setNotifications(false); } };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "there";
  const firstName = name.split(" ")[0];

  const cycle = useMemo(() => {
    // The latest real period is the safest anchor. This prevents an older
    // backdated history entry from moving the active cycle backwards.
    const latestHistory = [...history]
      .filter((item) => item?.period_start_date)
      .sort((a, b) => b.period_start_date.localeCompare(a.period_start_date))[0];
    const profileAnchor = parseDate(profile?.last_period_date);
    const historyAnchor = parseDate(latestHistory?.period_start_date);
    const anchor = historyAnchor && (!profileAnchor || historyAnchor > profileAnchor)
      ? historyAnchor
      : profileAnchor;
    if (!anchor) return null;

    // Current profile preferences are the source of truth for the active
    // prediction. History rows remain immutable historical facts and are used
    // for averages, not to silently override a user's updated preferences.
    const lengthValue = profile?.cycle_length ?? latestHistory?.cycle_length;
    const periodLengthValue = profile?.period_length ?? latestHistory?.period_length;
    const length = Number(lengthValue);
    const periodLen = Number(periodLengthValue);
    if (!Number.isInteger(length) || length < 21 || length > 45 || !Number.isInteger(periodLen) || periodLen < 1 || periodLen > 10) return null;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    // A future anchor can occur while someone is correcting their data. Keep
    // that state explicit instead of silently pretending today is cycle day 1.
    const diff = daysBetween(anchor, today);
    if (diff < 0) return { anchor, length, periodLen, cycleDay: 0, next: addDays(anchor, length), ovulation: addDays(anchor, Math.max(0, length - 14) - 1), ovulationDay: Math.max(1, length - 14), phase: "Not started", daysToNext: daysBetween(today, addDays(anchor, length)), daysLate: 0, daysBeyondWindow: 0, predictionStatus: "upcoming", periodDue: false };

    // Keep the expected period tied to the current logged cycle. Do not roll
    // silently into another predicted cycle after the expected date passes:
    // members need to see that their period may be late until they log the
    // actual start date.
    const cycleDay = diff + 1;
    const next = addDays(anchor, length);
    const ovulationDay = Math.max(1, length - 14);
    const ovulation = addDays(anchor, ovulationDay - 1);
    const daysToNext = daysBetween(today, next);
    const daysLate = Math.max(0, -daysToNext);

    // Period predictions are estimates, not appointments. Give the member
    // a transparent early/late window instead of implying the estimated day
    // is exact. When enough history exists, widen the window from the user's
    // own cycle variability; otherwise use a conservative +/- 2 days.
    const starts = [...history]
      .filter((item) => item?.period_start_date)
      .sort((a, b) => a.period_start_date.localeCompare(b.period_start_date))
      .map((item) => parseDate(item.period_start_date))
      .filter(Boolean);
    const intervals = starts.slice(1)
      .map((start, i) => daysBetween(starts[i], start))
      .filter((value) => value >= 21 && value <= 45);
    const avgInterval = intervals.length
      ? intervals.reduce((sum, value) => sum + value, 0) / intervals.length
      : length;
    const variability = intervals.length >= 3
      ? Math.sqrt(intervals.reduce((sum, value) => sum + (value - avgInterval) ** 2, 0) / intervals.length)
      : 0;
    const uncertaintyDays = Math.max(2, Math.min(4, Math.ceil(variability || 2)));
    const nextWindowStart = addDays(next, -uncertaintyDays);
    const nextWindowEnd = addDays(next, uncertaintyDays);
    const daysBeyondWindow = Math.max(0, daysBetween(nextWindowEnd, today));
    const predictionStatus = daysBeyondWindow > 0 ? "past-window" : (today >= nextWindowStart ? "within-window" : "upcoming");
    let phase = "Luteal";
    if (cycleDay <= periodLen) phase = "Menstrual";
    else if (cycleDay < ovulationDay) phase = "Follicular";
    else if (cycleDay === ovulationDay) phase = "Ovulation";
    else if (daysLate > 0) phase = "Period expected";
    return { anchor, length, periodLen, cycleDay, next, nextWindowStart, nextWindowEnd, uncertaintyDays, ovulation, ovulationDay, phase, daysToNext, daysLate, daysBeyondWindow, predictionStatus, periodDue: today >= nextWindowStart && today <= nextWindowEnd };
  }, [profile, history]);

  const historyStats = useMemo(() => {
    const sorted = [...history]
      .filter((x) => x?.period_start_date)
      .sort((a, b) => a.period_start_date.localeCompare(b.period_start_date));

    // Never present a made-up “average”. A cycle average needs at least two
    // logged starts so it can be derived from the user's actual history.
    const starts = sorted.map((x) => parseDate(x.period_start_date)).filter(Boolean);
    const intervals = starts.slice(1).map((start, i) => daysBetween(starts[i], start)).filter((x) => x >= 21 && x <= 45);
    const periodLengths = sorted.map((x) => Number(x.period_length)).filter((x) => x >= 1 && x <= 10);
    const average = (values) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;

    return {
      count: sorted.length,
      cycle: average(intervals),
      period: average(periodLengths),
      cycleSamples: intervals.length,
      periodSamples: periodLengths.length,
    };
  }, [history]);

  const phase = cycle?.phase || "Not set up";
  const phaseCopy = {
    Menstrual: "Rest, recharge and listen to your body.",
    Follicular: "A good time for movement, planning and new activities.",
    Ovulation: "High fertility window — take note of how you feel.",
    Luteal: "Slow down gently and prepare for the next phase.",
    "Not started": "Your saved cycle starts in the future. Check the date if this was unexpected.",
    "Not set up": "Add your cycle to unlock your personal plan.",
  }[phase];

  const insightTags = todayCheckin
    ? [
        `Mood: ${String(todayCheckin.mood || "Not logged").replace(/^./, (c) => c.toUpperCase())}`,
        `Energy: ${Number(todayCheckin.energy || 0)}/5`,
        `Pain: ${Number(todayCheckin.pain || 0)}/5`,
      ]
    : [
        phase === "Menstrual" ? "Rest & recharge" : phase === "Ovulation" ? "Peak fertility estimate" : phase === "Luteal" || phase === "Period expected" ? "Gentle movement" : "Build your routine",
        cycle ? `Cycle day ${cycle.cycleDay}` : "Cycle not set",
        "Personal wellness not logged",
      ];

  const calendarDays = useMemo(() => {
    if (!cycle || cycle.phase === "Not started") return [];
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const startOffset = first.getDay();
    const count = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, i) => {
      const day = i - startOffset + 1;
      if (day < 1 || day > count) return null;
      const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
      const key = dateKey(d);
      const actual = history.find((h) => h.period_start_date === key);
      const ranges = history.some((h) => {
        const s = parseDate(h.period_start_date); const e = addDays(s, Number(h.period_length || cycle.periodLen) - 1);
        return d >= s && d <= e;
      });
      const diff = daysBetween(cycle.anchor, d);
      const cd = diff + 1;
      const predicted = !ranges && key === dateKey(cycle.next);
      const inNextPeriodWindow = !ranges && d >= cycle.nextWindowStart && d <= cycle.nextWindowEnd;
      const earlyLate = inNextPeriodWindow && !predicted;
      const fertile = !ranges && diff >= 0 && diff < cycle.length && cd >= cycle.ovulationDay - 5 && cd <= cycle.ovulationDay;
      const ov = !ranges && diff >= 0 && diff < cycle.length && cd === cycle.ovulationDay;
      return { d, key, actual, ranges, predicted, earlyLate, fertile, ov, today: key === dateKey(new Date()) };
    });
  }, [calendarMonth, cycle, history]);

  const reminderText = useMemo(() => {
    if (!cycle || !reminder?.period_reminder) return null;
    const lead = Number(reminder.reminder_days_before ?? 3);
    // The notification is a reminder window, not a persistent alert for
    // every past/invalid state. Daily countdown remains visible separately.
    if (cycle.daysToNext < 0 || cycle.daysToNext > lead) return null;
    if (cycle.daysToNext === 0) return "Your estimated period may be due today.";
    return `Your estimated period may begin in ${cycle.daysToNext} day${cycle.daysToNext === 1 ? "" : "s"}.`;
  }, [cycle, reminder]);

  const openCalendar = () => {
    setNotifications(false);
    const todayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    setCalendarMonth(todayMonth);
    setSelectedDate(null);
    setCalendarOpen(true);
  };
  const openCheckin = () => {
    setCheckinForm({ mood: todayCheckin?.mood || "", energy: Number(todayCheckin?.energy || 0), pain: Number(todayCheckin?.pain || 0), sleep: Number(todayCheckin?.sleep || 0), notes: todayCheckin?.notes || "" });
    setCheckinOpen(true); setNotifications(false);
  };
  const openPeriod = () => { setPeriodDate(""); setPeriodLength(""); setMessage(""); setPeriodOpen(true); setNotifications(false); };

  const saveCheckin = async (e) => {
    e.preventDefault();
    if (!user?.id || !checkinForm.mood || checkinForm.energy === "" || checkinForm.sleep === "") {
      setMessage("Please choose your mood, energy and sleep rating before saving.");
      return;
    }
    setSaving(true); setMessage("");
    const payload = { user_id: user.id, checkin_date: dateKey(new Date()), mood: checkinForm.mood, energy: Number(checkinForm.energy), pain: Number(checkinForm.pain || 0), sleep: Number(checkinForm.sleep), notes: checkinForm.notes.trim() || null, updated_at: new Date().toISOString() };
    const existing = todayCheckin?.id;
    const result = await supabase.from("daily_checkins").upsert(payload, { onConflict: "user_id,checkin_date" }).select().single();
    if (result.error) setMessage(result.error.message);
    else { setTodayCheckin(result.data); setAllCheckins((rows) => [result.data, ...rows.filter((row) => row.checkin_date !== result.data.checkin_date)]); setCheckinOpen(false); setMessage("Today's wellness check-in is saved."); }
    setSaving(false);
  };

  const savePeriod = async (e) => {
    e.preventDefault();
    if (!user?.id || !periodDate || !periodLength) return;
    setSaving(true); setMessage("");
    const periodLengthNumber = Number(periodLength);
    if (!Number.isInteger(periodLengthNumber) || periodLengthNumber < 1 || periodLengthNumber > 10) { setMessage("Bleeding duration must be between 1 and 10 days."); setSaving(false); return; }
    if (periodDate > dateKey(new Date())) { setMessage("The actual bleeding start date cannot be in the future."); setSaving(false); return; }
    const existing = history.find((x) => x.period_start_date === periodDate);
    if (existing) { setMessage("That period date is already in your history. Choose a different date or edit the existing record."); setSaving(false); return; }
    const start = parseDate(periodDate);
    if (!start || Number.isNaN(start.getTime())) { setMessage("Please choose a valid bleeding start date."); setSaving(false); return; }
    const end = addDays(start, periodLengthNumber - 1);
    const overlapsExisting = history.some((item) => {
      const savedStart = parseDate(item?.period_start_date);
      const savedLength = Number(item?.period_length);
      if (!savedStart || !Number.isInteger(savedLength) || savedLength < 1) return false;
      const savedEnd = addDays(savedStart, savedLength - 1);
      return start <= savedEnd && end >= savedStart;
    });
    if (overlapsExisting) {
      setMessage("Those bleeding dates overlap an existing period record. Edit the existing record instead so your history stays consistent.");
      setSaving(false);
      return;
    }
    const currentCycleLength = Number(profile?.cycle_length);
    if (!Number.isInteger(currentCycleLength) || currentCycleLength < 21 || currentCycleLength > 45) {
      setMessage("Please complete your cycle preferences before logging a period.");
      setSaving(false);
      return;
    }

    // Store a real interval when one can be derived from the member's history.
    // For a back-filled period, use the nearest earlier logged start rather than
    // blindly copying today's typical cycle length. The profile value remains the
    // fallback for the first record or when no valid interval exists.
    const previousStart = [...history]
      .map((item) => parseDate(item?.period_start_date))
      .filter((d) => d && d < start)
      .sort((a, b) => b - a)[0];
    const derivedCycleLength = previousStart ? daysBetween(previousStart, start) : currentCycleLength;
    if (previousStart && (derivedCycleLength < 21 || derivedCycleLength > 45)) {
      setMessage("The gap from the previous logged period is outside CycleCare's supported 21–45 day range. Check the date or edit your history first.");
      setSaving(false);
      return;
    }
    const row = { user_id: user.id, period_start_date: periodDate, period_end_date: dateKey(end), cycle_length: derivedCycleLength, period_length: periodLengthNumber };
    const result = await supabase.from("cycle_history").insert(row).select().single();
    if (result.error) setMessage(result.error.message);
    else {
      // The current profile must always point to the newest logged period,
      // not merely the period the user happened to enter. This matters when
      // someone back-fills an older period after already logging a newer one.
      const refreshedHistory = [...history, { period_start_date: periodDate, period_length: periodLengthNumber, cycle_length: derivedCycleLength }]
        .filter((item) => item?.period_start_date)
        .sort((a, b) => a.period_start_date.localeCompare(b.period_start_date));
      const latest = refreshedHistory.at(-1);
      const profileUpdate = latest
        ? await supabase.from("cycle_profiles").update({
            last_period_date: latest.period_start_date,
            cycle_length: Number(latest.cycle_length),
            period_length: Number(latest.period_length),
            updated_at: new Date().toISOString(),
          }).eq("user_id", user.id)
        : { error: null };
      if (profileUpdate.error) console.warn(profileUpdate.error.message);
      await load(); setPeriodOpen(false); setMessage("Period saved. Your latest cycle anchor has been refreshed.");
    }
    setSaving(false);
  };

  const downloadPdf = async () => {
    try {
      downloadCycleCarePdf({ user, cycleProfile: profile, history, checkins: allCheckins });
      setMessage("Your CycleCare PDF is ready.");
    } catch (e) { setMessage(e?.message || "Unable to create PDF."); }
  };

  const nav = [
    ["Dashboard", Home, () => setMobileMenu(false)],
    ["Calendar", CalendarDays, openCalendar],
    ["Log Period", Droplets, openPeriod],
    ["History & Insights", LineChart, onOpenHistory],
    ["Wellness Library", Heart, onOpenWellness],
    ["Reminders", Bell, () => { setNotifications(true); setMobileMenu(false); }],
    ["Help & Support", CircleHelp, () => { setMessage("CycleCare support: use your account email when contacting support."); setMobileMenu(false); }],
  ];

  if (loading) return <div className="cc-dashboard-loading" role="status" aria-live="polite" aria-label="Loading your CycleCare dashboard">
    <div className="cc-loading-shell">
      <div className="cc-loading-topbar"><div className="cc-loading-brand"><div className="cc-loader-logo">C</div><div><strong>CycleCare</strong><small>Your private cycle companion</small></div></div><div className="cc-loading-top-actions"><span/><span/><span/></div></div>
      <div className="cc-loading-content">
        <div className="cc-loading-heading"><i/><i/></div>
        <div className="cc-loading-grid-top"><div className="cc-loading-card cc-loading-plan"><i/><i/><i/><i/><i/><i/></div><div className="cc-loading-card"><i/><i/><i/><i/></div></div>
        <div className="cc-loading-grid-lower"><div className="cc-loading-card cc-loading-calendar"><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="cc-loading-card"><i/><i/><i/><i/><i/></div><div className="cc-loading-card"><i/><i/><i/><i/><i/></div></div>
      </div>
      <span className="cc-loading-status">Preparing your private dashboard…</span>
    </div>
  </div>;

  return (
    <main className="cc-dashboard">
      {mobileMenu && <button className="cc-mobile-overlay" aria-label="Close menu" onClick={() => setMobileMenu(false)} />}
      <aside className={`cc-sidebar ${mobileMenu ? "is-open" : ""}`}>
        <div>
          <div className="cc-brand"><div className="cc-brand-mark">C</div><div><strong>CycleCare</strong><small>Know your cycle. Care for yourself.</small></div></div>
          <nav className="cc-nav">
            {nav.map(([label, Icon, action]) => <button key={label} className={`cc-nav-item ${label === "Dashboard" ? "active" : ""}`} onClick={action}><Icon size={19} /><span>{label}</span></button>)}
          </nav>
          <div className="cc-nav-divider" />
          <button className="cc-nav-item" onClick={() => { onOpenSettings?.(); setMobileMenu(false); }}><UserRound size={19} /><span>Profile</span></button>
          <button className="cc-nav-item" onClick={() => { onOpenSettings?.(); setMobileMenu(false); }}><Settings size={19} /><span>Settings</span></button>
        </div>
        <div className="cc-sidebar-bottom">
          <div className="cc-premium-card"><Sparkles size={19} /><strong>Go Premium</strong><p>Unlock advanced insights, detailed reports and an ad-free experience.</p><button onClick={onOpenHistory}>Explore insights <ChevronRight size={15} /></button></div>
          <button className="cc-user-card" onClick={onOpenSettings}><span className="cc-avatar">{name.slice(0, 1).toUpperCase()}</span><span><strong>{name}</strong><small>View Profile</small></span><ChevronRight size={17} /></button>
        </div>
      </aside>

      <section className="cc-main">
        <header className="cc-header">
          <button className="cc-menu" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={23} /></button>
          <div className="cc-mobile-title">Dashboard</div>
          <div className="cc-header-spacer" />
          <button className="cc-date-range" onClick={openCalendar}><CalendarDays size={16}/> {cycle ? `${formatDate(cycle.anchor, {month:"short",day:"numeric",year:"numeric"})} – ${formatDate(addDays(cycle.next,-1), {month:"short",day:"numeric",year:"numeric"})}` : "Cycle overview"}<ChevronRight size={14}/></button>
          <button className="cc-export-top" onClick={downloadPdf}><Download size={16}/> Export PDF</button>
          <button className="cc-icon-button" onClick={() => setNotifications(v => !v)} aria-label="Notifications" aria-expanded={notifications}><Bell size={19} />{reminderText && <span className="cc-notification-badge">1</span>}</button>
          <button className="cc-header-avatar" onClick={onOpenSettings}>{name.slice(0, 1).toUpperCase()}</button>
          {notifications && <div className="cc-notification-panel"><div><strong>Notifications</strong><button onClick={() => setNotifications(false)}><X size={16} /></button></div>{reminderText ? <div className="cc-notification-item"><Bell size={17} /><span><strong>Period reminder</strong><small>{reminderText} Estimated: {formatDate(cycle?.next)}</small></span></div> : <div className="cc-empty-mini"><Check size={16} /> You're all caught up.</div>}</div>}
        </header>

        <div className="cc-body">
          <div className="cc-page-title"><div><h1>Dashboard</h1><p>Hello {name}, here’s your cycle at a glance.</p></div><button className="cc-outline-action" onClick={openCheckin}><HeartPulse size={17} />{todayCheckin ? "Update wellness" : "Today's check-in"}<ChevronRight size={16} /></button></div>

          {message && <div className="cc-toast" role="status"><Check size={17} />{message}<button onClick={() => setMessage("")}><X size={15} /></button></div>}

          <div className="cc-grid-top">
            <article className="cc-card cc-cycle-plan">
              <div className="cc-card-heading"><div><span className="cc-label">CYCLE PLAN</span><h2>Cycle Plan <Info size={15} /></h2>{cycle && <p>{formatDate(cycle.anchor)} – {formatDate(addDays(cycle.next, -1))} • {cycle.length} Days</p>}</div><div className="cc-soft-icon"><Sparkles size={20} /></div></div>
              {cycle ? <>
                <div className="cc-phase-line"><i className="period" /><i className="follicular" /><i className="ovulation" /><i className="luteal" /></div>
                <div className="cc-phase-grid">
                  <Phase name="Period" dates={`${formatDate(cycle.anchor, {month:"short",day:"numeric"})} – ${formatDate(addDays(cycle.anchor, cycle.periodLen - 1), {month:"short",day:"numeric"})}`} cls="period" active={phase === "Menstrual"} />
                  <Phase name="Follicular" dates={cycle.ovulationDay - 1 > cycle.periodLen ? `${formatDate(addDays(cycle.anchor, cycle.periodLen), {month:"short",day:"numeric"})} – ${formatDate(addDays(cycle.anchor, cycle.ovulationDay - 2), {month:"short",day:"numeric"})}` : "Overlaps period"} cls="follicular" active={phase === "Follicular"} />
                  <Phase name="Ovulation" dates={formatDate(cycle.ovulation, {month:"short",day:"numeric",year:"numeric"})} cls="ovulation" active={phase === "Ovulation"} />
                  <Phase name="Luteal" dates={`${formatDate(addDays(cycle.ovulation,1), {month:"short",day:"numeric"})} – ${formatDate(addDays(cycle.next,-1), {month:"short",day:"numeric"})}`} cls="luteal" active={phase === "Luteal" || phase === "Period expected"} />
                </div>
                <div className={`cc-plan-callout ${cycle.daysLate > 0 ? "is-due" : ""}`}><Sparkles size={17} /><div><strong>{cycle.daysLate > 0 ? `Period is ${cycle.daysLate} day${cycle.daysLate === 1 ? "" : "s"} late` : cycle.predictionStatus === "within-window" ? "Your estimated period window is open" : (() => { const today = new Date(); today.setHours(0,0,0,0); const delta = daysBetween(today, cycle.ovulation); return delta > 0 ? `Ovulation in ${delta} days` : delta < 0 ? `Ovulation was ${Math.abs(delta)} days ago` : "Ovulation is today"; })()}</strong><span className="cc-plan-estimate"><b>Estimated period:</b> <strong>{formatDate(cycle.next, {month:"short",day:"numeric",year:"numeric"})}</strong> <i>•</i> likely window {formatDate(cycle.nextWindowStart, {month:"short",day:"numeric"})} – {formatDate(cycle.nextWindowEnd, {month:"short",day:"numeric"})}</span>{cycle.daysLate > 0 && <small className="cc-delay-badge">Today is {cycle.daysLate} day{cycle.daysLate === 1 ? "" : "s"} after the estimated date. The period may still start later.</small>}<small className="cc-prediction-note">This is an estimate, not a fixed date. Your period can start earlier or later. <strong>Log the actual first day when bleeding begins</strong> to refresh future predictions.</small></div><button onClick={openCalendar}>View Calendar <ChevronRight size={15} /></button></div>
              </> : <div className="cc-empty-plan"><Sparkles size={26} /><strong>Your personal cycle plan starts here.</strong><p>Log your first period to unlock your cycle timeline, estimated ovulation and next-period prediction.</p><button onClick={onSetupCycle}>Set up my cycle <ChevronRight size={16} /></button></div>}
            </article>

            <article className="cc-card cc-glance">
              <div className="cc-glance-head"><div><span className="cc-label">YOUR KEY NUMBERS</span><h2>At a Glance <Info size={15} /></h2><p>Four simple numbers that explain where you are in your cycle.</p></div></div>
              <div className="cc-glance-grid">
                <Metric icon={CalendarDays} title="Next Period" value={cycle ? formatDate(cycle.next) : "Not set"} sub={cycle ? (cycle.daysLate > 0 ? `${cycle.daysLate} day${cycle.daysLate === 1 ? "" : "s"} late` : cycle.predictionStatus === "within-window" ? "Likely window is open" : `About ${Math.max(0, cycle.daysToNext)} days away`) : "Add your cycle"} detail={cycle ? `Window: ${formatDate(cycle.nextWindowStart, {month:"short",day:"numeric"})} – ${formatDate(cycle.nextWindowEnd, {month:"short",day:"numeric"})}` : "Prediction appears after setup."} />
                <Metric icon={Activity} title="Ovulation" value={cycle ? formatDate(cycle.ovulation) : "Not set"} sub={cycle ? `Cycle day ${cycle.ovulationDay}` : "Add your cycle"} detail="Estimated fertile peak" green />
                <Metric icon={Zap} title="Cycle Length" value={historyStats.cycle ? `${historyStats.cycle} days` : cycle ? `${cycle.length} days` : "Not set"} sub={historyStats.cycle ? "Your average" : cycle ? "Current cycle" : "Add your cycle"} detail={historyStats.cycle ? `Based on ${historyStats.cycleSamples} logged intervals` : "More history improves the average."} />
                <Metric icon={Droplets} title="Period Length" value={historyStats.period ? `${historyStats.period} days` : cycle ? `${cycle.periodLen} days` : "Not set"} sub={historyStats.periodSamples >= 2 ? "Your average" : historyStats.periodSamples === 1 ? "Current logged period" : cycle ? "Current cycle" : "Log a period to start"} detail={historyStats.period ? `Based on ${historyStats.periodSamples} logged periods` : "This is how long bleeding lasts."} purple />
              </div>
            </article>
          </div>

          <div className="cc-grid-lower">
            <article className="cc-card cc-calendar-card"><div className="cc-section-head"><h2><CalendarDays size={18} /> Calendar</h2><div className="cc-calendar-actions"><button onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1))}><ChevronLeft size={17}/></button><strong>{calendarMonth.toLocaleDateString("en-IN", {month:"long",year:"numeric"})}</strong><button onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1))}><ChevronRight size={17}/></button><button className="today-btn" onClick={() => setCalendarMonth(new Date(new Date().getFullYear(),new Date().getMonth(),1))}>Today</button></div></div>
              <div className="cc-weekdays">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=><span key={x}>{x}</span>)}</div>
              <div className="cc-calendar-grid">{calendarDays.map((item, i) => item ? <button key={item.key} className={`cc-day ${item.today?"today":""} ${item.ranges?"period":""} ${item.predicted?"predicted":""} ${item.earlyLate?"early-late":""} ${item.fertile?"fertile":""} ${item.ov?"ovulation":""}`} onClick={() => {setSelectedDate(item.d);setCalendarOpen(true)}}>{item.d.getDate()}</button> : <span key={`e-${i}`} />)}</div>
              <div className="cc-legend"><span><i className="dot period"/>Actual period</span><span><i className="dot fertile"/>Fertile window</span><span><i className="dot ovulation"/>Ovulation</span><span><i className="dot predicted"/>Estimated period</span><span><i className="dot early-late"/>Possible early/late</span></div><button className="cc-full-button" onClick={openCalendar}>View Full Calendar</button>
            </article>

            <article className="cc-card cc-insight-card"><div className="cc-section-head"><h2>Today’s Insights <Info size={15}/></h2>{cycle && <span className="cc-day-pill">Day {cycle.cycleDay}</span>}</div><div className="cc-insight-icon"><Sparkles size={31}/></div><strong className="cc-insight-phase">{phase}</strong><p>{phaseCopy}</p><strong className="cc-feel-title">{todayCheckin ? "From your wellness log" : "What this means today"}</strong><div className="cc-tags">{insightTags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="cc-full-button" onClick={todayCheckin ? onOpenHistory : openCheckin}>{todayCheckin ? "View trends" : "Log wellness"}</button></article>

            <article className="cc-card cc-tracking-card"><div className="cc-section-head"><h2>Tracking <Info size={15}/></h2></div><TrackRow icon={Droplets} color="red" title="Log Period" sub="Record your period information" onClick={openPeriod}/><TrackRow icon={Activity} color="yellow" title="Log Symptoms" sub="Track how you’re feeling" onClick={openCheckin}/><TrackRow icon={Heart} color="pink" title="Log Wellness" sub="Log your daily wellness" onClick={openCheckin}/><TrackRow icon={LineChart} color="blue" title="View History" sub="See your past cycles" onClick={onOpenHistory}/></article>
          </div>

          <article className="cc-card cc-wellness-library"><div className="cc-section-head"><div><h2>Wellness Library <Info size={15}/></h2><p>Simple resources for every phase of your cycle.</p></div><button className="cc-link-button" onClick={onOpenWellness}>Explore all <ChevronRight size={15}/></button></div><div className="cc-library-grid">{[[Heart,"Nutrition","Eat right for your cycle","green"],[Activity,"Fitness","Workouts for every phase","blue"],[Heart,"Self Care","Care for your mind & body","pink"],[Activity,"Symptoms","Manage common symptoms","purple"],[Sparkles,"Sleep","Improve your sleep","violet"],["😊","Mood","Boost your mood","yellow"]].map(([Icon,title,sub,color])=><button className="cc-library-item" key={title} onClick={onOpenWellness}><span className={`library-icon ${color}`}>{typeof Icon === "string" ? Icon : <Icon size={20}/>}</span><span><strong>{title}</strong><small>{sub}</small></span></button>)}</div></article>

          <section className="cc-company-workspace" aria-label="Account and insights overview">
            <article className="cc-card cc-workspace-card">
              <div className="cc-workspace-head"><div><span className="cc-label">PROFILE</span><h2>Personal Information</h2><p>Manage your account details and cycle preferences.</p></div><button className="cc-mini-action" onClick={onOpenSettings}><UserRound size={15}/> Open profile <ChevronRight size={14}/></button></div>
              <div className="cc-workspace-profile">
                <span className="cc-workspace-avatar">{name.slice(0,1).toUpperCase()}</span>
                <div><strong>{name}</strong><small>{user?.email || "Private CycleCare member"}</small></div>
              </div>
              <div className="cc-workspace-facts"><span><small>Cycle anchor</small><strong>{profile?.last_period_date ? formatDate(profile.last_period_date) : "Not set"}</strong></span><span><small>Typical cycle</small><strong>{profile?.cycle_length ? `${profile.cycle_length} days` : "Not set"}</strong></span><span><small>Typical period</small><strong>{profile?.period_length ? `${profile.period_length} days` : "Not set"}</strong></span></div>
            </article>

            <article className="cc-card cc-workspace-card">
              <div className="cc-workspace-head"><div><span className="cc-label">HISTORY & INSIGHTS</span><h2>Track your pattern</h2><p>Cycles and wellness become more useful over time.</p></div><button className="cc-mini-action" onClick={onOpenHistory}><LineChart size={15}/> Open insights <ChevronRight size={14}/></button></div>
              <div className="cc-insight-tabs"><button className="active" onClick={onOpenHistory}>Cycle History</button><button onClick={onOpenWellness}>Wellness Library</button><button onClick={onOpenHistory}>Trends</button></div>
              <div className="cc-insight-summary"><div><strong>{historyStats.count}</strong><small>period records</small></div><div><strong>{todayCheckin ? "1" : "0"}</strong><small>today's wellness</small></div><div><strong>{historyStats.cycle ? `${historyStats.cycle}d` : "—"}</strong><small>cycle average</small></div></div>
            </article>

            <article className="cc-card cc-workspace-card">
              <div className="cc-workspace-head"><div><span className="cc-label">SETTINGS</span><h2>Preferences & reminders</h2><p>Keep your notifications and privacy controls up to date.</p></div><button className="cc-mini-action" onClick={onOpenSettings}><Settings size={15}/> Manage <ChevronRight size={14}/></button></div>
              <div className="cc-settings-preview"><span><Bell size={16}/><b>Period reminder</b><em>{reminder?.period_reminder ? `${reminder.reminder_days_before || 3} days before` : "Off"}</em></span><span><Activity size={16}/><b>Daily countdown</b><em>{reminder?.daily_countdown ? "On" : "Off"}</em></span><span><ShieldCheck size={16}/><b>Privacy</b><em>Protected</em></span></div>
            </article>

            <article className="cc-card cc-workspace-card cc-report-card">
              <div className="cc-workspace-head"><div><span className="cc-label">CYCLECARE REPORT</span><h2>Your personal report</h2><p>A clean PDF summary of your saved cycle and wellness data.</p></div><div className="cc-report-mark"><Sparkles size={23}/></div></div>
              <div className="cc-report-lines"><span>Cycle overview <strong>{cycle ? `${cycle.length} days` : "Not set"}</strong></span><span>Period history <strong>{historyStats.count} record{historyStats.count===1?"":"s"}</strong></span><span>Wellness today <strong>{todayCheckin ? "Completed" : "Not logged"}</strong></span></div>
              <button className="cc-primary-report" onClick={downloadPdf}><Download size={15}/> Download PDF report</button>
            </article>
          </section>

          <div className="cc-footer-note"><ShieldCheck size={16}/><span><strong>Private by design.</strong> Your cycle and wellness details stay linked to your private CycleCare account.</span><button onClick={downloadPdf}><Download size={15}/> Export PDF</button></div>
        </div>
      </section>

      {calendarOpen && <CalendarModal month={calendarMonth} setMonth={setCalendarMonth} days={calendarDays} selectedDate={selectedDate} setSelectedDate={setSelectedDate} cycle={cycle} onClose={() => setCalendarOpen(false)} onLogPeriod={openPeriod} />}
      {periodOpen && <Modal title="Log your period" eyebrow="PERIOD TRACKING" onClose={() => setPeriodOpen(false)}><form className="cc-period-form" onSubmit={savePeriod}><div className="cc-period-intro"><span className="cc-period-hero"><Droplets size={22}/></span><div><span className="cc-period-kicker">ACTUAL BLEEDING · NOT A PREDICTION</span><strong>Tell CycleCare when your period really began</strong><p>Choose the calendar day your bleeding actually started — not the estimated period date. This becomes your new cycle anchor and refreshes future estimates.</p></div></div><div className="cc-period-rule"><span className="cc-period-rule-icon"><Check size={14}/></span><div><strong>Important</strong><span>Log the <b>first day of real bleeding</b>. If your period has not started yet, wait until bleeding begins.</span></div></div><div className="cc-form-section"><div className="cc-form-section-head"><span>01</span><div><strong>When did the bleeding start?</strong><small>Pick the exact first day you noticed your period.</small></div></div><PremiumDatePicker value={periodDate} onChange={setPeriodDate} maxDate={dateKey(new Date())} label="ACTUAL FIRST DAY OF BLEEDING" helper="Only past or today can be selected. Your estimate is never used as the actual date." /></div><div className="cc-form-section"><div className="cc-form-section-head"><span>02</span><div><strong>How long did the bleeding last?</strong><small>Enter the total number of bleeding days.</small></div></div><div className="cc-length-picker">{[3,4,5,6,7].map(n=><button type="button" key={n} className={String(n)===String(periodLength)?"selected":""} onClick={()=>setPeriodLength(String(n))}>{n}<small>days</small></button>)}<label className="cc-length-custom"><span>Custom</span><input type="number" min="1" max="10" placeholder="1–10" value={periodLength && ![3,4,5,6,7].includes(Number(periodLength)) ? periodLength : ""} onChange={e=>setPeriodLength(e.target.value)} /></label></div></div><div className="cc-period-trust"><ShieldCheck size={17}/><span><strong>Private & secure</strong><small>Your actual bleeding date and duration stay in your CycleCare account and are used to update your cycle timeline.</small></span></div>{periodDate && periodLength && <div className="cc-period-confirm"><CalendarDays size={17}/><div><span>READY TO SAVE</span><strong>Bleeding started {formatDate(periodDate, {month:"short",day:"numeric",year:"numeric"})} · lasted {periodLength} day{Number(periodLength) === 1 ? "" : "s"}</strong><small>CycleCare will treat this as an actual period record, not an estimate.</small></div></div>}<button className="cc-primary-button cc-period-submit" disabled={saving || !periodDate || !periodLength}>{saving?"Saving actual period…":"Save actual period"}<Check size={17}/></button></form></Modal>}
      {checkinOpen && <Modal title="How are you feeling today?" eyebrow="DAILY WELLNESS" onClose={() => setCheckinOpen(false)}><form className="cc-modal-form" onSubmit={saveCheckin}><p className="cc-modal-copy">Your wellness entry is saved once per day. Updating it edits today’s existing record rather than creating a duplicate.</p><label>Mood<div className="cc-mood-grid">{MOODS.map(([v,e,l])=><button type="button" key={v} className={checkinForm.mood===v?"selected":""} onClick={()=>setCheckinForm(f=>({...f,mood:v}))}><span>{e}</span><small>{l}</small></button>)}</div></label><Scale label="Energy" value={checkinForm.energy} setValue={v=>setCheckinForm(f=>({...f,energy:v}))} max={5}/><Scale label="Pain" value={checkinForm.pain} setValue={v=>setCheckinForm(f=>({...f,pain:v}))} max={5}/><Scale label="Sleep quality" value={checkinForm.sleep} setValue={v=>setCheckinForm(f=>({...f,sleep:v}))} max={5}/><label>Notes <textarea rows="3" placeholder="Anything you'd like to remember?" value={checkinForm.notes} onChange={e=>setCheckinForm(f=>({...f,notes:e.target.value}))}/></label><button className="cc-primary-button" disabled={saving || !checkinForm.mood || !checkinForm.energy || !checkinForm.sleep}>{saving?"Saving…":todayCheckin?"Update today's check-in":"Save today's check-in"}<Check size={17}/></button></form></Modal>}
    </main>
  );
}

function Phase({name, dates, cls, active}) { return <div className={`cc-phase ${active?"active":""}`}><span className={`cc-phase-dot ${cls}`}/><strong>{name}</strong><small>{dates}</small></div>; }
function Metric({icon:Icon,title,value,sub,detail,green,purple}) { return <div className="cc-metric"><span className={`cc-metric-icon ${green?"green":""} ${purple?"purple":""}`}><Icon size={19}/></span><span className="cc-metric-copy"><small>{title}</small><strong>{value}</strong><em>{sub}</em>{detail && <b>{detail}</b>}</span></div>; }
function TrackRow({icon:Icon,color,title,sub,onClick}) { return <button className="cc-track-row" onClick={onClick}><span className={`cc-track-icon ${color}`}><Icon size={19}/></span><span><strong>{title}</strong><small>{sub}</small></span><ChevronRight size={17}/></button>; }
function Scale({label,value,setValue,max}) { return <label>{label}<div className="cc-scale">{Array.from({length:max},(_,i)=>i+1).map(n=><button type="button" className={n<=value?"on":""} key={n} onClick={()=>setValue(n)}>{n}</button>)}</div></label>; }
function Modal({title,eyebrow,onClose,children}) { return <div className="cc-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="cc-modal" role="dialog" aria-modal="true"><button className="cc-modal-close" onClick={onClose} aria-label="Close"><X size={20}/></button><span className="cc-label">{eyebrow}</span><h2>{title}</h2>{children}</section></div>; }
function CalendarModal({month,setMonth,days,selectedDate,setSelectedDate,cycle,onClose,onLogPeriod}) { const selected=selectedDate; const selectedItem=selected?days.find(item=>item?.key===dateKey(selected)):null; const status=selectedItem?.ranges?"Actual bleeding":selectedItem?.predicted?"Estimated period day":selectedItem?.earlyLate?"Possible early / late":selectedItem?.ov?"Estimated ovulation":selectedItem?.fertile?"Fertile window":selectedItem?.today?"Today":"No cycle event"; return <div className="cc-modal-backdrop"><section className="cc-calendar-modal"><div className="cc-modal-top"><div><span className="cc-label">CYCLE CALENDAR</span><h2>{month.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</h2><p><b>Actual bleeding</b> is based only on dates you log. Estimated period dates are kept separate and shown as a personal prediction window.</p></div><button className="cc-modal-close" onClick={onClose}><X size={20}/></button></div><div className="cc-calendar-toolbar"><button aria-label="Previous month" onClick={()=>setMonth(m=>new Date(m.getFullYear(),m.getMonth()-1,1))}><ChevronLeft/></button><strong>{month.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</strong><button aria-label="Next month" onClick={()=>setMonth(m=>new Date(m.getFullYear(),m.getMonth()+1,1))}><ChevronRight/></button><button className="today-btn" onClick={()=>setMonth(new Date(new Date().getFullYear(),new Date().getMonth(),1))}>Today</button></div><div className="cc-weekdays large">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=><span key={x}>{x}</span>)}</div><div className="cc-calendar-grid large">{days.map((item,i)=>item?<button key={item.key} aria-label={`${formatDate(item.d)}: ${item.ranges?"actual bleeding":item.predicted?"estimated period":item.earlyLate?"possible early or late":item.ov?"estimated ovulation":item.fertile?"fertile window":"no cycle event"}`} className={`cc-day ${item.today?"today":""} ${item.ranges?"period":""} ${item.predicted?"predicted":""} ${item.earlyLate?"early-late":""} ${item.fertile?"fertile":""} ${item.ov?"ovulation":""}`} onClick={()=>setSelectedDate(item.d)}>{item.d.getDate()}</button>:<span key={`empty-${i}`}/>)}</div><div className="cc-legend"><span><i className="dot period"/>Actual bleeding</span><span><i className="dot fertile"/>Fertile</span><span><i className="dot ovulation"/>Ovulation</span><span><i className="dot predicted"/>Estimated period</span><span><i className="dot early-late"/>Possible early/late</span></div><div className="cc-calendar-detail">{selected?<><span className="cc-detail-icon"><CalendarDays size={20}/></span><div><strong>{formatDate(selected)} <span className="cc-selected-status">{status}</span></strong><p>{selectedItem?.ranges?"This date is part of a period you actually logged. It is treated as real bleeding data, not a prediction.":selectedItem?.predicted?`Estimated period day. Your likely window is ${formatDate(cycle.nextWindowStart)} – ${formatDate(cycle.nextWindowEnd)}.`:selectedItem?.earlyLate?`Possible early/late day around your estimated period of ${formatDate(cycle.next)}.`:cycle?.next?`Estimated period: ${formatDate(cycle.next)}. Your personal range is ${formatDate(cycle.nextWindowStart)} – ${formatDate(cycle.nextWindowEnd)}.`:"Select a day to see its status."}</p></div></>:<div className="cc-empty-detail"><Info size={17}/> Select a day to see its status.</div>}<button className="cc-primary-small" onClick={onLogPeriod}>Log actual period <ChevronRight size={15}/></button></div></section></div>; }

export default Dashboard;
