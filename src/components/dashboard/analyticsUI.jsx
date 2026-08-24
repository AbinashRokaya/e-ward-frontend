// Shared presentational pieces + constants for both analytics dashboards.
// Previously Panel/StatCard/MiniStat were exported from WardAnalytics.jsx
// AND redefined locally in AdminAnalytics.jsx with different styling, so the
// two dashboards drifted apart. One source now.
//
// Design tokens match the homepage: navy (blue-950/900) primary, slate
// neutrals, rounded-2xl cards with border-slate-200/80 + shadow-sm.

export const MODULES = [
  { value: "birth", label: "Birth Registration" },
  { value: "death", label: "Death Registration" },
  { value: "migration", label: "Migration Registration" },
  { value: "recommendation", label: "Recommendation Letter" },
  { value: "complaint", label: "Complaint" },
];

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Chart palette, aligned to the site's navy/slate scheme. Kept as hex
// because recharts needs literal colors, not Tailwind class names.
export const CHART = {
  primary: "#1e3a8a",   // blue-900 — main series
  deep: "#172554",      // blue-950 — emphasis
  success: "#047857",   // emerald-700
  danger: "#b91c1c",    // red-700
  warning: "#b45309",   // amber-700
  accent: "#6d28d9",    // violet-700
  grid: "#e2e8f0",      // slate-200
  axis: "#64748b",      // slate-500
};

// status -> color. Unknown statuses fall back to neutral slate instead of
// breaking the chart.
const STATUS_COLORS = {
  SUBMITTED: CHART.warning,
  DOCUMENT_REQUESTED: "#c2410c",
  APPROVED: CHART.primary,
  VERIFIED: CHART.accent,
  CERTIFICATE_ISSUED: CHART.success,
  RESOLVED: CHART.success,
  FORWARDED_TO_CHAIRPERSON: "#0e7490",
  REJECTED: CHART.danger,
  DRAFT: "#94a3b8",
};

export function statusColor(key) {
  return STATUS_COLORS[key] || "#94a3b8";
}

export function humanize(key) {
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export const SELECT_CLASS =
  "border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white outline-none transition-colors focus:border-blue-900 focus:ring-1 focus:ring-blue-900";

export function Panel({ title, children }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
      {title && (
        <h3 className="text-[15px] font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, accent = CHART.deep }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
      <p className="text-xs font-medium text-slate-500 mb-1.5">{label}</p>
      <p className="text-2xl font-bold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

export function MiniStat({ label, value, color = CHART.deep, prefix = "" }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1.5">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>
        {prefix}
        {value}
      </p>
    </div>
  );
}

const BADGE_STYLES = {
  slate: "bg-slate-100 text-slate-700",
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-900",
  violet: "bg-violet-50 text-violet-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
};

export function Badge({ tone = "slate", children }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}

export function rateTone(rate) {
  if (rate < 60) return "red";
  if (rate < 85) return "amber";
  return "green";
}

export function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-slate-500 hover:text-blue-900 font-medium flex items-center gap-1 transition-colors"
    >
      ← Back
    </button>
  );
}