import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BirthCertificateTable from "../datavalidation/BirthCertificateTable";
import API_URL from "../../api/api";
import EditBirthRegistrationWardSecretaryModal from "./EditBirthRegistrationWardSecretaryModal";
import ConfirmDeleteModal from "../admin/ConfirmDeleteModal";

// ---------------------------------------------------------------------------
// Constants & Configuration
// ---------------------------------------------------------------------------
const WARD_SECRETARY_TYPES = {
  birth_certificate: "BIRTH_CERTIFICATE",
};

const FORWARDED_STATUS = "FORWARDED_TO_CHAIRPERSON";

const TABS = [
  {
    key: "document_verification",
    label: "कागजात प्रमाणीकरण (Verify Birth Documents)",
  },
  {
    key: "forwarded_to_chairperson",
    label: "सिफारिस पठाइएको (Forwarded for Approval)",
  },
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

function WardSecretary() {
  // Moved config variable inside the function component body
  const config = WARD_SECRETARY_TYPES.birth_certificate;

  const [wards, setWards] = useState([]);
  const [activeTab, setActiveTab] = useState("document_verification");
  const [birthCertificate, setbirthCertificate] = useState([]);
  const [editingBirth, setEditingBirth] = useState(null);
  const [birthCertificateSearch, setbirthCertificateSearch] = useState("");
  const [deleteBirthTarget, setDeleteBirthTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filterBirthCertificate = birthCertificate
    .filter((b) =>
      (b.child?.child_first_name ?? "")
        .toLowerCase()
        .includes(birthCertificateSearch.toLowerCase()),
    )
    .filter((b) => {
      const status = String(b.register_status || "").toUpperCase();
      if (activeTab === "forwarded_to_chairperson")
        return status === FORWARDED_STATUS;
      return status !== FORWARDED_STATUS;
    });

  const fetchWards = () => {
    return fetch(`${API_URL}/v1/admin/ward`, {
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
        console.error("Failed to fetch wards:", err);
        toast.error("Failed to fetch wards.");
      });
  };

  const fetchRecords = () => {
    return fetch(`${API_URL}/v1/ward-secretary/all`, {
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
        console.error("Failed to fetch records:", err);
        toast.error("Failed to fetch birth registration records.");
      });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords().finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchWards();
    fetchRecords();
  }, []);

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

  const confirmDeleteBirth = async () => {
    setDeleting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setbirthCertificate((prev) =>
        prev.filter(
          (b) => b.registration_id !== deleteBirthTarget.registration_id,
        ),
      );
      setDeleteBirthTarget(null);
      toast.success("Record removed successfully!");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap gap-2 bg-white p-1 rounded-md shadow-sm border border-slate-200">
        <span className="self-center text-xs text-slate-400 font-semibold px-2 uppercase tracking-wide">
          Actions
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

      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {activeTab === "forwarded_to_chairperson"
              ? "सिफारिस पठाइएका अभिलेखहरू (Forwarded for Approval)"
              : "प्रमाणीकरण पर्खाइमा रहेका (Pending Verification)"}
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
        <div className="p-4">
          {filterBirthCertificate.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              No records found
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

      {editingBirth && (
        <EditBirthRegistrationWardSecretaryModal
          wards={wards}
          birth={editingBirth}
          onClose={() => setEditingBirth(null)}
          onSaved={handleBirthSaved}
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
    </main>
  );
}

export default WardSecretary;
