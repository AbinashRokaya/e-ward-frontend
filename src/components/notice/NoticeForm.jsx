import React, { useState } from "react";
import API_URL from "../../api/api";

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

function NoticeForm({ notice, onCreated, onSaved }) {
  const isEditing = Boolean(notice);
  const [form, setForm] = useState(
    notice
      ? {
          notice_title: notice.notice_title,
          notice_description: notice.notice_description,
          notice_type: notice.notice_type,
          status: notice.notice_status,
        }
      : EMPTY_FORM,
  );
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAttachmentFile(file);
    // Only build an image preview when it actually is one — PDFs/DOCX
    // just show the filename instead.
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

      if (isEditing) {
        onSaved?.(data.data);
      } else {
        setForm(EMPTY_FORM);
        setAttachmentFile(null);
        setImagePreview(null);
        onCreated?.(data.data);
      }
    } catch (err) {
      setError(
        err?.detail || err?.message || "Failed to save notice. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-md p-6 space-y-5"
    >
      <h2 className="text-lg font-semibold text-gray-800">Add New Notice</h2>

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
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
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
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 h-28 w-28 object-cover rounded-lg border border-gray-200"
          />
        )}
        {attachmentFile && !imagePreview && (
          <p className="mt-2 text-xs text-gray-500">📎 {attachmentFile.name}</p>
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
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
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
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          >
            {NOTICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
      >
        {submitting ? "Saving..." : "Publish Notice"}
      </button>
    </form>
  );
}

export default NoticeForm;
