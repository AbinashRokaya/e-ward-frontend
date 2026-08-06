import { useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";
import logo from "../../assets/nepal-sarkar.png";
import ComplaintPreview from "../complaint/ComplaintPreview";

const ESCALATION_CATEGORIES = ["STAFF_MISCONDUCT", "CORRUPTION"];

function ResolutionImageTile({ previewUrl, onFileSelected, onClear }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Resolution proof"
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-[10px] text-gray-400 text-center px-1">
            No image
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs px-3 py-1.5 rounded-md cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-center">
          {previewUrl ? "Change photo" : "Upload proof photo"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelected(file);
              e.target.value = "";
            }}
          />
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function EditComplaintWardSecretaryModal({ complaint, onClose, onSaved }) {
  const isEscalation = ESCALATION_CATEGORIES.includes(
    complaint.complaint_category,
  );

  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionImage, setResolutionImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectText, setRejectText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canAct = complaint.complaint_status === "APPROVED";

  const handleImageSelected = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setResolutionImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setResolutionImage(null);
    setPreviewUrl(null);
  };

  const handleResolveDirectly = (e) => {
    e.preventDefault();
    if (resolutionNote.trim().length < 10) {
      toast.error("Resolution note must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    const body = new FormData();
    body.append("resolution_note", resolutionNote.trim());
    if (resolutionImage) body.append("resolution_image", resolutionImage);

    fetch(
      `${API_URL}/v1/ward-secretary/complaint/${complaint.complaint_id}/resolve`,
      {
        method: "POST",
        credentials: "include",
        body,
      },
    )
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then(() => {
        onSaved?.();
        onClose();
        toast.success("Complaint resolved successfully!");
      })
      .catch((err) => {
        console.error("Resolve failed:", err);
        toast.error(err?.detail || "Failed to resolve complaint.");
      })
      .finally(() => setSubmitting(false));
  };

  const handleForward = (e) => {
    e.preventDefault();
    setSubmitting(true);
    fetch(
      `${API_URL}/v1/ward-secretary/complaint/${complaint.complaint_id}/approve`,
      {
        method: "POST",
        credentials: "include",
      },
    )
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then(() => {
        onSaved?.();
        onClose();
        toast.success("Complaint forwarded to chairperson!");
      })
      .catch((err) => {
        console.error("Forward failed:", err);
        toast.error(err?.detail || "Failed to forward complaint.");
      })
      .finally(() => setSubmitting(false));
  };

  const handleReject = (e) => {
    e.preventDefault();
    if (rejectText.trim().length < 10) {
      toast.error("Please provide a reason for rejection (min 10 characters).");
      return;
    }
    setSubmitting(true);
    fetch(
      `${API_URL}/v1/ward-secretary/complaint/${complaint.complaint_id}/reject`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reject_text: rejectText.trim() }),
      },
    )
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then(() => {
        onSaved?.();
        onClose();
        toast.success("Complaint rejected successfully!");
      })
      .catch((err) => {
        console.error("Reject failed:", err);
        toast.error(err?.detail || "Failed to reject complaint.");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: absolute; top: 0; left: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Government of Nepal" className="w-14 h-14" />
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Government of Nepal
              </p>
              <h2 className="text-2xl font-bold text-rose-700">
                Complaint Review — Ward Secretary
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-3xl text-gray-400 hover:text-rose-500"
          >
            ×
          </button>
        </div>

        {isEscalation && canAct && (
          <div className="no-print bg-amber-50 border-b border-amber-200 px-8 py-2 text-sm text-amber-800">
            ⚠️ This category ({complaint.complaint_category.replace("_", " ")})
            requires escalation to the ward chairperson — it cannot be resolved
            directly.
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="flex justify-center py-10 px-4">
            <div className="relative inline-block" id="print-area">
              <button
                onClick={() => window.print()}
                className="no-print absolute z-10 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-lg transition-colors text-sm"
                style={{ top: -18, right: 0 }}
              >
                🖨️ Print / Download
              </button>
              <div className="bg-white rounded-lg shadow-xl">
                <ComplaintPreview
                  complaint={complaint}
                  apiUrl={API_URL}
                  showRejectSection={rejecting}
                  rejectText={rejectText}
                  onRejectChange={setRejectText}
                />
              </div>
            </div>
          </div>
        </div>

        {canAct && !isEscalation && !rejecting && (
          <div className="no-print border-t bg-white px-8 py-4 space-y-3 shrink-0">
            <label className="block text-sm font-medium text-gray-700">
              Resolution note (shown to citizen)
            </label>
            <textarea
              rows={2}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Describe how this complaint was resolved (min 10 characters)"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <ResolutionImageTile
              previewUrl={previewUrl}
              onFileSelected={handleImageSelected}
              onClear={handleClearImage}
            />
          </div>
        )}

        <div className="no-print border-t bg-white px-8 py-4 flex justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border hover:bg-gray-100"
          >
            Cancel
          </button>

          {canAct && !rejecting && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => setRejecting(true)}
              className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              Reject
            </button>
          )}

          {canAct && rejecting && (
            <>
              <button
                type="button"
                onClick={() => setRejecting(false)}
                className="px-5 py-2 rounded-lg border hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleReject}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                Confirm Rejection
              </button>
            </>
          )}

          {canAct && !rejecting && isEscalation && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleForward}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Forward to Chairperson
            </button>
          )}

          {canAct && !rejecting && !isEscalation && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleResolveDirectly}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              Resolve Directly
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditComplaintWardSecretaryModal;
