import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";

const STATUS_STYLES = {
  ASSESSED: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  DISPUTED: "bg-yellow-100 text-yellow-800",
};

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "PAID", label: "Paid" },
  { key: "ASSESSED", label: "Unpaid" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "DISPUTED", label: "Disputed" },
];

export default function WardTaxAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  function fetchAssessments() {
    setLoading(true);
    return fetch(`${API_URL}/v1/tax/assessments/ward`, {
      credentials: "include",
    })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then((d) => setAssessments(d.data || []))
      .catch(() => toast.error("Failed to fetch ward tax assessments"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchAssessments();
  }, []);

  const filtered =
    statusFilter === "all"
      ? assessments
      : assessments.filter((a) => a.status === statusFilter);

  const statusCounts = {
    all: assessments.length,
    PAID: assessments.filter((a) => a.status === "PAID").length,
    ASSESSED: assessments.filter((a) => a.status === "ASSESSED").length,
    OVERDUE: assessments.filter((a) => a.status === "OVERDUE").length,
    DISPUTED: assessments.filter((a) => a.status === "DISPUTED").length,
  };

  const totalCollected = assessments
    .filter((a) => a.status === "PAID")
    .reduce((sum, a) => sum + a.total_due, 0);

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Tax Payments — This Ward
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Every bill issued in this ward and whether the citizen has actually
            paid it — separate from the property/business tables, which only
            track whether the survey record itself was reviewed.
          </p>
        </div>
        {totalCollected > 0 && (
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400">Total collected</div>
            <div className="text-lg font-semibold text-green-700">
              Rs. {totalCollected.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === f.key
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label} ({statusCounts[f.key] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          No assessments match this filter.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4 font-medium">Citizen</th>
                <th className="py-2 pr-4 font-medium">Tax Type</th>
                <th className="py-2 pr-4 font-medium">Fiscal Year</th>
                <th className="py-2 pr-4 font-medium">Amount Due</th>
                <th className="py-2 pr-4 font-medium">Due Date</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2 pr-4 text-slate-700">
                    {a.citizen_name || "—"}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">
                    {a.tax_type.replace("_", " ")}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">{a.fiscal_year}</td>
                  <td className="py-2 pr-4 text-slate-700">
                    Rs. {a.total_due.toLocaleString()}
                    {a.penalty_amount > 0 && (
                      <span className="text-xs text-red-600 ml-1">
                        (+Rs. {a.penalty_amount.toLocaleString()} penalty)
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-slate-500">
                    {new Date(a.due_date).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_STYLES[a.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
