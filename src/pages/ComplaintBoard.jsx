import { useEffect, useState } from "react";
import ComplaintCard from "../components/complaint/ComplaintCard";
import ComplaintFilters from "../components/complaint/ComplaintFilters";
import API_URL from "../api/api";
import logo from "../assets/nepal-sarkar.png";
import {
  CATEGORY_STYLES,
  STATUS_STYLES,
  categoryLabel,
  formatDate,
} from "../components/complaint/complaintStyles";

// LEGACY attachment_*_path values are relative to the static/ mount and
// need the API_URL/static prefix. Documents uploaded after the
// Cloudinary migration come back as full https://res.cloudinary.com/...
// URLs — those are used as-is.
function attachmentUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/static/${path}`;
}

function ComplaintBoard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
    // "/all" is the ward-wide officer queue — it returns every complaint in
    // the ward, including other citizens'. This page is "My Complaints", so
    // it must use "/" which is scoped to the logged-in user.
    fetch(`${API_URL}/v1/complaint/`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then((data) => setComplaints(data.data || []))
      .catch((err) => console.error("Failed to load complaints:", err))
      .finally(() => setLoading(false));
  }, []);
  
  const filtered = complaints.filter((c) => {
    if (search && !c.subject.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (categoryFilter && c.complaint_category !== categoryFilter) return false;
    if (statusFilter && c.complaint_status !== statusFilter) return false;
    if (dateFrom && new Date(c.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(c.created_at) > new Date(dateTo)) return false;
    return true;
  });

  const clearFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const attachments = selectedComplaint
    ? [
        selectedComplaint.attachment_1_path,
        selectedComplaint.attachment_2_path,
        selectedComplaint.attachment_3_path,
      ].filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
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
            <h1 className="text-4xl font-bold">My Complaints</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
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
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Loading complaints...
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                No complaints found.
              </p>
            ) : (
              filtered.map((complaint) => (
                <ComplaintCard
                  key={complaint.complaint_id}
                  complaint={complaint}
                  onView={setSelectedComplaint}
                />
              ))
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Recent Complaints</h2>
            <div className="space-y-3">
              {complaints.slice(0, 5).map((complaint) => (
                <div
                  key={complaint.complaint_id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className="bg-red-600 hover:bg-red-700 cursor-pointer text-white p-4 rounded-lg transition-colors"
                >
                  {complaint.subject}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-[700px] max-w-[90%] rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <p className="text-xs text-gray-400 font-mono mb-1">
              {selectedComplaint.complaint_number}
            </p>
            <h2 className="text-3xl font-bold text-red-700 mb-4">
              {selectedComplaint.subject}
            </h2>

            <div className="flex gap-2 mb-4">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${CATEGORY_STYLES[selectedComplaint.complaint_category]}`}
              >
                {categoryLabel(selectedComplaint.complaint_category)}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[selectedComplaint.complaint_status]}`}
              >
                {selectedComplaint.complaint_status?.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-2 text-gray-700">
              {selectedComplaint.location && (
                <p>
                  <strong>Location:</strong> {selectedComplaint.location}
                </p>
              )}
              <p>
                <strong>Submitted:</strong>{" "}
                {formatDate(selectedComplaint.created_at)}
              </p>
            </div>

            <hr className="my-4" />

            <p className="leading-relaxed whitespace-pre-wrap">
              {selectedComplaint.description}
            </p>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {attachments.map((path, i) => (
                  <a
                    key={path}
                    href={attachmentUrl(path)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5"
                  >
                    📎 Attachment {i + 1}
                  </a>
                ))}
              </div>
            )}

            {selectedComplaint.resolution_note &&
              selectedComplaint.complaint_status === "RESOLVED" && (
                <div className="mt-4 text-sm bg-green-50 border border-green-200 text-green-800 rounded-lg px-3 py-2">
                  <strong>Resolution:</strong>{" "}
                  {selectedComplaint.resolution_note}
                </div>
              )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
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
