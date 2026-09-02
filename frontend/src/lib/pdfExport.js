// Dependency-free, browser-safe PDF export. The previous exporter was very
// minimal; this version builds a structured, multi-page report with headers,
// section cards and readable tables. Everything is generated client-side.

const safe = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[^\x20-\x7E]/g, " ")
  .replace(/\\/g, "\\\\")
  .replace(/\(/g, "\\(")
  .replace(/\)/g, "\\)");

const fmtDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (value) => value ? String(value).slice(0, 5) : "Not set";

function wrap(text, max = 88) {
  const words = safe(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function escPdfText(text) {
  return safe(text).slice(0, 110);
}

function textCmd(font, size, x, y, text) {
  return `BT ${font} ${size} Tf 0.20 0.17 0.18 rg ${x} ${y} Td (${escPdfText(text)}) Tj ET`;
}

function rectCmd(r, g, b, x, y, w, h) {
  return `${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f`;
}

function buildPageStream(page, pageNumber, totalPages) {
  const out = [];
  out.push("q", "1 1 1 rg", "0 0 612 792 re", "f", "Q");
  // Header accent + brand
  out.push(rectCmd(0.68, 0.32, 0.47, 0, 758, 612, 34));
  out.push(textCmd("/F2", 16, 40, 770, "CycleCare"));
  out.push(textCmd("/F1", 8, 492, 770, `Personal data report  |  Page ${pageNumber} of ${totalPages}`));

  let y = 728;
  for (const block of page) {
    if (block.type === "title") {
      out.push(textCmd("/F2", 22, 40, y, block.text));
      y -= 28;
      continue;
    }
    if (block.type === "meta") {
      out.push(textCmd("/F1", 8.5, 40, y, block.text));
      y -= 18;
      continue;
    }
    if (block.type === "section") {
      out.push(rectCmd(0.97, 0.93, 0.95, 40, y - 5, 532, 24));
      out.push(textCmd("/F2", 10.5, 50, y + 3, block.text.toUpperCase()));
      y -= 30;
      continue;
    }
    if (block.type === "row") {
      out.push(textCmd("/F1", 9.2, 50, y, block.text));
      y -= 16;
      continue;
    }
    if (block.type === "note") {
      out.push(rectCmd(0.99, 0.96, 0.98, 40, y - 30, 532, 36));
      const lines = wrap(block.text, 86).slice(0, 2);
      lines.forEach((line, i) => out.push(textCmd("/F1", 8.3, 50, y - 9 - (i * 11), line)));
      y -= 46;
    }
  }
  out.push(textCmd("/F1", 7.5, 40, 24, "CycleCare estimates are informational and are not medical advice."));
  return out.join("\n");
}

function buildPdf(blocks) {
  const pages = [];
  let current = [];
  let height = 0;
  const cost = (b) => ({ title: 36, meta: 22, section: 32, row: 17, note: 50 }[b.type] || 17);

  for (const block of blocks) {
    const c = cost(block);
    if (height + c > 685 && current.length) {
      pages.push(current);
      current = [];
      height = 0;
    }
    current.push(block);
    height += c;
  }
  if (current.length) pages.push(current);
  if (!pages.length) pages.push([{ type: "title", text: "CycleCare Personal Data Report" }]);

  const objects = [];
  const add = (value) => { objects.push(value); return objects.length; };
  const catalogId = add(null);
  const pagesId = add(null);
  const regularFontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldFontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageIds = [];

  pages.forEach((page, index) => {
    const stream = buildPageStream(page, index + 1, pages.length);
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = "%PDF-1.4\n%CycleCare\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets[index + 1] = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadCycleCarePdf({ user, profile = [], cycleProfile = [], history = [], checkins = [], reminders = [] }) {
  // Accept both a single Supabase row and the array shape returned by the
  // account export helper. This prevents dashboard exports from silently
  // becoming empty when callers pass the live profile object directly.
  const asRows = (value) => Array.isArray(value) ? value : (value ? [value] : []);
  const profileRow = asRows(profile)[0] || {};
  const cycleRow = asRows(cycleProfile)[0] || {};
  const reminderRow = asRows(reminders)[0] || {};
  const blocks = [
    { type: "title", text: "CycleCare Personal Data Report" },
    { type: "meta", text: `Generated ${new Date().toLocaleString("en-IN")}` },
    { type: "section", text: "Account summary" },
    { type: "row", text: `Name: ${profileRow.full_name || user?.user_metadata?.full_name || "Not provided"}` },
    { type: "row", text: `Email: ${user?.email || "Not available"}` },
    { type: "row", text: `Date of birth: ${fmtDate(profileRow.date_of_birth)}` },
    { type: "section", text: "Current cycle" },
    { type: "row", text: `Last period: ${fmtDate(cycleRow.last_period_date)}` },
    { type: "row", text: `Typical cycle length: ${cycleRow.cycle_length ?? "Not set"} days` },
    { type: "row", text: `Typical period length: ${cycleRow.period_length ?? "Not set"} days` },
    { type: "section", text: "Period reminders" },
    { type: "row", text: `Period reminder: ${reminderRow.period_reminder === false ? "Off" : "On"}` },
    { type: "row", text: `Reminder window: ${reminderRow.reminder_days_before ?? "Not set"} day(s) before estimated period` },
    { type: "row", text: `Reminder time: ${fmtTime(reminderRow.reminder_time)}` },
    { type: "row", text: `Daily countdown: ${reminderRow.daily_countdown === false ? "Off" : "On"}` },
    { type: "section", text: `Period history (${history.length})` },
  ];

  if (!history.length) blocks.push({ type: "row", text: "No saved period records." });
  history.slice(0, 160).forEach((item, index) => {
    blocks.push({ type: "row", text: `${index + 1}. ${fmtDate(item.period_start_date)}  |  ${item.period_length ?? "-"} day period  |  ${item.cycle_length ?? "-"} day cycle` });
  });

  blocks.push({ type: "section", text: `Wellness library (${checkins.length})` });
  if (!checkins.length) blocks.push({ type: "row", text: "No wellness check-ins saved." });
  checkins.slice(0, 180).forEach((item) => {
    blocks.push({ type: "row", text: `${fmtDate(item.checkin_date)}  |  Mood ${item.mood || "-"}  |  Energy ${item.energy ?? "-"}/5  |  Pain ${item.pain ?? "-"}/5  |  Sleep ${item.sleep ?? "-"}/5` });
    if (item.notes) blocks.push({ type: "row", text: `    Note: ${item.notes}` });
  });
  blocks.push({ type: "note", text: "Your CycleCare report contains data linked to your private account. Keep this file secure because it may contain personal wellness information." });

  const blob = buildPdf(blocks);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cyclecare-data-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
