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

function ValidationManager({ config, onBack }) {
  const colors = colorsFor(config.color);

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = () => {
    return fetch(`${API_URL}${config.fetchEndpoint}`, {
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
        toast.error(`Failed to fetch ${config.label.toLowerCase()}s.`);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchRecords().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.key]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords().finally(() => setRefreshing(false));
  };

  const filteredRecords = records
    .filter((r) =>
      config.getSearchValue(r).toLowerCase().includes(search.toLowerCase()),
    )
    .filter((r) => {
      if (!config.statusFilters || statusFilter === "all") return true;
      return String(r[config.statusField] || "").toLowerCase() === statusFilter;
    });

  const statusCounts = config.statusFilters
    ? config.statusFilters.reduce((acc, f) => {
        acc[f.key] =
          f.key === "all"
            ? records.length
            : records.filter(
                (r) =>
                  String(r[config.statusField] || "").toLowerCase() === f.key,
              ).length;
        return acc;
      }, {})
    : {};

  const handleSaved = () => {
    setEditingRecord(null);
    fetchRecords();
  };

  const handleConfirmDelete = async () => {
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
      toast.success(`${config.label} removed successfully!`);
      setDeleteTarget(null);
    } catch {
      toast.error(`Failed to remove ${config.label.toLowerCase()}.`);
    } finally {
      setDeleting(false);
    }
  };

  const TableComponent = config.TableComponent;
  const EditModalComponent = config.EditModalComponent;
  // Optional — when set (currently just notice), "View" opens this
  // read-only component instead of falling back to EditModalComponent.
  const ViewComponent = config.ViewComponent;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
        >
          ← सबै लाइनहरू (All Queues)
        </button>
        <h1 className={`text-xl font-semibold ${colors.accentText}`}>
          {config.icon} {config.label} ({config.labelNp})
        </h1>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {config.sectionTitle}
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

        {config.statusFilters && (
          <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 border-b border-slate-100">
            {config.statusFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === f.key
                    ? colors.activeFilter
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label} ({statusCounts[f.key] ?? 0})
              </button>
            ))}
          </div>
        )}

        <div className="p-4">
          {loading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
          ) : (
            <TableComponent
              {...{ [config.recordsPropName]: filteredRecords }}
              onView={(r) =>
                ViewComponent ? setViewingRecord(r) : setEditingRecord(r)
              }
              onEdit={setEditingRecord}
              onDeleteRequest={config.allowDelete ? setDeleteTarget : () => {}}
            />
          )}
        </div>
      </div>

      {editingRecord && (
        <EditModalComponent
          {...{ [config.editRecordPropName]: editingRecord }}
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

      {config.allowDelete && (
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

export default ValidationManager;
