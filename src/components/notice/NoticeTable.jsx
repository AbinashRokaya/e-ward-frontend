import React, { useContext } from "react";
import API_URL from "../../api/api";
import { LoginContext } from "../context/LoginContext";

// Tailwind color pairs per notice_status enum value.
const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-green-100 text-green-700",
  EXPIRED: "bg-red-100 text-red-600",
  ARCHIVED: "bg-yellow-100 text-yellow-700",
};

// Tailwind color pairs per notice_type enum value.
const TYPE_STYLES = {
  PUBLIC: "bg-blue-50 text-blue-700",
  TENDER: "bg-purple-50 text-purple-700",
  VACANCY: "bg-indigo-50 text-indigo-700",
  TAX: "bg-orange-50 text-orange-700",
  MEETING: "bg-teal-50 text-teal-700",
  HEALTH: "bg-pink-50 text-pink-700",
  EDUCATION: "bg-cyan-50 text-cyan-700",
  DISASTER: "bg-red-50 text-red-700",
  EVENT: "bg-lime-50 text-lime-700",
  OTHER: "bg-gray-50 text-gray-600",
};

function Badge({ text, styles }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
        styles || "bg-gray-100 text-gray-600"
      }`}
    >
      {text}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function NoticeTable({ notices, onView, onEdit }) {
  const { userRole } = useContext(LoginContext);
  const canEdit = userRole === "wardsecretary";

  if (!notices.length)
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        No notices found. Add one above.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-50 text-blue-800 text-left">
            {["#", "Attachment", "Title", "Type", "Status", "Created", ""].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 py-2 font-semibold whitespace-nowrap border-b border-blue-100"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {notices.map((n, i) => (
            <tr
              key={n.notice_id ?? i}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              <td className="px-3 py-2">
                {n.notice_attachment_path ? (
                  n.notice_attachment_type?.startsWith("image/") ? (
                    <img
                      src={`${API_URL}/static/${n.notice_attachment_path}`}
                      alt=""
                      className="w-10 h-10 object-cover rounded border border-gray-200"
                    />
                  ) : (
                    <span
                      className="text-lg"
                      title={n.notice_attachment_type || "File"}
                    >
                      {n.notice_attachment_type === "application/pdf"
                        ? "📄"
                        : "📎"}
                    </span>
                  )
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </td>
              <td className="px-3 py-2 font-medium text-gray-800 max-w-xs truncate">
                {n.notice_title}
              </td>
              <td className="px-3 py-2">
                <Badge
                  text={n.notice_type}
                  styles={TYPE_STYLES[n.notice_type]}
                />
              </td>
              <td className="px-3 py-2">
                <Badge
                  text={n.notice_status}
                  styles={STATUS_STYLES[n.notice_status]}
                />
              </td>
              <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                {formatDate(n.created_at)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <button
                  onClick={() => onView(n)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors mr-3"
                >
                  View
                </button>
                {canEdit && (
                  <button
                    onClick={() => onEdit(n)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NoticeTable;
