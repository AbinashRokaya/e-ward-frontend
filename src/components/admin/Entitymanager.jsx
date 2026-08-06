import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";
import { colorsFor } from "../config/colorClasses";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
// Adjust this import path to wherever ConfirmDeleteModal actually lives —
// it's already generic and doesn't need any changes.

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

/**
 * One manager screen for any admin-managed entity (ward, officer, and
 * whatever comes next). Pass the config object from adminEntityTypes.js —
 * everything else is read from it. `wards` is passed down separately since
 * several entity types (like officer) depend on the ward list regardless
 * of which entity is currently being managed.
 */
function EntityManager({ config, wards, onWardsChanged, onBack }) {
  const colors = colorsFor(config.color);

  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("list"); // "list" | "add"
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
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

  const filteredRecords = records.filter((r) =>
    config.getSearchValue(r).toLowerCase().includes(search.toLowerCase()),
  );

  // FormComponent (AddWardForm/AssignOfficerForm) does its own POST and
  // hands back the created record here — same contract as your original
  // Admin.jsx's handleAddWard/handleAddOfficer.
  const handleAdded = (record) => {
    setRecords((prev) => [record, ...prev]);
    setActiveTab("list");
    // If a ward was just added, the ward list used by other entity types
    // (e.g. officer's ward dropdown) needs to know about it too.
    if (config.key === "ward") onWardsChanged?.((prev) => [record, ...prev]);
  };

  // EditModalComponent does its own PUT and hands back the updated record.
  const handleSaved = (updated) => {
    setRecords((prev) =>
      prev.map((r) =>
        r[config.idField] === updated[config.idField] ? updated : r,
      ),
    );
    setEditingRecord(null);
    if (config.key === "ward") {
      onWardsChanged?.((prev) =>
        prev.map((w) => (w.ward_id === updated.ward_id ? updated : w)),
      );
    }
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
      if (config.key === "ward") {
        onWardsChanged?.((prev) =>
          prev.filter((w) => w.ward_id !== deleteTarget.ward_id),
        );
      }
      toast.success(`${config.label} removed successfully!`);
      setDeleteTarget(null);
    } catch {
      toast.error(`Failed to remove ${config.label.toLowerCase()}.`);
    } finally {
      setDeleting(false);
    }
  };

  const TableComponent = config.TableComponent;
  const FormComponent = config.FormComponent;
  const EditModalComponent = config.EditModalComponent;
  const extraProps = config.extraProps(wards);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
        >
          ← सबै सेवा (All Services)
        </button>
        <h1 className={`text-xl font-semibold ${colors.accentText}`}>
          {config.icon} {config.label} ({config.labelNp})
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-1 rounded-md shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "list"
              ? `${colors.activeTab} shadow-sm`
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          {config.listLabel}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "add"
              ? `${colors.activeTab} shadow-sm`
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          {config.addLabel}
        </button>
      </div>

      {activeTab === "list" && (
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
          <div className="p-4">
            {loading ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                लोड हुँदैछ… (Loading…)
              </p>
            ) : (
              <TableComponent
                {...{ [config.recordsPropName]: filteredRecords }}
                onEdit={setEditingRecord}
                onDeleteRequest={setDeleteTarget}
                {...extraProps}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "add" && (
        <FormComponent onSuccess={handleAdded} {...extraProps} />
      )}

      {editingRecord && (
        <EditModalComponent
          {...{ [config.editRecordPropName]: editingRecord }}
          onClose={() => setEditingRecord(null)}
          onSaved={handleSaved}
          {...extraProps}
        />
      )}

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
    </main>
  );
}

export default EntityManager;
