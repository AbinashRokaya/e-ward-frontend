import React from "react";
import {
  CATEGORY_STYLES,
  STATUS_STYLES,
  categoryLabel,
  formatDate,
} from "./complaintStyles";

function ComplaintCard({ complaint, onView }) {
  const hasAttachment =
    complaint.attachment_1_path ||
    complaint.attachment_2_path ||
    complaint.attachment_3_path;

  return (
    <div
      onClick={() => onView && onView(complaint)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              CATEGORY_STYLES[complaint.complaint_category] ||
              CATEGORY_STYLES.OTHER
            }`}
          >
            {categoryLabel(complaint.complaint_category)}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              STATUS_STYLES[complaint.complaint_status] ||
              "bg-gray-100 text-gray-500"
            }`}
          >
            {complaint.complaint_status?.replace("_", " ")}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
          {complaint.subject}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-3">
          {complaint.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-[11px] text-gray-400 font-mono">
            {complaint.complaint_number}
          </span>
          <span className="text-[11px] text-gray-400">
            {formatDate(complaint.created_at)}
          </span>
        </div>

        {hasAttachment && (
          <span className="text-[11px] text-blue-600">📎 Attachment</span>
        )}
      </div>
    </div>
  );
}

export default ComplaintCard;
