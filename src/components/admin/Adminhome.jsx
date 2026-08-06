import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";
import { ADMIN_ENTITY_LIST } from "../config/adminEntityTypes";
import { colorsFor } from "../config/colorClasses";
import EntityManager from "./Entitymanager";
// Adjust this path to wherever AdminAnalytics.jsx actually lives in your
// repo — used ../../components/dashboard/AdminAnalytics to match where
// WardAnalytics.jsx already sits (the officer-facing version this reuses
// Panel/StatCard/MiniStat/statusColor/humanize/MODULES from).
import AdminAnalytics from "../../components/dashboard/AdminAnalytics";

// Analytics isn't a CRUD entity — no table, no add-form, no delete — so
// it doesn't belong in ADMIN_ENTITY_TYPES (that config exists purely to
// drive EntityManager). It gets its own card and its own render branch
// below instead.
const ANALYTICS_CARD = {
  key: "analytics",
  label: "Analytics",
  labelNp: "तथ्याङ्क विश्लेषण",
  icon: "📊",
  color: "violet", // swap for whatever key exists in colorClasses.js
};

function ServiceCard({ config, count, onSelect }) {
  const colors = colorsFor(config.color);
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
      <p className="text-sm text-slate-500 mt-1">
        {config.key === "analytics"
          ? "View country-wide or ward-by-ward statistics."
          : `View, add, or manage ${config.label.toLowerCase()} records.`}
      </p>
    </button>
  );
}

function AdminHome() {
  const [selectedKey, setSelectedKey] = useState(null);
  const [wards, setWards] = useState([]);
  const [counts, setCounts] = useState({});

  const fetchWards = () => {
    return fetch(`${API_URL}/v1/admin/ward`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        }),
      )
      .then((data) => setWards(data.data.ward_list));
  };

  // Best-effort counts for the landing cards — one lightweight fetch per
  // entity type. If a fetch fails, that card just omits its count badge.
  useEffect(() => {
    fetchWards().catch((err) => {
      console.error("Failed to fetch wards:", err);
      toast.error("Failed to fetch wards.");
    });

    ADMIN_ENTITY_LIST.forEach((config) => {
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
    // wards is already fetched above for the Ward-management card —
    // AdminAnalytics reuses it (ward_name/ward_no/ward_district/
    // ward_municipality/ward_id) for its District -> Municipality ->
    // Ward selector instead of fetching its own copy.
    return <AdminAnalytics wards={wards} onBack={() => setSelectedKey(null)} />;
  }

  if (selectedKey) {
    const config = ADMIN_ENTITY_LIST.find((c) => c.key === selectedKey);
    return (
      <EntityManager
        config={config}
        wards={wards}
        onWardsChanged={(updater) => setWards(updater)}
        onBack={() => setSelectedKey(null)}
      />
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Admin Services</h1>
        <p className="text-slate-500">
          Choose a service to view, add, or manage records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...ADMIN_ENTITY_LIST, ANALYTICS_CARD].map((config) => (
          <ServiceCard
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

export default AdminHome;
