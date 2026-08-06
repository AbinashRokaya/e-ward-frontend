import React from "react";
import API_URL from "../../api/api";

const isWordDoc = (mime) =>
  mime === "application/msword" ||
  mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// LEGACY notice_attachment_path values are relative to the static/ mount
// and need the API_URL/static prefix. Documents uploaded after the
// Cloudinary migration come back as full https://res.cloudinary.com/...
// URLs — those are used as-is.
function attachmentUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/static/${path}`;
}

function NoticeDetailView({ notice = null, formData = null, onClose }) {
  const n = notice ?? formData;
  if (!n) return null;

  const fileUrl = attachmentUrl(n.notice_attachment_path);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {n.notice_title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        </div>

        {fileUrl &&
          (n.notice_attachment_type?.startsWith("image/") ? (
            <img
              src={fileUrl}
              alt={n.notice_title}
              className="w-full max-h-[70vh] object-contain rounded-lg border border-gray-200"
            />
          ) : n.notice_attachment_type === "application/pdf" ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={fileUrl}
                title={n.notice_title}
                className="w-full h-[70vh]"
              />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-blue-600 hover:text-blue-800 bg-gray-50 py-2 border-t border-gray-200"
              >
                ⬇ Open Full PDF
              </a>
            </div>
          ) : (
            <a
              href={fileUrl}
              {...(isWordDoc(n.notice_attachment_type)
                ? { download: true }
                : {})}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 border border-gray-200 rounded-lg px-3 py-2"
            >
              📎 View / Download Attachment
              {isWordDoc(n.notice_attachment_type) && " (Word Doc)"}
            </a>
          ))}

        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {n.notice_description}
        </p>

        <div className="flex gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            {n.notice_type}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            {n.notice_status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default NoticeDetailView;
