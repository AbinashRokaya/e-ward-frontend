import React, { useState } from "react";
import OfficerForm from "./OfficerForm";
import API_URL from "../../api/api";

const initialOfficerForm = {
  user_name: "",
  user_nepali_name: "", // <-- add
  user_phone_number: "",
  user_citizenship_number: "",
  user_email: "",
  user_province: "",
  user_district: "",
  user_municipality: "",
  user_ward_number: "",
  user_role: "",
  password: "",
};
function validateOfficer(form) {
  const e = {};
  if (!form.user_name.trim()) e.user_name = "Username is required.";
  if (!form.password || form.password.length < 6)
    e.password = "Password is required (min 6 chars).";
  if (!/^\d{7,15}$/.test(form.user_phone_number))
    e.user_phone_number = "Enter a valid phone number (7–15 digits).";
  if (!form.user_citizenship_number.trim())
    e.user_citizenship_number = "Citizenship number is required.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.user_email.trim()))
    e.user_email = "Enter a valid email address.";
  if (!form.user_province) e.user_province = "Select a province.";
  if (!form.user_district.trim()) e.user_district = "District is required.";
  if (!form.user_municipality.trim())
    e.user_municipality = "Municipality is required.";
  if (!form.user_nepali_name || !form.user_nepali_name.trim())
    e.user_nepali_name = "Nepali name is required.";
  if (
    !form.user_ward_number ||
    isNaN(Number(form.user_ward_number)) ||
    Number(form.user_ward_number) < 1
  )
    e.user_ward_number = "Enter a valid ward number.";
  if (!form.user_role) e.user_role = "Select a role.";
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

function AssignOfficerForm({ wards, onSuccess }) {
  const [formData, setFormData] = useState(initialOfficerForm);
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
      console.log(formData);

      await fetch(`${API_URL}/v1/admin/user`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          return response.json().then((data) => {
            if (!response.ok) {
              throw data;
            }
            return data;
          });
        })
        .then((data) => {
          console.log("Submission successful");
          console.log(data);
          setFormData(initialOfficerForm);
        })
        .catch((err) => {
          console.error("Submission failed:", err);
        });
      onSuccess({
        ...formData,
        user_id: Date.now(),
        user_ward_number: Number(formData.user_ward_number),
      });

      // showToast("Officer assigned successfully!", "success");
    } catch {
      // showToast("Failed to assign officer. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {/* <Toast toast={toast} /> */}
      <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
        अधिकृत नियुक्त गर्नुहोस् (Assign Ward Officer)
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <OfficerForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onPhoneChange={handlePhoneChange}
          onCitizenshipChange={handleCitizenshipChange}
          onRolePick={handleRolePick}
          wards={wards}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData(initialOfficerForm);
              setErrors({});
            }}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            रद्द गर्नुहोस् (Reset)
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Spinner /> नियुक्त गर्दै…
              </>
            ) : (
              "अधिकृत नियुक्त गर्नुहोस् (Assign Officer)"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignOfficerForm;
