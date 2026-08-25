import { useEffect, useState } from "react";
import ComplaintCard from "../components/complaint/ComplaintCard";
import ComplaintFilters from "../components/complaint/ComplaintFilters";
import API_URL from "../api/api";
import logo from "../assets/nepal-sarkar.png";
import { notify } from "../utils/notify";
import {
  CATEGORY_STYLES,
  STATUS_STYLES,
  categoryLabel,
  formatDate,
} from "../components/complaint/complaintStyles";

// Legacy attachment_*_path values are relative to the static mount.
// Documents uploaded after the Cloudinary migration return full URLs,
// so those URLs are used directly.
function attachmentUrl(path) {
  if (!path) return null;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_URL}/static/${path}`;
}

function ComplaintBoard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // ---------------------------------------------------------------------------
  // Load current user's complaints
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const loadComplaints = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(`${API_URL}/v1/complaint/`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw data;
        }

        if (cancelled) return;

        setComplaints(data.data || []);
      } catch (err) {
        if (cancelled) return;

        setLoadError(
          "Could not load your complaints. Please check your connection and try again."
        );

        notify.loadFailed("your complaints", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Filter complaints
  // ---------------------------------------------------------------------------
  const filtered = complaints.filter((complaint) => {
    const subject = complaint.subject || "";

    // Search by subject
    if (
      search &&
      !subject.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    // Category
    if (
      categoryFilter &&
      complaint.complaint_category !== categoryFilter
    ) {
      return false;
    }

    // Status
    if (
      statusFilter &&
      complaint.complaint_status !== statusFilter
    ) {
      return false;
    }

    // From date
    if (
      dateFrom &&
      new Date(complaint.created_at) < new Date(dateFrom)
    ) {
      return false;
    }

    // To date
    if (
      dateTo &&
      new Date(complaint.created_at) > new Date(dateTo)
    ) {
      return false;
    }

    return true;
  });

  // ---------------------------------------------------------------------------
  // Clear all filters
  // ---------------------------------------------------------------------------
  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  // ---------------------------------------------------------------------------
  // Selected complaint attachments
  // ---------------------------------------------------------------------------
  const attachments = selectedComplaint
    ? [
        selectedComplaint.attachment_1_path,
        selectedComplaint.attachment_2_path,
        selectedComplaint.attachment_3_path,
      ].filter(Boolean)
    : [];

  const hasComplaints = complaints.length > 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
          <img
            src={logo}
            alt="Government of Nepal"
            className="w-16 h-16 object-contain"
          />

          <div>
            <p className="text-sm uppercase tracking-wider text-red-100">
              Government of Nepal
            </p>

            <h1 className="text-4xl font-bold">
              My Complaints
            </h1>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main Content */}
      {/* ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <ComplaintFilters
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onClear={clearFilters}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* ================================================================ */}
          {/* Complaint List */}
          {/* ================================================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loading */}
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Loading complaints...
              </p>
            ) : loadError ? (
              /* ============================================================ */
              /* Error */
              /* ============================================================ */
              <div className="text-center py-8 px-4 border border-dashed border-red-200 bg-red-50/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl mb-3 mx-auto">
                  ⚠️
                </div>

                <p className="text-sm text-red-700">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 text-xs font-semibold text-red-700 underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : !hasComplaints ? (
              /* ============================================================ */
              /* No Complaints */
              /* ============================================================ */
              <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-xl bg-white">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3 mx-auto">
                  📭
                </div>

                <p className="text-sm text-slate-600 font-medium">
                  You haven't filed any complaints yet.
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Complaints you submit will appear here with their status.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              /* ============================================================ */
              /* No Filter Results */
              /* ============================================================ */
              <div className="text-center py-8 px-4 border border-dashed border-slate-300 rounded-xl bg-white">
                <p className="text-sm text-slate-600">
                  No complaints match your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 text-xs font-semibold text-red-700 underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              /* ============================================================ */
              /* Complaint Cards */
              /* ============================================================ */
              filtered.map((complaint) => (
                <ComplaintCard
                  key={complaint.complaint_id}
                  complaint={complaint}
                  onView={setSelectedComplaint}
                />
              ))
            )}
          </div>

          {/* ================================================================ */}
          {/* Recent Complaints */}
          {/* ================================================================ */}
          <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
            <h2 className="text-2xl font-semibold mb-4">
              Recent Complaints
            </h2>

            {complaints.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nothing to show yet.
              </p>
            ) : (
              <div className="space-y-3">
                {complaints.slice(0, 5).map((complaint) => (
                  <button
                    key={complaint.complaint_id}
                    type="button"
                    onClick={() => setSelectedComplaint(complaint)}
                    className="w-full text-left bg-red-600 hover:bg-red-700 cursor-pointer text-white p-4 rounded-lg transition-colors"
                  >
                    {complaint.subject || "Untitled complaint"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Complaint Details Modal */}
      {/* ==================================================================== */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-white w-[700px] max-w-[90%] rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Complaint Number */}
            <p className="text-xs text-gray-400 font-mono mb-1">
              {selectedComplaint.complaint_number}
            </p>

            {/* Subject */}
            <h2 className="text-3xl font-bold text-red-700 mb-4">
              {selectedComplaint.subject}
            </h2>

            {/* Category + Status */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  CATEGORY_STYLES[selectedComplaint.complaint_category] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {categoryLabel(selectedComplaint.complaint_category)}
              </span>

              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  STATUS_STYLES[selectedComplaint.complaint_status] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {selectedComplaint.complaint_status
                  ?.replace(/_/g, " ")
                  .toUpperCase()}
              </span>
            </div>

            {/* Complaint Information */}
            <div className="space-y-2 text-gray-700">
              {selectedComplaint.location && (
                <p>
                  <strong>Location:</strong>{" "}
                  {selectedComplaint.location}
                </p>
              )}

              <p>
                <strong>Submitted:</strong>{" "}
                {formatDate(selectedComplaint.created_at)}
              </p>
            </div>

            <hr className="my-4" />

            {/* Description */}
            <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
              {selectedComplaint.description}
            </p>

            {/* ============================================================= */}
            {/* Attachments */}
            {/* ============================================================= */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Attachments
                </h3>

                <div className="flex flex-wrap gap-2">
                  {attachments.map((path, index) => (
                    <a
                      key={path}
                      href={attachmentUrl(path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg px-3 py-2 transition-colors"
                    >
                      📎 Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* Resolution / Rejection Note */}
            {/* ============================================================= */}
            {selectedComplaint.resolution_note && (
              <div
                className={`mt-4 text-sm rounded-lg px-3 py-2 border ${
                  selectedComplaint.complaint_status === "REJECTED"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-green-50 border-green-200 text-green-800"
                }`}
              >
                <strong>
                  {selectedComplaint.complaint_status === "REJECTED"
                    ? "Reason for rejection:"
                    : "Resolution:"}
                </strong>{" "}
                {selectedComplaint.resolution_note}
              </div>
            )}

            {/* ============================================================= */}
            {/* Reject Text */}
            {/* ============================================================= */}
            {selectedComplaint.reject_text && (
              <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2">
                <strong>Reason for rejection:</strong>{" "}
                {selectedComplaint.reject_text}
              </div>
            )}

            {/* ============================================================= */}
            {/* Close Button */}
            {/* ============================================================= */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintBoard;