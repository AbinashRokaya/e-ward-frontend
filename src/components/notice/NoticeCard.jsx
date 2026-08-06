import React from "react";
import API_URL from "../../api/api";

function NoticeCard({ notice, onView }) {
  const isImage = notice.notice_attachment_type?.startsWith("image/");
  const isPdf = notice.notice_attachment_type === "application/pdf";

  return (
    <div
      onClick={() => onView && onView(notice)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
    >
      {notice.notice_attachment_path && isImage && (
        <img
          src={`${API_URL}/static/${notice.notice_attachment_path}`}
          alt={notice.notice_title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            {notice.notice_type}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              notice.notice_status === "PUBLISHED"
                ? "bg-green-50 text-green-600"
                : notice.notice_status === "EXPIRED"
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            {notice.notice_status}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
          {notice.notice_title}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-3">
          {notice.notice_description}
        </p>

        {notice.notice_attachment_path && !isImage && (
          <span className="text-[11px] text-blue-600 mt-auto">
            {isPdf ? "📄 PDF attached" : "📎 Attachment"}
          </span>
        )}
      </div>
    </div>
  );
}

export default NoticeCard;
