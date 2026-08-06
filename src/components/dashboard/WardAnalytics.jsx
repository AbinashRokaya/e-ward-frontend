// components/dashboard/WardAnalytics.jsx
//
// One shared analytics component, mounted unchanged in all three role
// pages (DataValidation, WardSecretary, WardChairperson) — each role
// only ever sees their own ward because every backend query is scoped
// server-side to current_user.user_ward_id, same trust pattern as the
// rest of this project's routers.
//
// MODULES / MONTH_LABELS / statusColor / humanize / Panel / StatCard /
// MiniStat are exported so AdminAnalytics.jsx (admin's country-wide +
// drill-down view) can reuse them instead of redefining them.

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API_URL from "../../api/api"; // matches the default-export pattern used in DataValidationHome.jsx
import toast from "react-hot-toast"; // adjust to whatever toast lib you use elsewhere — not visible in the files shared so far

export const MODULES = [
  { value: "birth", label: "Birth Registration" },
  { value: "death", label: "Death Registration" },
  { value: "migration", label: "Migration Registration" },
  { value: "recommendation", label: "Recommendation Letter" },
  { value: "complaint", label: "Complaint" },
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

// status -> color map. Unknown statuses (any enum value not listed here,
// e.g. if a module has a status this map doesn't know about yet) fall
// back to a neutral gray instead of breaking the chart.
const STATUS_COLORS = {
  SUBMITTED: "#d97706",
  DOCUMENT_REQUESTED: "#f97316",
  APPROVED: "#2563eb",
  VERIFIED: "#7c3aed",
  CERTIFICATE_ISSUED: "#059669",
  RESOLVED: "#059669",
  FORWARDED_TO_CHAIRPERSON: "#0891b2",
  REJECTED: "#dc2626",
  DRAFT: "#9ca3af",
};
export function statusColor(key) {
  return STATUS_COLORS[key] || "#9ca3af";
}
export function humanize(key) {
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  const body = await res.json();
  return body.data;
}

export default function WardAnalytics({ onBack }) {
  const [module, setModule] = useState("birth");
  const [year, setYear] = useState(new Date().getFullYear());

  const [vital, setVital] = useState(null);
  const [summary, setSummary] = useState(null);
  const [extra, setExtra] = useState(null); // death causes / migration reasons / complaint breakdown
  const [loading, setLoading] = useState(true);

  // vital snapshot — independent of the module selector, refetches only on year change
  useEffect(() => {
    let cancelled = false;
    getJSON(`/v1/analytics/vital-snapshot?year=${year}`)
      .then((data) => {
        if (!cancelled) setVital(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load ward vital snapshot");
      });
    return () => {
      cancelled = true;
    };
  }, [year]);
  // (guard added below alongside the other two effects)

  // module summary — refetches on module or year change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getJSON(`/v1/analytics/${module}/summary?year=${year}`)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load analytics for this module");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [module, year]);

  // module-specific extra breakdown
  useEffect(() => {
    let cancelled = false; // prevents a slow fetch from a previously selected
    // module (e.g. "complaint") from landing after you've already switched to
    // a different one (e.g. "migration") and overwriting `extra` with a
    // mismatched shape — this was the cause of the Object.entries crash.
    setExtra(null);
    const endpoint =
      module === "death"
        ? "/v1/analytics/death/causes"
        : module === "migration"
          ? "/v1/analytics/migration/reasons"
          : module === "complaint"
            ? "/v1/analytics/complaint/breakdown"
            : null;
    if (!endpoint) return;
    getJSON(endpoint)
      .then((data) => {
        if (!cancelled) setExtra(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load breakdown");
      });
    return () => {
      cancelled = true;
    };
  }, [module]);

  return (
    <div className="space-y-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          ← Back
        </button>
      )}

      {/* ── ward-wide vital snapshot ─────────────────────────── */}
      {vital && (
        <Panel title={`Ward Vital Snapshot — ${vital.year}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MiniStat label="Births" value={vital.births} color="#2563eb" />
            <MiniStat label="Deaths" value={vital.deaths} color="#dc2626" />
            <MiniStat
              label="Natural Change"
              value={vital.natural_change}
              color="#059669"
              prefix={vital.natural_change >= 0 ? "+" : ""}
            />
            <MiniStat
              label="Migration Registrations"
              value={vital.migrations}
              color="#7c3aed"
            />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Natural change = births − deaths. A per-1,000 birth/death rate needs
            a population figure on the Ward model — not tracked yet, so it's
            left out here rather than shown wrong.
          </p>
        </Panel>
      )}

      {/* ── filters ──────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {MODULES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {[year, year - 1, year - 2].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading || !summary ? (
        <p className="text-sm text-gray-500">Loading analytics…</p>
      ) : (
        <>
          {/* ── stat cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total Records"
              value={summary.total}
              accent="#111827"
            />
            <StatCard
              label={
                summary.status_summary.RESOLVED !== undefined
                  ? "Resolved"
                  : "Certificate Issued"
              }
              value={summary.issued}
              accent="#059669"
            />
            <StatCard
              label="Rejected"
              value={summary.rejected}
              accent="#dc2626"
            />
            <StatCard
              label="Completion Rate"
              value={`${summary.completion_rate}%`}
              accent="#2563eb"
            />
          </div>

          {/* ── status breakdown + monthly trend ──────────────── */}
          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="Status Breakdown">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={Object.entries(summary.status_summary || {}).map(
                      ([key, value]) => ({ key, value }),
                    )}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {Object.keys(summary.status_summary).map((key) => (
                      <Cell key={key} fill={statusColor(key)} />
                    ))}
                  </Pie>
                  <PieTooltip
                    formatter={(value, name) => [value, humanize(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {Object.entries(summary.status_summary || {}).map(
                  ([key, value]) => (
                    <span
                      key={key}
                      className="text-xs text-gray-600 flex items-center gap-1.5"
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ background: statusColor(key) }}
                      />
                      {humanize(key)} · {value}
                    </span>
                  ),
                )}
              </div>
            </Panel>

            <Panel title={`Monthly Submissions — ${year}`}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={summary.monthly_trend.map((m) => ({
                    ...m,
                    label: MONTH_LABELS[m.month - 1],
                  }))}
                >
                  <CartesianGrid stroke="#eef0f3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="submitted"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    name="Submitted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* ── pending aging + recent rejection reasons ──────── */}
          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="Pending Records — How Long They've Waited">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={Object.entries(summary.pending_aging || {}).map(
                    ([bucket, count]) => ({ bucket, count }),
                  )}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid stroke="#eef0f3" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="bucket"
                    width={90}
                    tick={{ fontSize: 11.5 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d97706" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2">
                Records piling up in the 15-30 or 30+ buckets are the ones
                actually stuck, not just pending.
              </p>
            </Panel>

            <Panel title="Recent Rejection Reasons">
              {(summary.recent_rejection_reasons || []).length === 0 ? (
                <p className="text-sm text-gray-400">
                  No rejections recorded yet.
                </p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700 max-h-[200px] overflow-y-auto">
                  {(summary.recent_rejection_reasons || []).map((text, i) => (
                    <li key={i} className="border-l-2 border-red-300 pl-3">
                      {text}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Free text, most recent first — not categorized, so shown as a
                list rather than a chart.
              </p>
            </Panel>
          </div>

          {/* ── module-specific panels ─────────────────────────── */}
          {module === "death" && extra && (
            <div className="grid md:grid-cols-2 gap-6">
              <Panel title="Cause of Death">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={Object.entries(extra.cause_breakdown || {}).map(
                      ([cause, count]) => ({ cause: humanize(cause), count }),
                    )}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid stroke="#eef0f3" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="cause"
                      width={100}
                      tick={{ fontSize: 11.5 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#dc2626" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="Age at Death">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={Object.entries(extra.age_distribution || {}).map(
                      ([bucket, count]) => ({ bucket, count }),
                    )}
                  >
                    <CartesianGrid stroke="#eef0f3" vertical={false} />
                    <XAxis
                      dataKey="bucket"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>
          )}

          {module === "migration" && extra && (
            <Panel title="Migration Reasons">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={Object.entries(extra.reason_breakdown || {}).map(
                    ([reason, count]) => ({ reason: humanize(reason), count }),
                  )}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid stroke="#eef0f3" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="reason"
                    width={120}
                    tick={{ fontSize: 11.5 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2">
                No in/out split — MigrationRegistrationModel has no direction
                field yet. This shows why people are migrating, not which
                direction.
              </p>
            </Panel>
          )}

          {module === "complaint" && extra && (
            <div className="grid md:grid-cols-2 gap-6">
              <Panel title="By Category">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={Object.entries(extra.category_breakdown || {}).map(
                      ([c, count]) => ({ category: humanize(c), count }),
                    )}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid stroke="#eef0f3" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={110}
                      tick={{ fontSize: 11.5 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="Priority + SLA">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart
                    data={Object.entries(extra.priority_breakdown || {}).map(
                      ([p, count]) => ({ priority: humanize(p), count }),
                    )}
                  >
                    <CartesianGrid stroke="#eef0f3" vertical={false} />
                    <XAxis
                      dataKey="priority"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#d97706" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  <MiniStat
                    label="Avg Resolution"
                    value={`${extra.avg_resolution_days}d`}
                    color="#111827"
                  />
                  <MiniStat
                    label="SLA Compliance"
                    value={
                      extra.sla_compliance_pct != null
                        ? `${extra.sla_compliance_pct}%`
                        : "—"
                    }
                    color={
                      extra.sla_compliance_pct != null &&
                      extra.sla_compliance_pct < 80
                        ? "#dc2626"
                        : "#059669"
                    }
                  />
                </div>
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function StatCard({ label, value, accent }) {
  return (
    <div
      className="rounded-xl border p-4 shadow-sm"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <p className="text-xs text-gray-500 font-semibold">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export function MiniStat({ label, value, color, prefix = "" }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-semibold">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {prefix}
        {value}
      </p>
    </div>
  );
}

export function Panel({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}
