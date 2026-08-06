// components/complaint/AllComplaintsList.jsx
import { useContext, useEffect, useState } from "react";
import API_URL from "../../api/api";
import ComplaintTable from "./ComplaintTable";
import ComplaintFilters from "./ComplaintFilters";
import ComplaintPreview from "./ComplaintPreview";
import { LoginContext } from "../context/LoginContext";

function AllComplaintsList() {
  const { userWardId } = useContext(LoginContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    if (!userWardId) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/v1/complaint/?ward_id=${userWardId}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        }),
      )
      .then((data) => setComplaints(data.data || []))
      .catch((err) => console.error("Failed to load ward complaints:", err))
      .finally(() => setLoading(false));
  }, [userWardId]);

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

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">
          All Ward Complaints
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Every complaint filed in your ward — for transparency. You can only
          manage your own from the "My Complaints" tab.
        </p>
      </div>

      <div className="p-4 border-b border-slate-100">
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
          <p className="text-slate-400 text-sm text-center py-8">
            Loading complaints...
          </p>
        ) : (
          <ComplaintTable
            complaints={filtered}
            onView={setViewing}
            onReview={() => {}}
          />
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-md shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setViewing(null)}
                className="text-slate-500 hover:text-slate-800 text-sm"
              >
                ✕ Close
              </button>
            </div>
            <ComplaintPreview complaint={viewing} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AllComplaintsList;
