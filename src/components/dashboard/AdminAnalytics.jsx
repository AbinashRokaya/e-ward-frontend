// components/dashboard/AdminAnalytics.jsx
//
// Admin's analytics view. Two modes, toggled by the ward selector:
//   - "All Wards" (ward_id = null) -> country-wide totals + a ward
//     leaderboard/comparison chart, hitting the /admin/... endpoints
//     with no ward_id.
//   - a specific ward -> the same charts as WardAnalytics.jsx, but for a
//     ward the admin picked — same /admin/... endpoints with ward_id set.
//
// STYLING: Panel / StatCard / MiniStat / Badge and the chart palette now
// come from analyticsUI.jsx, shared with WardAnalytics.jsx, so the two
// dashboards can't drift apart again.
//
// LAYOUT: this component does NOT add its own page margin/padding — it
// sits inside whatever content container the role page already provides.
//
// WARD_ID TYPE: ward_id is a UUID string, not a number — the backend
// parses it with uuid.UUID(...) and 400s on anything else. Never wrap it
// in Number(...); treat it as an opaque string throughout.

import { useEffect, useMemo, useState } from "react";
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
import { toast } from "react-toastify";
import {
  MODULES,
  MONTH_LABELS,
  CHART,
  statusColor,
  humanize,
  SELECT_CLASS,
  Panel,
  StatCard,
  MiniStat,
  Badge,
  rateTone,
  BackButton,
} from "./analyticsUI";

const AXIS_TICK = { fontSize: 11, fill: CHART.axis };

async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  const body = await res.json();
  return body.data;
}

// Ward schema uses ward_province, confirmed against the backend's
// Create Ward / Update Ward multipart schema.
function getProvince(w) {
  return w.ward_province || null;
}

// Province -> District -> Municipality -> Ward, as four always-visible
// dropdowns. Filtered client-side from the ward list AdminHome already
// fetched for its ward-management card.
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
          // ward_id is a UUID string — do NOT wrap in Number(), that
          // produces "ward_id=NaN" which the backend correctly 400s on.
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

// AdminHome already fetches the full ward list — pass it straight through
// instead of a second fetch of the same data.
export default function AdminAnalytics({ wards = [], onBack }) {
  const [module, setModule] = useState("birth");
  const [year, setYear] = useState(new Date().getFullYear());
  const [wardId, setWardId] = useState(null); // null = country-wide; else a UUID string

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
      {onBack && <BackButton onClick={onBack} />}

      {/* ── vital snapshot — country-wide or single-ward ── */}
      {vital && (
        <Panel
          title={
            isCountryView
              ? `Country-Wide Vital Snapshot — ${vital.year}`
              : (() => {
                  const w = wards.find((w) => w.ward_id === wardId);
                  return `${
                    w ? w.ward_name || `Ward ${w.ward_no}` : `Ward ${wardId}`
                  } — ${vital.year}`;
                })()
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <MiniStat label="Births" value={vital.births} color={CHART.primary} />
            <MiniStat label="Deaths" value={vital.deaths} color={CHART.danger} />
            <MiniStat
              label="Natural Change"
              value={vital.natural_change}
              color={CHART.success}
              prefix={vital.natural_change >= 0 ? "+" : ""}
            />
            <MiniStat
              label="Migration Registrations"
              value={vital.migrations}
              color={CHART.accent}
            />
          </div>

          {isCountryView && vital.births_by_ward?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-500 mb-3">
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
                  <CartesianGrid stroke={CHART.grid} horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="ward_name"
                    width={110}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="births" fill={CHART.primary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      )}

      {/* ── filters ── */}
      <Panel>
        <div className="flex gap-3 flex-wrap items-center">
          <WardCascadeSelector wards={wards} wardId={wardId} onChange={setWardId} />
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
        <p className="text-sm text-slate-500">Loading analytics…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Records" value={summary.total} accent={CHART.deep} />
            <StatCard
              label={
                summary.status_summary?.RESOLVED !== undefined
                  ? "Resolved"
                  : "Certificate Issued"
              }
              value={summary.issued}
              accent={CHART.success}
            />
            <StatCard label="Rejected" value={summary.rejected} accent={CHART.danger} />
            <StatCard
              label="Completion Rate"
              value={`${summary.completion_rate}%`}
              accent={CHART.primary}
            />
          </div>

          {/* ── ward leaderboard — country-wide view only. This is the
              panel that answers "which wards are behind". ── */}
          {isCountryView && wardBreakdown.length > 0 && (
            <Panel
              title={`Ward Comparison — ${
                MODULES.find((m) => m.value === module)?.label
              }`}
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
                  <CartesianGrid stroke={CHART.grid} horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="ward_name"
                    width={110}
                    tick={AXIS_TICK}
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
                            ? CHART.danger
                            : w.completion_rate < 85
                              ? CHART.warning
                              : CHART.success
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Own overflow-x-auto so a wide table scrolls internally
                  instead of stretching the page. */}
              <div className="overflow-x-auto mt-6 -mx-1">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="py-2 px-1 font-semibold text-blue-900">Ward</th>
                      <th className="py-2 px-1 font-semibold text-blue-900 text-right">
                        Total
                      </th>
                      <th className="py-2 px-1 font-semibold text-blue-900 text-right">
                        Issued
                      </th>
                      <th className="py-2 px-1 font-semibold text-blue-900 text-right">
                        Rejected
                      </th>
                      <th className="py-2 px-1 font-semibold text-blue-900 text-right">
                        Rate
                      </th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {wardBreakdown.map((w) => (
                      <tr
                        key={w.ward_id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-2.5 px-1 text-slate-800">{w.ward_name}</td>
                        <td className="py-2.5 px-1 text-right text-slate-700">
                          {w.total}
                        </td>
                        <td className="py-2.5 px-1 text-right text-slate-700">
                          {w.issued}
                        </td>
                        <td className="py-2.5 px-1 text-right text-slate-700">
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
                            className="text-blue-900 hover:underline font-medium whitespace-nowrap"
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

          {/* ── status breakdown + monthly trend ── */}
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
                    {Object.keys(summary.status_summary || {}).map((key) => (
                      <Cell key={key} fill={statusColor(key)} />
                    ))}
                  </Pie>
                  <PieTooltip formatter={(value, name) => [value, humanize(name)]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-3">
                {Object.entries(summary.status_summary || {}).map(([key, value]) => (
                  <span
                    key={key}
                    className="text-xs text-slate-600 flex items-center gap-1.5"
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: statusColor(key) }}
                    />
                    {humanize(key)} · {value}
                  </span>
                ))}
              </div>
            </Panel>

            <Panel
              title={`Monthly Submissions — ${year}${
                isCountryView ? " (All Wards)" : ""
              }`}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={(summary.monthly_trend || []).map((m) => ({
                    ...m,
                    label: MONTH_LABELS[m.month - 1],
                  }))}
                  margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                >
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="submitted"
                    stroke={CHART.primary}
                    strokeWidth={2}
                    dot={false}
                    name="Submitted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* ── pending aging + rejection reasons ── */}
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
                  <CartesianGrid stroke={CHART.grid} horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="bucket"
                    width={90}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={CHART.warning} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Recent Rejection Reasons">
              {(summary.recent_rejection_reasons || []).length === 0 ? (
                <p className="text-sm text-slate-400">No rejections recorded yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-700 max-h-[200px] overflow-y-auto">
                  {(summary.recent_rejection_reasons || []).map((text, i) => (
                    <li key={i} className="border-l-2 border-red-300 pl-3">
                      {text}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* ── module-specific panels ── */}
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
                    <CartesianGrid stroke={CHART.grid} horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="cause"
                      width={100}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill={CHART.danger} radius={[0, 6, 6, 0]} />
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
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis
                      dataKey="bucket"
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill={CHART.accent} radius={[6, 6, 0, 0]} />
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
                  <CartesianGrid stroke={CHART.grid} horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="reason"
                    width={120}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={CHART.accent} radius={[0, 6, 6, 0]} />
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
                    <CartesianGrid stroke={CHART.grid} horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={110}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill={CHART.primary} radius={[0, 6, 6, 0]} />
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
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis
                      dataKey="priority"
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill={CHART.warning} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-4">
                  <MiniStat
                    label="Avg Resolution"
                    value={`${extra.avg_resolution_days}d`}
                    color={CHART.deep}
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
                        ? CHART.danger
                        : CHART.success
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