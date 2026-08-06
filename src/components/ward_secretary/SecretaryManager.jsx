import { useState, useEffect } from "react";
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

function SecretaryManager({ config, onBack }) {
  const colors = colorsFor(config.color);

  const [wards, setWards] = useState([]);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("verification");
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filterFields = config.filterFields || [];

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

  // config.fetchEndpoint is ALWAYS a plain string now — every ward-secretary
  // endpoint (birth, death, migration, recommendation, complaint, notice)
  // derives the secretary's ward server-side from their session, so there's
  // no ward id to resolve on the frontend at all.
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

  const handleFilterChange = (id, value) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
  };

  const clearExtraFilters = () => setFilterValues({});
  const hasActiveExtraFilters = Object.values(filterValues).some(Boolean);

  const matchesExtraFilters = (record) =>
    filterFields.every((field) => {
      const value = filterValues[field.id];
      if (!value) return true;
      if (field.kind === "select") {
        return String(record[field.id] || "").toUpperCase() === value;
      }
      if (field.kind === "date-from") {
        const recordDate = new Date(record[field.recordField]);
        return (
          !Number.isNaN(recordDate.getTime()) && recordDate >= new Date(value)
        );
      }
      if (field.kind === "date-to") {
        const recordDate = new Date(record[field.recordField]);
        const end = new Date(value);
        end.setHours(23, 59, 59, 999);
        return !Number.isNaN(recordDate.getTime()) && recordDate <= end;
      }
      return true;
    });

  const filteredRecords = records
    .filter((r) =>
      config.getSearchValue(r).toLowerCase().includes(search.toLowerCase()),
    )
    .filter((r) => {
      if (!hasStatusTabs) return true;
      const status = String(r[config.statusField] || "").toUpperCase();
      if (activeTab === "forwarded") return status === config.forwardedStatus;
      return status !== config.forwardedStatus;
    })
    .filter(matchesExtraFilters);

  const handleSaved = () => {
    setEditingRecord(null);
    setShowAddModal(false);
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

      {hasStatusTabs ? (
        <div className="flex flex-wrap gap-2 bg-white p-1 rounded-md shadow-sm border border-slate-200">
          <span className="self-center text-xs text-slate-400 font-semibold px-2 uppercase tracking-wide">
            Actions
          </span>
          <button
            type="button"
            onClick={() => setActiveTab("verification")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "verification"
                ? `${colors.activeTab} shadow-sm`
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {config.verificationTabLabel}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("forwarded")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "forwarded"
                ? `${colors.activeTab} shadow-sm`
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {config.forwardedTabLabel}
          </button>
        </div>
      ) : (
        config.allowAdd && (
          <div className="flex flex-wrap gap-2 bg-white p-1 rounded-md shadow-sm border border-slate-200">
            <span className="self-center text-xs text-slate-400 font-semibold px-2 uppercase tracking-wide">
              Actions
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${colors.activeTab} shadow-sm`}
            >
              {config.addButtonLabel || "+ Add"}
            </button>
          </div>
        )
      )}

      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {hasStatusTabs
              ? activeTab === "forwarded"
                ? config.sectionTitleForwarded
                : config.sectionTitleVerification
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

        {filterFields.length > 0 && (
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-end">
            {filterFields.map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {field.label}
                </label>
                {field.kind === "select" ? (
                  <select
                    value={filterValues[field.id] || ""}
                    onChange={(e) =>
                      handleFilterChange(field.id, e.target.value)
                    }
                    className={`border border-slate-300 rounded-md px-3 py-2 text-sm outline-none bg-white ${colors.ring}`}
                  >
                    <option value="">{field.allLabel || "All"}</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    value={filterValues[field.id] || ""}
                    onChange={(e) =>
                      handleFilterChange(field.id, e.target.value)
                    }
                    className={`border border-slate-300 rounded-md px-3 py-2 text-sm outline-none ${colors.ring}`}
                  />
                )}
              </div>
            ))}
            {hasActiveExtraFilters && (
              <button
                type="button"
                onClick={clearExtraFilters}
                className="text-xs text-slate-500 hover:text-slate-700 underline pb-2"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

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

      {config.allowAdd && showAddModal && (
        <EditModalComponent
          {...(config.needsWards ? { wards } : {})}
          onClose={() => setShowAddModal(false)}
          onSaved={handleSaved}
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

export default SecretaryManager;
