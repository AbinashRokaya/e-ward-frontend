import React from "react";
import { useRef } from "react";
import { transliterateToNepali } from "../../utils/nepaliTransliteration";
const inputStyle =
  "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const PROVINCE_LIST = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];
const PROVINCE_NEPALI_MAP = {
  Koshi: "कोशी",
  Madhesh: "मधेश",
  Bagmati: "बागमती",
  Gandaki: "गण्डकी",
  Lumbini: "लुम्बिनी",
  Karnali: "कर्णाली",
  Sudurpashchim: "सुदूरपश्चिम",
};

// Must match model.enums.MunicipalityType values on the backend exactly.
const WARD_TYPE_LIST = [
  { value: "METROPOLITAN_CITY", label: "महानगरपालिका (Metropolitan City)" },
  {
    value: "SUB_METROPOLITAN_CITY",
    label: "उपमहानगरपालिका (Sub-Metropolitan City)",
  },
  { value: "MUNICIPALITY", label: "नगरपालिका (Municipality)" },
  { value: "RURAL_MUNICIPALITY", label: "गाउँपालिका (Rural Municipality)" },
];

function WardForm({
  formData,
  errors,
  onChange,
  onContactChange,
  images,
  onImageSelect,
}) {
  const romanBuffer = useRef({});
  const IMAGE_FIELDS = [
    { key: "logo", label: "वडा लोगो (Ward Logo)" },
    {
      key: "chairperson_signature",
      label: "अध्यक्षको हस्ताक्षर (Chairperson Signature)",
    },
    { key: "chairperson_stamp", label: "छाप (Official Stamp)" },
  ];

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
      target: {
        name: fieldName,
        value: transliterateToNepali(romanValue),
      },
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          वडाको नाम (Ward Name)
        </label>
        <input
          type="text"
          name="ward_name"
          value={formData.ward_name}
          onChange={onChange}
          placeholder="वडाको नाम लेख्नुहोस्"
          className={`${inputStyle} ${errors.ward_name ? "border-red-400" : ""}`}
        />
        {/* <FieldError msg={errors.ward_name} /> */}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          वडाको नाम (Ward Name)(nepali)
        </label>

        <input
          type="text"
          name="ward_nepali_name"
          value={formData.ward_nepali_name}
          onKeyDown={(e) => handleNepaliKeyDown(e, "ward_nepali_name")}
          onPaste={(e) => handleNepaliPaste(e, "ward_nepali_name")}
          onChange={() => {}}
          placeholder="यहाँ English मा टाइप गर्नुहोस्"
          className={`${inputStyle} ${
            errors.ward_nepali_name ? "border-red-400" : ""
          }`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          वडा नम्बर (Ward Number)
        </label>
        <input
          type="number"
          name="ward_no"
          value={formData.ward_no}
          onChange={(e) => {
            if (!isNaN(Number(e.target.value))) onChange(e);
          }}
          placeholder="१, २, ३…"
          min={1}
          className={`${inputStyle} ${errors.ward_no ? "border-red-400" : ""}`}
        />
        {/* <FieldError msg={errors.ward_no} /> */}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          स्थानीय तहको प्रकार (Municipality Type)
        </label>
        <select
          name="ward_type"
          value={formData.ward_type}
          onChange={onChange}
          className={`${inputStyle} bg-white ${
            errors.ward_type ? "border-red-400" : ""
          }`}
        >
          <option value="">-- प्रकार छान्नुहोस् --</option>
          {WARD_TYPE_LIST.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {/* <FieldError msg={errors.ward_type} /> */}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          नगरपालिका (Municipality)
        </label>
        <input
          type="text"
          name="ward_municipality"
          value={formData.ward_municipality}
          onChange={onChange}
          placeholder="नगरपालिका लेख्नुहोस्"
          className={`${inputStyle} ${errors.ward_municipality ? "border-red-400" : ""}`}
        />
        {/* <FieldError msg={errors.ward_municipality} /> */}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          नगरपालिका (Municipality)(Nepali)
        </label>
        <input
          type="text"
          name="ward_nepali_municipality"
          value={formData.ward_nepali_municipality}
          onKeyDown={(e) => handleNepaliKeyDown(e, "ward_nepali_municipality")}
          onPaste={(e) => handleNepaliPaste(e, "ward_nepali_municipality")}
          onChange={() => {}}
          placeholder="यहाँ English मा टाइप गर्नुहोस्"
          className={inputStyle}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          जिल्ला (District)
        </label>
        <input
          type="text"
          name="ward_district"
          value={formData.ward_district}
          onChange={onChange}
          placeholder="जिल्ला लेख्नुहोस्"
          className={`${inputStyle} ${errors.ward_district ? "border-red-400" : ""}`}
        />
        {/* <FieldError msg={errors.ward_district} /> */}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          जिल्ला (District)(Nepali)
        </label>
        <input
          type="text"
          name="ward_nepali_district"
          value={formData.ward_nepali_district}
          onKeyDown={(e) => handleNepaliKeyDown(e, "ward_nepali_district")}
          onPaste={(e) => handleNepaliPaste(e, "ward_nepali_district")}
          onChange={() => {}}
          placeholder="यहाँ English मा टाइप गर्नुहोस्"
          className={inputStyle}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          प्रदेश (Province)
        </label>
        <select
          name="ward_province"
          value={formData.ward_province}
          onChange={(e) => {
            const english = e.target.value;

            onChange({
              target: {
                name: "ward_province",
                value: english,
              },
            });

            onChange({
              target: {
                name: "ward_nepali_province",
                value: PROVINCE_NEPALI_MAP[english] || "",
              },
            });
          }}
          className={`${inputStyle} bg-white ${
            errors.ward_province ? "border-red-400" : ""
          }`}
        >
          <option value="">-- प्रदेश छान्नुहोस् --</option>

          {PROVINCE_LIST.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          प्रदेश (Nepali)
        </label>
        <input
          type="text"
          name="ward_nepali_province"
          value={formData.ward_nepali_province}
          readOnly
          placeholder="प्रदेश छान्दा स्वतः देखिनेछ"
          className={`${inputStyle} bg-gray-50`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          सम्पर्क नम्बर (Contact Number)
        </label>
        <input
          type="tel"
          name="ward_contact_number"
          value={formData.ward_contact_number}
          onChange={onContactChange}
          placeholder="98XXXXXXXX"
          className={`${inputStyle} ${errors.ward_contact_number ? "border-red-400" : ""}`}
        />
        {/* <FieldError msg={errors.ward_contact_number} /> */}
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          इमेल (Email Address)
        </label>
        <input
          type="email"
          name="ward_email"
          value={formData.ward_email}
          onChange={onChange}
          placeholder="ward@municipality.gov.np"
          className={`${inputStyle} ${errors.ward_email ? "border-red-400" : ""}`}
        />
        {/* <FieldError msg={errors.ward_email} /> */}
      </div>
      <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          लोगो, हस्ताक्षर र छाप (Logo, Signature & Stamp)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {IMAGE_FIELDS.map((field) => {
            const current = images?.[field.key];
            const previewUrl = current?.previewUrl;
            return (
              <div
                key={field.key}
                className="border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-gray-600 text-center">
                  {field.label}
                </span>
                <div className="w-20 h-20 rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={field.label}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400">छैन</span>
                  )}
                </div>
                <label className="text-xs px-3 py-1.5 rounded-md cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                  {previewUrl ? "बदल्नुहोस्" : "अपलोड गर्नुहोस्"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onImageSelect(field.key, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WardForm;
