import { useRef } from "react";
import { toast } from "react-toastify";
import { transliterateToNepali } from "../../utils/nepaliTransliteration";

// English label + the Nepali value that actually gets saved.
// Add/remove entries here as needed — this list drives the dropdown.
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
  { en: "Unemployed", np: "बेरोजगार" },
  { en: "Student", np: "विद्यार्थी" },
  { en: "Other", np: "अन्य" },
];

const NATIONALITY_OPTIONS = [
  { en: "Nepali", np: "नेपाली" },
  { en: "Indian", np: "भारतीय" },
  { en: "Chinese", np: "चिनियाँ" },
  { en: "Other", np: "अन्य" },
];

function FatherInfo({ setFormData, formData, handleChange }) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:invalid:border-blue-500 focus:invalid:ring-blue-500";

  const englishRegex = /^[A-Za-z\s]*$/;

  // Find father from parents array
  const fatherIndex = formData.parents.findIndex(
    (p) => p.parent_type === "FATHER",
  );
  const father = formData.parents[fatherIndex];

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
    setFormData((prev) => {
      const updatedParents = [...prev.parents];
      updatedParents[fatherIndex] = {
        ...updatedParents[fatherIndex],
        [fieldName]: transliterateToNepali(romanValue),
      };
      return { ...prev, parents: updatedParents };
    });
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

  const handleFatherChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    if (
      ["parent_first_name", "parent_middle_name", "parent_last_name"].includes(
        name,
      )
    ) {
      if (!englishRegex.test(value)) {
        toast.error("Please enter English letters only.");
        return;
      }
    }

    setFormData((prev) => {
      const updatedParents = [...prev.parents];
      updatedParents[fatherIndex] = {
        ...updatedParents[fatherIndex],
        [name]: value,
      };
      return { ...prev, parents: updatedParents };
    });
  };

  // Select fields store the Nepali value directly (option value="np"),
  // so this can reuse the same setFormData pattern as handleFatherChange —
  // no separate handler needed since the <option value> IS already Nepali.
  const handleFatherSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedParents = [...prev.parents];
      updatedParents[fatherIndex] = {
        ...updatedParents[fatherIndex],
        [name]: value,
      };
      return { ...prev, parents: updatedParents };
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6">
        बाबुको जानकारी (Father Information)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>First Name(English)</label>
          <input
            type="text"
            name="parent_first_name"
            value={father.parent_first_name}
            onChange={handleFatherChange}
            placeholder="पहिलो नाम लेख्नुहोस् (Enter First Name)"
            required
            className={inputStyle}
          />
        </div>
        <div>
          <label>पहिलो नाम (Nepali)</label>
          <input
            type="text"
            name="parent_nepali_first_name"
            value={father.parent_nepali_first_name}
            onKeyDown={(e) =>
              handleNepaliKeyDown(e, "parent_nepali_first_name")
            }
            onPaste={(e) => handleNepaliPaste(e, "parent_nepali_first_name")}
            onChange={() => {}}
            placeholder="यहाँ English मा टाइप गर्नुहोस्, नेपालीमा देखिनेछ"
            required
            className={inputStyle}
          />
        </div>

        <div>
          <label>
            Middle Name(English) <i>(Optional)</i>
          </label>
          <input
            type="text"
            name="parent_middle_name"
            value={father.parent_middle_name}
            onChange={handleFatherChange}
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
            name="parent_nepali_middle_name"
            value={father.parent_nepali_middle_name}
            onKeyDown={(e) =>
              handleNepaliKeyDown(e, "parent_nepali_middle_name")
            }
            onPaste={(e) => handleNepaliPaste(e, "parent_nepali_middle_name")}
            onChange={() => {}}
            placeholder="यहाँ English मा टाइप गर्नुहोस्"
            className={inputStyle}
          />
        </div>

        <div>
          <label>Last Name(English)</label>
          <input
            type="text"
            name="parent_last_name"
            value={father.parent_last_name}
            onChange={handleFatherChange}
            placeholder="थर लेख्नुहोस् (Enter Last Name)"
            required
            className={inputStyle}
          />
        </div>
        <div>
          <label>थर (Last Name)</label>
          <input
            type="text"
            name="parent_nepali_last_name"
            value={father.parent_nepali_last_name}
            onKeyDown={(e) => handleNepaliKeyDown(e, "parent_nepali_last_name")}
            onPaste={(e) => handleNepaliPaste(e, "parent_nepali_last_name")}
            onChange={() => {}}
            placeholder="यहाँ English मा टाइप गर्नुहोस्"
            required
            className={inputStyle}
          />
        </div>

        <div>
          <label>पेशा (Occupation)</label>
          <select
            name="parent_occupation"
            value={father.parent_occupation}
            onChange={handleFatherSelectChange}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- पेशा छान्नुहोस् (Select Occupation) --</option>
            {OCCUPATION_OPTIONS.map((opt) => (
              <option key={opt.np} value={opt.np}>
                {opt.en} ({opt.np})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>राष्ट्रियता (Nationality)</label>
          <select
            name="parent_nationality"
            value={father.parent_nationality}
            onChange={handleFatherSelectChange}
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
          <label>फोन नम्बर (Phone Number)</label>
          <input
            type="tel"
            name="parent_contact_no"
            value={father.parent_contact_no}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                setFormData((prev) => {
                  const updatedParents = [...prev.parents];
                  updatedParents[fatherIndex] = {
                    ...updatedParents[fatherIndex],
                    parent_contact_no: "",
                  };
                  return { ...prev, parents: updatedParents };
                });
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

              setFormData((prev) => {
                const updatedParents = [...prev.parents];
                updatedParents[fatherIndex] = {
                  ...updatedParents[fatherIndex],
                  parent_contact_no: value,
                };
                return { ...prev, parents: updatedParents };
              });
            }}
            required
            placeholder="98XXXXXXXX"
            className={inputStyle}
          />
        </div>
      </div>

      <div>
        <label>नागरिकता नम्बर (Citizenship Number)</label>
        <input
          type="text"
          name="parent_citizenship_no"
          value={father.parent_citizenship_no}
          onChange={(e) => {
            const value = e.target.value;

            if (!/^[0-9-]*$/.test(value)) return;

            setFormData((prev) => {
              const updatedParents = [...prev.parents];
              updatedParents[fatherIndex] = {
                ...updatedParents[fatherIndex],
                parent_citizenship_no: value,
              };

              return {
                ...prev,
                parents: updatedParents,
              };
            });
          }}
          placeholder="12-34-56789"
          className={inputStyle}
        />
      </div>
    </div>
  );
}

export default FatherInfo;
