import React, { useState } from "react";
import logo from "../../assets/nepal-sarkar.png";
import RecommendationPreview from "../recommendation-component/RecommendationPreview";
import API_URL from "../../api/api";
import { toast } from "react-toastify";

// Adjust if your static files are mounted elsewhere — LEGACY paths come
// back from the backend as "recommendation_letter/{letter_id}/{filename}"
// (see UPLOAD_DIR in recommendation_router.py), served under /static/.
// Documents uploaded after the Cloudinary migration instead come back as
// full https://res.cloudinary.com/... URLs — those are used as-is.
function docUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/static/${path}`;
}

function buildDocuments(formData) {
  const toDoc = (path) => {
    if (!path) return null;
    const isPdf = path.toLowerCase().endsWith(".pdf");
    return { previewUrl: isPdf ? "pdf" : docUrl(path) };
  };
  return {
    // citizenship is two-sided now (see applicant_citizenship_front_path /
    // applicant_citizenship_back_path on RecommendationLetterResponse) —
    // NOTE: RecommendationPreview must accept this { front, back } shape
    // for applicant_citizenship; if it still expects a single previewUrl
    // object, it needs the same dual-tile treatment as documents.father_citizenship
    // gets in the birth registration Preview component.
    applicant_citizenship: {
      front: toDoc(formData.applicant_citizenship_front_path),
      back: toDoc(formData.applicant_citizenship_back_path),
    },
    supporting_document: toDoc(formData.supporting_document_path),
  };
}

function EditRecommendationModal({ recommendation, onClose, onSaved }) {
  const [formData, setFormData] = useState({ ...recommendation });

  // reject is a list relationship on this model, unlike birth's single object
  const rejectText = formData.reject?.[0]?.reject_text || "";

  const handleRejectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      reject: [{ ...(prev.reject?.[0] || {}), reject_text: value }],
    }));
  };

  const handleApproved = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/v1/recommendation-letter/${formData.letter_id}/approve`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then(() => {
        if (onSaved) onSaved();
        onClose();
        toast.success("Recommendation letter approved successfully!");
      })
      .catch((err) => {
        console.error("Approve failed:", err);
        toast.error(err?.detail || "Approve failed. Please try again.");
      });
  };

  const handleRejected = (e) => {
    e.preventDefault();
    if (!rejectText.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    fetch(`${API_URL}/v1/recommendation-letter/${formData.letter_id}/reject`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reject_text: rejectText }),
    })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then(() => {
        if (onSaved) onSaved();
        onClose();
        toast.success("Recommendation letter rejected successfully!");
      })
      .catch((err) => {
        console.error("Reject failed:", err);
        toast.error(err?.detail || "Reject failed. Please try again.");
      });
  };

  const documents = buildDocuments(formData);

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
              <h2 className="text-2xl font-bold text-amber-700">
                Edit Recommendation Letter
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-3xl text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>

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
                <RecommendationPreview
                  formData={formData}
                  documents={documents}
                  showRejectSection={true}
                  rejectText={rejectText}
                  onRejectChange={handleRejectChange}
                />
              </div>
            </div>
          </div>
        </div>

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
            onClick={handleRejected}
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={handleApproved}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Approved
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditRecommendationModal;
