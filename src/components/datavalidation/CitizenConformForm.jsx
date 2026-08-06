import React from "react";
const inputStyle =
  "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
function CitizenConformForm({ formData, errors, onChange, onContactChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Name
        </label>
        <input
          type="text"
          name="user_name"
          value={formData.user_name}
          onChange={onChange}
          readOnly
          className={`${inputStyle} `}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Phone Number
        </label>
        <input
          type="text"
          name="user_phone_number"
          value={formData.user_phone_number}
          onChange={onChange}
          readOnly
          className={`${inputStyle} `}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Citizen Number
        </label>
        <input
          type="text"
          name="user_citizenship_number"
          value={formData.user_citizenship_number}
          onChange={onChange}
          readOnly
          className={`${inputStyle} `}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Provience
        </label>
        <input
          type="text"
          name="user_provience"
          value={formData.user_provience}
          onChange={onChange}
          readOnly
          className={`${inputStyle} `}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User District
        </label>
        <input
          type="text"
          name="user_district"
          value={formData.user_district}
          onChange={onChange}
          readOnly
          className={`${inputStyle} `}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Municipality
        </label>
        <input
          type="text"
          name="user_municipality"
          value={formData.user_municipality}
          onChange={onChange}
          readOnly
          className={`${inputStyle} `}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Ward No
        </label>
        <input
          type="text"
          name="user_ward_number"
          value={formData.user_ward_number}
          onChange={onChange}
          readOnly
          className={`${inputStyle} `}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Role
        </label>
        <input
          type="text"
          name="user_role"
          value={formData.user_role}
          onChange={onChange}
          readOnly
          className={`${inputStyle} `}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Ward Id
        </label>
        <input
          type="text"
          name="ward_id"
          value={formData.ward_id}
          onChange={onChange}
          readOnly
          className={`${inputStyle} `}
        />
      </div>
    </div>
  );
}

export default CitizenConformForm;
