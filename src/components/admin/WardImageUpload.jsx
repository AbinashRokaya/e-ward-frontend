import { useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";
import { wardImageUrl } from "../../utils/imageUrl";

const FIELDS = [
  { key: "logo", label: "वडा लोगो (Ward Logo)", pathField: "ward_logo_path" },
  {
    key: "chairperson_signature",
    label: "अध्यक्षको हस्ताक्षर (Chairperson Signature)",
    pathField: "chairperson_signature_path",
  },
  {
    key: "chairperson_stamp",
    label: "छाप (Official Stamp)",
    pathField: "chairperson_stamp_path",
  },
];

function WardImageUpload({ wardId, currentPaths, onUpdated }) {
  const [uploadingKey, setUploadingKey] = useState(null);

  async function handleFileSelect(e, field) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append(field.key, file);

    setUploadingKey(field.key);
    try {
      const res = await fetch(`${API_URL}/v1/ward/${wardId}/upload-images`, {
        method: "POST",
        credentials: "include",
        body: form, // no Content-Type — browser sets multipart boundary itself
      });
      const data = await res.json();
      if (!res.ok) throw data;

      toast.success(`${field.label} updated!`);
      onUpdated?.(data.data); // { ward_logo_path, chairperson_signature_path, chairperson_stamp_path }
    } catch (err) {
      console.error(err);
      toast.error(err?.detail || `Failed to upload ${field.label}.`);
    } finally {
      setUploadingKey(null);
      e.target.value = ""; // allow re-selecting the same file later
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {FIELDS.map((field) => {
        const existingUrl = wardImageUrl(currentPaths?.[field.pathField]);
        const isUploading = uploadingKey === field.key;

        return (
          <div
            key={field.key}
            className="border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2"
          >
            <span className="text-xs font-medium text-gray-600 text-center">
              {field.label}
            </span>

            <div className="w-20 h-20 rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
              {existingUrl ? (
                <img
                  src={existingUrl}
                  alt={field.label}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-gray-400">छैन</span>
              )}
            </div>

            <label
              className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                isUploading
                  ? "bg-gray-200 text-gray-400"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {isUploading
                ? "अपलोड हुँदै..."
                : existingUrl
                  ? "बदल्नुहोस्"
                  : "अपलोड गर्नुहोस्"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => handleFileSelect(e, field)}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}

export default WardImageUpload;
