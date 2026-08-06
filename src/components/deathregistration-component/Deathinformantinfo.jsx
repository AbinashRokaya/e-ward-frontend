import { useRef } from "react";
import { toast } from "react-toastify";
import { transliterateToNepali } from "../../utils/nepaliTransliteration";
import * as BS from "bikram-sambat-js";

// NOTE: RelatioshipType is shared with the birth registration nominee
// enum. The options below extend that list with relations relevant to a
// death informant — verify the exact enum values in enums/death_enum.py
// (or model/enums.py) before shipping, since a mismatch here will 422.
const RELATIONSHIP_OPTIONS = [
  { value: "छोरा", label: "छोरा (Son)" },
  { value: "छोरी", label: "छोरी (Daughter)" },
  { value: "पति", label: "पति (Husband)" },
  { value: "पत्नी", label: "पत्नी (Wife)" },
  { value: "बुबा", label: "बुबा (Father)" },
  { value: "आमा", label: "आमा (Mother)" },
  { value: "दाजुभाइ", label: "दाजुभाइ (Brother)" },
  { value: "दिदीबहिनी", label: "दिदीबहिनी (Sister)" },
  { value: "आफन्त", label: "आफन्त (Relative)" },
  { value: "अन्य", label: "अन्य (Other)" },
];

function DeathInformantInfo({ setFormData, formData }) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:invalid:border-blue-500 focus:invalid:ring-blue-500";

  const informant = formData.informant;
  const romanBuffer = useRef("");

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

  const updateNepaliName = (romanValue) => {
    romanBuffer.current = romanValue;
    setFormData((prev) => ({
      ...prev,
      informant: {
        ...prev.informant,
        informant_name: transliterateToNepali(romanValue),
      },
    }));
  };

  const handleNepaliKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      updateNepaliName(romanBuffer.current.slice(0, -1));
      return;
    }

    if (passthroughKeys.includes(e.key)) return;

    if (e.key.length === 1) {
      e.preventDefault();
      updateNepaliName(romanBuffer.current + e.key);
    }
  };

  const handleNepaliPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    updateNepaliName(romanBuffer.current + pasted);
  };

  const handleInformantChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      informant: { ...prev.informant, [name]: value },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-orange-700 mb-6">
        सूचनादाताको जानकारी (Informant Information)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>नाम (Name)</label>
          <input
            type="text"
            name="informant_name"
            value={informant.informant_name}
            onKeyDown={handleNepaliKeyDown}
            onPaste={handleNepaliPaste}
            onChange={() => {}}
            placeholder="यहाँ English मा टाइप गर्नुहोस्, नेपालीमा देखिनेछ"
            required
            className={inputStyle}
          />
        </div>

        <div>
          <label>मृतकसँगको सम्बन्ध (Relationship to Deceased)</label>
          <select
            name="informant_relationship"
            value={informant.informant_relationship}
            onChange={handleInformantChange}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- सम्बन्ध छान्नुहोस् --</option>
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>
            फोन नम्बर (Phone Number) <i>(Optional)</i>
          </label>
          <input
            type="tel"
            name="informant_contact_no"
            value={informant.informant_contact_no}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                handleInformantChange({
                  target: { name: "informant_contact_no", value: "" },
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
              handleInformantChange({
                target: { name: "informant_contact_no", value },
              });
            }}
            placeholder="98XXXXXXXX"
            className={inputStyle}
          />
        </div>

        <div>
          <label>घोषणा मिति (AD)</label>
          <input
            type="date"
            onChange={(e) => {
              const adDate = e.target.value;
              if (adDate === "") return;
              const bsDate = BS.ADToBS(adDate);
              setFormData((prev) => ({
                ...prev,
                informant: {
                  ...prev.informant,
                  declared_date_bs: bsDate,
                },
              }));
            }}
            required
            className={inputStyle}
          />
        </div>
        <div>
          <label>घोषणा मिति (BS)</label>
          <input
            type="text"
            value={informant.declared_date_bs}
            readOnly
            className={`${inputStyle} bg-gray-100`}
          />
        </div>
      </div>
    </div>
  );
}

export default DeathInformantInfo;
