import React, { useState } from "react";
import OfficerForm from "./OfficerForm";
const inputStyle =
  "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const OFFICER_ROLES = [
  { value: "wardchairperson", label: "Ward Chairperson", labelNp: "वडाध्यक्ष" },
  { value: "wardsecretary", label: "Ward Secretary", labelNp: "वडा सचिव" },
  {
    value: "datavalidationofficer",
    label: "Data Validation Officer",
    labelNp: "डेटा अधिकृत",
  },
];
const PROVINCE_LIST = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];
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
const initialOfficerForm = {
  user_name: "",
  user_phone_number: "",
  user_citizenship_number: "",
  user_province: "",
  user_district: "",
  user_municipality: "",
  user_ward_number: "",
  user_role: "",
};
function validateOfficer(form) {
  const e = {};
  if (!form.user_name.trim()) e.user_name = "Username is required.";
  if (!/^\d{7,15}$/.test(form.user_phone_number))
    e.user_phone_number = "Enter a valid phone number (7–15 digits).";
  if (!form.user_citizenship_number.trim())
    e.user_citizenship_number = "Citizenship number is required.";
  if (!form.user_province) e.user_province = "Select a province.";
  if (!form.user_district.trim()) e.user_district = "District is required.";
  if (!form.user_municipality.trim())
    e.user_municipality = "Municipality is required.";
  if (
    !form.user_ward_number ||
    isNaN(Number(form.user_ward_number)) ||
    Number(form.user_ward_number) < 1
  )
    e.user_ward_number = "Enter a valid ward number.";
  if (!form.user_role) e.user_role = "Select a role.";
  return e;
}
function EditOfficerModal({ officer, wards, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    ...officer,
    user_ward_number: String(officer.user_ward_number),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleWardSelect = (e) => {
    const wardNo = Number(e.target.value);
    const ward = wards.find((w) => w.ward_no === wardNo);
    setFormData((prev) => ({
      ...prev,
      user_ward_number: e.target.value,
      ...(ward
        ? {
            user_municipality: ward.ward_municipality,
            user_district: ward.ward_district,
            user_province: ward.ward_province,
          }
        : {}),
    }));
    if (errors.user_ward_number)
      setErrors((prev) => ({ ...prev, user_ward_number: undefined }));
  };
  const handlePhoneChange = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setFormData((prev) => ({ ...prev, user_phone_number: e.target.value }));
    if (errors.user_phone_number)
      setErrors((prev) => ({ ...prev, user_phone_number: undefined }));
  };
  const handleCitizenshipChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      user_citizenship_number: e.target.value,
    }));
    if (errors.user_citizenship_number)
      setErrors((prev) => ({ ...prev, user_citizenship_number: undefined }));
  };
  const handleRolePick = (value) => {
    setFormData((prev) => ({ ...prev, user_role: value }));
    if (errors.user_role)
      setErrors((prev) => ({ ...prev, user_role: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateOfficer(formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      // Replace with: PUT /v1/admin/user/{officer.user_id}
      await new Promise((r) => setTimeout(r, 700));
      onSaved({
        ...formData,
        user_ward_number: Number(formData.user_ward_number),
      });
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-indigo-700">
            अधिकृत सम्पादन गर्नुहोस् (Edit Officer)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <OfficerForm
            formData={formData}
            errors={errors}
            wards={wards}
            onChange={handleChange}
            onWardSelect={handleWardSelect}
            onPhoneChange={handlePhoneChange}
            onCitizenshipChange={handleCitizenshipChange}
            onRolePick={handleRolePick}
          />
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
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold transition-colors flex items-center gap-2"
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

export default EditOfficerModal;
