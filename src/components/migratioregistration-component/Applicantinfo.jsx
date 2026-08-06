import { useRef } from "react";
import { toast } from "react-toastify";
import { transliterateToNepali } from "../../utils/nepaliTransliteration";
import * as BS from "bikram-sambat-js";

const NATIONALITY_OPTIONS = [
  { en: "Nepali", np: "नेपाली" },
  { en: "Indian", np: "भारतीय" },
  { en: "Chinese", np: "चिनियाँ" },
  { en: "Other", np: "अन्य" },
];

function ApplicantInfo({ setFormData, formData }) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:invalid:border-blue-500 focus:invalid:ring-blue-500";

  const englishRegex = /^[A-Za-z\s]*$/;

  // keeps the "raw roman" text the user actually typed, per field
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
    setFormData((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [fieldName]: transliterateToNepali(romanValue),
      },
    }));
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

  const handleApplicantChange = (e) => {
    const { name, value } = e.target;

    if (name === "applicant_full_name_en") {
      if (!englishRegex.test(value)) {
        toast.error("Please enter English letters only.");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      applicant: { ...prev.applicant, [name]: value },
    }));
  };

  const handleApplicantSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      applicant: { ...prev.applicant, [name]: value },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6">
        निवेदकको व्यक्तिगत विवरण (Applicant Information)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>पूरा नाम (English)</label>
          <input
            type="text"
            name="applicant_full_name_en"
            value={formData.applicant.applicant_full_name_en}
            onChange={handleApplicantChange}
            placeholder="पूरा नाम लेख्नुहोस् (Enter Full Name)"
            required
            className={inputStyle}
          />
        </div>
        <div>
          <label>पूरा नाम (नेपालीमा)</label>
          <input
            type="text"
            name="applicant_full_name_np"
            value={formData.applicant.applicant_full_name_np}
            onKeyDown={(e) => handleNepaliKeyDown(e, "applicant_full_name_np")}
            onPaste={(e) => handleNepaliPaste(e, "applicant_full_name_np")}
            onChange={() => {}}
            placeholder="यहाँ English मा टाइप गर्नुहोस्, नेपालीमा देखिनेछ"
            required
            className={inputStyle}
          />
        </div>

        <div>
          <label>लिंग (Sex)</label>
          <select
            name="applicant_gender"
            value={formData.applicant.applicant_gender}
            onChange={handleApplicantChange}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- लिंग छान्नुहोस् (Select Sex) --</option>
            <option value="MALE">पुरुष (Male)</option>
            <option value="FEMALE">महिला (Female)</option>
            <option value="OTHER">अन्य (Other)</option>
          </select>
        </div>

        <div>
          <label>राष्ट्रियता (Nationality)</label>
          <select
            name="applicant_nationality"
            value={formData.applicant.applicant_nationality}
            onChange={handleApplicantSelectChange}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">
              -- राष्ट्रियता छान्नुहोस् (Select Nationality) --
            </option>
            {NATIONALITY_OPTIONS.map((opt) => (
              <option key={opt.np} value={opt.np}>
                {opt.en} ({opt.np})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>जन्म मिति (AD)</label>
          <input
            type="date"
            name="applicant_dob_ad"
            value={formData.applicant.applicant_dob_ad}
            onChange={(e) => {
              const adDate = e.target.value;
              const date = new Date(adDate);
              const now = new Date();

              if (date > now) {
                toast.error("Date of birth must be in the past");
                return;
              }

              const bsDate = BS.ADToBS(adDate);

              setFormData((prev) => ({
                ...prev,
                applicant: {
                  ...prev.applicant,
                  applicant_dob_ad: adDate,
                  applicant_dob_bs: bsDate,
                },
              }));
            }}
            required
            className={inputStyle}
          />
        </div>
        <div>
          <label>जन्म मिति (वि.सं.)</label>
          <input
            type="text"
            name="applicant_dob_bs"
            value={formData.applicant.applicant_dob_bs}
            readOnly
            className={inputStyle}
          />
        </div>

        <div>
          <label>पेशा/व्यवसाय (Occupation)</label>
          <input
            type="text"
            name="applicant_occupation"
            value={formData.applicant.applicant_occupation}
            onChange={handleApplicantChange}
            placeholder="पेशा/व्यवसाय लेख्नुहोस्"
            className={inputStyle}
          />
        </div>

        <div>
          <label>सम्पर्क नं. (Contact No.)</label>
          <input
            type="tel"
            name="applicant_contact_no"
            value={formData.applicant.applicant_contact_no}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                setFormData((prev) => ({
                  ...prev,
                  applicant: { ...prev.applicant, applicant_contact_no: "" },
                }));
                return;
              }

              if (isNaN(Number(value))) return;

              if (value.length > 10) {
                toast.error("Phone number cannot be more than 10 digits");
                return;
              }

              if (value.length >= 2 && !/^9[678]/.test(value)) {
                toast.error("The number must start with 96, 97, or 98");
                return;
              }

              setFormData((prev) => ({
                ...prev,
                applicant: { ...prev.applicant, applicant_contact_no: value },
              }));
            }}
            required
            placeholder="98XXXXXXXX"
            className={inputStyle}
          />
        </div>
      </div>

      <div className="mt-4">
        <label>नागरिकता नं. (Citizenship No.)</label>
        <input
          type="text"
          name="applicant_citizenship_no"
          value={formData.applicant.applicant_citizenship_no}
          onChange={(e) => {
            const value = e.target.value;
            if (!/^[0-9-]*$/.test(value)) return;

            setFormData((prev) => ({
              ...prev,
              applicant: { ...prev.applicant, applicant_citizenship_no: value },
            }));
          }}
          required
          placeholder="12-34-56789"
          className={inputStyle}
        />
      </div>
    </div>
  );
}

export default ApplicantInfo;
