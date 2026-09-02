import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import "../styles/premium-date-picker.css";

const pad = (n) => String(n).padStart(2, "0");
const keyOf = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseKey = (value) => {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

function PremiumDatePicker({ value, onChange, maxDate, label = "Select date", helper }) {
  const [open, setOpen] = useState(false);
  const selected = parseKey(value);
  const [month, setMonth] = useState(() => {
    const base = selected || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (selected) setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [value]);

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const leading = first.getDay();
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - leading + 1;
      if (day < 1 || day > days) return null;
      return new Date(month.getFullYear(), month.getMonth(), day);
    });
  }, [month]);

  const max = parseKey(maxDate);
  const isDisabled = (date) => max && date > max;

  const choose = (date) => {
    if (!date || isDisabled(date)) return;
    onChange(keyOf(date));
    setOpen(false);
  };

  return (
    <div className="premium-date-picker">
      <button type="button" className={`premium-date-trigger ${value ? "has-value" : ""}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="premium-date-trigger-icon"><CalendarDays size={18} /></span>
        <span className="premium-date-trigger-copy">
          <small>{label}</small>
          <strong>{selected ? selected.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Choose a date"}</strong>
          {!selected && <em>Nothing is pre-filled</em>}
        </span>
        {selected ? <span className="premium-date-clear" onClick={(event) => { event.stopPropagation(); onChange(""); }} aria-label="Clear selected date"><X size={15} /></span> : <ChevronRight size={17} />}
      </button>
      {helper && <p className="premium-date-helper">{helper}</p>}

      {open && (
        <div className="premium-date-popover" role="dialog" aria-label="Choose a date">
          <div className="premium-date-head">
            <div><small>SELECT A DAY</small><strong>{month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</strong></div>
            <div className="premium-date-nav">
              <button type="button" onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
              <button type="button" onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="premium-date-weekdays">{["S","M","T","W","T","F","S"].map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}</div>
          <div className="premium-date-grid">
            {cells.map((date, index) => date ? (
              <button key={keyOf(date)} type="button" disabled={isDisabled(date)} className={`${value === keyOf(date) ? "selected" : ""} ${keyOf(date) === keyOf(new Date()) ? "today" : ""}`} onClick={() => choose(date)}>
                {date.getDate()}
                {value === keyOf(date) && <Check size={10} />}
              </button>
            ) : <span key={`empty-${index}`} />)}
          </div>
          <div className="premium-date-foot"><span><b>Actual bleeding start only.</b> Do not choose your predicted period date.</span><button type="button" onClick={() => setOpen(false)}>Done</button></div>
        </div>
      )}
    </div>
  );
}

export default PremiumDatePicker;
