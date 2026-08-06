import React, { useMemo, useRef } from "react";
import { transliterateToNepali } from "../../utils/nepaliTransliteration"; // adjust path

const inputStyle =
  "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

const OFFICER_ROLES = [
  { value: "wardchairperson", label: "Ward Chairperson", labelNp: "वडाध्यक्ष" },
  { value: "wardsecretary", label: "Ward Secretary", labelNp: "वडा सचिव" },
  {
    value: "datavalidationofficer",
    label: "Data Validation Officer",
    labelNp: "डेटा अधिकृत",
  },
];

function OfficerForm({
  formData,
  errors,
  onChange,
  onPhoneChange,
  onCitizenshipChange,
  onRolePick,
  wards = [],
}) {
  const provinces = useMemo(() => {
    return [...new Set(wards.map((w) => w.ward_province))].sort();
  }, [wards]);

  const districts = useMemo(() => {
    if (!formData.user_province) return [];
    return [
      ...new Set(
        wards
          .filter((w) => w.ward_province === formData.user_province)
          .map((w) => w.ward_district),
      ),
    ].sort();
  }, [wards, formData.user_province]);

  const municipalities = useMemo(() => {
    if (!formData.user_province || !formData.user_district) return [];
    return [
      ...new Set(
        wards
          .filter(
            (w) =>
              w.ward_province === formData.user_province &&
              w.ward_district === formData.user_district,
          )
          .map((w) => w.ward_municipality),
      ),
    ].sort();
  }, [wards, formData.user_province, formData.user_district]);

  const filteredWards = useMemo(() => {
    if (
      !formData.user_province ||
      !formData.user_district ||
      !formData.user_municipality
    )
      return [];
    return wards
      .filter(
        (w) =>
          w.ward_province === formData.user_province &&
          w.ward_district === formData.user_district &&
          w.ward_municipality === formData.user_municipality,
      )
      .sort((a, b) => a.ward_no - b.ward_no);
  }, [
    wards,
    formData.user_province,
    formData.user_district,
    formData.user_municipality,
  ]);

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    onChange({ target: { name: "user_province", value } });
    onChange({ target: { name: "user_district", value: "" } });
    onChange({ target: { name: "user_municipality", value: "" } });
    onChange({ target: { name: "user_ward_number", value: "" } });
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    onChange({ target: { name: "user_district", value } });
    onChange({ target: { name: "user_municipality", value: "" } });
    onChange({ target: { name: "user_ward_number", value: "" } });
  };

  const handleMunicipalityChange = (e) => {
    const value = e.target.value;
    onChange({ target: { name: "user_municipality", value } });
    onChange({ target: { name: "user_ward_number", value: "" } });
  };

  const handleWardChange = (e) => {
    onChange({ target: { name: "user_ward_number", value: e.target.value } });
  };
  const romanBuffer = useRef({});
  const passthroughKeys = [
    "Tab",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "CapsLock",
    "Delete",
    "Escape",
  ];

  const updateNepaliField = (fieldName, romanValue) => {
    romanBuffer.current[fieldName] = romanValue;
    onChange({
      target: { name: fieldName, value: transliterateToNepali(romanValue) },
    });
  };

  const handleNepaliKeyDown = (e, fieldName) => {
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      const buf = (romanBuffer.current[fieldName] || "").slice(0, -1);
      updateNepaliField(fieldName, buf);
      return;
    }
    if (passthroughKeys.includes(e.key)) return;
    if (e.key.length === 1) {
      e.preventDefault();
      const buf = (romanBuffer.current[fieldName] || "") + e.key;
      updateNepaliField(fieldName, buf);
    }
  };

  const handleNepaliPaste = (e, fieldName) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const buf = (romanBuffer.current[fieldName] || "") + pasted;
    updateNepaliField(fieldName, buf);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          प्रदेश (Province)
        </label>
        <select
          name="user_province"
          value={formData.user_province}
          onChange={handleProvinceChange}
          className={`${inputStyle} bg-white ${errors.user_province ? "border-red-400" : ""}`}
        >
          <option value="">-- प्रदेश छान्नुहोस् --</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          जिल्ला (District)
        </label>
        <select
          name="user_district"
          value={formData.user_district}
          onChange={handleDistrictChange}
          disabled={!formData.user_province}
          className={`${inputStyle} bg-white ${errors.user_district ? "border-red-400" : ""}`}
        >
          <option value="">-- जिल्ला छान्नुहोस् --</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Municipality */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          नगरपालिका (Municipality)
        </label>
        <select
          name="user_municipality"
          value={formData.user_municipality}
          onChange={handleMunicipalityChange}
          disabled={!formData.user_district}
          className={`${inputStyle} bg-white ${errors.user_municipality ? "border-red-400" : ""}`}
        >
          <option value="">-- नगरपालिका छान्नुहोस् --</option>
          {municipalities.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Ward */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          वडा छान्नुहोस् (Select Ward)
        </label>
        <select
          name="user_ward_number"
          value={formData.user_ward_number}
          onChange={handleWardChange}
          disabled={!formData.user_municipality}
          className={`${inputStyle} bg-white ${errors.user_ward_number ? "border-red-400" : ""}`}
        >
          <option value="">-- वडा छान्नुहोस् --</option>
          {filteredWards.map((w) => (
            <option key={w.ward_id} value={w.ward_no}>
              Ward {w.ward_no} — {w.ward_name}
            </option>
          ))}
        </select>
      </div>

      {/* Role */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          भूमिका (Role)
        </label>
        <div className="flex flex-wrap gap-3 mt-1">
          {OFFICER_ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onRolePick(r.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.user_role === r.value ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400" : "border-gray-300 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"}`}
            >
              <span className="block text-xs text-gray-400">{r.labelNp}</span>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          प्रयोगकर्ता नाम (Username)
        </label>
        <input
          type="text"
          name="user_name"
          value={formData.user_name}
          onChange={onChange}
          placeholder="username_here"
          className={`${inputStyle} ${errors.user_name ? "border-red-400" : ""}`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          नाम (नेपालीमा) (Name in Nepali)
        </label>
        <input
          type="text"
          name="user_nepali_name"
          value={formData.user_nepali_name || ""}
          onKeyDown={(e) => handleNepaliKeyDown(e, "user_nepali_name")}
          onPaste={(e) => handleNepaliPaste(e, "user_nepali_name")}
          onChange={() => {}}
          placeholder="यहाँ English मा टाइप गर्नुहोस्"
          className={`${inputStyle} ${errors.user_nepali_name ? "border-red-400" : ""}`}
        />
        {errors.user_nepali_name && (
          <p className="text-red-500 text-xs mt-1">{errors.user_nepali_name}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          फोन नम्बर (Phone Number)
        </label>
        <input
          type="tel"
          name="user_phone_number"
          value={formData.user_phone_number}
          onChange={onPhoneChange}
          placeholder="98XXXXXXXX"
          className={`${inputStyle} ${errors.user_phone_number ? "border-red-400" : ""}`}
        />
      </div>

      {/* Citizenship */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          नागरिकता नम्बर (Citizenship Number)
        </label>
        <input
          type="text"
          name="user_citizenship_number"
          value={formData.user_citizenship_number}
          onChange={onCitizenshipChange}
          placeholder="XX-XX-XXXX"
          className={`${inputStyle} ${errors.user_citizenship_number ? "border-red-400" : ""}`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          इमेल (Email)
        </label>
        <input
          type="email"
          name="user_email"
          value={formData.user_email}
          onChange={onChange}
          placeholder="officer@example.com"
          className={`${inputStyle} ${errors.user_email ? "border-red-400" : ""}`}
        />
        {errors.user_email && (
          <p className="text-red-500 text-xs mt-1">{errors.user_email}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          password (Password)
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          placeholder="Enter password"
          className={`${inputStyle} ${errors.password ? "border-red-400" : ""}`}
        />
      </div>
    </div>
  );
}

export default OfficerForm;
