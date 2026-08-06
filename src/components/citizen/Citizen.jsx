import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BirthRegistration from "../../pages/BirthRegistration";
import API_URL from "../../api/api";
import BirthCertificateTableCitizen from "./BirthCertificateTableCitizen";
import Preview from "../Preview";
import EditBirthRegistrationCitizen from "./EditBirthRegistrationCitizen";

// ---------------------------------------------------------------------------
// Same tokens as Header/Home/AuthPage/Footer — navy (blue-900), rounded-md.
// Move to shared tokens.js when ready so nothing drifts by hand again.
// ---------------------------------------------------------------------------
const TABS = [
  {
    key: "birth_certificate",
    label: "Birth Certificate List",
    section: "birth_certificate",
  },
  {
    key: "add_birth_certificate",
    label: "+ Birth Certificate",
    section: "birth_certificate",
  },
];

const STATUS_FILTERS = [
  { key: "all", label: "All", activeClass: "bg-slate-700 text-white" },
  {
    key: "in_progress",
    label: "In Progress",
    activeClass: "bg-blue-900 text-white",
  },
  {
    key: "issued",
    label: "Certificate Issued",
    activeClass: "bg-green-700 text-white",
  },
  { key: "rejected", label: "Rejected", activeClass: "bg-red-700 text-white" },
];

const CERTIFICATE_ISSUED = "CERTIFICATE_ISSUED";

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

function Citizen() {
  const [birthCertificate, setbirthCertificate] = useState([]);
  const [activeTab, setActiveTab] = useState("birth_certificate");
  const [birthCertificateSearch, setbirthCertificateSearch] = useState("");
  const [wards, setWards] = useState([]);
  const [editingBirth, setEditingBirth] = useState(null);
  const [deleteBirthTarget, setDeleteBirthTarget] = useState(null);

  // CERTIFICATE_ISSUED records go here → the real backend PDF is embedded via <iframe>
  const [viewingCertificate, setViewingCertificate] = useState(null);
  // submitted / approved / verified records go here → rendered with Preview
  const [viewingPreview, setViewingPreview] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Bumped every time we open a certificate, forces the iframe to re-fetch
  // instead of showing a cached/blank previous render on the 2nd+ open.
  const [certificateReloadKey, setCertificateReloadKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "in_progress" | "issued" | "rejected"

  // Returns a promise now (instead of nothing) so both the initial
  // useEffect load and the manual refresh button can await/settle it and
  // drive their own loading state without duplicating the fetch logic.
  const fetchBirthCertificates = () => {
    return fetch(`${API_URL}/v1/citizen/birth/all`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then((data) => {
        setbirthCertificate(data.data);
      })
      .catch((err) => {
        console.error("Submission failed:", err);
        toast.error("Failed to fetch birth certificate data.");
      });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBirthCertificates().finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetch(`${API_URL}/v1/admin/ward`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then((data) => {
        setWards(data.data.ward_list);
      })
      .catch((err) => {
        console.error("Submission failed:", err);
        toast.error("Failed to fetch wards.");
      });

    fetchBirthCertificates();
  }, []);

  const filterBirthCertificate = birthCertificate
    .filter((b) =>
      (b.child?.child_first_name ?? "")
        .toLowerCase()
        .includes(birthCertificateSearch.toLowerCase()),
    )
    .filter((b) => {
      const status = String(b.register_status || "").toUpperCase();
      if (statusFilter === "issued") return status === CERTIFICATE_ISSUED;
      if (statusFilter === "rejected") return status === "REJECTED";
      if (statusFilter === "in_progress")
        return status !== CERTIFICATE_ISSUED && status !== "REJECTED";
      return true; // "all"
    });

  const statusCounts = {
    all: birthCertificate.length,
    in_progress: birthCertificate.filter((b) => {
      const s = String(b.register_status || "").toUpperCase();
      return s !== CERTIFICATE_ISSUED && s !== "REJECTED";
    }).length,
    issued: birthCertificate.filter(
      (b) =>
        String(b.register_status || "").toUpperCase() === CERTIFICATE_ISSUED,
    ).length,
    rejected: birthCertificate.filter(
      (b) => String(b.register_status || "").toUpperCase() === "REJECTED",
    ).length,
  };

  const handleEditBirthCertificate = (record) => {
    fetch(`${API_URL}/v1/citizen/birth/${record.registration_id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then((d) => {
        setEditingBirth(d.data);
      })
      .catch((err) => {
        console.error("Failed to load registration details:", err);
        toast.error("Failed to load registration details.");
      });
  };

  // Fetches the full record, then routes it to the right viewer based on status:
  //   CERTIFICATE_ISSUED           -> embed the real backend PDF (iframe)
  //   SUBMITTED/APPROVED/VERIFIED  -> Preview
  // Rejected rows never reach this — the table sends those to onEdit instead.
  //
  // IMPORTANT: both viewer states are cleared at the start of every call.
  // Without this, closing a certificate modal and then opening a preview
  // (or vice versa) left the previous modal's state set, so the wrong
  // component could end up reading a formData object built for the other
  // case — which showed up as blank/null fields on the 2nd click.
  const handleViewBirthCertificate = (record) => {
    setLoadingView(true);
    setViewingCertificate(null);
    setViewingPreview(null);

    fetch(`${API_URL}/v1/citizen/birth/${record.registration_id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then((d) => {
        const full = d.data;

        if (!full || !full.registration_id) {
          toast.error(
            "Registration data is incomplete — cannot open this record.",
          );
          return;
        }

        if (full.register_status === CERTIFICATE_ISSUED) {
          setCertificateReloadKey((k) => k + 1);
          setViewingCertificate(full);
        } else {
          setViewingPreview(full);
        }
      })
      .catch((err) => {
        console.error("Failed to load registration details:", err);
        toast.error("Failed to load registration details.");
      })
      .finally(() => setLoadingView(false));
  };

  const handleDownloadCertificate = () => {
    if (!viewingCertificate?.registration_id) {
      toast.error("Missing registration ID — cannot download certificate.");
      return;
    }
    window.open(
      `${API_URL}/v1/birth-registration/${viewingCertificate.registration_id}/certificate/download`,
      "_blank",
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Tab switcher — fixed: the original had a second "Citizen" group
          whose filter (t.section === "Citizen") never matched any tab, so
          it always rendered an empty, useless label. Both real tabs belong
          to one group, so there's now just one. */}
      <div className="flex flex-wrap gap-2 bg-white p-1 rounded-md shadow-sm border border-slate-200">
        <span className="self-center text-xs text-slate-400 font-semibold px-2 uppercase tracking-wide">
          Birth Certificate
        </span>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "bg-blue-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "birth_certificate" && (
        <div className="bg-white rounded-md shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              All Wards Birth Certificates
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={birthCertificateSearch}
                onChange={(e) => setbirthCertificateSearch(e.target.value)}
                placeholder="Search by child's name"
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full sm:w-64 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
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

          {/* Status filter tabs */}
          <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 border-b border-slate-100">
            {STATUS_FILTERS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatusFilter(t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === t.key
                    ? t.activeClass
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label} ({statusCounts[t.key]})
              </button>
            ))}
          </div>

          <div className="p-4">
            <BirthCertificateTableCitizen
              birth={filterBirthCertificate}
              onView={handleViewBirthCertificate}
              onEdit={handleEditBirthCertificate}
              onDeleteRequest={setDeleteBirthTarget}
            />
            {(loadingView || refreshing) && (
              <p className="text-xs text-slate-400 mt-2">
                {refreshing ? "Refreshing records…" : "Loading record…"}
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "add_birth_certificate" && (
        <BirthRegistration wards={wards} />
      )}

      {/* CERTIFICATE_ISSUED records — embeds the actual backend-generated PDF
          (with QR code, hash-backed registration no., registrar name, etc.)
          instead of re-rendering an incomplete React copy.
          The `key` forces React to remount the iframe on every open, so the
          browser always issues a fresh request instead of reusing a stale/
          blank cached frame from a previous view. */}
      {viewingCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-md shadow-lg max-w-4xl w-full h-[90vh] flex flex-col">
            <div className="flex justify-end gap-3 p-2 sticky top-0 bg-white border-b border-slate-100">
              <button
                type="button"
                onClick={handleDownloadCertificate}
                className="text-blue-900 hover:text-blue-950 text-sm font-medium cursor-pointer"
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
              src={`${API_URL}/v1/birth-registration/${viewingCertificate.registration_id}/certificate/download?t=${certificateReloadKey}`}
              title="Birth Certificate"
              className="flex-1 w-full"
            />
          </div>
        </div>
      )}

      {/* SUBMITTED / APPROVED / VERIFIED records — plain preview, no reject UI */}
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
            <Preview formData={viewingPreview} showRejectSection={false} />
          </div>
        </div>
      )}

      {/* Rejected records only — edit + resubmit, with reject reasons shown */}
      {editingBirth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-md shadow-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-end p-2 sticky top-0 bg-white border-b border-slate-100 z-10">
              <button
                type="button"
                onClick={() => setEditingBirth(null)}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <EditBirthRegistrationCitizen
              registration={editingBirth}
              wards={wards}
              onClose={() => setEditingBirth(null)}
              onSaved={() => {
                setEditingBirth(null);
                fetchBirthCertificates();
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default Citizen;
