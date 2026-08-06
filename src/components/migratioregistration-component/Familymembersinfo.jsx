import { useRef } from "react";
import { toast } from "react-toastify";
import { transliterateToNepali } from "../../utils/nepaliTransliteration";
import * as BS from "bikram-sambat-js";

const EMPTY_MEMBER = {
  member_name_np: "",
  member_name_en: "",
  member_relationship: "",
  member_gender: "",
  member_dob_bs: "",
  member_dob_ad: "",
  member_citizenship_no: "",
  member_remarks: "",
};

// Same relationship values already used for the informant dropdown in the
// birth registration flow, kept identical here since they map to the same
// RelatioshipType enum on the backend.
const RELATIONSHIP_OPTIONS = [
  "बुबा",
  "आमा",
  "हजुरबुबा",
  "हजुरआमा",
  "अभिभावक",
  "अन्य",
];

function FamilyMembersInfo({ setFormData, formData }) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-2 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  const englishRegex = /^[A-Za-z\s]*$/;
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

  const members = formData.family_members;

  const updateMember = (index, patch) => {
    setFormData((prev) => {
      const updated = [...prev.family_members];
      updated[index] = { ...updated[index], ...patch };
      return { ...prev, family_members: updated };
    });
  };

  const bufferKey = (index) => `member_${index}_np`;

  const updateNepaliField = (index, romanValue) => {
    romanBuffer.current[bufferKey(index)] = romanValue;
    updateMember(index, { member_name_np: transliterateToNepali(romanValue) });
  };

  const handleNepaliKeyDown = (e, index) => {
    if (e.ctrlKey || e.metaKey) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const buf = (romanBuffer.current[bufferKey(index)] || "").slice(0, -1);
      updateNepaliField(index, buf);
      return;
    }

    if (passthroughKeys.includes(e.key)) return;

    if (e.key.length === 1) {
      e.preventDefault();
      const buf = (romanBuffer.current[bufferKey(index)] || "") + e.key;
      updateNepaliField(index, buf);
    }
  };

  const handleNepaliPaste = (e, index) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const buf = (romanBuffer.current[bufferKey(index)] || "") + pasted;
    updateNepaliField(index, buf);
  };

  const handleNameEnChange = (index, value) => {
    if (!englishRegex.test(value)) {
      toast.error("Please enter English letters only.");
      return;
    }
    updateMember(index, { member_name_en: value });
  };

  const handleCitizenshipChange = (index, value) => {
    if (!/^[0-9-]*$/.test(value)) return;
    updateMember(index, { member_citizenship_no: value });
  };

  const handleDobChange = (index, adDate) => {
    const date = new Date(adDate);
    const now = new Date();
    if (date > now) {
      toast.error("Date of birth must be in the past");
      return;
    }
    const bsDate = adDate ? BS.ADToBS(adDate) : "";
    updateMember(index, { member_dob_ad: adDate, member_dob_bs: bsDate });
  };

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      family_members: [...prev.family_members, { ...EMPTY_MEMBER }],
    }));
  };

  const removeMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      family_members: prev.family_members.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-teal-700">
          परिवारका सदस्यहरुको विवरण (Family Members Details)
        </h2>
        <button
          type="button"
          onClick={addMember}
          className="bg-teal-100 hover:bg-teal-200 text-teal-700 font-medium px-4 py-2 rounded-md cursor-pointer transition-colors"
        >
          + सदस्य थप्नुहोस् (Add Member)
        </button>
      </div>

      {members.map((member, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 mb-4 relative"
        >
          {members.length > 1 && (
            <button
              type="button"
              onClick={() => removeMember(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm cursor-pointer"
            >
              ✕ हटाउनुहोस्
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label>नाम (English)</label>
              <input
                type="text"
                value={member.member_name_en}
                onChange={(e) => handleNameEnChange(index, e.target.value)}
                placeholder="Full Name"
                className={inputStyle}
              />
            </div>
            <div>
              <label>नाम (नेपालीमा)</label>
              <input
                type="text"
                value={member.member_name_np}
                onKeyDown={(e) => handleNepaliKeyDown(e, index)}
                onPaste={(e) => handleNepaliPaste(e, index)}
                onChange={() => {}}
                placeholder="English मा टाइप गर्नुहोस्"
                className={inputStyle}
              />
            </div>
            <div>
              <label>सम्बन्ध (Relationship)</label>
              <select
                value={member.member_relationship}
                onChange={(e) =>
                  updateMember(index, { member_relationship: e.target.value })
                }
                className={`${inputStyle} bg-white`}
              >
                <option value="">-- छान्नुहोस् --</option>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>लिंग (Sex)</label>
              <select
                value={member.member_gender}
                onChange={(e) =>
                  updateMember(index, { member_gender: e.target.value })
                }
                className={`${inputStyle} bg-white`}
              >
                <option value="">-- छान्नुहोस् --</option>
                <option value="MALE">पुरुष (Male)</option>
                <option value="FEMALE">महिला (Female)</option>
                <option value="OTHER">अन्य (Other)</option>
              </select>
            </div>
            <div>
              <label>जन्म मिति (AD)</label>
              <input
                type="date"
                value={member.member_dob_ad}
                onChange={(e) => handleDobChange(index, e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label>जन्म मिति (वि.सं.)</label>
              <input
                type="text"
                value={member.member_dob_bs}
                readOnly
                className={inputStyle}
              />
            </div>

            <div>
              <label>नागरिकता नं.</label>
              <input
                type="text"
                value={member.member_citizenship_no}
                onChange={(e) => handleCitizenshipChange(index, e.target.value)}
                placeholder="12-34-56789"
                className={inputStyle}
              />
            </div>
            <div className="md:col-span-2">
              <label>कैफियत (Remarks)</label>
              <input
                type="text"
                value={member.member_remarks}
                onChange={(e) =>
                  updateMember(index, { member_remarks: e.target.value })
                }
                placeholder="कैफियत (यदि छ भने)"
                className={inputStyle}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FamilyMembersInfo;
