import { useRef } from "react";
import { toast } from "react-toastify";
import { transliterateToNepali } from "../../utils/nepaliTransliteration";
import * as BS from "bikram-sambat-js";

// NOTE: MaritalStatusType values assumed as UNMARRIED / MARRIED / WIDOWED /
// DIVORCED to mirror the model default (MaritalStatusType.UNMARRIED).
// Verify these match enums/death_enum.py exactly before shipping.
const MARITAL_STATUS_OPTIONS = [
  { value: "UNMARRIED", label: "अविवाहित (Unmarried)" },
  { value: "MARRIED", label: "विवाहित (Married)" },
  { value: "WIDOWED", label: "विधवा/विधुर (Widowed)" },
  { value: "DIVORCED", label: "सम्बन्ध विच्छेद (Divorced)" },
];

const OCCUPATION_OPTIONS = [
  { en: "Farmer", np: "कृषक" },
  { en: "Business", np: "व्यवसायी" },
  { en: "Service (Government)", np: "सरकारी सेवा" },
  { en: "Service (Private)", np: "निजी सेवा" },
  { en: "Labour", np: "श्रमिक" },
  { en: "Teacher", np: "शिक्षक" },
  { en: "Driver", np: "चालक" },
  { en: "Foreign Employment", np: "वैदेशिक रोजगार" },
  { en: "Housemaker", np: "गृहिणी" },
  { en: "Retired", np: "अवकाशप्राप्त" },
  { en: "Student", np: "विद्यार्थी" },
  { en: "Other", np: "अन्य" },
];

function DeceasedInfo({ setFormData, formData, handleChange }) {
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
      deceased: {
        ...prev.deceased,
        [fieldName]: transliterateToNepali(romanValue),
      },
    }));
  };

  const handleNepaliKeyDown = (e, fieldName) => {
    if (e.ctrlKey || e.metaKey) return; // allow copy/paste/select-all

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

  const handleDeceasedChange = (e) => {
    const { name, value } = e.target;

    if (
      [
        "deceased_first_name",
        "deceased_middle_name",
        "deceased_last_name",
      ].includes(name)
    ) {
      if (!englishRegex.test(value)) {
        toast.error("Please enter English letters only.");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      deceased: { ...prev.deceased, [name]: value },
    }));
  };

  const handleDeceasedSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      deceased: { ...prev.deceased, [name]: value },
    }));
  };

  const handleAgeChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        deceased: { ...prev.deceased, [name]: "" },
      }));
      return;
    }
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    setFormData((prev) => ({
      ...prev,
      deceased: { ...prev.deceased, [name]: value },
    }));
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-b-xl shadow-md">
        <h2 className="text-2xl font-semibold text-blue-700 mb-6">
          मृतकको व्यक्तिगत विवरण (Deceased Information)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>First Name(English)</label>
            <input
              type="text"
              name="deceased_first_name"
              value={formData.deceased.deceased_first_name}
              onChange={handleDeceasedChange}
              placeholder="पहिलो नाम लेख्नुहोस् (Enter First Name)"
              required
              className={inputStyle}
            />
          </div>
          <div>
            <label>
              पहिलो नाम (Nepali) <i>(Optional)</i>
            </label>
            <input
              type="text"
              name="deceased_nepali_first_name"
              value={formData.deceased.deceased_nepali_first_name}
              onKeyDown={(e) =>
                handleNepaliKeyDown(e, "deceased_nepali_first_name")
              }
              onPaste={(e) =>
                handleNepaliPaste(e, "deceased_nepali_first_name")
              }
              onChange={() => {}}
              placeholder="यहाँ English मा टाइप गर्नुहोस्, नेपालीमा देखिनेछ"
              className={inputStyle}
            />
          </div>

          <div>
            <label>
              Middle Name(English) <i>(Optional)</i>
            </label>
            <input
              type="text"
              name="deceased_middle_name"
              value={formData.deceased.deceased_middle_name}
              onChange={handleDeceasedChange}
              placeholder="बीचको नाम (Middle Name)"
              className={inputStyle}
            />
          </div>
          <div>
            <label>
              बीचको नाम (Nepali) <i>(Optional)</i>
            </label>
            <input
              type="text"
              name="deceased_nepali_middle_name"
              value={formData.deceased.deceased_nepali_middle_name}
              onKeyDown={(e) =>
                handleNepaliKeyDown(e, "deceased_nepali_middle_name")
              }
              onPaste={(e) =>
                handleNepaliPaste(e, "deceased_nepali_middle_name")
              }
              onChange={() => {}}
              placeholder="यहाँ English मा टाइप गर्नुहोस्"
              className={inputStyle}
            />
          </div>

          <div>
            <label>Last Name(English)</label>
            <input
              type="text"
              name="deceased_last_name"
              value={formData.deceased.deceased_last_name}
              onChange={handleDeceasedChange}
              placeholder="थर लेख्नुहोस् (Enter Last Name)"
              required
              className={inputStyle}
            />
          </div>
          <div>
            <label>
              थर (Nepali) <i>(Optional)</i>
            </label>
            <input
              type="text"
              name="deceased_nepali_last_name"
              value={formData.deceased.deceased_nepali_last_name}
              onKeyDown={(e) =>
                handleNepaliKeyDown(e, "deceased_nepali_last_name")
              }
              onPaste={(e) => handleNepaliPaste(e, "deceased_nepali_last_name")}
              onChange={() => {}}
              placeholder="यहाँ English मा टाइप गर्नुहोस्"
              className={inputStyle}
            />
          </div>

          <div>
            <label>लिंग (Gender)</label>
            <select
              name="deceased_gender"
              value={formData.deceased.deceased_gender}
              onChange={handleDeceasedChange}
              required
              className={`${inputStyle} bg-white`}
            >
              <option value="">-- लिंग छान्नुहोस् (Select Gender) --</option>
              <option value="MALE">पुरुष (Male)</option>
              <option value="FEMALE">महिला (Female)</option>
              <option value="OTHER">अन्य (Other)</option>
            </select>
          </div>

          <div>
            <label>वैवाहिक स्थिति (Marital Status)</label>
            <select
              name="deceased_marital_status"
              value={formData.deceased.deceased_marital_status}
              onChange={handleDeceasedSelectChange}
              required
              className={`${inputStyle} bg-white`}
            >
              {MARITAL_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>
              जन्म मिति (AD) <i>(Optional)</i>
            </label>
            <input
              type="date"
              name="deceased_dob_ad"
              value={formData.deceased.deceased_dob_ad}
              onChange={(e) => {
                const adDate = e.target.value;
                if (adDate === "") {
                  setFormData((prev) => ({
                    ...prev,
                    deceased: {
                      ...prev.deceased,
                      deceased_dob_ad: "",
                      deceased_dob_bs: "",
                    },
                  }));
                  return;
                }
                const date = new Date(adDate);
                const now = new Date();
                if (date > now) {
                  toast.error("Date of birth must be in the past");
                  return;
                }
                const bsDate = BS.ADToBS(adDate);
                setFormData((prev) => ({
                  ...prev,
                  deceased: {
                    ...prev.deceased,
                    deceased_dob_ad: adDate,
                    deceased_dob_bs: bsDate,
                  },
                }));
              }}
              className={inputStyle}
            />
          </div>
          <div>
            <label>जन्म मिति (BS)</label>
            <input
              type="text"
              name="deceased_dob_bs"
              value={formData.deceased.deceased_dob_bs}
              readOnly
              className={`${inputStyle} bg-gray-100`}
            />
          </div>

          <div>
            <label>
              नागरिकता नम्बर (Citizenship Number) <i>(Optional)</i>
            </label>
            <input
              type="text"
              name="deceased_citizenship_no"
              value={formData.deceased.deceased_citizenship_no}
              onChange={(e) => {
                const value = e.target.value;
                if (!/^[0-9-]*$/.test(value)) return;
                setFormData((prev) => ({
                  ...prev,
                  deceased: {
                    ...prev.deceased,
                    deceased_citizenship_no: value,
                  },
                }));
              }}
              placeholder="12-34-56789"
              className={inputStyle}
            />
          </div>

          <div>
            <label>
              अन्य परिचय नम्बर (Other ID No.) <i>(Optional)</i>
            </label>
            <input
              type="text"
              name="deceased_other_id_no"
              value={formData.deceased.deceased_other_id_no}
              onChange={handleDeceasedChange}
              placeholder="भएमा उल्लेख गर्नुहोस्"
              className={inputStyle}
            />
          </div>

          <div>
            <label>
              पेशा (Occupation) <i>(Optional)</i>
            </label>
            <select
              name="deceased_occupation"
              value={formData.deceased.deceased_occupation}
              onChange={handleDeceasedSelectChange}
              className={`${inputStyle} bg-white`}
            >
              <option value="">
                -- पेशा छान्नुहोस् (Select Occupation) --
              </option>
              {OCCUPATION_OPTIONS.map((opt) => (
                <option key={opt.np} value={opt.np}>
                  {opt.en} ({opt.np})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block mb-2">
            उमेर (Age at time of death) <i>(Optional)</i>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="deceased_age_years"
              value={formData.deceased.deceased_age_years}
              onChange={handleAgeChange}
              placeholder="वर्ष (Years)"
              className={inputStyle}
            />
            <input
              type="text"
              name="deceased_age_months"
              value={formData.deceased.deceased_age_months}
              onChange={handleAgeChange}
              placeholder="महिना (Months)"
              className={inputStyle}
            />
            <input
              type="text"
              name="deceased_age_days"
              value={formData.deceased.deceased_age_days}
              onChange={handleAgeChange}
              placeholder="दिन (Days)"
              className={inputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeceasedInfo;
