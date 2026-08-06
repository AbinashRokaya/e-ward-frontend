import { useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";
import { wardImageUrl } from "../../utils/imageUrl"; // generic path->URL builder, reused as-is

const FIELDS = [
  {
    key: "father_citizenship",
    label: "बाबुको नागरिकता (Father's Citizenship)",
    pathField: "father_citizenship_path",
  },
  {
    key: "mother_citizenship",
    label: "आमाको नागरिकता (Mother's Citizenship)",
    pathField: "mother_citizenship_path",
  },
  {
    key: "hospital_birth_certificate",
    label: "अस्पताल जन्म प्रमाणपत्र (Hospital Birth Certificate)",
    pathField: "hospital_birth_certificate_path",
  },
  {
    key: "vaccination_card",
    label: "खोप कार्ड (Vaccination Card)",
    pathField: "vaccination_card_path",
  },
];

function BirthDocumentUpload({ registrationId, currentPaths, onUpdated }) {
  const [uploadingKey, setUploadingKey] = useState(null);

  async function handleFileSelect(e, field) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append(field.key, file);

    setUploadingKey(field.key);
    try {
      const res = await fetch(
        `${API_URL}/v1/birth-registration/${registrationId}/upload-documents`,
        {
          method: "POST",
          credentials: "include",
          body: form, // no Content-Type — browser sets multipart boundary itself
        },
      );
      const data = await res.json();
      if (!res.ok) throw data;

      toast.success(`${field.label} अपलोड सफल भयो!`);
      onUpdated?.(data.data); // { father_citizenship_path, mother_citizenship_path, hospital_birth_certificate_path, vaccination_card_path }
    } catch (err) {
      console.error(err);
      toast.error(err?.detail || `Failed to upload ${field.label}.`);
    } finally {
      setUploadingKey(null);
      e.target.value = ""; // allow re-selecting the same file later
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
              className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors text-center ${
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
                accept="image/png,image/jpeg,image/webp,application/pdf"
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

export default BirthDocumentUpload;
