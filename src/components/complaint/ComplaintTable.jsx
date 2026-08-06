// components/complaint/ComplaintTable.jsx
import {
  CATEGORY_STYLES,
  STATUS_STYLES,
  categoryLabel,
  statusLabel,
  formatDate,
} from "./complaintStyles";

function ComplaintTable({ complaints = [], onView }) {
  if (complaints.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        No complaints found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-2 pr-4 font-medium">Number</th>
            <th className="py-2 pr-4 font-medium">Subject</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Submitted</th>
            <th className="py-2 pr-4 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr
              key={c.complaint_id}
              className="border-b border-gray-50 hover:bg-gray-50"
            >
              <td className="py-2 pr-4 font-mono text-xs text-gray-500">
                {c.complaint_number}
              </td>
              <td className="py-2 pr-4">{c.subject}</td>
              <td className="py-2 pr-4">
                <span
                  className={`text-[11px] font-semibold px-2 py-1 rounded-full ${CATEGORY_STYLES[c.complaint_category]}`}
                >
                  {categoryLabel(c.complaint_category)}
                </span>
              </td>
              <td className="py-2 pr-4">
                <span
                  className={`text-[11px] font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[c.complaint_status]}`}
                >
                  {statusLabel(c.complaint_status)}
                </span>
              </td>
              <td className="py-2 pr-4 text-gray-500">
                {formatDate(c.created_at)}
              </td>
              <td className="py-2 pr-4 text-right">
                <button
                  onClick={() => onView(c)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComplaintTable;
