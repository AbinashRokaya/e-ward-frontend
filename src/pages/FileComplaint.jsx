// pages/FileComplaint.jsx
import { useState } from "react";
import logo from "../assets/nepal-sarkar.png";
import API_URL from "../api/api";
import { toast } from "react-toastify";
import ComplaintPreview from "../components/complaint/ComplaintPreview";
import {
  COMPLAINT_CATEGORIES,
  categoryRequiresLocation,
} from "../components/complaint/complaintStyles";

const initial_data = {
  complaint_category: "",
  subject: "",
  description: "",
  location: "",
};

const emptyAttachments = () => ({
  attachment_1: { file: null, previewUrl: null },
  attachment_2: { file: null, previewUrl: null },
  attachment_3: { file: null, previewUrl: null },
});

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

function UploadTile({ label, previewUrl, isPdf, onFileSelected }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] text-gray-500 text-center">{label}</span>
      <div className="w-20 h-20 rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
        {previewUrl ? (
          isPdf ? (
            <span className="text-[10px] text-gray-500">PDF</span>
          ) : (
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-contain"
            />
          )
        ) : (
          <span className="text-[10px] text-gray-400">छैन</span>
        )}
      </div>
      <label className="text-xs px-3 py-1.5 rounded-md cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
        {previewUrl ? "बदल्नुहोस्" : "अपलोड गर्नुहोस्"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelected(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function AttachmentUploads({ attachments, onSelect }) {
  return (
    <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        प्रमाण संलग्नकहरू (Evidence Attachments)
        <span className="text-xs text-gray-400 font-normal ml-2">
          (optional, up to 3, max 5MB each)
        </span>
      </h3>
      <div className="grid grid-cols-3 gap-4 max-w-md">
        {["attachment_1", "attachment_2", "attachment_3"].map((key, i) => (
          <UploadTile
            key={key}
            label={`Attachment ${i + 1}`}
            previewUrl={attachments[key].previewUrl}
            isPdf={attachments[key].file?.type === "application/pdf"}
            onFileSelected={(file) => onSelect(key, file)}
          />
        ))}
      </div>
    </div>
  );
}

function FileComplaint() {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(initial_data);
  const [attachments, setAttachments] = useState(emptyAttachments());
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  function handleAttachmentSelect(key, file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB.");
      return;
    }
    setAttachments((prev) => {
      const previewUrl =
        file.type === "application/pdf" ? "pdf" : URL.createObjectURL(file);
      if (prev[key]?.previewUrl && prev[key].previewUrl !== "pdf")
        URL.revokeObjectURL(prev[key].previewUrl);
      return { ...prev, [key]: { file, previewUrl } };
    });
  }

  function validate() {
    if (!formData.complaint_category) {
      toast.error("Please select a category.");
      return false;
    }
    if (formData.subject.trim().length < 5) {
      toast.error("Subject must be at least 5 characters.");
      return false;
    }
    if (formData.description.trim().length < 20) {
      toast.error(
        "Please describe the issue in more detail (min 20 characters).",
      );
      return false;
    }
    if (
      categoryRequiresLocation(formData.complaint_category) &&
      !formData.location.trim()
    ) {
      toast.error("Location is required for this category.");
      return false;
    }
    return true;
  }

  function handleSubmit() {
    setSubmitting(true);
    const body = new FormData();
    body.append("complaint_category", formData.complaint_category);
    body.append("subject", formData.subject.trim());
    body.append("description", formData.description.trim());
    if (formData.location.trim())
      body.append("location", formData.location.trim());
    ["attachment_1", "attachment_2", "attachment_3"].forEach((key) => {
      if (attachments[key].file) body.append(key, attachments[key].file);
    });

    fetch(`${API_URL}/v1/complaint/`, {
      method: "POST",
      credentials: "include",
      body,
    })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then(() => {
        toast.success("Complaint submitted successfully!");
        setFormData(initial_data);
        setAttachments(emptyAttachments());
        setShowPreview(false);
      })
      .catch((err) => {
        console.error("Submission failed:", err);
        toast.error(err?.detail || "Complaint submission failed.");
      })
      .finally(() => setSubmitting(false));
  }

  const previewComplaint = {
    complaint_number: "—",
    complaint_category: formData.complaint_category,
    complaint_status: "DRAFT",
    subject: formData.subject,
    description: formData.description,
    location: formData.location,
    created_at: new Date().toISOString(),
    attachment_1_path: null,
    attachment_2_path: null,
    attachment_3_path: null,
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md cursor-pointer transition-colors"
          >
            ← पछाडि जानुहोस् (Back to Form)
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
          >
            🖨️ Print / Download
          </button>
        </div>
        <div
          className="bg-white rounded-lg shadow-xl mx-auto"
          style={{ width: "fit-content" }}
        >
          <ComplaintPreview complaint={previewComplaint} apiUrl={API_URL} />
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-300 hover:bg-slate-300 disabled:bg-blue-200 px-6 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner /> पेश गर्दै…
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      required
      className="min-h-screen bg-gray-100 p-8 flex flex-col max-w-4xl mx-auto gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) setShowPreview(true);
      }}
    >
      <div>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={logo}
            alt="Government of Nepal"
            className="w-16 h-16 object-contain"
          />
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              Government of Nepal
            </p>
            <h1 className="text-4xl font-bold">File a Complaint</h1>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-rose-700 mb-6">
            गुनासो विवरण (Complaint Details)
          </h2>

          <div className="mb-4">
            <label className="block mb-2">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COMPLAINT_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      complaint_category: cat.value,
                    }))
                  }
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    formData.complaint_category === cat.value
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                maxLength={200}
                placeholder="Brief summary of the issue"
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {categoryRequiresLocation(formData.complaint_category) && (
              <div className="md:col-span-2">
                <label>Location / Tole</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Ward 5, Balkumari Chowk"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={3000}
                rows={5}
                placeholder="Describe what happened, when, and any relevant details"
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {formData.description.length}/3000
              </p>
            </div>

            <AttachmentUploads
              attachments={attachments}
              onSelect={handleAttachmentSelect}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="submit"
          className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium px-6 py-2 rounded-md cursor-pointer transition-colors"
        >
          👁️ Preview Complaint
        </button>
      </div>
    </form>
  );
}

export default FileComplaint;
