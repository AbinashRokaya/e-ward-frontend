// Shared presentational pieces + constants for both analytics dashboards.
// Design tokens match the homepage: navy (blue-950/900) primary, slate
// neutrals, rounded-2xl cards with border-slate-200/80 + shadow-sm.

export const MODULES = [
  { value: "birth", label: "Birth Registration", icon: "👶" },
  { value: "death", label: "Death Registration", icon: "🕊️" },
  { value: "migration", label: "Migration Registration", icon: "🧳" },
  { value: "recommendation", label: "Recommendation Letter", icon: "📄" },
  { value: "complaint", label: "Complaint", icon: "📢" },
];

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const CHART = {
  primary: "#1e3a8a",
  deep: "#172554",
  success: "#047857",
  danger: "#b91c1c",
  warning: "#b45309",
  accent: "#6d28d9",
  grid: "#e2e8f0",
  axis: "#64748b",
};

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
  "border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white outline-none transition-colors focus:border-blue-900 focus:ring-1 focus:ring-blue-900 hover:border-slate-400";

// Constrains dashboard width so content doesn't stretch across a wide
// monitor into a sparse, empty-looking row. Wrap the whole analytics page.
export function DashboardShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-6">{children}</div>
    </div>
  );
}

// Navy banner giving the page an anchor at the top, matching the site header.
export function DashboardHeader({ title, subtitle, right }) {
  return (
    <div className="bg-gradient-to-r from-blue-950 to-blue-800 rounded-2xl px-6 py-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-blue-100 mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Panel({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 ${className}`}
    >
      {title && (
        <div className="mb-5 pb-3 border-b border-slate-100">
          <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// Stat card with a colored left rail and optional icon, so a row of them
// reads as distinct cards rather than four floating numbers.
export function StatCard({ label, value, accent = CHART.deep, icon, hint }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 flex items-start gap-4 relative overflow-hidden">
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: accent }}
      />
      {icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: `${accent}14`, color: accent }}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold mt-1" style={{ color: accent }}>
          {value}
        </p>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

export function MiniStat({ label, value, color = CHART.deep, prefix = "", icon }) {
  return (
    <div className="flex items-center gap-3">
      {icon && (
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ background: `${color}14` }}
        >
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold" style={{ color }}>
          {prefix}
          {value}
        </p>
      </div>
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

// Shown in place of a chart when there's genuinely nothing to plot. An
// empty axis frame reads as "broken"; this reads as "no data yet".
export function EmptyChart({ message = "No records for this period yet." }) {
  return (
    <div className="h-[200px] flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">
        📊
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <p className="text-xs text-slate-400 mt-1">
        Charts will populate as applications come in.
      </p>
    </div>
  );
}

export function isEmptyCounts(obj) {
  const values = Object.values(obj || {});
  return values.length === 0 || values.every((v) => !v);
}