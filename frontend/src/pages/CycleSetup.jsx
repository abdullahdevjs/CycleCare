import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  HeartPulse,
  LockKeyhole,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/cycle-setup.css";


const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseLocalDateForDisplay = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
};

function CycleSetup({ onComplete }) {
  const [user, setUser] = useState(null);

  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [savedLastPeriodDate, setSavedLastPeriodDate] = useState("");
  // Never pre-fill a first-time setup form. Existing values are loaded only
  // after Supabase confirms that a cycle profile already exists.
  const [cycleLength, setCycleLength] = useState("");
  const [periodLength, setPeriodLength] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSetup = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!currentUser) {
        setError("Your session could not be found. Please sign in again.");
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const { data, error: profileError } = await supabase
        .from("cycle_profiles")
        .select("last_period_date, cycle_length, period_length")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (!active) return;

      if (profileError) {
        console.error("Cycle setup load error:", profileError);
        setError("We couldn't load your saved cycle details.");
      } else if (data) {
        // Keep the date picker intentionally empty when editing an existing setup.
        // The saved date is shown separately so the form feels like a fresh action.
        setSavedLastPeriodDate(data.last_period_date || "");
        setLastPeriodDate("");
        setCycleLength(data.cycle_length != null ? Number(data.cycle_length) : "");
        setPeriodLength(data.period_length != null ? Number(data.period_length) : "");
      }

      setLoading(false);
    };

    loadSetup();

    return () => {
      active = false;
    };
  }, []);

  const updateNumber = (setter, current, min, max, amount) => {
    const nextValue =
      current === "" || current == null
        ? min
        : Math.max(min, Math.min(max, Number(current) + amount));
    setter(nextValue);
    setError("");
    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaved(false);

    if (!user) {
      setError("Your session could not be found. Please sign in again.");
      return;
    }

    const effectiveLastPeriodDate = lastPeriodDate || savedLastPeriodDate;
    const previousSavedDate = savedLastPeriodDate;

    if (!effectiveLastPeriodDate) {
      setError("Please select the first day of your most recent period.");
      return;
    }

    const cycle = Number(cycleLength);
    const period = Number(periodLength);
    const todayKey = dateKey(new Date());

    if (effectiveLastPeriodDate > todayKey) {
      setError("Your most recent period date cannot be in the future.");
      return;
    }

    if (cycleLength === "" || !Number.isInteger(cycle) || cycle < 21 || cycle > 45) {
      setError("Cycle length must be between 21 and 45 days.");
      return;
    }

    if (periodLength === "" || !Number.isInteger(period) || period < 1 || period > 10) {
      setError("Period length must be between 1 and 10 days.");
      return;
    }

    setSaving(true);

    /*
      Setup My Cycle defines/updates the CURRENT baseline only.
      It must never create a second historical period when an existing
      user edits their baseline date. Historical periods are created by
      the dedicated Log Period action.

      On first setup, if there is no history yet, create exactly one
      initial record so History & Insights has a starting point.
    */

    const { error: saveError } = await supabase
      .from("cycle_profiles")
      .upsert(
        {
          user_id: user.id,
          last_period_date: effectiveLastPeriodDate,
          cycle_length: cycle,
          period_length: period,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      console.error("Cycle setup save error:", saveError);
      setError(saveError.message || "We couldn't save your cycle details. Please try again.");
      setSaving(false);
      return;
    }

    const { data: existingHistory, error: historyLookupError } = await supabase
      .from("cycle_history")
      .select("id, period_start_date, created_at")
      .eq("user_id", user.id)
      .order("period_start_date", { ascending: true });

    if (historyLookupError) {
      console.error("Cycle history lookup error:", historyLookupError);
      setError("Your cycle profile was saved, but we couldn't verify your history.");
      setSaving(false);
      return;
    }

    if (!existingHistory?.length) {
      // First setup creates one baseline history record.
      const { error: historyInsertError } = await supabase
        .from("cycle_history")
        .insert({
          user_id: user.id,
          period_start_date: effectiveLastPeriodDate,
          period_end_date: (() => { const d = new Date(`${effectiveLastPeriodDate}T00:00:00`); d.setDate(d.getDate() + period - 1); return dateKey(d); })(),
          cycle_length: cycle,
          period_length: period,
        });

      if (historyInsertError) {
        console.error("Initial cycle history insert error:", historyInsertError);
        setError("Your cycle profile was saved, but we couldn't create your first history record.");
        setSaving(false);
        return;
      }
    } else if (existingHistory.length === 1 && previousSavedDate && existingHistory[0].period_start_date === previousSavedDate) {
      // If the only history row is the baseline created by Setup My Cycle,
      // changing Setup should replace that baseline rather than inventing a
      // second period. Once the user has multiple records, history is treated
      // as real tracking data and is never rewritten by setup.
      const { error: baselineUpdateError } = await supabase
        .from("cycle_history")
        .update({
          period_start_date: effectiveLastPeriodDate,
          cycle_length: cycle,
          period_length: period,
          period_end_date: (() => { const d = new Date(`${effectiveLastPeriodDate}T00:00:00`); d.setDate(d.getDate() + period - 1); return dateKey(d); })(),
        })
        .eq("id", existingHistory[0].id)
        .eq("user_id", user.id);

      if (baselineUpdateError) {
        console.error("Baseline history update error:", baselineUpdateError);
        setError("Your cycle profile was saved, but we couldn't update the original setup record.");
        setSaving(false);
        return;
      }
    }

    setSavedLastPeriodDate(effectiveLastPeriodDate);
    setLastPeriodDate("");
    setSaved(true);
    setSaving(false);

    window.setTimeout(() => {
      onComplete?.();
    }, 600);
  };

  const handleBack = () => {
    if (!saving) onComplete?.();
  };

  if (loading) {
    return (
      <main className="cycle-setup-page cycle-setup-loading-page">
        <div className="cycle-setup-loading-shell">
          <div className="cycle-setup-loading-brand">
            <div className="cycle-setup-brand-mark">C</div>
            <span>CycleCare</span>
          </div>

          <div className="cycle-setup-loading-card">
            <div className="cycle-setup-skeleton cycle-setup-skeleton-sm" />
            <div className="cycle-setup-skeleton cycle-setup-skeleton-title" />
            <div className="cycle-setup-skeleton cycle-setup-skeleton-text" />
            <div className="cycle-setup-skeleton cycle-setup-skeleton-field" />
            <div className="cycle-setup-skeleton cycle-setup-skeleton-field" />
            <div className="cycle-setup-skeleton cycle-setup-skeleton-button" />
            <span>Loading your saved cycle details…</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cycle-setup-page">
      <div className="cycle-setup-shell">
        <header className="cycle-setup-header">
          <button
            type="button"
            className="cycle-setup-back"
            onClick={handleBack}
            disabled={saving}
          >
            <ChevronLeft size={16} />
            <span>Back to dashboard</span>
          </button>

          <div className="cycle-setup-brand">
            <div className="cycle-setup-brand-mark">C</div>
            <span>CycleCare</span>
          </div>

          <div className="cycle-setup-private">
            <LockKeyhole size={13} />
            <span>Private by design</span>
          </div>
        </header>

        <div className="cycle-setup-step">
          <div className="cycle-setup-step-line">
            <span />
          </div>
          <span>Personal setup</span>
          <strong>Complete</strong>
        </div>

        <div className="cycle-setup-content">
          <section className="cycle-setup-intro">
            <div className="cycle-setup-eyebrow">
              <Sparkles size={13} />
              PERSONALIZE YOUR EXPERIENCE
            </div>

            <h1>
              Start with
              <br />
              <em>your rhythm.</em>
            </h1>

            <p>
              Tell CycleCare a few basics about your cycle. We'll use
              them to make your dashboard, predictions and wellness
              experience more relevant to you.
            </p>

            <div className="cycle-setup-trust">
              <div className="cycle-setup-trust-icon">
                <LockKeyhole size={15} />
              </div>
              <div>
                <strong>Your data stays yours</strong>
                <span>
                  Your cycle details are tied to your private account and
                  can be updated whenever you need.
                </span>
              </div>
              <Check size={15} />
            </div>

            <div className="cycle-setup-benefit-row">
              <div>
                <CalendarDays size={16} />
                <span>Cycle tracking</span>
              </div>
              <div>
                <HeartPulse size={16} />
                <span>Wellness context</span>
              </div>
              <div>
                <Sparkles size={16} />
                <span>Personal insights</span>
              </div>
            </div>
          </section>

          <section className="cycle-setup-card">
            <div className="cycle-setup-card-heading">
              <span>YOUR CYCLE BASICS</span>
              <h2>Let's get to know your cycle.</h2>
              <p>
                These details create your starting point. You can edit
                them later from your cycle settings.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="cycle-setup-form">
              <div className="cycle-setup-field">
                <div className="cycle-setup-label-row">
                  <label htmlFor="cycle-last-period">
                    Last period started
                  </label>
                  <span>{savedLastPeriodDate ? "Optional when saved" : "Required"}</span>
                </div>

                {savedLastPeriodDate && (
                  <div className="cycle-setup-saved-date">
                    <div>
                      <small>SAVED IN YOUR PROFILE</small>
                      <strong>{parseLocalDateForDisplay(savedLastPeriodDate)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLastPeriodDate(savedLastPeriodDate)}
                      disabled={saving}
                    >
                      Use saved date
                    </button>
                  </div>
                )}

                <div className="cycle-setup-date-control">
                  <div className="cycle-setup-field-icon">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <small>FIRST DAY OF YOUR MOST RECENT PERIOD</small>
                    <input
                      id="cycle-last-period"
                      type="date"
                      value={lastPeriodDate}
                      max={dateKey(new Date())}
                      onChange={(event) => {
                        setLastPeriodDate(event.target.value);
                        setError("");
                        setSaved(false);
                      }}
                      required={!savedLastPeriodDate}
                    />
                  </div>
                </div>

                <p className="cycle-setup-help">
                  Choose the day your bleeding actually began.
                </p>
              </div>

              <div className="cycle-setup-divider" />

              <div className="cycle-setup-field">
                <div className="cycle-setup-label-row">
                  <label>Typical cycle length</label>
                  <span>21–45 days</span>
                </div>

                <div className="cycle-setup-stepper">
                  <button
                    type="button"
                    aria-label="Decrease cycle length"
                    disabled={cycleLength <= 21}
                    onClick={() =>
                      updateNumber(
                        setCycleLength,
                        cycleLength,
                        21,
                        45,
                        -1
                      )
                    }
                  >
                    <Minus size={15} />
                  </button>

                  <div>
                    <strong>{cycleLength === "" ? "—" : cycleLength}</strong>
                    <span>{cycleLength === "" ? "Select" : "days"}</span>
                  </div>

                  <button
                    type="button"
                    aria-label="Increase cycle length"
                    disabled={cycleLength >= 45}
                    onClick={() =>
                      updateNumber(
                        setCycleLength,
                        cycleLength,
                        21,
                        45,
                        1
                      )
                    }
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <p className="cycle-setup-help">
                  Choose your usual cycle length. You can update it later.
                </p>
              </div>

              <div className="cycle-setup-field">
                <div className="cycle-setup-label-row">
                  <label>Typical period length</label>
                  <span>1–10 days</span>
                </div>

                <div className="cycle-setup-stepper">
                  <button
                    type="button"
                    aria-label="Decrease period length"
                    disabled={periodLength <= 1}
                    onClick={() =>
                      updateNumber(
                        setPeriodLength,
                        periodLength,
                        1,
                        10,
                        -1
                      )
                    }
                  >
                    <Minus size={15} />
                  </button>

                  <div>
                    <strong>{periodLength === "" ? "—" : periodLength}</strong>
                    <span>{periodLength === "" ? "Select" : "days"}</span>
                  </div>

                  <button
                    type="button"
                    aria-label="Increase period length"
                    disabled={periodLength >= 10}
                    onClick={() =>
                      updateNumber(
                        setPeriodLength,
                        periodLength,
                        1,
                        10,
                        1
                      )
                    }
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <p className="cycle-setup-help">
                  Choose how many days your period usually lasts.
                </p>
              </div>

              {error && (
                <div className="cycle-setup-error" role="alert">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className={`cycle-setup-submit ${
                  saved ? "is-saved" : ""
                }`}
                disabled={saving || saved}
              >
                {saving ? (
                  <>
                    <span className="cycle-setup-spinner" />
                    Saving your cycle…
                  </>
                ) : saved ? (
                  <>
                    <Check size={17} />
                    Cycle details saved
                  </>
                ) : (
                  <>
                    Continue to CycleCare
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="cycle-setup-card-footer">
              <LockKeyhole size={12} />
              <span>Encrypted account data · You can change this anytime</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default CycleSetup;
