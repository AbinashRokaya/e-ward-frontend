// components/complaint/EditComplaintModal.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";
import logo from "../../assets/nepal-sarkar.png";
import ComplaintPreview from "./ComplaintPreview";

const STAGE_CONFIG = {
  officer: {
    endpoint: "approve",
    approveLabel: "Aproved",
    title: "Officer Review",
    base: "complaint",
  },
  secretary: {
    endpoint: "approve",
    approveLabel: "Verified",
    title: "Ward Secretary Review",
    base: "ward-secretary/complaint",
  },
  chairperson: {
    endpoint: "approve",
    approveLabel: "Resolved",
    title: "Ward Chairperson Review",
    base: "ward-chairperson/complaint",
  },
};

function EditComplaintModal({
  complaint,
  stage = "officer",
  onClose,
  onSaved,
}) {
  const [rejectText, setRejectText] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionImage, setResolutionImage] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const config = STAGE_CONFIG[stage];

  const handleResolutionImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB.");
      return;
    }
    setResolutionImage(file);
    setResolutionPreview(URL.createObjectURL(file));
  };

  const handleApproved = (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (stage === "chairperson") {
      if (resolutionNote.trim().length < 10) {
        toast.error(
          "Please describe how the complaint was resolved (min 10 characters).",
        );
        setSubmitting(false);
        return;
      }
      const body = new FormData();
      body.append("resolution_note", resolutionNote.trim());
      if (resolutionImage) body.append("resolution_image", resolutionImage);

      fetch(
        `${API_URL}/v1/${config.base}/${complaint.complaint_id}/${config.endpoint}`,
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
      return;
    }

    fetch(
      `${API_URL}/v1/${config.base}/${complaint.complaint_id}/${config.endpoint}`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
        toast.success("Complaint updated successfully!");
      })
      .catch((err) => {
        console.error("Approve failed:", err);
        toast.error(err?.detail || "Failed to update complaint.");
      })
      .finally(() => setSubmitting(false));
  };

  const handleRejected = (e) => {
    e.preventDefault();
    if (rejectText.trim().length < 10) {
      toast.error("Please provide a reason for rejection (min 10 characters).");
      return;
    }
    setSubmitting(true);
    fetch(`${API_URL}/v1/${config.base}/${complaint.complaint_id}/reject`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reject_text: rejectText.trim() }),
    })
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
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Government of Nepal" className="w-14 h-14" />
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Government of Nepal
              </p>
              <h2 className="text-2xl font-bold text-rose-700">
                Edit Complaint — {config.title}
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

        {/* Preview */}
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
                  showRejectSection={true}
                  rejectText={rejectText}
                  onRejectChange={setRejectText}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resolution note + photo — chairperson stage only */}
        {stage === "chairperson" && (
          <div style={{ padding: "10px 24px", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 12, marginBottom: 6, color: "#555" }}>
              समाधान विवरण (Resolution Note)&nbsp;:
            </div>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #86efac",
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 12,
                fontFamily:
                  "'Noto Sans Devanagari', 'Noto Sans', Arial, sans-serif",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                background: "#fff",
              }}
              placeholder="कसरी समाधान गरियो लेख्नुहोस् (Describe how this was resolved)..."
            />
            <div className="flex items-center gap-3 mt-3">
              {resolutionPreview && (
                <img
                  src={resolutionPreview}
                  alt="Resolution proof preview"
                  className="w-16 h-16 object-cover rounded-md border border-gray-200"
                />
              )}
              <label className="text-xs px-3 py-1.5 rounded-md cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                {resolutionImage
                  ? "फोटो बदल्नुहोस् (Change Photo)"
                  : "प्रमाण फोटो थप्नुहोस् (Add Proof Photo)"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleResolutionImageSelect}
                />
              </label>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t bg-white px-8 py-4 flex justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleRejected}
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleApproved}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {config.approveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditComplaintModal;
