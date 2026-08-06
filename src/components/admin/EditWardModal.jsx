import React, { useState } from "react";
import WardForm from "./WardForm";
import API_URL from "../../api/api";
import { toast } from "react-toastify";
import { wardImageUrl } from "../../utils/imageUrl";

function validateWard(form) {
  const e = {};
  if (!form.ward_name.trim()) e.ward_name = "Ward name is required.";
  if (!form.ward_no || isNaN(Number(form.ward_no)) || Number(form.ward_no) < 1)
    e.ward_no = "Enter a valid ward number.";
  if (!form.ward_municipality.trim())
    e.ward_municipality = "Municipality is required.";
  if (!form.ward_district.trim()) e.ward_district = "District is required.";
  if (!form.ward_province) e.ward_province = "Select a province.";
  if (!/^\d{7,15}$/.test(form.ward_contact_number))
    e.ward_contact_number = "Enter a valid contact number (7–15 digits).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ward_email))
    e.ward_email = "Enter a valid email address.";
  return e;
}

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

function EditWardModal({ ward, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    ...ward,
    ward_no: String(ward.ward_no),
  });
  const [images, setImages] = useState({
    logo: { file: null, previewUrl: wardImageUrl(ward.ward_logo_path) },
    chairperson_signature: {
      file: null,
      previewUrl: wardImageUrl(ward.chairperson_signature_path),
    },
    chairperson_stamp: {
      file: null,
      previewUrl: wardImageUrl(ward.chairperson_stamp_path),
    },
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleContactChange = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setFormData((prev) => ({ ...prev, ward_contact_number: e.target.value }));
    if (errors.ward_contact_number)
      setErrors((prev) => ({ ...prev, ward_contact_number: undefined }));
  };

  const handleImageSelect = (key, file) => {
    setImages((prev) => {
      if (prev[key]?.file && prev[key]?.previewUrl)
        URL.revokeObjectURL(prev[key].previewUrl);
      return {
        ...prev,
        [key]: { file, previewUrl: URL.createObjectURL(file) },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateWard(formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "ward_id" || key.endsWith("_path")) return; // not editable text fields
        body.append(key, value);
      });
      if (images.logo.file) body.append("logo", images.logo.file);
      if (images.chairperson_signature.file)
        body.append("chairperson_signature", images.chairperson_signature.file);
      if (images.chairperson_stamp.file)
        body.append("chairperson_stamp", images.chairperson_stamp.file);

      const response = await fetch(`${API_URL}/v1/admin/ward/${ward.ward_id}`, {
        method: "PUT",
        credentials: "include",
        body,
      });

      const data = await response.json();
      if (!response.ok) throw data;

      onSaved(data.data); // now includes updated image paths from the backend
      toast.success("Ward updated successfully!");
    } catch (err) {
      console.error("Submission failed:", err);
      setErrors((prev) => ({
        ...prev,
        form: err?.detail || "Failed to save ward. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-blue-700">
            वडा सम्पादन गर्नुहोस् (Edit Ward)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <WardForm
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onContactChange={handleContactChange}
            images={images}
            onImageSelect={handleImageSelect}
          />
          {errors.form && (
            <p className="text-sm text-red-500 mt-4">{errors.form}</p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              रद्द गर्नुहोस् (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Spinner /> अद्यावधिक गर्दै…
                </>
              ) : (
                "परिवर्तन सुरक्षित गर्नुहोस् (Save Changes)"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditWardModal;
