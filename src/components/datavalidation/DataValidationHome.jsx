import { useEffect, useState } from "react";
import API_URL from "../../api/api";
import ValidationManager from "./ValidationManager";
import { VALIDATION_LIST } from "../config/dataValidationTypes";
import { colorsFor } from "../config/colorClasses";
import WardAnalytics from "../dashboard/WardAnalytics";
import TaxDataValidationHome from "./TaxDataValidationHome"; // ADD — adjust path to wherever you place it

// Existing synthetic tab for analytics
const ANALYTICS_TAB = {
  key: "analytics",
  label: "Analytics",
  labelNp: "विश्लेषण",
  icon: "📊",
  color: "indigo",
};

// ADD — same idea: tax isn't a review queue (DVO enters the data, doesn't
// approve/reject a citizen submission), so it gets its own home component
// instead of going through VALIDATION_TYPES/ValidationManager.
const TAX_TAB = {
  key: "tax",
  label: "Tax",
  labelNp: "कर",
  icon: "💰",
  color: "emerald",
};

function QueueCard({ config, count, onSelect }) {
  const colors = colorsFor(config.color);

  // ADD — per-key description text, extended for tax instead of falling
  // through to the generic "Review and approve or reject..." line, which
  // would be wrong for tax (nothing to approve/reject).
  const description =
    config.key === "analytics"
      ? "View ward-wide trends and statistics across all queues."
      : config.key === "tax"
        ? "Enter and manage property, business, and rental tax records for this ward."
        : `Review and approve or reject ${config.label.toLowerCase()} submissions.`;

  return (
    <button
      type="button"
      onClick={() => onSelect(config.key)}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left transition-all hover:shadow-md ${colors.cardBorder} cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className="text-4xl mb-3">{config.icon}</div>
        {count !== null && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${colors.badge}`}
          >
            {count}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-800">
        {config.label}{" "}
        <span className="text-slate-400">({config.labelNp})</span>
      </h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </button>
  );
}

function DataValidationHome() {
  const [selectedKey, setSelectedKey] = useState(null);
  const [counts, setCounts] = useState({});

  // Unchanged — still iterates VALIDATION_LIST only, so ANALYTICS_TAB and
  // TAX_TAB (neither has a fetchEndpoint in this shape) are correctly skipped.
  useEffect(() => {
    VALIDATION_LIST.forEach((config) => {
      fetch(`${API_URL}${config.fetchEndpoint}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) =>
          res.json().then((data) => {
            if (!res.ok) throw data;
            return data;
          }),
        )
        .then((data) => {
          const records = config.getRecords(data) || [];
          setCounts((prev) => ({ ...prev, [config.key]: records.length }));
        })
        .catch(() => {
          // silent — card just won't show a count badge
        });
    });
  }, []);

  if (selectedKey === "analytics") {
    return <WardAnalytics onBack={() => setSelectedKey(null)} />;
  }

  // ADD — same early-branch pattern as analytics, before the
  // VALIDATION_LIST lookup below (which would return undefined for "tax").
  if (selectedKey === "tax") {
    return <TaxDataValidationHome onBack={() => setSelectedKey(null)} />;
  }

  if (selectedKey) {
    const config = VALIDATION_LIST.find((c) => c.key === selectedKey);
    return (
      <ValidationManager config={config} onBack={() => setSelectedKey(null)} />
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Data Validation</h1>
        <p className="text-slate-500">
          Choose a queue to review, approve, or reject submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* ADD — TAX_TAB prepended alongside ANALYTICS_TAB, everything else unchanged */}
        {[ANALYTICS_TAB, TAX_TAB, ...VALIDATION_LIST].map((config) => (
          <QueueCard
            key={config.key}
            config={config}
            count={counts[config.key] ?? null}
            onSelect={setSelectedKey}
          />
        ))}
      </div>
    </main>
  );
}

export default DataValidationHome;
