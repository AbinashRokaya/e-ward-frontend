// components/dashboard/analyticsUI.jsx
//
// Shared presentational pieces + constants for the analytics dashboards
// (AdminAnalytics.jsx and WardAnalytics.jsx), so both stay visually
// identical instead of drifting apart. Nothing here talks to the API —
// pure UI + small pure-function helpers only.

// ══════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════

export const MODULES = [
  { value: "birth", label: "Birth Registration", icon: "👶" },
  { value: "death", label: "Death Registration", icon: "🕊️" },
  { value: "migration", label: "Migration Registration", icon: "🧳" },
  { value: "recommendation", label: "Recommendation Letter", icon: "📜" },
  { value: "complaint", label: "Complaint", icon: "📮" },
];

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Single chart color palette — every chart in both dashboards pulls
// from this instead of hardcoding hex values, so a palette change is
// a one-line edit here rather than a find-and-replace across files.
export const CHART = {
  primary: "#2563eb",
  accent: "#7c3aed",
  success: "#059669",
  danger: "#dc2626",
  warning: "#d97706",
  deep: "#111827",
  grid: "#f1f2f4",
  axis: "#6b7280",
};

// status -> color map. Unknown statuses (any enum value not listed
// here) fall back to a neutral gray instead of breaking a chart.
const STATUS_COLORS = {
  DRAFT: "#9ca3af",
  SUBMITTED: CHART.warning,
  DOCUMENT_REQUESTED: "#f97316",
  APPROVED: CHART.primary,
  VERIFIED: CHART.accent,
  FORWARDED_TO_CHAIRPERSON: "#0891b2",
  CERTIFICATE_ISSUED: CHART.success,
  RESOLVED: CHART.success,
  REJECTED: CHART.danger,
};

export function statusColor(key) {
  return STATUS_COLORS[key] || "#9ca3af";
}

export function humanize(key) {
  if (!key) return "";
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

// True when a counts object (e.g. status_summary, pending_aging) has no
// keys, or every value in it is zero — used to swap a chart for an
// EmptyChart placeholder instead of rendering an empty/broken chart.
export function isEmptyCounts(counts) {
  if (!counts) return true;
  const values = Object.values(counts);
  if (values.length === 0) return true;
  return values.every((v) => !v);
}

// Shared select styling used for every filter dropdown across both
// dashboards.
export const SELECT_CLASS =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400";

// ══════════════════════════════════════════════
// LAYOUT
// ══════════════════════════════════════════════

// Outer wrapper for a full analytics page. Deliberately adds only
// vertical spacing between children, no horizontal margin/padding —
// the page it's mounted in already provides that.
export function DashboardShell({ children }) {
  return <div className="space-y-6">{children}</div>;
}

// Title + subtitle on the left, arbitrary controls (filters) on the
// right. Wraps on small screens instead of overflowing.
export function DashboardHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}

export function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
    >
      ← Back
    </button>
  );
}

// ══════════════════════════════════════════════
// CARDS
// ══════════════════════════════════════════════

export function Panel({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, accent = "#111827", icon, hint }) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        {icon && <span className="text-base leading-none">{icon}</span>}
      </div>
      <p className="text-2xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function MiniStat({
  label,
  value,
  color = "#111827",
  prefix = "",
  icon,
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon && <span className="text-sm leading-none">{icon}</span>}
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-xl font-bold" style={{ color }}>
        {prefix}
        {value}
      </p>
    </div>
  );
}

// Rounded-full colored pill, used for completion-rate badges etc.
const BADGE_STYLES = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
};

export function Badge({ tone = "gray", children }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_STYLES[tone]}`}
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

// Placeholder shown in place of a chart when its underlying data is
// empty/all-zero, instead of rendering recharts with nothing to draw.
export function EmptyChart({ message = "No data yet." }) {
  return (
    <div className="h-[160px] flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
      {message}
    </div>
  );
}
