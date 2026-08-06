import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import WardTable from "./WardTable";
import AddWardForm from "./AddWardForm";
import OfficerTable from "./OfficerTable";
import AssignOfficerForm from "./AssignOfficerForm";
import API_URL from "../../api/api";
import EditWardModal from "./EditWardModal";
import EditOfficerModal from "./EditOfficerModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

// ---------------------------------------------------------------------------
// Same tokens as Header/Home/Footer/AuthPage/Citizen — navy (blue-900),
// rounded-md, slate neutrals. Move to shared tokens.js when ready.
// ---------------------------------------------------------------------------
const TABS = [
  { key: "wards", label: "वडा सूची (Ward List)", section: "ward" },
  { key: "add-ward", label: "+ नयाँ वडा (Add Ward)", section: "ward" },
  { key: "officers", label: "अधिकृत सूची (Officer List)", section: "officer" },
  {
    key: "add-officer",
    label: "+ अधिकृत नियुक्त (Assign)",
    section: "officer",
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

function Admin() {
  const [wards, setWards] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [activeTab, setActiveTab] = useState("wards");
  const [editingWard, setEditingWard] = useState(null);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [wardSearch, setWardSearch] = useState("");
  const [officerSearch, setOfficerSearch] = useState("");
  const [deleteWardTarget, setDeleteWardTarget] = useState(null);
  const [deleteOfficerTarget, setDeleteOfficerTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingWards, setLoadingWards] = useState(true);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [refreshingWards, setRefreshingWards] = useState(false);
  const [refreshingOfficers, setRefreshingOfficers] = useState(false);

  const handleAddWard = (w) => {
    setWards((p) => [w, ...p]);
    setActiveTab("wards");
  };

  const handleAddOfficer = (o) => {
    setOfficers((p) => [o, ...p]);
    setActiveTab("officers");
  };

  const filteredWards = wards.filter(
    (w) =>
      w.ward_name.toLowerCase().includes(wardSearch.toLowerCase()) ||
      w.ward_municipality.toLowerCase().includes(wardSearch.toLowerCase()) ||
      w.ward_district.toLowerCase().includes(wardSearch.toLowerCase()),
  );

  const filteredOfficers = officers.filter((o) => {
    const q = officerSearch.toLowerCase();
    return (
      (o.user_name ?? "").toLowerCase().includes(q) ||
      (o.user_phone_number ?? "").includes(officerSearch) ||
      String(o.user_ward_number ?? "").includes(officerSearch)
    );
  });

  // Bug fix: the previous version called `showPanelToast(...)`, a function
  // that was never defined or imported anywhere in this file — it would
  // have thrown a ReferenceError the moment a ward/officer was saved,
  // deleted, so those confirmations silently never appeared.
  const handleWardSaved = (updated) => {
    setWards((prev) =>
      prev.map((w) => (w.ward_id === updated.ward_id ? updated : w)),
    );
    setEditingWard(null);
    toast.success("Ward updated successfully!");
  };

  const handleOfficerSaved = (updated) => {
    setOfficers((prev) =>
      prev.map((o) => (o.user_id === updated.user_id ? updated : o)),
    );
    setEditingOfficer(null);
    toast.success("Officer updated successfully!");
  };

  // Extracted so the initial load and the manual "Refresh" buttons share
  // the exact same fetch logic instead of duplicating it.
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

  const fetchOfficers = () => {
    return fetch(`${API_URL}/v1/admin/users/officers`, {
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
        setOfficers(data.data);
      })
      .catch((err) => {
        console.error("Failed to fetch officers:", err);
        toast.error("Failed to fetch officers.");
      });
  };

  const handleRefreshWards = () => {
    setRefreshingWards(true);
    fetchWards().finally(() => setRefreshingWards(false));
  };

  const handleRefreshOfficers = () => {
    setRefreshingOfficers(true);
    fetchOfficers().finally(() => setRefreshingOfficers(false));
  };

  useEffect(() => {
    fetchWards().finally(() => setLoadingWards(false));
    fetchOfficers().finally(() => setLoadingOfficers(false));
  }, []);

  const confirmDeleteWard = async () => {
    setDeleting(true);
    try {
      // TODO: replace with DELETE /v1/admin/ward/{deleteWardTarget.ward_id}
      await new Promise((r) => setTimeout(r, 600));
      setWards((prev) =>
        prev.filter((w) => w.ward_id !== deleteWardTarget.ward_id),
      );
      setDeleteWardTarget(null);
      toast.success("Ward removed successfully!");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteOfficer = async () => {
    setDeleting(true);
    try {
      // TODO: replace with DELETE /v1/admin/user/{deleteOfficerTarget.user_id}
      await new Promise((r) => setTimeout(r, 600));
      setOfficers((prev) =>
        prev.filter((o) => o.user_id !== deleteOfficerTarget.user_id),
      );
      setDeleteOfficerTarget(null);
      toast.success("Officer removed successfully!");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Tab switcher — one primary color (navy) for both groups now;
          section grouping is communicated by the uppercase label above
          each group, not by giving every group its own brand color. */}
      <div className="flex flex-wrap gap-4 bg-white p-1 rounded-md shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold px-2 uppercase tracking-wide">
            Ward
          </span>
          {TABS.filter((t) => t.section === "ward").map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
            Officer
          </span>
          {TABS.filter((t) => t.section === "officer").map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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

      {activeTab === "wards" && (
        <div className="bg-white rounded-md shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              सबै वडाहरू (All Wards)
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={wardSearch}
                onChange={(e) => setWardSearch(e.target.value)}
                placeholder="नाम, जिल्ला वा नगरपालिका खोज्नुहोस्…"
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full sm:w-64 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
              <button
                type="button"
                onClick={handleRefreshWards}
                disabled={refreshingWards}
                title="Refresh list"
                aria-label="Refresh ward list"
                className="shrink-0 inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshIcon spinning={refreshingWards} />
                <span className="hidden sm:inline">
                  {refreshingWards ? "Refreshing…" : "Refresh"}
                </span>
              </button>
            </div>
          </div>
          <div className="p-4">
            {loadingWards ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                लोड हुँदैछ… (Loading wards…)
              </p>
            ) : filteredWards.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                कुनै वडा फेला परेन (No wards found)
              </p>
            ) : (
              <WardTable
                wards={filteredWards}
                onEdit={setEditingWard}
                onDeleteRequest={setDeleteWardTarget}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "add-ward" && <AddWardForm onSuccess={handleAddWard} />}

      {activeTab === "officers" && (
        <div className="bg-white rounded-md shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              सबै अधिकृतहरू (All Officers)
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={officerSearch}
                onChange={(e) => setOfficerSearch(e.target.value)}
                placeholder="नाम, फोन वा वडा नं. खोज्नुहोस्…"
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full sm:w-64 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
              <button
                type="button"
                onClick={handleRefreshOfficers}
                disabled={refreshingOfficers}
                title="Refresh list"
                aria-label="Refresh officer list"
                className="shrink-0 inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshIcon spinning={refreshingOfficers} />
                <span className="hidden sm:inline">
                  {refreshingOfficers ? "Refreshing…" : "Refresh"}
                </span>
              </button>
            </div>
          </div>
          <div className="p-4">
            {loadingOfficers ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                लोड हुँदैछ… (Loading officers…)
              </p>
            ) : filteredOfficers.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                कुनै अधिकृत फेला परेन (No officers found)
              </p>
            ) : (
              <OfficerTable
                officers={filteredOfficers}
                onEdit={setEditingOfficer}
                onDeleteRequest={setDeleteOfficerTarget}
                wards={wards}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "add-officer" && (
        <AssignOfficerForm wards={wards} onSuccess={handleAddOfficer} />
      )}

      {editingWard && (
        <EditWardModal
          ward={editingWard}
          onClose={() => setEditingWard(null)}
          onSaved={handleWardSaved}
        />
      )}
      {editingOfficer && (
        <EditOfficerModal
          officer={editingOfficer}
          wards={wards}
          onClose={() => setEditingOfficer(null)}
          onSaved={handleOfficerSaved}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteWardTarget}
        title="वडा हटाउनुहोस्? (Delete Ward?)"
        description={
          deleteWardTarget
            ? `"${deleteWardTarget.ward_name}" (Ward ${deleteWardTarget.ward_no}) लाई स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`
            : ""
        }
        onCancel={() => setDeleteWardTarget(null)}
        onConfirm={confirmDeleteWard}
        deleting={deleting}
      />
      <ConfirmDeleteModal
        open={!!deleteOfficerTarget}
        title="अधिकृत हटाउनुहोस्? (Delete Officer?)"
        description={
          deleteOfficerTarget
            ? `"${deleteOfficerTarget.user_name}" लाई वडा ${deleteOfficerTarget.user_ward_number} बाट हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`
            : ""
        }
        onCancel={() => setDeleteOfficerTarget(null)}
        onConfirm={confirmDeleteOfficer}
        deleting={deleting}
      />
    </main>
  );
}

export default Admin;
