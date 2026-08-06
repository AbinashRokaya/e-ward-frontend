import React, { useContext, useEffect, useState } from "react";
import API_URL from "../../api/api";
import ComplaintTable from "./ComplaintTable";
import ComplaintFilters from "./ComplaintFilters";
import ComplaintReviewModal from "./ComplaintReviewModal";
import { LoginContext } from "../context/LoginContext";

const TABS = [{ key: "complaint_list", label: "Complaint List" }];

function ComplaintManagement() {
  const { userWardId } = useContext(LoginContext);
  const [complaints, setComplaints] = useState([]);
  const [activeTab] = useState("complaint_list");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [reviewingComplaint, setReviewingComplaint] = useState(null);

  const fetchComplaints = () => {
    if (!userWardId) {
      setComplaints([]);
      return;
    }
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ ward_id: userWardId });
    if (statusFilter) params.set("status", statusFilter);

    fetch(`${API_URL}/v1/complaint/?${params.toString()}`, {
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
      .catch((err) => {
        console.error("Failed to load complaints:", err);
        setError("Could not load complaints for this ward.");
      })
      .finally(() => setLoading(false));
  };

  // Re-fetch whenever the status filter changes server-side; category/date
  // range filter client-side below, same split as NoticeManagement uses.
  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userWardId, statusFilter]);

  const filteredComplaints = complaints.filter((c) => {
    if (search && !c.subject.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (categoryFilter && c.complaint_category !== categoryFilter) return false;
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

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
        <span className="self-center text-xs text-gray-400 font-semibold px-2 uppercase tracking-wide">
          Complaint
        </span>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-blue-600 text-white shadow"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "complaint_list" && (
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Ward Complaints
            </h2>
          </div>

          <div className="p-4 border-b border-gray-100">
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
          </div>

          <div className="p-4">
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Loading complaints...
              </p>
            ) : error ? (
              <p className="text-red-500 text-sm text-center py-8">{error}</p>
            ) : (
              <ComplaintTable
                complaints={filteredComplaints}
                onView={setViewingComplaint}
                onReview={setReviewingComplaint}
              />
            )}
          </div>
        </div>
      )}

      {viewingComplaint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {viewingComplaint.subject}
              </h3>
              <button
                onClick={() => setViewingComplaint(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {viewingComplaint.description}
            </p>
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded-full">
                {viewingComplaint.complaint_category}
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded-full">
                {viewingComplaint.complaint_status}
              </span>
            </div>
          </div>
        </div>
      )}

      {reviewingComplaint && (
        <ComplaintReviewModal
          complaint={reviewingComplaint}
          onClose={() => setReviewingComplaint(null)}
          onUpdated={fetchComplaints}
        />
      )}
    </main>
  );
}

export default ComplaintManagement;
