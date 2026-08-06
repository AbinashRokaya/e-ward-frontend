import React, { useState } from "react";
import WardForm from "./WardForm";
import API_URL from "../../api/api";
import { toast } from "react-toastify";

const initialWardForm = {
  ward_name: "",
  ward_nepali_name: "",
  ward_no: "",
  ward_type: "MUNICIPALITY",
  ward_municipality: "",
  ward_nepali_municipality: "",
  ward_district: "",
  ward_nepali_district: "",
  ward_province: "",
  ward_nepali_province: "",
  ward_contact_number: "",
  ward_email: "",
};

const emptyImages = () => ({
  logo: { file: null, previewUrl: null },
  chairperson_signature: { file: null, previewUrl: null },
  chairperson_stamp: { file: null, previewUrl: null },
});

function validateWard(form) {
  const e = {};
  if (!form.ward_name.trim()) e.ward_name = "Ward name is required.";
  if (!form.ward_nepali_name.trim())
    e.ward_nepali_name = "Nepali ward name is required.";
  if (!form.ward_no || Number(form.ward_no) < 1)
    e.ward_no = "Enter a valid ward number.";
  if (!form.ward_type) e.ward_type = "Select a municipality type.";
  if (!form.ward_municipality.trim())
    e.ward_municipality = "Municipality is required.";
  if (!form.ward_nepali_municipality.trim())
    e.ward_nepali_municipality = "Nepali municipality is required.";
  if (!form.ward_district.trim()) e.ward_district = "District is required.";
  if (!form.ward_nepali_district.trim())
    e.ward_nepali_district = "Nepali district is required.";
  if (!form.ward_province) e.ward_province = "Select a province.";
  if (!form.ward_nepali_province.trim())
    e.ward_nepali_province = "Nepali province is required.";
  if (!/^9[678]\d{8}$/.test(form.ward_contact_number))
    e.ward_contact_number = "Enter a valid Nepali mobile number.";
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.ward_email))
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

function AddWardForm({ onSuccess }) {
  const [formData, setFormData] = useState(initialWardForm);
  const [images, setImages] = useState(emptyImages());
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
      if (prev[key]?.previewUrl) URL.revokeObjectURL(prev[key].previewUrl);
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
      Object.entries(formData).forEach(([key, value]) =>
        body.append(key, value),
      );
      if (images.logo.file) body.append("logo", images.logo.file);
      if (images.chairperson_signature.file)
        body.append("chairperson_signature", images.chairperson_signature.file);
      if (images.chairperson_stamp.file)
        body.append("chairperson_stamp", images.chairperson_stamp.file);

      const response = await fetch(`${API_URL}/v1/admin/ward`, {
        method: "POST",
        credentials: "include",
        body, // no Content-Type header — browser sets the multipart boundary
      });

      const data = await response.json();
      if (!response.ok) throw data;

      toast.success("Ward created successfully!");
      onSuccess?.(data.data);
      setFormData(initialWardForm);
      setImages(emptyImages());
    } catch (err) {
      console.error("Submission failed:", err);
      const msg = err?.detail || "Failed to create ward. Please try again.";
      setErrors((prev) => ({ ...prev, form: msg }));
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6">
        वडा थप्नुहोस् (Add New Ward)
      </h2>
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
            onClick={() => {
              setFormData(initialWardForm);
              setImages(emptyImages());
              setErrors({});
            }}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            रद्द गर्नुहोस् (Reset)
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner /> सिर्जना गर्दै…
              </>
            ) : (
              "वडा थप्नुहोस् (Add Ward)"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddWardForm;
