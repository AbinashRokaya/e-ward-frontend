import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BirthCertificateTable from "../datavalidation/BirthCertificateTable";
import API_URL from "../../api/api";
import EditBirthRegistrationWardChairpersonModal from "./EditBirthRegistrationWardChairpersonModal";
import ConfirmDeleteModal from "../admin/ConfirmDeleteModal";

// ---------------------------------------------------------------------------
// Same tokens as the rest of the app — navy (blue-900), rounded-md, slate
// neutrals. Move to shared tokens.js when ready.
//
// NOTE: I don't know the exact `register_status` values your API returns
// for chairperson-stage records, so the pending/issued split below is a
// best guess (anything not CERTIFICATE_ISSUED/REJECTED = "pending").
// Swap CERTIFICATE_ISSUED and the pending condition for your real enum.
// ---------------------------------------------------------------------------
const CERTIFICATE_ISSUED = "CERTIFICATE_ISSUED";

const TABS = [
  {
    key: "pending_approvals",
    label: "स्वीकृतिको पर्खाइमा (Pending Signatures)",
  },
  {
    key: "issued_certificates",
    label: "जारी गरिएका प्रमाणपत्र (Issued Certificates)",
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

function WardChairperson() {
  const [wards, setWards] = useState([]);
  const [activeTab, setActiveTab] = useState("pending_approvals");
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
      if (activeTab === "issued_certificates")
        return status === CERTIFICATE_ISSUED;
      return status !== CERTIFICATE_ISSUED && status !== "REJECTED";
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

  // Extracted so the initial load and the manual "Refresh" button share
  // the exact same fetch logic instead of duplicating it.
  const fetchRecords = () => {
    return fetch(`${API_URL}/v1/ward-chairperson/all`, {
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
      // TODO: replace with DELETE /v1/birth-registration/{deleteBirthTarget.registration_id}
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
      {/* Bug fix: the original filtered this list by
          t.section === "issued_certificates", but every TABS entry had
          section: "chairperson_action" — the filter never matched, so
          NO tab buttons rendered at all, and there was no way to ever
          switch away from the default tab. Now both tabs render. */}
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

      {/* Bug fix: only the "issued_certificates" tab had a content block —
          switching to "Pending Signatures" showed a blank page. Both tabs
          now share one card, filtered by status above. */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {activeTab === "issued_certificates"
              ? "जारी गरिएका प्रमाणपत्रहरू (Issued Certificates)"
              : "स्वीकृतिको पर्खाइमा रहेका (Pending Signatures)"}
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
        <EditBirthRegistrationWardChairpersonModal
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

export default WardChairperson;
