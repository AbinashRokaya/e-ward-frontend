// components/dashboard/AdminAnalytics.jsx
//
// Admin's analytics view. Two modes, toggled by the ward selector:
//   - "All Wards" (ward_id = null) -> country-wide totals + a ward
//     leaderboard/comparison chart, hitting the /admin/... endpoints
//     with no ward_id.
//   - a specific ward -> the exact same charts as WardAnalytics.jsx,
//     but for a ward the admin picked rather than their own — hitting
//     the same /admin/... endpoints with ward_id set.
//
// STYLING: Panel / StatCard / MiniStat below are restyled to match
// the Officer List page (rounded-xl white cards, gray-200 border,
// shadow-sm, indigo-900 table headers, rounded-full badges, blue/red
// text action links). They're defined locally here rather than
// imported from WardAnalytics so this page matches the app's actual
// visual standard — move them back into WardAnalytics.jsx once that
// file is updated to match, so both dashboards share one source again.
//
// LAYOUT: this component does NOT add its own page margin/padding —
// it sits inside whatever content container the app already wraps
// pages in (same one the Officer List page uses). An earlier version
// used a negative-margin hack here to fight assumed parent padding;
// that was wrong for this layout and caused the page to overflow the
// viewport width (visible as a horizontal scrollbar) and the top nav
// to clip. Just use normal spacing.
//
// WARD_ID TYPE: ward_id is a UUID string, not a number — the backend
// (admin_analytics_router.py) parses it with uuid.UUID(...) and 400s
// on anything else. Never wrap it in Number(...); treat it as an
// opaque string throughout (comparisons, keys, and the query string).

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

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
import API_URL from "../../api/api";
import { MODULES, MONTH_LABELS, statusColor, humanize } from "./WardAnalytics";

async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  const body = await res.json();
  return body.data;
}

// ── shared presentational pieces, styled to match the Officer List page ──

function Panel({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      {title && (
        <h3 className="text-[15px] font-bold text-gray-900 mb-5">{title}</h3>
      )}
      {children}
    </div>
  );
}

function StatCard({ label, value, accent = "#111827" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
      <p className="text-2xl font-bold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value, color = "#111827", prefix = "" }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>
        {prefix}
        {value}
      </p>
    </div>
  );
}

// Rounded-full colored pill, same treatment as the Role column badges
// on the Officer List page (gray/green/blue/purple by kind).
const BADGE_STYLES = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
};

function Badge({ tone = "gray", children }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}

function rateTone(rate) {
  if (rate < 60) return "red";
  if (rate < 85) return "amber";
  return "green";
}

// Shared select styling used for every filter dropdown across this page.
const SELECT_CLASS =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400";

// Province -> District -> Municipality -> Ward, laid out as four
// always-visible dropdowns matching the Ward Notices filter bar (not
// disabled-until-parent like the previous version). Filtered client-side
// from the ward list AdminHome already fetched for the Ward-management
// card.
//
// PROVINCE FIELD: your WardTable/AddWardForm code only showed
// ward_name/ward_district/ward_municipality/ward_no — no province field
// on the ward record itself. This tries a few likely field names
// (ward_province, ward_province_name, province) and falls back to
// leaving the Province dropdown empty (just "All") if none exist. If
// your Notice page's Province dropdown is reading from a separate
// static province/district dataset (the one already built for the
// registration form's cascading address dropdowns) rather than from
// ward records, swap `getProvince` below to pull from that same
// dataset instead.
// Ward schema uses ward_province (confirmed against the backend's
// Create Ward / Update Ward multipart schema).
function getProvince(w) {
  return w.ward_province || null;
}

function WardCascadeSelector({ wards, wardId, onChange }) {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");

  const provinces = useMemo(
    () => [...new Set(wards.map(getProvince).filter(Boolean))].sort(),
    [wards],
  );
  const districts = useMemo(
    () =>
      [
        ...new Set(
          wards
            .filter((w) => !province || getProvince(w) === province)
            .map((w) => w.ward_district)
            .filter(Boolean),
        ),
      ].sort(),
    [wards, province],
  );
  const municipalities = useMemo(
    () =>
      [
        ...new Set(
          wards
            .filter(
              (w) =>
                (!province || getProvince(w) === province) &&
                (!district || w.ward_district === district),
            )
            .map((w) => w.ward_municipality)
            .filter(Boolean),
        ),
      ].sort(),
    [wards, province, district],
  );
  const filteredWards = useMemo(
    () =>
      wards.filter(
        (w) =>
          (!province || getProvince(w) === province) &&
          (!district || w.ward_district === district) &&
          (!municipality || w.ward_municipality === municipality),
      ),
    [wards, province, district, municipality],
  );

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <select
        value={province}
        onChange={(e) => {
          setProvince(e.target.value);
          setDistrict("");
          setMunicipality("");
          onChange(null);
        }}
        className={SELECT_CLASS}
      >
        <option value="">Province: All</option>
        {provinces.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <select
        value={district}
        onChange={(e) => {
          setDistrict(e.target.value);
          setMunicipality("");
          onChange(null);
        }}
        className={SELECT_CLASS}
      >
        <option value="">District: All</option>
        {districts.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={municipality}
        onChange={(e) => {
          setMunicipality(e.target.value);
          onChange(null);
        }}
        className={SELECT_CLASS}
      >
        <option value="">Municipality: All</option>
        {municipalities.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={wardId ?? "all"}
        onChange={(e) =>
          // ward_id is a UUID string on the backend — do NOT wrap this
          // in Number(...); that turns a UUID into NaN and produces a
          // literal "ward_id=NaN" query string, which the backend
          // correctly 400s on.
          onChange(e.target.value === "all" ? null : e.target.value)
        }
        className={`${SELECT_CLASS} font-medium`}
      >
        <option value="all">🌐 All Wards (Country-Wide)</option>
        {filteredWards.map((w) => (
          <option key={w.ward_id} value={w.ward_id}>
            {w.ward_name || `Ward ${w.ward_no}`}
          </option>
        ))}
      </select>
    </div>
  );
}

// AdminHome already fetches the full ward list for the ward-management
// card and holds it in `wards` state — pass that straight through here
// instead of a second fetch of the same data.
export default function AdminAnalytics({ wards = [], onBack }) {
  const [module, setModule] = useState("birth");
  const [year, setYear] = useState(new Date().getFullYear());
  const [wardId, setWardId] = useState(null); // null = "All Wards" / country-wide; otherwise a UUID string

  const [vital, setVital] = useState(null);
  const [summary, setSummary] = useState(null);
  const [extra, setExtra] = useState(null);
  const [loading, setLoading] = useState(true);

  const isCountryView = wardId === null;

  useEffect(() => {
    let cancelled = false;
    const qs = `year=${year}${wardId != null ? `&ward_id=${wardId}` : ""}`;
    getJSON(`/v1/analytics/admin/vital-snapshot?${qs}`)
      .then((data) => {
        if (!cancelled) setVital(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load vital snapshot");
      });
    return () => {
      cancelled = true;
    };
  }, [year, wardId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const qs = `year=${year}${wardId != null ? `&ward_id=${wardId}` : ""}`;
    getJSON(`/v1/analytics/admin/${module}/summary?${qs}`)
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
  }, [module, year, wardId]);

  useEffect(() => {
    let cancelled = false;
    setExtra(null);
    const wardQs = wardId != null ? `?ward_id=${wardId}` : "";
    const endpoint =
      module === "death"
        ? `/v1/analytics/admin/death/causes${wardQs}`
        : module === "migration"
          ? `/v1/analytics/admin/migration/reasons${wardQs}`
          : module === "complaint"
            ? `/v1/analytics/admin/complaint/breakdown${wardQs}`
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
  }, [module, wardId]);

  const wardBreakdown = useMemo(
    () => (isCountryView && summary ? summary.ward_breakdown || [] : []),
    [isCountryView, summary],
  );

  return (
    <div className="space-y-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
        >
          ← Back
        </button>
      )}

      {/* ── vital snapshot — country-wide or single-ward depending on selector ── */}
      {vital && (
        <Panel
          title={
            isCountryView
              ? `Country-Wide Vital Snapshot — ${vital.year}`
              : (() => {
                  const w = wards.find((w) => w.ward_id === wardId);
                  return `${w ? w.ward_name || `Ward ${w.ward_no}` : `Ward ${wardId}`} — ${vital.year}`;
                })()
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
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

          {isCountryView && vital.births_by_ward?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-500 mb-3">
                Births by Ward
              </p>
              <ResponsiveContainer
                width="100%"
                height={Math.max(120, vital.births_by_ward.length * 26)}
              >
                <BarChart
                  data={vital.births_by_ward}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 20 }}
                >
                  <CartesianGrid stroke="#f1f2f4" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="ward_name"
                    width={110}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="births" fill="#2563eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      )}

      {/* ── filters ── */}
      <Panel>
        <div className="flex gap-3 flex-wrap items-center">
          <WardCascadeSelector
            wards={wards}
            wardId={wardId}
            onChange={setWardId}
          />
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className={SELECT_CLASS}
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
            className={SELECT_CLASS}
          >
            {[year, year - 1, year - 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </Panel>

      {loading || !summary ? (
        <p className="text-sm text-gray-500">Loading analytics…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
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

          {/* ── ward leaderboard — only in country-wide view; this is the
              panel that actually answers "which wards are behind" ── */}
          {isCountryView && wardBreakdown.length > 0 && (
            <Panel
              title={`Ward Comparison — ${MODULES.find((m) => m.value === module)?.label}`}
            >
              <ResponsiveContainer
                width="100%"
                height={Math.max(160, wardBreakdown.length * 30)}
              >
                <BarChart
                  data={wardBreakdown}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 20 }}
                >
                  <CartesianGrid stroke="#f1f2f4" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="ward_name"
                    width={110}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v, n, p) => [
                      `${v}% (${p.payload.issued}/${p.payload.total})`,
                      "Completion Rate",
                    ]}
                  />
                  <Bar dataKey="completion_rate" radius={[0, 6, 6, 0]}>
                    {wardBreakdown.map((w) => (
                      <Cell
                        key={w.ward_id}
                        fill={
                          w.completion_rate < 60
                            ? "#dc2626"
                            : w.completion_rate < 85
                              ? "#d97706"
                              : "#059669"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Wrapped in its own overflow-x-auto so a wide table
                  scrolls internally instead of stretching the whole
                  page and producing a page-level horizontal scrollbar. */}
              <div className="overflow-x-auto mt-6 -mx-1">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="py-2 px-1 font-semibold text-indigo-900">
                        Ward
                      </th>
                      <th className="py-2 px-1 font-semibold text-indigo-900 text-right">
                        Total
                      </th>
                      <th className="py-2 px-1 font-semibold text-indigo-900 text-right">
                        Issued
                      </th>
                      <th className="py-2 px-1 font-semibold text-indigo-900 text-right">
                        Rejected
                      </th>
                      <th className="py-2 px-1 font-semibold text-indigo-900 text-right">
                        Rate
                      </th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {wardBreakdown.map((w) => (
                      <tr
                        key={w.ward_id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-2.5 px-1 text-gray-800">
                          {w.ward_name}
                        </td>
                        <td className="py-2.5 px-1 text-right text-gray-700">
                          {w.total}
                        </td>
                        <td className="py-2.5 px-1 text-right text-gray-700">
                          {w.issued}
                        </td>
                        <td className="py-2.5 px-1 text-right text-gray-700">
                          {w.rejected}
                        </td>
                        <td className="py-2.5 px-1 text-right">
                          <Badge tone={rateTone(w.completion_rate)}>
                            {w.completion_rate}%
                          </Badge>
                        </td>
                        <td className="py-2.5 px-1 text-right">
                          <button
                            type="button"
                            onClick={() => setWardId(w.ward_id)}
                            className="text-blue-600 hover:underline font-medium whitespace-nowrap"
                          >
                            Drill in →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {/* ── status breakdown + monthly trend — same charts whether
              country-wide (aggregated) or a single drilled-into ward ── */}
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
              <div className="flex flex-wrap gap-3 justify-center mt-3">
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

            <Panel
              title={`Monthly Submissions — ${year}${isCountryView ? " (All Wards)" : ""}`}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={summary.monthly_trend.map((m) => ({
                    ...m,
                    label: MONTH_LABELS[m.month - 1],
                  }))}
                  margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                >
                  <CartesianGrid stroke="#f1f2f4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
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

          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="Pending Records — How Long They've Waited">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={Object.entries(summary.pending_aging || {}).map(
                    ([bucket, count]) => ({ bucket, count }),
                  )}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 20 }}
                >
                  <CartesianGrid stroke="#f1f2f4" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="bucket"
                    width={90}
                    tick={{ fontSize: 11.5, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d97706" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
            </Panel>
          </div>

          {module === "death" && extra && (
            <div className="grid md:grid-cols-2 gap-6">
              <Panel title="Cause of Death">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={Object.entries(extra.cause_breakdown || {}).map(
                      ([cause, count]) => ({ cause: humanize(cause), count }),
                    )}
                    layout="vertical"
                    margin={{ top: 4, right: 24, bottom: 4, left: 20 }}
                  >
                    <CartesianGrid stroke="#f1f2f4" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="cause"
                      width={100}
                      tick={{ fontSize: 11.5, fill: "#6b7280" }}
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
                    margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                  >
                    <CartesianGrid stroke="#f1f2f4" vertical={false} />
                    <XAxis
                      dataKey="bucket"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
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
                  margin={{ top: 4, right: 24, bottom: 4, left: 20 }}
                >
                  <CartesianGrid stroke="#f1f2f4" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="reason"
                    width={120}
                    tick={{ fontSize: 11.5, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                    margin={{ top: 4, right: 24, bottom: 4, left: 20 }}
                  >
                    <CartesianGrid stroke="#f1f2f4" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={110}
                      tick={{ fontSize: 11.5, fill: "#6b7280" }}
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
                    margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                  >
                    <CartesianGrid stroke="#f1f2f4" vertical={false} />
                    <XAxis
                      dataKey="priority"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#d97706" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-3">
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
