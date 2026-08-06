import React, { useState } from "react";
import API_URL from "../../api/api";
import logo from "../../assets/nepal-sarkar.png";
import { toast } from "react-toastify";

const NOTICE_TYPES = [
  "PUBLIC",
  "TENDER",
  "VACANCY",
  "TAX",
  "MEETING",
  "HEALTH",
  "EDUCATION",
  "DISASTER",
  "EVENT",
  "OTHER",
];
const NOTICE_STATUSES = ["DRAFT", "PUBLISHED", "EXPIRED", "ARCHIVED"];

const EMPTY_FORM = {
  notice_title: "",
  notice_description: "",
  notice_type: "PUBLIC",
  status: "DRAFT",
};

// LEGACY notice_attachment_path values are relative to the static/ mount
// and need the API_URL/static prefix. Documents uploaded after the
// Cloudinary migration come back as full https://res.cloudinary.com/...
// URLs — those are used as-is.
function attachmentUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/static/${path}`;
}

// Rendered by SecretaryManager two ways:
//   Add:  <EditNoticeWardSecretaryModal onClose={...} onSaved={...} />
//         (no `notice` prop at all — isEditing must default to false)
//   Edit: <EditNoticeWardSecretaryModal notice={editingRecord} onClose={...} onSaved={...} />
// `wards` is never passed (config.needsWards is false for notice), so it's
// intentionally not destructured here — accepting it silently via ...rest
// instead of naming it avoids an unused-prop lint warning if it's ever added.
function EditNoticeWardSecretaryModal({ notice = null, onClose, onSaved }) {
  const isEditing = Boolean(notice);

  const [form, setForm] = useState(
    isEditing
      ? {
          notice_title: notice.notice_title ?? "",
          notice_description: notice.notice_description ?? "",
          notice_type: notice.notice_type ?? "PUBLIC",
          status: notice.notice_status ?? "DRAFT",
        }
      : EMPTY_FORM,
  );
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    isEditing && notice.notice_attachment_type?.startsWith("image/")
      ? attachmentUrl(notice.notice_attachment_path)
      : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAttachmentFile(file);
    setImagePreview(
      file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.notice_title.trim() || !form.notice_description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("notice_title", form.notice_title);
      body.append("notice_description", form.notice_description);
      body.append("notice_type", form.notice_type);
      body.append("status", form.status);
      if (attachmentFile) body.append("attachment", attachmentFile);

      const url = isEditing
        ? `${API_URL}/v1/notice/${notice.notice_id}`
        : `${API_URL}/v1/notice/create`;
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        credentials: "include",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw data;

      toast.success(
        isEditing
          ? "Notice updated successfully!"
          : "Notice created successfully!",
      );
      // SecretaryManager's handleSaved ignores arguments and just
      // refetches the list — passing data.data costs nothing but isn't
      // relied on, so this stays safe either way.
      onSaved?.(data.data);
      onClose?.();
    } catch (err) {
      setError(
        err?.detail || err?.message || "Failed to save notice. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[640px] max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header — same chrome as EditBirthRegistrationWardSecretaryModal */}
        <div className="flex items-center justify-between px-8 py-5 border-b bg-white shrink-0">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Government of Nepal" className="w-14 h-14" />
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Government of Nepal
              </p>
              <h2 className="text-2xl font-bold text-sky-700">
                {isEditing ? "Edit Notice" : "Add Notice"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-3xl text-gray-400 hover:text-sky-500"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-5"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="notice_title"
              value={form.notice_title}
              onChange={handleChange}
              placeholder="e.g. Public Holiday Notice"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="notice_description"
              value={form.notice_description}
              onChange={handleChange}
              rows={4}
              placeholder="Write the notice details here..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment{" "}
              <i className="text-xs text-gray-400">
                (optional — image, PDF, or Word doc)
              </i>
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf,.doc,.docx"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 h-28 w-28 object-cover rounded-lg border border-gray-200"
              />
            )}
            {attachmentFile && !imagePreview && (
              <p className="mt-2 text-xs text-gray-500">
                📎 {attachmentFile.name}
              </p>
            )}
            {isEditing &&
              !attachmentFile &&
              notice.notice_attachment_path &&
              !imagePreview && (
                <p className="mt-2 text-xs text-gray-500">
                  📎 Current attachment on file (upload a new file to replace
                  it)
                </p>
              )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="notice_type"
                value={form.notice_type}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
              >
                {NOTICE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
              >
                {NOTICE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Footer — Cancel / Save, same layout as the birth modal's Cancel/Reject/Verify row */}
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
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Publish Notice"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditNoticeWardSecretaryModal;
