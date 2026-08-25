// components/recommendation-component/EditRecommendationLetterCitizen.jsx
import { useRef, useState } from "react";
import { toast } from "react-toastify";

import API_URL from "../../api/api";
import { transliterateToNepali } from "../../utils/nepaliTransliteration";

const LETTER_TYPES = [
  { value: "RESIDENCE_PROOF", label: "बसोबास प्रमाणित (Residence Proof)" },
  { value: "UNMARRIED_STATUS", label: "अविवाहित प्रमाणित (Unmarried Status)" },
  {
    value: "CHARACTER_CERTIFICATE",
    label: "चालचलन प्रमाणित (Character Certificate)",
  },
  {
    value: "INCOME_STATEMENT",
    label: "आर्थिक अवस्था प्रमाणित (Income Statement)",
  },
  { value: "RELATIONSHIP_PROOF", label: "नाता प्रमाणित (Relationship Proof)" },
  {
    value: "LAND_OWNERSHIP_PROOF",
    label: "जग्गा स्वामित्व प्रमाणित (Land Ownership Proof)",
  },
  { value: "OTHER", label: "अन्य (Other)" },
];

const inputStyle =
  "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const englishRegex = /^[A-Za-z\s]*$/;
const CITIZENSHIP_REGEX = /^[0-9-]+$/;

// The API (RecommendationLetterResponse) returns address fields FLAT on
// the letter itself — no `.address` wrapper, unlike the create form's
// in-memory formData shape. See the normalizeAddress() comment in
// RecommendationPreview.jsx for the same distinction. This edit form
// works directly against that flat shape since it's built from a
// fetched/existing letter, not from the create form's local state.
function buildFormDataFromLetter(letter) {
  return {
    letter_id: letter.letter_id,
    letter_type: letter.letter_type || "",
    letter_type_other: letter.letter_type_other || "",
    applicant_full_name_np: letter.applicant_full_name_np || "",
    applicant_full_name_en: letter.applicant_full_name_en || "",
    applicant_citizenship_no: letter.applicant_citizenship_no || "",
    applicant_contact_no: letter.applicant_contact_no || "",
    purpose: letter.purpose || "",
    register_ward_id: letter.register_ward_id || "",
    applicant_province: letter.applicant_province || "",
    applicant_district: letter.applicant_district || "",
    applicant_municipality: letter.applicant_municipality || "",
    applicant_ward_number: letter.applicant_ward_number || "",
    applicant_tole: letter.applicant_tole || "",
    ward_nepali_province: letter.ward_nepali_province || "",
    ward_nepali_district: letter.ward_nepali_district || "",
    ward_nepali_municipality: letter.ward_nepali_municipality || "",
    ward_nepali_name: letter.ward_nepali_name || "",
    ward_type: letter.ward_type || "",
  };
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

function validate(form) {
  const e = {};
  if (!form.letter_type) e.letter_type = "Please select a letter type.";
  if (form.letter_type === "OTHER" && !form.letter_type_other.trim())
    e.letter_type_other = "Please specify the letter type.";

  if (!form.applicant_full_name_en.trim())
    e.applicant_full_name_en = "Full name (English) is required.";
  else if (!englishRegex.test(form.applicant_full_name_en))
    e.applicant_full_name_en = "Please enter English letters only.";

  if (!form.applicant_full_name_np.trim())
    e.applicant_full_name_np = "Full name (Nepali) is required.";

  if (!form.applicant_citizenship_no.trim())
    e.applicant_citizenship_no = "Citizenship number is required.";
  else if (!CITIZENSHIP_REGEX.test(form.applicant_citizenship_no))
    e.applicant_citizenship_no =
      "Use digits and dashes only (e.g. 12-34-56789).";

  if (
    form.applicant_contact_no &&
    !/^9[678]\d{8}$/.test(form.applicant_contact_no)
  )
    e.applicant_contact_no = "Enter a valid Nepali mobile number.";

  if (!form.purpose.trim()) e.purpose = "Purpose is required.";
  else if (form.purpose.trim().length < 10)
    e.purpose = "Please describe the purpose in a bit more detail.";

  return e;
}

function EditRecommendationLetterCitizen({ letter, onClose, onSaved }) {
  const [formData, setFormData] = useState(() =>
    buildFormDataFromLetter(letter),
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const rejections = Array.isArray(letter.reject) ? letter.reject : [];

  // roman → Nepali transliteration buffers, same pattern as the create
  // form (RecommendationLetter.jsx) — kept separate per field since the
  // Nepali text produced isn't reversible back into the Roman keystrokes
  // that typed it.
  const nameBuffer = useRef(formData.applicant_full_name_np ? "" : "");
  const purposeBuffer = useRef("");

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

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleContactChange(e) {
    const value = e.target.value;
    if (value && isNaN(Number(value))) return;
    if (value.length > 10) return;
    setFormData((p) => ({ ...p, applicant_contact_no: value }));
    if (errors.applicant_contact_no)
      setErrors((prev) => ({ ...prev, applicant_contact_no: undefined }));
  }

  function handleCitizenshipChange(e) {
    const value = e.target.value;
    if (!/^[0-9-]*$/.test(value)) return;
    setFormData((p) => ({ ...p, applicant_citizenship_no: value }));
    if (errors.applicant_citizenship_no)
      setErrors((prev) => ({ ...prev, applicant_citizenship_no: undefined }));
  }

  const updateNepaliName = (romanValue) => {
    nameBuffer.current = romanValue;
    setFormData((p) => ({
      ...p,
      applicant_full_name_np: transliterateToNepali(romanValue),
    }));
    if (errors.applicant_full_name_np)
      setErrors((prev) => ({ ...prev, applicant_full_name_np: undefined }));
  };

  const handleNepaliNameKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      updateNepaliName(nameBuffer.current.slice(0, -1));
      return;
    }
    if (passthroughKeys.includes(e.key)) return;
    if (e.key.length === 1) {
      e.preventDefault();
      updateNepaliName(nameBuffer.current + e.key);
    }
  };

  const handleNepaliNamePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    updateNepaliName(nameBuffer.current + pasted);
  };

  const updatePurpose = (romanValue) => {
    purposeBuffer.current = romanValue;
    setFormData((p) => ({
      ...p,
      purpose: transliterateToNepali(romanValue),
    }));
    if (errors.purpose) setErrors((prev) => ({ ...prev, purpose: undefined }));
  };

  const handlePurposeKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      updatePurpose(purposeBuffer.current.slice(0, -1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      updatePurpose(purposeBuffer.current + "\n");
      return;
    }
    if (passthroughKeys.includes(e.key)) return;
    if (e.key.length === 1) {
      e.preventDefault();
      updatePurpose(purposeBuffer.current + e.key);
    }
  };

  const handlePurposePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    updatePurpose(purposeBuffer.current + pasted);
  };

  async function handleResubmit(e) {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/v1/recommendation-letter/${letter.letter_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            register_status: "SUBMITTED",
            letter_type: formData.letter_type,
            letter_type_other: formData.letter_type_other,
            applicant_full_name_np: formData.applicant_full_name_np,
            applicant_full_name_en: formData.applicant_full_name_en,
            applicant_citizenship_no: formData.applicant_citizenship_no,
            applicant_contact_no: formData.applicant_contact_no,
            purpose: formData.purpose,
            applicant_tole: formData.applicant_tole,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw data;

      toast.success("Recommendation letter resubmitted for review!");
      onSaved?.();
    } catch (err) {
      console.error("Resubmission failed:", err);
      toast.error(err?.detail || "Failed to resubmit recommendation letter.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {rejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-700 font-semibold mb-2">
            ✕ यो सिफारिस अस्वीकृत गरिएको छ (This recommendation was rejected)
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
        {/* ── Letter type ── */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            सिफारिसको प्रकार (Letter Type)
          </h2>
          <div>
            <label>सिफारिसको प्रकार (Letter Type)</label>
            <select
              name="letter_type"
              value={formData.letter_type}
              onChange={handleChange}
              className={`${inputStyle} bg-white ${errors.letter_type ? "border-red-400" : ""}`}
            >
              <option value="">-- प्रकार छान्नुहोस् (Select Type) --</option>
              {LETTER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <FieldError msg={errors.letter_type} />
          </div>

          {formData.letter_type === "OTHER" && (
            <div className="mt-4">
              <label>अन्य प्रकार खुलाउनुहोस् (Specify Type)</label>
              <input
                type="text"
                name="letter_type_other"
                value={formData.letter_type_other}
                onChange={handleChange}
                placeholder="प्रकार लेख्नुहोस्"
                className={`${inputStyle} ${errors.letter_type_other ? "border-red-400" : ""}`}
              />
              <FieldError msg={errors.letter_type_other} />
            </div>
          )}
        </div>

        {/* ── Applicant info ── */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            निवेदकको जानकारी (Applicant Information)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Full Name (English)</label>
              <input
                type="text"
                name="applicant_full_name_en"
                value={formData.applicant_full_name_en}
                onChange={handleChange}
                placeholder="पूरा नाम लेख्नुहोस् (Enter Full Name)"
                className={`${inputStyle} ${errors.applicant_full_name_en ? "border-red-400" : ""}`}
              />
              <FieldError msg={errors.applicant_full_name_en} />
            </div>
            <div>
              <label>पूरा नाम (Nepali)</label>
              <input
                type="text"
                value={formData.applicant_full_name_np}
                onKeyDown={handleNepaliNameKeyDown}
                onPaste={handleNepaliNamePaste}
                onChange={() => {}}
                placeholder="यहाँ English मा टाइप गर्नुहोस्, नेपालीमा देखिनेछ"
                className={`${inputStyle} ${errors.applicant_full_name_np ? "border-red-400" : ""}`}
              />
              <FieldError msg={errors.applicant_full_name_np} />
            </div>

            <div>
              <label>नागरिकता नम्बर (Citizenship Number)</label>
              <input
                type="text"
                name="applicant_citizenship_no"
                value={formData.applicant_citizenship_no}
                onChange={handleCitizenshipChange}
                placeholder="12-34-56789"
                className={`${inputStyle} ${errors.applicant_citizenship_no ? "border-red-400" : ""}`}
              />
              <FieldError msg={errors.applicant_citizenship_no} />
            </div>
            <div>
              <label>
                फोन नम्बर (Phone Number) <i>(Optional)</i>
              </label>
              <input
                type="tel"
                name="applicant_contact_no"
                value={formData.applicant_contact_no}
                onChange={handleContactChange}
                placeholder="98XXXXXXXX"
                className={`${inputStyle} ${errors.applicant_contact_no ? "border-red-400" : ""}`}
              />
              <FieldError msg={errors.applicant_contact_no} />
            </div>
          </div>
        </div>

        {/* ── Address — read-only summary; register_ward_id/address are
             set by the backend from the account and aren't editable here,
             same restriction the create form applies for non-override
             letter types. Only tole is editable. ── */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-green-700 mb-2">
            ठेगाना (Address)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="block text-gray-500">प्रदेश (Province)</span>
              <span className="font-medium">
                {formData.ward_nepali_province} ({formData.applicant_province})
              </span>
            </div>
            <div>
              <span className="block text-gray-500">जिल्ला (District)</span>
              <span className="font-medium">
                {formData.ward_nepali_district} ({formData.applicant_district})
              </span>
            </div>
            <div>
              <span className="block text-gray-500">
                नगरपालिका (Municipality)
              </span>
              <span className="font-medium">
                {formData.ward_nepali_municipality} (
                {formData.applicant_municipality})
              </span>
            </div>
            <div>
              <span className="block text-gray-500">वडा नं. (Ward No.)</span>
              <span className="font-medium">
                {formData.ward_nepali_name} — Ward{" "}
                {formData.applicant_ward_number}
              </span>
            </div>
          </div>
          <div>
            <label>टोल / सडक (Tole / Street)</label>
            <input
              type="text"
              name="applicant_tole"
              value={formData.applicant_tole}
              onChange={handleChange}
              placeholder="टोल वा सडकको नाम"
              className={inputStyle}
            />
          </div>
        </div>

        {/* ── Purpose ── */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            प्रयोजन (Purpose)
          </h2>
          <textarea
            value={formData.purpose}
            onKeyDown={handlePurposeKeyDown}
            onPaste={handlePurposePaste}
            onChange={() => {}}
            rows={4}
            placeholder="यहाँ English मा टाइप गर्नुहोस्, नेपालीमा देखिनेछ (Type in English here, it will show in Nepali)"
            className={`${inputStyle} resize-vertical ${errors.purpose ? "border-red-400" : ""}`}
          />
          <FieldError msg={errors.purpose} />
        </div>

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

export default EditRecommendationLetterCitizen;
