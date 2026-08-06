import React, { useRef } from "react";
import { toast } from "react-toastify";
import { transliterateToNepali } from "../../utils/nepaliTransliteration";

function InformantInfo({ setFormData, formData }) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:invalid:border-blue-500 focus:invalid:ring-blue-500";

  const englishRegex = /^[A-Za-z\s]*$/;

  const nominee = formData.nominees?.[0] || {};

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
      const currentNominees = Array.isArray(prev.nominees)
        ? prev.nominees
        : [{}];
      return {
        ...prev,
        nominees: [
          {
            ...currentNominees[0],
            [fieldName]: transliterateToNepali(romanValue),
          },
        ],
      };
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

  const handleNomineeChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    if (
      [
        "nominee_first_name",
        "nominee_middle_name",
        "nominee_last_name",
      ].includes(name)
    ) {
      if (!englishRegex.test(value)) {
        toast.error("Please enter English letters only.");
        return;
      }
    }

    setFormData((prev) => {
      const currentNominees = Array.isArray(prev.nominees)
        ? prev.nominees
        : [{}];

      return {
        ...prev,
        nominees: [
          {
            ...currentNominees[0],
            [name]: value,
          },
        ],
      };
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-orange-700 mb-6">
        सूचनादाताको जानकारी (Informant Information)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>First Name(English)</label>
          <input
            type="text"
            name="nominee_first_name"
            value={nominee.nominee_first_name || ""}
            onChange={handleNomineeChange}
            placeholder="पहिलो नाम लेख्नुहोस् (Enter First Name)"
            required
            className={inputStyle}
          />
        </div>
        <div>
          <label>पहिलो नाम (Nepali)</label>
          <input
            type="text"
            name="nominee_nepali_first_name"
            value={nominee.nominee_nepali_first_name || ""}
            onKeyDown={(e) =>
              handleNepaliKeyDown(e, "nominee_nepali_first_name")
            }
            onPaste={(e) => handleNepaliPaste(e, "nominee_nepali_first_name")}
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
            name="nominee_middle_name"
            value={nominee.nominee_middle_name || ""}
            onChange={handleNomineeChange}
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
            name="nominee_nepali_middle_name"
            value={nominee.nominee_nepali_middle_name || ""}
            onKeyDown={(e) =>
              handleNepaliKeyDown(e, "nominee_nepali_middle_name")
            }
            onPaste={(e) => handleNepaliPaste(e, "nominee_nepali_middle_name")}
            onChange={() => {}}
            placeholder="यहाँ English मा टाइप गर्नुहोस्"
            className={inputStyle}
          />
        </div>

        <div>
          <label>Last Name(English)</label>
          <input
            type="text"
            name="nominee_last_name"
            value={nominee.nominee_last_name || ""}
            onChange={handleNomineeChange}
            placeholder="थर लेख्नुहोस् (Enter Last Name)"
            required
            className={inputStyle}
          />
        </div>
        <div>
          <label>थर (Last Name)</label>
          <input
            type="text"
            name="nominee_nepali_last_name"
            value={nominee.nominee_nepali_last_name || ""}
            onKeyDown={(e) =>
              handleNepaliKeyDown(e, "nominee_nepali_last_name")
            }
            onPaste={(e) => handleNepaliPaste(e, "nominee_nepali_last_name")}
            onChange={() => {}}
            placeholder="यहाँ English मा टाइप गर्नुहोस्"
            required
            className={inputStyle}
          />
        </div>

        <div>
          <label>बच्चासँगको सम्बन्ध (Relationship to Child)</label>
          <select
            name="nominee_relationship"
            value={nominee.nominee_relationship || ""}
            onChange={handleNomineeChange}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">
              -- सम्बन्ध छान्नुहोस् (Select Relationship) --
            </option>
            <option value="बुबा">बुबा (Father)</option>
            <option value="आमा">आमा (Mother)</option>
            <option value="हजुरबुबा">हजुरबुबा (Grandfather)</option>
            <option value="हजुरआमा">हजुरआमा (Grandmother)</option>
            <option value="अभिभावक">अभिभावक (Guardian)</option>
            <option value="अन्य">अन्य (Other)</option>
          </select>
        </div>

        <div>
          <label>फोन नम्बर (Phone Number)</label>
          <input
            type="tel"
            name="nominee_contact_no"
            value={nominee.nominee_contact_no || ""}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                setFormData((prev) => {
                  const currentNominees = Array.isArray(prev.nominees)
                    ? prev.nominees
                    : [{}];
                  return {
                    ...prev,
                    nominees: [
                      { ...currentNominees[0], nominee_contact_no: "" },
                    ],
                  };
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
                const currentNominees = Array.isArray(prev.nominees)
                  ? prev.nominees
                  : [{}];
                return {
                  ...prev,
                  nominees: [
                    {
                      ...currentNominees[0],
                      nominee_contact_no: value,
                    },
                  ],
                };
              });
            }}
            required
            placeholder="98XXXXXXXX"
            className={inputStyle}
          />
        </div>

        <div>
          <label>नागरिकता नम्बर (Citizenship Number)</label>
          <input
            type="text"
            name="nominee_citizenship_no"
            value={nominee.nominee_citizenship_no || ""}
            onChange={(e) => {
              const value = e.target.value;

              if (!/^[0-9-]*$/.test(value)) return;
              setFormData((prev) => {
                const currentNominees = Array.isArray(prev.nominees)
                  ? prev.nominees
                  : [{}];
                return {
                  ...prev,
                  nominees: [
                    {
                      ...currentNominees[0],
                      nominee_citizenship_no: value,
                    },
                  ],
                };
              });
            }}
            required
            placeholder="12-34-56789"
            className={inputStyle}
          />
        </div>
      </div>

      <div className="mt-4">
        <label>ठेगाना (Address)</label>
        <input
          type="text"
          name="nominee_address"
          value={nominee.nominee_address || ""}
          onChange={handleNomineeChange}
          required
          placeholder="ठेगाना लेख्नुहोस् (Enter Address)"
          className={inputStyle}
        />
      </div>
    </div>
  );
}

export default InformantInfo;
