// components/complaint/ComplaintQueue.jsx
import { useEffect, useState } from "react";
import API_URL from "../../api/api";
import ComplaintTable from "./ComplaintTable";
import EditComplaintModal from "./EditComplaintModal";

function ComplaintQueue({ fetchEndpoint, stage, title }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState(null);

  const fetchComplaints = () => {
    setLoading(true);
    fetch(`${API_URL}${fetchEndpoint}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then((d) => setComplaints(d.data || []))
      .catch((err) => console.error("Failed to load complaints:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchEndpoint]);

  const filtered = complaints.filter(
    (c) => !search || c.subject.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-64 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </div>
      <div className="p-4">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Loading complaints...
          </p>
        ) : (
          <ComplaintTable complaints={filtered} onView={setReviewing} />
        )}
      </div>

      {reviewing && (
        <EditComplaintModal
          complaint={reviewing}
          stage={stage}
          onClose={() => setReviewing(null)}
          onSaved={fetchComplaints}
        />
      )}
    </div>
  );
}

export default ComplaintQueue;
