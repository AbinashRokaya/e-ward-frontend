import React, { useState } from "react";
import logo from "../../assets/nepal-sarkar.png";
import MigrationPreview from "../migratioregistration-component/Migrationpreview";
import API_URL from "../../api/api";
import { toast } from "react-toastify";

function EditMigrationRegistrationModal({ migration, onClose, onSaved }) {
  const [formData, setFormData] = useState({ ...migration });

  const rejectText = formData.reject?.reject_text || "";

  const handleRejectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      reject: { ...(prev.reject || {}), reject_text: value },
    }));
  };

  const handlleApproved = (e) => {
    e.preventDefault();
    fetch(
      `${API_URL}/v1/migration-registration/${formData.migration_id}/approve`,
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
        if (onSaved) onSaved();
        onClose();
        toast.success("Migration registration approved successfully!");
      })
      .catch((err) => console.error("Approve failed:", err));
  };
  const handlleRejected = (e) => {
    e.preventDefault();
    if (!rejectText.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    fetch(
      `${API_URL}/v1/migration-registration/${formData.migration_id}/reject`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reject_text: rejectText }),
      },
    )
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then(() => {
        if (onSaved) onSaved();
        onClose();
        toast.success("Migration registration rejected successfully!");
      })
      .catch((err) => console.error("Reject failed:", err));
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

              <h2 className="text-2xl font-bold text-violet-700">
                Edit Migration Registration
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
                <MigrationPreview
                  formData={formData}
                  showRejectSection={true}
                  rejectText={rejectText}
                  onRejectChange={handleRejectChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{ fontSize: 12, marginBottom: 6, color: "#555" }}>
            अस्वीकृतिको कारण (Reject Reason)&nbsp;:
          </div>

          {/* Always in editable mode for the Ward Secretary */}
          <textarea
            rows={4}
            value={rejectText}
            onChange={(e) => handleRejectChange(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #fc8181",
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
            placeholder="अस्वीकृतिको कारण लेख्नुहोस् (Enter rejection reason)..."
          />
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
            onClick={handlleRejected}
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Reject
          </button>
          <button
            type="button"
            value="APPROVED"
            onClick={handlleApproved}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Aproved
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditMigrationRegistrationModal;
