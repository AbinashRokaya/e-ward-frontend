// components/dashboard/WardAnalytics.jsx
//
// One shared analytics component, mounted unchanged in all three role
// pages (DataValidation, WardSecretary, WardChairperson) — each role only
// ever sees their own ward because every backend query is scoped
// server-side to current_user.user_ward_id.
//
// Presentational pieces and constants live in analyticsUI.jsx so this file
// and AdminAnalytics.jsx share one visual source.

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
import API_URL from "../../api/api";
import { toast } from "react-toastify";
import {
  MODULES,
  MONTH_LABELS,
  CHART,
  statusColor,
  humanize,
  SELECT_CLASS,
  DashboardShell,
  DashboardHeader,
  Panel,
  StatCard,
  MiniStat,
  BackButton,
  EmptyChart,
  isEmptyCounts,
} from "./analyticsUI";

// Re-exported for any file still importing these from here.
export { MODULES, MONTH_LABELS, statusColor, humanize, Panel, StatCard, MiniStat };

async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  const body = await res.json();
  return body.data;
}

const AXIS_TICK = { fontSize: 11, fill: CHART.axis };

export default function WardAnalytics({ onBack }) {
  const [module, setModule] = useState("birth");
  const [year, setYear] = useState(new Date().getFullYear());

  const [vital, setVital] = useState(null);
  const [summary, setSummary] = useState(null);
  const [extra, setExtra] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // `cancelled` prevents a slow fetch from a previously selected module
    // landing after you've switched, overwriting `extra` with a mismatched
    // shape — that was the cause of an Object.entries crash.
    let cancelled = false;
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

  const activeModule = MODULES.find((m) => m.value === module);
  const hasRecords = summary?.total > 0;

  return (
    <DashboardShell>
      {onBack && <BackButton onClick={onBack} />}

      {/* Filters live in the header rather than a separate panel, so the
          page opens with one clear anchor instead of a stray control bar. */}
      <DashboardHeader
        title="वडा तथ्याङ्क (Ward Analytics)"
        subtitle={`${activeModule?.label ?? ""} · ${year}`}
        right={
          <div className="flex gap-2 flex-wrap">
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className={SELECT_CLASS}
            >
              {MODULES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.icon} {m.label}
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
        }
      />

      {/* ── ward-wide vital snapshot ─────────────────────────── */}
      {vital && (
        <Panel
          title={`Ward Vital Snapshot — ${vital.year}`}
          subtitle="Births, deaths, and migration across the whole ward"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <MiniStat
              label="Births"
              value={vital.births}
              color={CHART.primary}
              icon="👶"
            />
            <MiniStat
              label="Deaths"
              value={vital.deaths}
              color={CHART.danger}
              icon="🕊️"
            />
            <MiniStat
              label="Natural Change"
              value={vital.natural_change}
              color={CHART.success}
              prefix={vital.natural_change >= 0 ? "+" : ""}
              icon="📈"
            />
            <MiniStat
              label="Migration Registrations"
              value={vital.migrations}
              color={CHART.accent}
              icon="🧳"
            />
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Natural change = births − deaths. A per-1,000 rate needs a
            population figure on the Ward model — not tracked yet, so it's left
            out rather than shown wrong.
          </p>
        </Panel>
      )}

      {loading || !summary ? (
        <p className="text-sm text-slate-500">Loading analytics…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Records"
              value={summary.total}
              accent={CHART.deep}
              icon="📁"
            />
            <StatCard
              label={
                summary.status_summary?.RESOLVED !== undefined
                  ? "Resolved"
                  : "Certificate Issued"
              }
              value={summary.issued}
              accent={CHART.success}
              icon="✅"
            />
            <StatCard
              label="Rejected"
              value={summary.rejected}
              accent={CHART.danger}
              icon="⛔"
            />
            <StatCard
              label="Completion Rate"
              value={`${summary.completion_rate}%`}
              accent={CHART.primary}
              icon="🎯"
              hint={`${summary.issued} of ${summary.total} completed`}
            />
          </div>

          {/* ── status breakdown + monthly trend ──────────────── */}
          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="Status Breakdown">
              {isEmptyCounts(summary.status_summary) ? (
                <EmptyChart message="No applications to break down yet." />
              ) : (
                <>
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
                          className="text-xs text-slate-600 flex items-center gap-1.5"
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
                </>
              )}
            </Panel>

            <Panel title={`Monthly Submissions — ${year}`}>
              {!hasRecords ? (
                <EmptyChart message={`No submissions recorded in ${year}.`} />
              ) : (
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
              )}
            </Panel>
          </div>

          {/* ── pending aging + recent rejection reasons ──────── */}
          <div className="grid md:grid-cols-2 gap-6">
            <Panel
              title="Pending Records"
              subtitle="How long each has been waiting"
            >
              {isEmptyCounts(summary.pending_aging) ? (
                <EmptyChart message="Nothing pending right now." />
              ) : (
                <>
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
                      <Bar
                        dataKey="count"
                        fill={CHART.warning}
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-400 mt-3">
                    Records piling up in the 15-30 or 30+ buckets are the ones
                    actually stuck, not just pending.
                  </p>
                </>
              )}
            </Panel>

            <Panel
              title="Recent Rejection Reasons"
              subtitle="Free text, most recent first"
            >
              {(summary.recent_rejection_reasons || []).length === 0 ? (
                <p className="text-sm text-slate-400">
                  No rejections recorded yet.
                </p>
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

          {/* ── module-specific panels ─────────────────────────── */}
          {module === "death" && extra && (
            <div className="grid md:grid-cols-2 gap-6">
              <Panel title="Cause of Death">
                {isEmptyCounts(extra.cause_breakdown) ? (
                  <EmptyChart message="No death registrations to analyse yet." />
                ) : (
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
                      <Bar
                        dataKey="count"
                        fill={CHART.danger}
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Panel>

              <Panel title="Age at Death">
                {isEmptyCounts(extra.age_distribution) ? (
                  <EmptyChart message="No age data available yet." />
                ) : (
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
                      <Bar
                        dataKey="count"
                        fill={CHART.accent}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Panel>
            </div>
          )}

          {module === "migration" && extra && (
            <Panel
              title="Migration Reasons"
              subtitle="Why people are migrating — no in/out direction tracked yet"
            >
              {isEmptyCounts(extra.reason_breakdown) ? (
                <EmptyChart message="No migration registrations yet." />
              ) : (
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
                    <Bar
                      dataKey="count"
                      fill={CHART.accent}
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>
          )}

          {module === "complaint" && extra && (
            <div className="grid md:grid-cols-2 gap-6">
              <Panel title="By Category">
                {isEmptyCounts(extra.category_breakdown) ? (
                  <EmptyChart message="No complaints filed yet." />
                ) : (
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
                      <Bar
                        dataKey="count"
                        fill={CHART.primary}
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Panel>

              <Panel title="Priority + SLA">
                {isEmptyCounts(extra.priority_breakdown) ? (
                  <EmptyChart message="No complaints to measure yet." />
                ) : (
                  <>
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
                        <Bar
                          dataKey="count"
                          fill={CHART.warning}
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-6 mt-4">
                      <MiniStat
                        label="Avg Resolution"
                        value={`${extra.avg_resolution_days}d`}
                        color={CHART.deep}
                        icon="⏱️"
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
                        icon="📋"
                      />
                    </div>
                  </>
                )}
              </Panel>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}