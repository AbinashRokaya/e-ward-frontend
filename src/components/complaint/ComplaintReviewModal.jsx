import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";
import { LoginContext } from "../context/LoginContext";
import {
  CATEGORY_STYLES,
  STATUS_STYLES,
  PRIORITY_STYLES,
  categoryLabel,
  formatDate,
} from "./complaintStyles";

// LEGACY attachment_*_path values are relative to the static/ mount and
// need the API_URL/static prefix. Documents uploaded after the
// Cloudinary migration come back as full https://res.cloudinary.com/...
// URLs — those are used as-is.
function attachmentUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/static/${path}`;
}

// Action set differs by role/current status, same "what can happen next"
// idea as the birth/death ward-secretary and ward-chairperson modals.
function actionsFor(userRole, status) {
  if (userRole === "wardofficer" && status === "SUBMITTED") {
    return [
      {
        key: "UNDER_REVIEW",
        label: "Validate & Move to Review",
        style: "bg-blue-600 hover:bg-blue-700",
      },
    ];
  }
  if (userRole === "wardsecretary" && status === "UNDER_REVIEW") {
    return [
      {
        key: "FORWARDED",
        label: "Forward to Chairperson",
        style: "bg-blue-600 hover:bg-blue-700",
      },
      {
        key: "RESOLVED",
        label: "Resolve Directly",
        style: "bg-green-600 hover:bg-green-700",
      },
    ];
  }
  if (
    userRole === "wardchairperson" &&
    ["FORWARDED", "ESCALATED"].includes(status)
  ) {
    return [
      {
        key: "RESOLVED",
        label: "Resolve",
        style: "bg-green-600 hover:bg-green-700",
      },
    ];
  }
  return [];
}

function ComplaintReviewModal({ complaint, onClose, onUpdated }) {
  const { userRole, userId } = useContext(LoginContext);
  const [resolutionNote, setResolutionNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const actions = actionsFor(userRole, complaint.complaint_status);
  const attachments = [
    complaint.attachment_1_path,
    complaint.attachment_2_path,
    complaint.attachment_3_path,
  ].filter(Boolean);

  const runAction = (statusKey) => {
    setSubmitting(true);
    fetch(`${API_URL}/v1/complaint/${complaint.complaint_id}/status`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complaint_status: statusKey,
        resolution_note:
          statusKey === "RESOLVED" ? resolutionNote || undefined : undefined,
      }),
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then(() => {
        toast.success("Complaint updated successfully");
        onUpdated?.();
        onClose();
      })
      .catch((err) => {
        console.error("Status update failed:", err);
        toast.error(err?.detail || "Failed to update complaint.");
      })
      .finally(() => setSubmitting(false));
  };

  const submitReject = () => {
    if (rejectReason.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    fetch(`${API_URL}/v1/complaint/${complaint.complaint_id}/reject`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reject_text: rejectReason.trim() }),
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then(() => {
        toast.success("Complaint rejected");
        onUpdated?.();
        onClose();
      })
      .catch((err) => {
        console.error("Rejection failed:", err);
        toast.error(err?.detail || "Failed to reject complaint.");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 font-mono">
              {complaint.complaint_number}
            </p>
            <h3 className="text-lg font-semibold text-gray-800">
              {complaint.subject}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span
            className={`text-[11px] font-semibold px-2 py-1 rounded-full ${CATEGORY_STYLES[complaint.complaint_category]}`}
          >
            {categoryLabel(complaint.complaint_category)}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-1 rounded-full ${PRIORITY_STYLES[complaint.complaint_priority]}`}
          >
            {complaint.complaint_priority}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[complaint.complaint_status]}`}
          >
            {complaint.complaint_status?.replace("_", " ")}
          </span>
        </div>

        {complaint.location && (
          <p className="text-xs text-gray-500">📍 {complaint.location}</p>
        )}

        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {complaint.description}
        </p>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
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

        <p className="text-xs text-gray-400">
          Submitted {formatDate(complaint.created_at)}
        </p>

        {actions.length > 0 && !rejecting && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            {actions.some((a) => a.key === "RESOLVED") && (
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={2}
                placeholder="Resolution note (shown to citizen when resolving)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            )}
            <div className="flex gap-2 flex-wrap">
              {actions.map((a) => (
                <button
                  key={a.key}
                  disabled={submitting}
                  onClick={() => runAction(a.key)}
                  className={`${a.style} disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors`}
                >
                  {a.label}
                </button>
              ))}
              <button
                disabled={submitting}
                onClick={() => setRejecting(true)}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {rejecting && (
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              placeholder="Reason for rejection (required, min 10 characters)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <div className="flex gap-2">
              <button
                disabled={submitting}
                onClick={submitReject}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setRejecting(false)}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintReviewModal;
