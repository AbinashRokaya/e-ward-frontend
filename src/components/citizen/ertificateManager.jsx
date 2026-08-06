import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";

import { colorsFor } from "../config/colorClasses";
import CertificateTable from "../ certificate-shared/CertificateTable";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "issued", label: "Certificate Issued" },
  { key: "rejected", label: "Rejected" },
];

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
 * One manager screen for any certificate type. Pass the config object from
 * certificateTypes.js — everything else (endpoints, labels, colors, which
 * form/preview component to render) is read from it.
 *
 * config.ListComponent (optional) — if set, renders this instead of the
 * generic search/filter/CertificateTable list for the "list" tab. Used by
 * Complaint for its card-grid "My Complaints" view, Notice for its
 * ward-secretary-managed list, and Tax for MyTaxDashboard.
 *
 * IMPORTANT: when config.ListComponent is set, this component does NOT
 * call the generic `${apiBase}/all` fetch at all — ListComponent is
 * expected to fetch whatever data it needs itself (MyTaxDashboard hits
 * /v1/tax/assessments/my directly, for example). Types that don't define
 * a real `${apiBase}/all` endpoint (tax has none — there was never a
 * reason to build one, since ListComponent bypasses this fetch) will
 * 404 on mount if this guard is ever removed.
 *
 * config.FormComponent (optional) — if not set (e.g. notice, tax — which
 * are created/edited entirely through their own screens instead), the
 * "+ Add" tab is omitted entirely rather than rendering a broken tab.
 *
 * config.extraTabs (optional) — array of { key, label, Component }. Each
 * renders as an additional tab after "+ Add", rendered with { wards } as
 * props when active. Used by Complaint for its "All Complaints" ward-wide
 * read-only view.
 */
function CertificateManager({ config, wards, onBack }) {
  const colors = colorsFor(config.color);

  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("list"); // "list" | "add" | <extraTab.key>
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingView, setLoadingView] = useState(false);

  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [viewingPreview, setViewingPreview] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [certificateReloadKey, setCertificateReloadKey] = useState(0);

  const extraTabs = config.extraTabs || [];

  const fetchRecords = () => {
    return fetch(`${API_URL}${config.apiBase}/all`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        }),
      )
      .then((data) => setRecords(data.data || []))
      .catch((err) => {
        console.error("Fetch failed:", err);
        toast.error(`Failed to fetch ${config.label.toLowerCase()} data.`);
      });
  };

  useEffect(() => {
    // Types with a ListComponent (notice, complaint, tax) manage their
    // own data fetching — calling the generic `${apiBase}/all` here is
    // both wasted work and, for types like tax that never had a reason
    // to build that endpoint, a guaranteed 404 on every mount.
    if (config.ListComponent) return;
    fetchRecords();
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
      const status = String(r[config.statusField] || "").toUpperCase();
      if (statusFilter === "issued") return status === config.issuedStatus;
      if (statusFilter === "rejected") return status === "REJECTED";
      if (statusFilter === "in_progress")
        return status !== config.issuedStatus && status !== "REJECTED";
      return true;
    });

  const statusCounts = {
    all: records.length,
    in_progress: records.filter((r) => {
      const s = String(r[config.statusField] || "").toUpperCase();
      return s !== config.issuedStatus && s !== "REJECTED";
    }).length,
    issued: records.filter(
      (r) =>
        String(r[config.statusField] || "").toUpperCase() ===
        config.issuedStatus,
    ).length,
    rejected: records.filter(
      (r) => String(r[config.statusField] || "").toUpperCase() === "REJECTED",
    ).length,
  };

  const fetchDetail = (record) =>
    fetch(`${API_URL}${config.apiBase}/${config.getId(record)}`, {
      method: "GET",
      credentials: "include",
    }).then((res) =>
      res.json().then((d) => {
        if (!res.ok) throw d;
        return d;
      }),
    );

  const handleView = (record) => {
    setLoadingView(true);
    setViewingCertificate(null);
    setViewingPreview(null);

    fetchDetail(record)
      .then((d) => {
        const full = d.data;
        if (!full || !config.getId(full)) {
          // was: !full.registration_id
          toast.error("Record is incomplete — cannot open it.");
          return;
        }
        const status = String(full[config.statusField] || "").toUpperCase();
        if (status === config.issuedStatus) {
          setCertificateReloadKey((k) => k + 1);
          setViewingCertificate(full);
        } else {
          setViewingPreview(full);
        }
      })
      .catch((err) => {
        console.error("Failed to load record:", err);
        toast.error("Failed to load record details.");
      })
      .finally(() => setLoadingView(false));
  };

  const handleEdit = (record) => {
    if (!config.EditComponent) {
      toast.info(`Editing for ${config.label} isn't available yet.`);
      return;
    }
    fetchDetail(record)
      .then((d) => setEditingRecord(d.data))
      .catch((err) => {
        console.error("Failed to load record:", err);
        toast.error("Failed to load record details.");
      });
  };

  const handleDownload = () => {
    const id = viewingCertificate && config.getId(viewingCertificate);
    if (!id) {
      toast.error("Missing registration ID — cannot download.");
      return;
    }
    window.open(`${API_URL}${config.certificateDownloadPath(id)}`, "_blank");
  };

  const PreviewComponent = config.PreviewComponent;
  const FormComponent = config.FormComponent;
  const EditComponent = config.EditComponent;
  const ListComponent = config.ListComponent;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
        >
          ← All certificates
        </button>
        <h1 className={`text-xl font-semibold ${colors.accentText}`}>
          {config.icon} {config.label}
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
          {config.label} List
        </button>
        {/* Only render "+ Add" when a FormComponent actually exists.
            notice/tax set FormComponent: null since they're created/edited
            entirely through their own screens — without this guard the
            tab showed up with nothing behind it. */}
        {FormComponent && (
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "add"
                ? `${colors.activeTab} shadow-sm`
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            + Add {config.label}
          </button>
        )}
        {extraTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? `${colors.activeTab} shadow-sm`
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "list" &&
        (ListComponent ? (
          <ListComponent />
        ) : (
          <div className="bg-white rounded-md shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                All Wards — {config.label}s
              </h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={config.searchLabel}
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

            <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 border-b border-slate-100">
              {STATUS_FILTERS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setStatusFilter(t.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === t.key
                      ? colors.activeFilter
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.label} ({statusCounts[t.key]})
                </button>
              ))}
            </div>

            <div className="p-4">
              <CertificateTable
                records={filteredRecords}
                config={config}
                onView={handleView}
                onEdit={handleEdit}
                onDeleteRequest={setDeleteTarget}
              />
              {(loadingView || refreshing) && (
                <p className="text-xs text-slate-400 mt-2">
                  {refreshing ? "Refreshing records…" : "Loading record…"}
                </p>
              )}
            </div>
          </div>
        ))}

      {/* Guarded on FormComponent too, not just the tab button — if
          activeTab were ever already "add" from a previous config (e.g.
          this component reused across type switches without unmounting),
          this stops it from rendering <null wards={...} /> and crashing. */}
      {activeTab === "add" && FormComponent && <FormComponent wards={wards} />}

      {extraTabs.map(
        (tab) =>
          activeTab === tab.key && (
            <tab.Component key={tab.key} wards={wards} />
          ),
      )}

      {/* Issued certificate — embeds the real backend PDF */}
      {viewingCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-md shadow-lg max-w-4xl w-full h-[90vh] flex flex-col">
            <div className="flex justify-end gap-3 p-2 sticky top-0 bg-white border-b border-slate-100">
              <button
                type="button"
                onClick={handleDownload}
                className={`${colors.accentText} text-sm font-medium cursor-pointer`}
              >
                ⬇ Download PDF
              </button>
              <button
                type="button"
                onClick={() => setViewingCertificate(null)}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <iframe
              key={certificateReloadKey}
              src={`${API_URL}${config.certificateDownloadPath(
                config.getId(viewingCertificate),
              )}?t=${certificateReloadKey}`}
              title={`${config.label}`}
              className="flex-1 w-full"
            />
          </div>
        </div>
      )}

      {/* Submitted / approved — plain preview */}
      {viewingPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-md shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-end gap-3 p-2 sticky top-0 bg-white border-b border-slate-100">
              <button
                type="button"
                onClick={() => setViewingPreview(null)}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <PreviewComponent
              formData={viewingPreview}
              showRejectSection={false}
            />
          </div>
        </div>
      )}

      {/* Rejected — edit + resubmit */}
      {editingRecord && EditComponent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-md shadow-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-end p-2 sticky top-0 bg-white border-b border-slate-100 z-10">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <EditComponent
              registration={editingRecord}
              wards={wards}
              onClose={() => setEditingRecord(null)}
              onSaved={() => {
                setEditingRecord(null);
                fetchRecords();
              }}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-lg max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Delete this record?
            </h3>
            <p className="text-sm text-slate-500">
              This can't be undone. The record will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  fetch(
                    `${API_URL}${config.apiBase}/${config.getId(deleteTarget)}`,
                    { method: "DELETE", credentials: "include" },
                  )
                    .then((res) => {
                      if (!res.ok) throw new Error();
                      toast.success("Record deleted.");
                      setDeleteTarget(null);
                      fetchRecords();
                    })
                    .catch(() => toast.error("Failed to delete record."));
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-700 text-white hover:bg-red-800 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default CertificateManager;
