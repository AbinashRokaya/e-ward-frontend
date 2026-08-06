// components/birthregistration-component/EditBirthRegistrationCitizen.jsx
import { useState } from "react";
import { toast } from "react-toastify";

import API_URL from "../../api/api";
import ChildInfo from "../birthregistration-component/ChildInfo";
import FatherInfo from "../birthregistration-component/FatherInfo";
import MotherInfo from "../birthregistration-component/MotherInfo";
import AddressInfo from "../birthregistration-component/AddressInfo";

// Maps the API response (BirthRegistrationResponseAll shape) into the
// same formData shape the create form (BirthRegistration.jsx) uses,
// so we can reuse ChildInfo / FatherInfo / MotherInfo / AddressInfo as-is.
function buildFormDataFromRegistration(registration) {
  const father =
    registration.parents?.find((p) => p.parent_type === "FATHER") || {};
  const mother =
    registration.parents?.find((p) => p.parent_type === "MOTHER") || {};

  // dob fields come back as full timestamps from the DB (DateTime column),
  // trim to YYYY-MM-DD so <input type="date"> can display them.
  const toDateInput = (val) => (val ? String(val).slice(0, 10) : "");

  return {
    registration_id: registration.registration_id,
    register_ward_id: registration.register_ward_id || "",
    register_submitted_by: registration.register_submitted_by || 1,
    child: {
      child_first_name: registration.child?.child_first_name || "",
      child_middle_name: registration.child?.child_middle_name || "",
      child_last_name: registration.child?.child_last_name || "",
      child_nepali_first_name:
        registration.child?.child_nepali_first_name || "",
      child_nepali_middle_name:
        registration.child?.child_nepali_middle_name || "",
      child_nepali_last_name: registration.child?.child_nepali_last_name || "",
      child_gender: registration.child?.child_gender || "",
      child_dob_bs: toDateInput(registration.child?.child_dob_bs),
      child_dob_ad: toDateInput(registration.child?.child_dob_ad),
      child_time_of_birth: registration.child?.child_time_of_birth || "",
      child_birth_place: registration.child?.child_birth_place || "",
      child_birth_kind: registration.child?.child_birth_kind || "",
      child_weight_kg: registration.child?.child_weight_kg || 0,
    },
    parents: [
      {
        parent_id: father.parent_id, // kept so we know which parent to PUT
        parent_first_name: father.parent_first_name || "",
        parent_middle_name: father.parent_middle_name || "",
        parent_last_name: father.parent_last_name || "",
        parent_nepali_first_name: father.parent_nepali_first_name || "",
        parent_nepali_middle_name: father.parent_nepali_middle_name || "",
        parent_nepali_last_name: father.parent_nepali_last_name || "",
        parent_type: "FATHER",
        parent_citizenship_no: father.parent_citizenship_no || "",
        parent_nid_no: father.parent_nid_no || "",
        parent_occupation: father.parent_occupation || "",
        parent_nationality: father.parent_nationality || "NEPALESE",
        parent_contact_no: father.parent_contact_no || "",
      },
      {
        parent_id: mother.parent_id,
        parent_first_name: mother.parent_first_name || "",
        parent_middle_name: mother.parent_middle_name || "",
        parent_last_name: mother.parent_last_name || "",
        parent_nepali_first_name: mother.parent_nepali_first_name || "",
        parent_nepali_middle_name: mother.parent_nepali_middle_name || "",
        parent_nepali_last_name: mother.parent_nepali_last_name || "",
        parent_type: "MOTHER",
        parent_citizenship_no: mother.parent_citizenship_no || "",
        parent_nid_no: mother.parent_nid_no || "",
        parent_occupation: mother.parent_occupation || "",
        parent_nationality: mother.parent_nationality || "NEPALESE",
        parent_contact_no: mother.parent_contact_no || "",
      },
    ],
    address: {
      address_id: registration.address?.address_id,
      child_province: registration.address?.child_province || "",
      child_district: registration.address?.child_district || "",
      child_municipality: registration.address?.child_municipality || "",
      child_ward_number: registration.address?.child_ward_number || 0,
      child_tole: registration.address?.child_tole || "",
    },
  };
}

function EditBirthRegistrationCitizen({
  registration,
  wards,
  onClose,
  onSaved,
}) {
  const [formData, setFormData] = useState(() =>
    buildFormDataFromRegistration(registration),
  );
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  const rejections = Array.isArray(registration.reject)
    ? registration.reject
    : [];

  async function handleResubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Update child + address, and flip status back to SUBMITTED
      const mainRes = await fetch(
        `${API_URL}/v1/birth-registration/${registration.registration_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            register_status: "SUBMITTED",
            child: formData.child,
            address: {
              child_province: formData.address.child_province,
              child_district: formData.address.child_district,
              child_municipality: formData.address.child_municipality,
              child_ward_number: formData.address.child_ward_number,
              child_tole: formData.address.child_tole,
            },
          }),
        },
      );
      const mainData = await mainRes.json();
      if (!mainRes.ok) throw mainData;

      // 2. Update each parent we have a parent_id for
      for (const parent of formData.parents) {
        if (!parent.parent_id) continue;
        const { parent_id, ...parentFields } = parent;
        const res = await fetch(
          `${API_URL}/v1/birth-registration/${registration.registration_id}/parents/${parent_id}`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parentFields),
          },
        );
        const data = await res.json();
        if (!res.ok) throw data;
      }

      toast.success("Registration resubmitted for review!");
      onSaved?.();
    } catch (err) {
      console.error("Resubmission failed:", err);
      toast.error(err?.detail || "Failed to resubmit registration.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {rejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-700 font-semibold mb-2">
            ✕ यो दर्ता अस्वीकृत गरिएको छ (This registration was rejected)
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {rejections.map((r) => (
              <li key={r.reject_id} className="text-sm text-red-600">
                {r.reject_text}
              </li>
            ))}
          </ul>
          <p className="text-xs text-red-500 mt-2">
            कृपया माथिका कारणहरू सुधार गरी पुन: पेश गर्नुहोस्।
          </p>
        </div>
      )}

      <form onSubmit={handleResubmit} className="space-y-4">
        <ChildInfo
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
        />
        <FatherInfo
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
        />
        <MotherInfo
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
        />
        <AddressInfo
          wards={wards}
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-md cursor-pointer transition-colors"
          >
            {submitting ? "Resubmitting..." : "🔄 Resubmit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditBirthRegistrationCitizen;
