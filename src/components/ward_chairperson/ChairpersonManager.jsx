import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";
import { colorsFor } from "../config/colorClasses";
import ConfirmDeleteModal from "../admin/ConfirmDeleteModal";

function RefreshIcon({ spinning }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? "animate-spin" : ""}
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function ChairpersonManager({ config, onBack }) {
  const colors = colorsFor(config.color);

  const [wards, setWards] = useState([]);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // only used when config.hasStatusTabs !== false
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchWards = () =>
    fetch(`${API_URL}/v1/admin/ward`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        }),
      )
      .then((data) => setWards(data.data.ward_list))
      .catch((err) => {
        console.error("Failed to fetch wards:", err);
        toast.error("Failed to fetch wards.");
      });

  const fetchRecords = () =>
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
      .then((data) => setRecords(config.getRecords(data) || []))
      .catch((err) => {
        console.error(`Failed to fetch ${config.label.toLowerCase()}s:`, err);
        toast.error(`Failed to fetch ${config.label.toLowerCase()} records.`);
      });

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWards(), fetchRecords()]).finally(() =>
      setLoading(false),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.key]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords().finally(() => setRefreshing(false));
  };

  const hasStatusTabs = config.hasStatusTabs !== false;

  const filteredRecords = records
    .filter((r) =>
      config.getSearchValue(r).toLowerCase().includes(search.toLowerCase()),
    )
    .filter((r) => {
      if (!hasStatusTabs) return true;
      const status = String(r[config.statusField] || "").toUpperCase();
      if (activeTab === "issued") return status === config.issuedStatus;
      return status !== config.issuedStatus && status !== config.rejectedStatus;
    });

  const handleSaved = () => {
    setEditingRecord(null);
    fetchRecords();
  };

  const handleConfirmDelete = async () => {
    if (!config.deleteEndpoint) {
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(
        `${API_URL}${config.deleteEndpoint(deleteTarget[config.idField])}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) throw new Error();
      setRecords((prev) =>
        prev.filter((r) => r[config.idField] !== deleteTarget[config.idField]),
      );
      toast.success("Record removed successfully!");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to remove record.");
    } finally {
      setDeleting(false);
    }
  };

  const TableComponent = config.TableComponent;
  const EditModalComponent = config.EditModalComponent;
  const ViewComponent = config.ViewComponent;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
        >
          ← सबै प्रमाणपत्र (All Certificates)
        </button>
        <h1 className={`text-xl font-semibold ${colors.accentText}`}>
          {config.icon} {config.label} ({config.labelNp})
        </h1>
      </div>

      {hasStatusTabs && (
        <div className="flex flex-wrap gap-2 bg-white p-1 rounded-md shadow-sm border border-slate-200">
          <span className="self-center text-xs text-slate-400 font-semibold px-2 uppercase tracking-wide">
            Actions
          </span>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "pending"
                ? `${colors.activeTab} shadow-sm`
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {config.pendingTabLabel}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("issued")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "issued"
                ? `${colors.activeTab} shadow-sm`
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {config.issuedTabLabel}
          </button>
        </div>
      )}

      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {hasStatusTabs
              ? activeTab === "issued"
                ? config.sectionTitleIssued
                : config.sectionTitlePending
              : config.sectionTitle}
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={config.searchPlaceholder}
              className={`border border-slate-300 rounded-md px-3 py-2 text-sm w-full sm:w-64 outline-none ${colors.ring}`}
            />
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh list"
              aria-label="Refresh list"
              className="shrink-0 inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshIcon spinning={refreshing} />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing…" : "Refresh"}
              </span>
            </button>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
          ) : filteredRecords.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              No records found
            </p>
          ) : (
            <TableComponent
              {...{ [config.recordsPropName]: filteredRecords }}
              onView={(r) =>
                ViewComponent ? setViewingRecord(r) : setEditingRecord(r)
              }
              onEdit={setEditingRecord}
              onDeleteRequest={
                config.deleteEndpoint ? setDeleteTarget : undefined
              }
            />
          )}
        </div>
      </div>

      {editingRecord && (
        <EditModalComponent
          {...{ [config.editRecordPropName]: editingRecord }}
          {...(config.needsWards ? { wards } : {})}
          onClose={() => setEditingRecord(null)}
          onSaved={handleSaved}
        />
      )}

      {ViewComponent && viewingRecord && (
        <ViewComponent
          {...{ [config.editRecordPropName]: viewingRecord }}
          onClose={() => setViewingRecord(null)}
        />
      )}

      {config.deleteEndpoint && (
        <ConfirmDeleteModal
          open={!!deleteTarget}
          title={config.deleteTitle}
          description={
            deleteTarget ? config.getDeleteDescription(deleteTarget) : ""
          }
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}
    </main>
  );
}

export default ChairpersonManager;
