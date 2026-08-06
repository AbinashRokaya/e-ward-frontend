import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import logo from "../assets/nepal-sarkar.png";
import API_URL from "../api/api";
import RecommendationPreview from "../components/recommendation-component/RecommendationPreview";
import { transliterateToNepali } from "../utils/nepaliTransliteration";

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

// Nepali display labels for the ward_type enum coming back from the backend.
const MUNICIPALITY_TYPE_LABELS = {
  METROPOLITAN_CITY: "महानगरपालिका",
  SUB_METROPOLITAN_CITY: "उपमहानगरपालिका",
  MUNICIPALITY: "नगरपालिका",
  RURAL_MUNICIPALITY: "गाउँपालिका",
};

// Letter types where the applicant may legitimately need to submit to a
// ward OTHER than their own registered ward (e.g. proving they currently
// live somewhere different from their citizenship-registered address).
// Every other letter type is locked to the account's own ward — both here
// (for display) and, authoritatively, on the backend
// (LETTER_TYPES_ALLOWING_DIFFERENT_WARD in recommendation_router.py,
// kept in sync with this set). The backend derives and re-verifies the
// address itself regardless of what this set contains here — this only
// controls what the UI offers to override.
const LETTER_TYPES_ALLOWING_DIFFERENT_WARD = new Set(["RESIDENCE_PROOF"]);

// Which supporting document (beyond citizenship, which every letter type
// needs) is expected for each letter_type, and whether it's mandatory.
const DOCUMENT_REQUIREMENTS = {
  RESIDENCE_PROOF: {
    supportingRequired: true,
    supportingLabel:
      "जग्गाधनी वा घर बहाल सम्झौता (Land Ownership / Rental Agreement)",
  },
  UNMARRIED_STATUS: {
    supportingRequired: false,
    supportingLabel: "सहायक कागजात (Supporting Document, if any)",
  },
  CHARACTER_CERTIFICATE: {
    supportingRequired: false,
    supportingLabel: "सहायक कागजात (Supporting Document, if any)",
  },
  INCOME_STATEMENT: {
    supportingRequired: true,
    supportingLabel: "आर्थिक अवस्था प्रमाणित हुने कागजात (Income Proof)",
  },
  RELATIONSHIP_PROOF: {
    supportingRequired: true,
    supportingLabel: "नाता प्रमाणित हुने कागजात (Relationship Document)",
  },
  LAND_OWNERSHIP_PROOF: {
    supportingRequired: true,
    supportingLabel: "जग्गाधनी प्रमाण पूर्जा (Land Ownership Certificate)",
  },
  OTHER: {
    supportingRequired: false,
    supportingLabel: "सहायक कागजात (Supporting Document, if any)",
  },
};

// Most citizens don't know the exact bureaucratic phrasing ward offices
// expect in the "purpose" field, so we suggest the most common real-world
// reasons each letter type is actually requested for in Nepal.
const PURPOSE_SUGGESTIONS = {
  RESIDENCE_PROOF: [
    "बैंक खाता खोल्नको लागि",
    "नागरिकता प्रमाणपत्र बनाउनको लागि",
    "सवारी चालक अनुमतिपत्र (लाइसेन्स) बनाउनको लागि",
    "विद्यालय/कलेजमा भर्ना हुनको लागि",
  ],
  UNMARRIED_STATUS: [
    "विवाह दर्ता गर्नको लागि",
    "छात्रवृत्ति (स्कलरसिप) आवेदनको लागि",
    "वैदेशिक रोजगार / भिसा प्रयोजनको लागि",
    "राहदानी (पासपोर्ट) बनाउनको लागि",
  ],
  CHARACTER_CERTIFICATE: [
    "जागिर/रोजगारीको लागि निवेदन दिंदा",
    "राहदानी (पासपोर्ट) बनाउनको लागि",
    "वैदेशिक रोजगार प्रयोजनको लागि",
    "विद्यालय/कलेज भर्नाको लागि",
  ],
  INCOME_STATEMENT: [
    "छात्रवृत्ति (स्कलरसिप) आवेदनको लागि",
    "शुल्क छुट (फी वेभर) पाउनको लागि",
    "स्वास्थ्य उपचार सहयोग रकम पाउनको लागि",
    "ऋण (कर्जा) आवेदनको लागि",
  ],
  RELATIONSHIP_PROOF: [
    "बीमा (इन्स्योरेन्स) दाबी गर्नको लागि",
    "सम्पत्ति हक हस्तान्तरण/अंशबण्डाको लागि",
    "राहदानी (पासपोर्ट) मा नाता प्रमाणित गर्नको लागि",
    "पारिवारिक भिसा प्रयोजनको लागि",
  ],
  LAND_OWNERSHIP_PROOF: [
    "बैंक ऋण (कर्जा) लिनको लागि",
    "जग्गा नामसारी वा दर्ताको लागि",
    "मालपोत/घर जग्गा कर तिर्नको लागि",
    "जग्गा बिक्री गर्नको लागि",
  ],
  OTHER: [],
};

const inputStyle =
  "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const initial_data = {
  letter_type: "",
  letter_type_other: "",
  applicant_full_name_np: "",
  applicant_full_name_en: "",
  applicant_citizenship_no: "",
  applicant_contact_no: "",
  purpose: "",
  register_ward_id: "",
  address: {
    applicant_province: "",
    applicant_district: "",
    applicant_municipality: "",
    applicant_ward_number: "",
    applicant_tole: "",
    ward_nepali_province: "",
    ward_nepali_district: "",
    ward_nepali_municipality: "",
    ward_nepali_name: "",
    ward_type: "",
  },
};

const emptyDocuments = () => ({
  applicant_citizenship: {
    front: { file: null, previewUrl: null },
    back: { file: null, previewUrl: null },
  },
  supporting_document: { file: null, previewUrl: null },
});

const englishRegex = /^[A-Za-z\s]*$/;
const CITIZENSHIP_REGEX = /^[0-9-]+$/;

function validate(form, documents) {
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

  if (!form.register_ward_id)
    e["address"] = "We couldn't determine your ward. Please reload the page.";

  if (!form.purpose.trim()) e.purpose = "Purpose is required.";
  else if (form.purpose.trim().length < 10)
    e.purpose = "Please describe the purpose in a bit more detail.";

  if (!documents.applicant_citizenship.front.file)
    e["documents.citizenship_front"] = "Upload the front side of citizenship.";
  if (!documents.applicant_citizenship.back.file)
    e["documents.citizenship_back"] = "Upload the back side of citizenship.";

  const requirement = DOCUMENT_REQUIREMENTS[form.letter_type];
  if (requirement?.supportingRequired && !documents.supporting_document.file)
    e["documents.supporting_document"] =
      `Please upload: ${requirement.supportingLabel}`;

  return e;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

function UploadTile({ label, previewUrl, isPdf, onFileSelected }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-gray-600 text-center">
        {label}
      </span>
      <div className="w-20 h-20 rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
        {previewUrl ? (
          isPdf ? (
            <span className="text-[10px] text-gray-500">PDF</span>
          ) : (
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-contain"
            />
          )
        ) : (
          <span className="text-[10px] text-gray-400">छैन</span>
        )}
      </div>
      <label className="text-xs px-3 py-1.5 rounded-md cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
        {previewUrl ? "बदल्नुहोस्" : "अपलोड गर्नुहोस्"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelected(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

// ── Applicant address section ───────────────────────────────────────────────
// The address is NOT a form the citizen fills in anymore. By default it's
// a plain read-only summary of whatever GET /v1/recommendation-letter/
// my-address returned — the backend resolves this from the logged-in
// account's own ward, so there's no local ward list to search and no
// dropdown state to keep in sync with a "currentUser" prop that may or
// may not have been passed down.
//
// The one exception is RESIDENCE_PROOF, where an applicant may genuinely
// need a ward OTHER than their own to certify where they currently live.
// For that case only, a checkbox unlocks a manual cascading
// province/district/municipality/ward picker (still using the `wards`
// list already passed in from CertificateManager, since that data is
// static reference data, unlike per-user address info). Everywhere else,
// the fields shown are exactly what the backend told us and nothing the
// citizen types here is trusted — the backend re-derives and re-verifies
// the address independently when the form is submitted.
function ApplicantAddressSection({
  wards,
  formData,
  setFormData,
  errors,
  addressLoading,
  addressError,
  myAddress,
  allowOverride,
  overrideChecked,
  onOverrideToggle,
}) {
  const editable = allowOverride && overrideChecked;

  const provinces = useMemo(
    () => [...new Set(wards.map((w) => w.ward_province))].sort(),
    [wards],
  );

  const districts = useMemo(() => {
    if (!formData.address.applicant_province) return [];
    return [
      ...new Set(
        wards
          .filter(
            (w) => w.ward_province === formData.address.applicant_province,
          )
          .map((w) => w.ward_district),
      ),
    ].sort();
  }, [wards, formData.address.applicant_province]);

  const municipalities = useMemo(() => {
    if (
      !formData.address.applicant_province ||
      !formData.address.applicant_district
    )
      return [];
    return [
      ...new Set(
        wards
          .filter(
            (w) =>
              w.ward_province === formData.address.applicant_province &&
              w.ward_district === formData.address.applicant_district,
          )
          .map((w) => w.ward_municipality),
      ),
    ].sort();
  }, [
    wards,
    formData.address.applicant_province,
    formData.address.applicant_district,
  ]);

  const filteredWards = useMemo(() => {
    if (
      !formData.address.applicant_province ||
      !formData.address.applicant_district ||
      !formData.address.applicant_municipality
    )
      return [];

    return wards
      .filter(
        (w) =>
          w.ward_province?.toLowerCase() ===
            formData.address.applicant_province?.toLowerCase() &&
          w.ward_district?.toLowerCase() ===
            formData.address.applicant_district?.toLowerCase() &&
          w.ward_municipality?.toLowerCase() ===
            formData.address.applicant_municipality?.toLowerCase(),
      )
      .sort((a, b) => Number(a.ward_no) - Number(b.ward_no));
  }, [
    wards,
    formData.address.applicant_province,
    formData.address.applicant_district,
    formData.address.applicant_municipality,
  ]);

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    const province = wards.find((w) => w.ward_province === value);
    setFormData((prev) => ({
      ...prev,
      register_ward_id: "",
      address: {
        ...prev.address,
        applicant_province: value,
        applicant_district: "",
        applicant_municipality: "",
        applicant_ward_number: "",
        ward_nepali_province: province?.ward_nepali_province || "",
        ward_nepali_district: "",
        ward_nepali_municipality: "",
        ward_nepali_name: "",
        ward_type: "",
      },
    }));
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    const district = wards.find(
      (w) =>
        w.ward_province === formData.address.applicant_province &&
        w.ward_district === value,
    );
    setFormData((prev) => ({
      ...prev,
      register_ward_id: "",
      address: {
        ...prev.address,
        applicant_district: value,
        applicant_municipality: "",
        applicant_ward_number: "",
        ward_nepali_district: district?.ward_nepali_district || "",
        ward_nepali_municipality: "",
        ward_nepali_name: "",
        ward_type: "",
      },
    }));
  };

  const handleMunicipalityChange = (e) => {
    const value = e.target.value;
    const municipality = wards.find(
      (w) =>
        w.ward_province === formData.address.applicant_province &&
        w.ward_district === formData.address.applicant_district &&
        w.ward_municipality === value,
    );
    setFormData((prev) => ({
      ...prev,
      register_ward_id: "",
      address: {
        ...prev.address,
        applicant_municipality: value,
        applicant_ward_number: "",
        ward_nepali_municipality: municipality?.ward_nepali_municipality || "",
        ward_nepali_name: "",
        ward_type: municipality?.ward_type || "",
      },
    }));
  };

  const handleWardChange = (e) => {
    const wardNo = Number(e.target.value);
    const ward = filteredWards.find((w) => Number(w.ward_no) === wardNo);
    if (!ward) return;
    setFormData((prev) => ({
      ...prev,
      register_ward_id: ward.ward_id,
      address: {
        ...prev.address,
        applicant_ward_number: wardNo,
        ward_nepali_name: ward.ward_nepali_name,
        ward_nepali_province: ward.ward_nepali_province,
        ward_nepali_district: ward.ward_nepali_district,
        ward_nepali_municipality: ward.ward_nepali_municipality,
        ward_type: ward.ward_type,
      },
    }));
  };

  const handleToleChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, applicant_tole: value },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-4">
      <h2 className="text-2xl font-semibold text-green-700 mb-2">
        ठेगाना (Address)
      </h2>

      {addressLoading && (
        <p className="text-sm text-gray-500 mb-4">
          तपाईंको ठेगाना लोड हुँदैछ… (Loading your address…)
        </p>
      )}

      {!addressLoading && addressError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {addressError}
        </div>
      )}

      {!addressLoading && !addressError && !editable && (
        <>
          <p className="text-xs text-gray-500 mb-4">
            यो ठेगाना तपाईंको दर्ता खातामा आधारित छ। (This address comes from
            your registered account.)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500">प्रदेश (Province)</span>
              <span className="font-medium">
                {myAddress?.ward_nepali_province} (
                {myAddress?.applicant_province})
              </span>
            </div>
            <div>
              <span className="block text-gray-500">जिल्ला (District)</span>
              <span className="font-medium">
                {myAddress?.ward_nepali_district} (
                {myAddress?.applicant_district})
              </span>
            </div>
            <div>
              <span className="block text-gray-500">
                नगरपालिका (Municipality)
              </span>
              <span className="font-medium">
                {myAddress?.ward_nepali_municipality} (
                {myAddress?.applicant_municipality})
              </span>
            </div>
            <div>
              <span className="block text-gray-500">वडा नं. (Ward No.)</span>
              <span className="font-medium">
                {myAddress?.ward_nepali_name} — Ward{" "}
                {myAddress?.applicant_ward_number}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">
                स्थानीय तहको प्रकार (Local Unit Type)
              </span>
              <span className="font-medium">
                {MUNICIPALITY_TYPE_LABELS[myAddress?.ward_type] || "—"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <label>टोल / सडक (Tole / Street)</label>
            <input
              type="text"
              value={formData.address.applicant_tole}
              onChange={handleToleChange}
              placeholder="टोल वा सडकको नाम"
              className={inputStyle}
            />
          </div>
        </>
      )}

      {allowOverride && (
        <label className="flex items-start gap-2 mt-4 mb-4 text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-lg p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={overrideChecked}
            onChange={(e) => onOverrideToggle(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            म हाल फरक ठेगानामा बस्छु र सोही वडाबाट सिफारिस चाहन्छु (I currently
            live at a different address and want this recommendation from that
            ward instead)
          </span>
        </label>
      )}

      {editable && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>प्रदेश (Province)</label>
            <select
              value={formData.address.applicant_province}
              onChange={handleProvinceChange}
              className={`${inputStyle} bg-white ${errors["address.applicant_province"] ? "border-red-400" : ""}`}
            >
              <option value="">
                -- प्रदेश छान्नुहोस् (Select Province) --
              </option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <FieldError msg={errors["address.applicant_province"]} />
          </div>

          <div>
            <label>जिल्ला (District)</label>
            <select
              value={formData.address.applicant_district}
              onChange={handleDistrictChange}
              disabled={!formData.address.applicant_province}
              className={`${inputStyle} bg-white ${errors["address.applicant_district"] ? "border-red-400" : ""}`}
            >
              <option value="">
                -- जिल्ला छान्नुहोस् (Select District) --
              </option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <FieldError msg={errors["address.applicant_district"]} />
          </div>

          <div>
            <label>नगरपालिका / गाउँपालिका (Municipality)</label>
            <select
              value={formData.address.applicant_municipality}
              onChange={handleMunicipalityChange}
              disabled={!formData.address.applicant_district}
              className={`${inputStyle} bg-white ${errors["address.applicant_municipality"] ? "border-red-400" : ""}`}
            >
              <option value="">
                -- नगरपालिका छान्नुहोस् (Select Municipality) --
              </option>
              {municipalities.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <FieldError msg={errors["address.applicant_municipality"]} />
          </div>

          <div>
            <label>वडा नं. (Ward No.)</label>
            <select
              value={formData.address.applicant_ward_number}
              onChange={handleWardChange}
              disabled={!formData.address.applicant_municipality}
              className={`${inputStyle} bg-white ${errors["address.applicant_ward_number"] ? "border-red-400" : ""}`}
            >
              <option value="">-- वडा छान्नुहोस् (Select Ward) --</option>
              {filteredWards.map((w) => (
                <option key={w.ward_id} value={w.ward_no}>
                  Ward {w.ward_no} — {w.ward_name}
                </option>
              ))}
            </select>
            <FieldError msg={errors["address.applicant_ward_number"]} />
          </div>

          <div className="md:col-span-2">
            <label>टोल / सडक (Tole / Street)</label>
            <input
              type="text"
              value={formData.address.applicant_tole}
              onChange={handleToleChange}
              placeholder="टोल वा सडकको नाम"
              className={inputStyle}
            />
          </div>
        </div>
      )}

      <FieldError msg={errors["address"]} />
    </div>
  );
}

function RecommendationLetter({ wards = [] }) {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(initial_data);
  const [documents, setDocuments] = useState(emptyDocuments());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // The address as returned by GET /v1/recommendation-letter/my-address.
  // This is fetched directly from the backend — it does NOT depend on a
  // wards list or a currentUser prop being passed down correctly.
  const [myAddress, setMyAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");

  // Whether the citizen has ticked "I live at a different address" for a
  // letter type that permits it (currently only RESIDENCE_PROOF).
  const [addressOverride, setAddressOverride] = useState(false);

  const allowOverride = LETTER_TYPES_ALLOWING_DIFFERENT_WARD.has(
    formData.letter_type,
  );

  function applyMyAddressToForm(addr) {
    setFormData((prev) => ({
      ...prev,
      register_ward_id: addr.register_ward_id,
      address: {
        ...prev.address,
        applicant_province: addr.applicant_province,
        applicant_district: addr.applicant_district,
        applicant_municipality: addr.applicant_municipality,
        applicant_ward_number: addr.applicant_ward_number,
        ward_nepali_province: addr.ward_nepali_province,
        ward_nepali_district: addr.ward_nepali_district,
        ward_nepali_municipality: addr.ward_nepali_municipality,
        ward_nepali_name: addr.ward_nepali_name,
        ward_type: addr.ward_type,
      },
    }));
  }

  function clearAddressForOverride() {
    setFormData((prev) => ({
      ...prev,
      register_ward_id: "",
      address: {
        ...initial_data.address,
        applicant_tole: prev.address.applicant_tole,
      },
    }));
  }

  // Fetch the citizen's own address straight from the backend on mount.
  // This replaces any client-side "find my ward in a wards list using a
  // currentUser prop" logic — the backend already knows who the logged-in
  // user is (same session cookie every other request here uses) and
  // resolves the address itself.
  useEffect(() => {
    let cancelled = false;
    setAddressLoading(true);
    setAddressError("");

    fetch(`${API_URL}/v1/recommendation-letter/my-address`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        }),
      )
      .then((data) => {
        if (cancelled) return;
        setMyAddress(data.data);
        applyMyAddressToForm(data.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setAddressError(
          err?.detail ||
            "तपाईंको ठेगाना लोड गर्न सकिएन। (Could not load your address.)",
        );
      })
      .finally(() => {
        if (!cancelled) setAddressLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the citizen switches letter type away from one that allows an
  // override, snap the address straight back to their own account address.
  useEffect(() => {
    if (!allowOverride) {
      setAddressOverride(false);
      if (myAddress) applyMyAddressToForm(myAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.letter_type]);

  function handleAddressOverrideToggle(checked) {
    setAddressOverride(checked);
    if (!checked && myAddress) {
      applyMyAddressToForm(myAddress);
    } else if (checked) {
      clearAddressForOverride();
    }
  }

  // roman → Nepali transliteration buffer for the applicant's Nepali name
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
      updateNepaliName(romanBuffer.current.slice(0, -1));
      return;
    }
    if (passthroughKeys.includes(e.key)) return;
    if (e.key.length === 1) {
      e.preventDefault();
      updateNepaliName(romanBuffer.current + e.key);
    }
  };

  const handleNepaliNamePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    updateNepaliName(romanBuffer.current + pasted);
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handlePurposeSuggestionClick(text) {
    setFormData((p) => ({ ...p, purpose: text }));
    if (errors.purpose) setErrors((prev) => ({ ...prev, purpose: undefined }));
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

  function handleDocumentSelect(key, file, side) {
    setDocuments((prev) => {
      const previewUrl =
        file.type === "application/pdf" ? "pdf" : URL.createObjectURL(file);

      if (side) {
        const prevSlot = prev[key]?.[side];
        if (prevSlot?.previewUrl && prevSlot.previewUrl !== "pdf")
          URL.revokeObjectURL(prevSlot.previewUrl);
        return {
          ...prev,
          [key]: { ...prev[key], [side]: { file, previewUrl } },
        };
      }

      if (prev[key]?.previewUrl && prev[key].previewUrl !== "pdf")
        URL.revokeObjectURL(prev[key].previewUrl);
      return { ...prev, [key]: { file, previewUrl } };
    });
  }

  function handlePreview() {
    const errs = validate(formData, documents);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fill in all required fields before previewing.");
      return;
    }
    setShowPreview(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(formData, documents);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);

    const payload = {
      letter_type: formData.letter_type,
      letter_type_other: formData.letter_type_other,
      applicant_full_name_np: formData.applicant_full_name_np,
      applicant_full_name_en: formData.applicant_full_name_en,
      applicant_citizenship_no: formData.applicant_citizenship_no,
      applicant_contact_no: formData.applicant_contact_no,
      purpose: formData.purpose,
      register_ward_id: formData.register_ward_id,
      address: {
        ...formData.address,
        applicant_ward_number: Number(formData.address.applicant_ward_number),
      },
    };

    const body = new FormData();
    body.append("letter", JSON.stringify(payload));
    if (documents.applicant_citizenship.front.file)
      body.append(
        "applicant_citizenship_front",
        documents.applicant_citizenship.front.file,
      );
    if (documents.applicant_citizenship.back.file)
      body.append(
        "applicant_citizenship_back",
        documents.applicant_citizenship.back.file,
      );
    if (documents.supporting_document.file)
      body.append("supporting_document", documents.supporting_document.file);

    fetch(`${API_URL}/v1/recommendation-letter/`, {
      method: "POST",
      credentials: "include",
      body,
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then((data) => {
        console.log("Submission successful", data);
        toast.success("Recommendation letter request submitted successfully!");
        setFormData(initial_data);
        setDocuments(emptyDocuments());
        setErrors({});
        setAddressOverride(false);
        if (myAddress) applyMyAddressToForm(myAddress);
      })
      .catch((err) => {
        console.error("Submission failed:", err);
        toast.error(err?.detail || "Submission failed. Please try again.");
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <>
      {showPreview ? (
        <div className="min-h-screen bg-gray-100 p-8 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md cursor-pointer transition-colors"
            >
              ← पछाडि जानुहोस् (Back to Form)
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
            >
              🖨️ Print / Download
            </button>
          </div>
          <RecommendationPreview formData={formData} documents={documents} />
        </div>
      ) : (
        <form
          className="min-h-screen bg-gray-100 p-8 flex flex-col max-w-6xl mx-auto gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={logo}
                alt="Government of Nepal"
                className="w-16 h-16 object-contain"
              />
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest">
                  Government of Nepal
                </p>
                <h1 className="text-4xl font-bold">
                  Recommendation Letter Request
                </h1>
              </div>
            </div>

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
                  <option value="">
                    -- प्रकार छान्नुहोस् (Select Type) --
                  </option>
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

              {formData.letter_type && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800">
                  <span className="font-semibold">
                    यो सिफारिसको लागि आवश्यक कागजात (Document required for this
                    letter):{" "}
                  </span>
                  {DOCUMENT_REQUIREMENTS[formData.letter_type].supportingLabel}
                  {DOCUMENT_REQUIREMENTS[formData.letter_type]
                    .supportingRequired ? (
                    <span className="text-red-600 font-semibold">
                      {" "}
                      (अनिवार्य / Required)
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      {" "}
                      (वैकल्पिक / Optional)
                    </span>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    नागरिकताको दुवैतर्फ (अगाडि/पछाडि) सबै प्रकारका सिफारिसको
                    लागि अनिवार्य छ।
                    <br />
                    (Both sides of citizenship are required for every letter
                    type.)
                  </div>
                </div>
              )}
            </div>

            {/* ── Applicant info ── */}
            <div className="bg-white p-6 rounded-xl shadow-md mt-4">
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

            {/* ── Address — fetched directly from the backend ── */}
            <ApplicantAddressSection
              wards={wards}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              addressLoading={addressLoading}
              addressError={addressError}
              myAddress={myAddress}
              allowOverride={allowOverride}
              overrideChecked={addressOverride}
              onOverrideToggle={handleAddressOverrideToggle}
            />

            {/* ── Purpose ── */}
            <div className="bg-white p-6 rounded-xl shadow-md mt-4">
              <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                प्रयोजन (Purpose)
              </h2>

              {formData.letter_type &&
                PURPOSE_SUGGESTIONS[formData.letter_type]?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">
                      यो सिफारिस सामान्यतया यी प्रयोजनका लागि लिइन्छ — मिल्ने
                      विकल्प छान्नुहोस् (Common reasons for this letter — tap
                      one, then edit if needed):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PURPOSE_SUGGESTIONS[formData.letter_type].map(
                        (suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() =>
                              handlePurposeSuggestionClick(suggestion)
                            }
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                              formData.purpose === suggestion
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                            }`}
                          >
                            {suggestion}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows={4}
                placeholder="यो सिफारिस पत्र किन आवश्यक छ, लेख्नुहोस्…"
                className={`${inputStyle} resize-vertical ${errors.purpose ? "border-red-400" : ""}`}
              />
              <FieldError msg={errors.purpose} />
            </div>

            {/* ── Documents ── */}
            <div className="bg-white p-6 rounded-xl shadow-md mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                सहयोगी कागजातहरू (Supporting Documents)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2 border border-gray-200 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-600 block text-center mb-2">
                    निवेदकको नागरिकता (Applicant's Citizenship)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <UploadTile
                      label="अगाडि (Front)"
                      previewUrl={
                        documents.applicant_citizenship.front.previewUrl
                      }
                      isPdf={
                        documents.applicant_citizenship.front.file?.type ===
                        "application/pdf"
                      }
                      onFileSelected={(file) =>
                        handleDocumentSelect(
                          "applicant_citizenship",
                          file,
                          "front",
                        )
                      }
                    />
                    <UploadTile
                      label="पछाडि (Back)"
                      previewUrl={
                        documents.applicant_citizenship.back.previewUrl
                      }
                      isPdf={
                        documents.applicant_citizenship.back.file?.type ===
                        "application/pdf"
                      }
                      onFileSelected={(file) =>
                        handleDocumentSelect(
                          "applicant_citizenship",
                          file,
                          "back",
                        )
                      }
                    />
                  </div>
                  <FieldError msg={errors["documents.citizenship_front"]} />
                  <FieldError msg={errors["documents.citizenship_back"]} />
                </div>

                {formData.letter_type ? (
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2">
                    <UploadTile
                      label={`${DOCUMENT_REQUIREMENTS[formData.letter_type].supportingLabel}${
                        DOCUMENT_REQUIREMENTS[formData.letter_type]
                          .supportingRequired
                          ? " *"
                          : ""
                      }`}
                      previewUrl={documents.supporting_document.previewUrl}
                      isPdf={
                        documents.supporting_document.file?.type ===
                        "application/pdf"
                      }
                      onFileSelected={(file) =>
                        handleDocumentSelect("supporting_document", file)
                      }
                    />
                    <FieldError msg={errors["documents.supporting_document"]} />
                  </div>
                ) : (
                  <div className="col-span-2 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                    सिफारिसको प्रकार छान्नुभएपछि आवश्यक कागजात देखिनेछ
                    <br />
                    (Select a letter type above to see the required document)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handlePreview}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-6 py-2 rounded-md cursor-pointer transition-colors"
            >
              👁️ Preview Letter
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-300 hover:bg-slate-300 disabled:bg-blue-200 px-6 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Spinner /> पेश गर्दै…
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

export default RecommendationLetter;
