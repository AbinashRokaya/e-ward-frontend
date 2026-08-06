import React, { useContext, useEffect, useState } from "react";
import API_URL from "../../api/api";
import NoticeTable from "./NoticeTable";
import NoticeForm from "./NoticeForm";
import NoticeWardFilter from "./NoticeWardFilter";
import { LoginContext } from "../context/LoginContext";

const NOTICE_TYPES = [
  "PUBLIC",
  "TENDER",
  "VACANCY",
  "TAX",
  "MEETING",
  "HEALTH",
  "EDUCATION",
  "DISASTER",
  "EVENT",
  "OTHER",
];
const NOTICE_STATUSES = ["DRAFT", "PUBLISHED", "EXPIRED", "ARCHIVED"];

function NoticeManagement() {
  const { userRole } = useContext(LoginContext);
  const canManage = userRole === "wardsecretary";

  const [notices, setNotices] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewingNotice, setViewingNotice] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/v1/admin/ward`, { method: "GET", credentials: "include" })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then((data) => setWards(data.data.ward_list || []))
      .catch((err) => console.error("Failed to load wards:", err));
  }, []);

  const fetchNotices = (wardId) => {
    if (!wardId) {
      setNotices([]);
      return;
    }
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (typeFilter) params.set("notice_type", typeFilter);
    if (statusFilter) params.set("notice_status", statusFilter);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);

    fetch(`${API_URL}/v1/notice/${wardId}/all?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then((data) => setNotices(data.data || []))
      .catch((err) => {
        console.error("Failed to load notices:", err);
        setError("Could not load notices for this ward.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotices(selectedWardId);
  }, [selectedWardId, typeFilter, statusFilter, dateFrom, dateTo]);

  const filteredNotices = notices.filter((n) =>
    n.notice_title.toLowerCase().includes(search.toLowerCase()),
  );

  const clearFilters = () => {
    setTypeFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const isWordDoc = (mime) =>
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Ward Notices</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <NoticeWardFilter wards={wards} onWardSelect={setSelectedWardId} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {canManage && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                + Add Notice
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">All Types</option>
              {NOTICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              {NOTICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {(typeFilter || statusFilter || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline pb-2"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="p-4">
          {!selectedWardId ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Select a province, district, municipality, and ward to view
              notices.
            </p>
          ) : loading ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Loading notices...
            </p>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : (
            <NoticeTable
              notices={filteredNotices}
              onView={setViewingNotice}
              onEdit={canManage ? setEditingNotice : undefined}
            />
          )}
        </div>
      </div>

      {viewingNotice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {viewingNotice.notice_title}
              </h3>
              <button
                onClick={() => setViewingNotice(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {viewingNotice.notice_attachment_path &&
              (viewingNotice.notice_attachment_type?.startsWith("image/") ? (
                <img
                  src={`${API_URL}/static/${viewingNotice.notice_attachment_path}`}
                  alt={viewingNotice.notice_title}
                  className="w-full max-h-[70vh] object-contain rounded-lg border border-gray-200"
                />
              ) : viewingNotice.notice_attachment_type === "application/pdf" ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={`${API_URL}/static/${viewingNotice.notice_attachment_path}`}
                    title={viewingNotice.notice_title}
                    className="w-full h-[70vh]"
                  />
                  <a
                    href={`${API_URL}/static/${viewingNotice.notice_attachment_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs text-blue-600 hover:text-blue-800 bg-gray-50 py-2 border-t border-gray-200"
                  >
                    ⬇ Open Full PDF
                  </a>
                </div>
              ) : (
                <a
                  href={`${API_URL}/static/${viewingNotice.notice_attachment_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...(isWordDoc(viewingNotice.notice_attachment_type)
                    ? { download: true }
                    : {})}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 border border-gray-200 rounded-lg px-3 py-2"
                >
                  📎 View / Download Attachment
                  {isWordDoc(viewingNotice.notice_attachment_type) &&
                    " (Word Doc)"}
                </a>
              ))}

            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {viewingNotice.notice_description}
            </p>
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded-full">
                {viewingNotice.notice_type}
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded-full">
                {viewingNotice.notice_status}
              </span>
            </div>
          </div>
        </div>
      )}

      {canManage && showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <NoticeForm
              onCreated={() => {
                setShowAddModal(false);
                fetchNotices(selectedWardId);
              }}
            />
          </div>
        </div>
      )}

      {canManage && editingNotice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <NoticeForm
              notice={editingNotice}
              onSaved={() => {
                setEditingNotice(null);
                fetchNotices(selectedWardId);
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default NoticeManagement;
