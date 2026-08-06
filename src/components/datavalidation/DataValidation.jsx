import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BirthCertificateTable from "./BirthCertificateTable";
import API_URL from "../../api/api";
import EditBirthRegistrationModal from "./ EditBirthRegistrationModal";
import CitizenTable from "./CitizenTable";
import EditCitizen from "./EditCitizen";
import ConfirmDeleteModal from "../admin/ConfirmDeleteModal";

// ---------------------------------------------------------------------------
// Same tokens as Header/Home/Footer/AuthPage/Citizen/Admin — navy
// (blue-900), rounded-md, slate neutrals. Move to shared tokens.js when ready.
// ---------------------------------------------------------------------------
const TABS = [
  {
    key: "birth_certificate",
    label: "Birth Certificate List",
    section: "birth_certificate",
  },
  { key: "citizen", label: "Citizen List", section: "citizen" },
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

const CITIZEN_STATUS_FILTERS = [
  { key: "all", label: "All", activeClass: "bg-slate-700 text-white" },
  { key: "pending", label: "Pending", activeClass: "bg-amber-600 text-white" },
  {
    key: "approved",
    label: "Approved",
    activeClass: "bg-green-700 text-white",
  },
  { key: "rejected", label: "Rejected", activeClass: "bg-red-700 text-white" },
];

function DataValidation() {
  const [birthCertificate, setbirthCertificate] = useState([]);
  const [activeTab, setActiveTab] = useState("birth_certificate");
  const [birthCertificateSearch, setbirthCertificateSearch] = useState("");
  const [editingBirth, setEditingBirth] = useState(null);
  const [deleteBirthTarget, setDeleteBirthTarget] = useState(null);

  const [citizen, setCitizen] = useState([]);
  const [editingCitizen, setEditingCitizen] = useState(null);
  const [citizenSearch, setCitizenSearch] = useState("");
  const [citizenStatusFilter, setCitizenStatusFilter] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [deleteCitizenTarget, setDeleteCitizenTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshingBirth, setRefreshingBirth] = useState(false);
  const [refreshingCitizen, setRefreshingCitizen] = useState(false);

  const filterBirthCertificate = birthCertificate.filter((b) =>
    (b.child?.child_first_name ?? "")
      .toLowerCase()
      .includes(birthCertificateSearch.toLowerCase()),
  );

  const filterCitizen = citizen
    .filter((c) =>
      (c.user_name ?? "").toLowerCase().includes(citizenSearch.toLowerCase()),
    )
    .filter((c) => {
      const status = String(c.user_status || "").toLowerCase();
      if (citizenStatusFilter === "all") return true;
      return status === citizenStatusFilter;
    });

  const citizenStatusCounts = {
    all: citizen.length,
    pending: citizen.filter(
      (c) => String(c.user_status || "").toLowerCase() === "pending",
    ).length,
    approved: citizen.filter(
      (c) => String(c.user_status || "").toLowerCase() === "approved",
    ).length,
    rejected: citizen.filter(
      (c) => String(c.user_status || "").toLowerCase() === "rejected",
    ).length,
  };

  const handleBirthSaved = (updated) => {
    if (!updated) return;
    setbirthCertificate((prev) =>
      prev.map((b) =>
        b?.registration_id === updated.registration_id ? updated : b,
      ),
    );
    setEditingBirth(null);
    toast.success("Birth registration updated successfully!");
  };

  const handleCitizenSaved = (updated) => {
    if (!updated) return;
    setCitizen((prev) =>
      prev.map((c) => {
        const currentId = c?.registration_id || c?.id || c?.user_id;
        const updatedId =
          updated?.registration_id || updated?.id || updated?.user_id;
        return currentId === updatedId ? updated : c;
      }),
    );
    setEditingCitizen(null);
    toast.success("Citizen record updated successfully!");
  };

  // Bug fix: the original had no ConfirmDeleteModal rendered anywhere in
  // this file, and the Citizen table's onDeleteRequest was wired to
  // setDeleteBirthTarget (the wrong state) instead of its own. Clicking
  // "Delete" on either table set state that nothing ever read, so nothing
  // happened. Both tables now have their own target + confirm handler,
  // same pattern as Admin.jsx.
  const confirmDeleteBirth = async () => {
    setDeleting(true);
    try {
      // TODO: replace with DELETE /v1/birth-registration/{deleteBirthTarget.registration_id}
      await new Promise((r) => setTimeout(r, 600));
      setbirthCertificate((prev) =>
        prev.filter(
          (b) => b.registration_id !== deleteBirthTarget.registration_id,
        ),
      );
      setDeleteBirthTarget(null);
      toast.success("Birth registration removed successfully!");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteCitizen = async () => {
    setDeleting(true);
    try {
      // TODO: replace with DELETE /v1/users/{deleteCitizenTarget.user_id}
      await new Promise((r) => setTimeout(r, 600));
      setCitizen((prev) =>
        prev.filter((c) => c.user_id !== deleteCitizenTarget.user_id),
      );
      setDeleteCitizenTarget(null);
      toast.success("Citizen removed successfully!");
    } finally {
      setDeleting(false);
    }
  };

  // Extracted so the initial load and the manual "Refresh" buttons share
  // the exact same fetch logic instead of duplicating it.
  const fetchBirthCertificates = () => {
    return fetch(`${API_URL}/v1/birth-registration/all`, {
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
        console.error("Failed to fetch birth registrations:", err);
        toast.error("Failed to fetch birth registrations.");
      });
  };

  const fetchCitizens = () => {
    return fetch(`${API_URL}/v1/users`, {
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
        setCitizen(data.data.user_list);
      })
      .catch((err) => {
        console.error("Failed to fetch citizens:", err);
        toast.error("Failed to fetch citizens.");
      });
  };

  const handleRefreshBirth = () => {
    setRefreshingBirth(true);
    fetchBirthCertificates().finally(() => setRefreshingBirth(false));
  };

  const handleRefreshCitizen = () => {
    setRefreshingCitizen(true);
    fetchCitizens().finally(() => setRefreshingCitizen(false));
  };

  useEffect(() => {
    fetchBirthCertificates();
    fetchCitizens();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap gap-4 bg-white p-1 rounded-md shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold px-2 uppercase tracking-wide">
            Birth Certificate
          </span>
          {TABS.filter((t) => t.section === "birth_certificate").map((tab) => (
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

        <div className="flex flex-wrap items-center gap-2 border-l border-slate-100 pl-4">
          <span className="text-xs text-slate-400 font-semibold px-2 uppercase tracking-wide">
            Citizen
          </span>
          {TABS.filter((t) => t.section === "citizen").map((tab) => (
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
                onClick={handleRefreshBirth}
                disabled={refreshingBirth}
                title="Refresh list"
                aria-label="Refresh birth certificate list"
                className="shrink-0 inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshIcon spinning={refreshingBirth} />
                <span className="hidden sm:inline">
                  {refreshingBirth ? "Refreshing…" : "Refresh"}
                </span>
              </button>
            </div>
          </div>
          <div className="p-4">
            {filterBirthCertificate.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No birth registrations found
              </p>
            ) : (
              <BirthCertificateTable
                birth={filterBirthCertificate}
                onEdit={setEditingBirth}
                onDeleteRequest={setDeleteBirthTarget}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "citizen" && (
        <div className="bg-white rounded-md shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              All Citizens
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={citizenSearch}
                onChange={(e) => setCitizenSearch(e.target.value)}
                placeholder="Search by citizen name"
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full sm:w-64 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
              <button
                type="button"
                onClick={handleRefreshCitizen}
                disabled={refreshingCitizen}
                title="Refresh list"
                aria-label="Refresh citizen list"
                className="shrink-0 inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshIcon spinning={refreshingCitizen} />
                <span className="hidden sm:inline">
                  {refreshingCitizen ? "Refreshing…" : "Refresh"}
                </span>
              </button>
            </div>
          </div>

          <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 border-b border-slate-100">
            {CITIZEN_STATUS_FILTERS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setCitizenStatusFilter(t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  citizenStatusFilter === t.key
                    ? t.activeClass
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label} ({citizenStatusCounts[t.key]})
              </button>
            ))}
          </div>

          <div className="p-4">
            {filterCitizen.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No citizens found
              </p>
            ) : (
              <CitizenTable
                citizen={filterCitizen}
                onEdit={setEditingCitizen}
                onDeleteRequest={setDeleteCitizenTarget}
              />
            )}
          </div>
        </div>
      )}

      {editingBirth && (
        <EditBirthRegistrationModal
          birth={editingBirth}
          onClose={() => setEditingBirth(null)}
          onSaved={handleBirthSaved}
        />
      )}
      {editingCitizen && (
        <EditCitizen
          citizen={editingCitizen}
          onClose={() => setEditingCitizen(null)}
          onSaved={handleCitizenSaved}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteBirthTarget}
        title="जन्म दर्ता हटाउनुहोस्? (Delete Birth Registration?)"
        description={
          deleteBirthTarget
            ? `"${deleteBirthTarget.child?.child_first_name ?? "this record"}" को जन्म दर्ता स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`
            : ""
        }
        onCancel={() => setDeleteBirthTarget(null)}
        onConfirm={confirmDeleteBirth}
        deleting={deleting}
      />
      <ConfirmDeleteModal
        open={!!deleteCitizenTarget}
        title="नागरिक हटाउनुहोस्? (Delete Citizen?)"
        description={
          deleteCitizenTarget
            ? `"${deleteCitizenTarget.user_name}" लाई स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`
            : ""
        }
        onCancel={() => setDeleteCitizenTarget(null)}
        onConfirm={confirmDeleteCitizen}
        deleting={deleting}
      />
    </main>
  );
}

export default DataValidation;
