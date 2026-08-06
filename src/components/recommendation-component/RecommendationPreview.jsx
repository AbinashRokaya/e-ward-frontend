// components/recommendation-component/RecommendationPreview.jsx
import logo from "../../assets/nepal-sarkar.png";
import API_URL from "../../api/api";

const LETTER_TYPE_INFO = {
  RESIDENCE_PROOF: {
    subject_np: "बसोबास प्रमाणित सम्बन्धमा",
    clause: "हाल यस वडा क्षेत्रमा स्थायी बसोबास गरी बसेको",
  },
  UNMARRIED_STATUS: {
    subject_np: "अविवाहित प्रमाणित सम्बन्धमा",
    clause: "हालसम्म विवाह नगरी अविवाहित रहेको",
  },
  CHARACTER_CERTIFICATE: {
    subject_np: "चालचलन प्रमाणित सम्बन्धमा",
    clause: "यस वडा क्षेत्रमा असल चालचलन कायम राखी बसेको",
  },
  INCOME_STATEMENT: {
    subject_np: "आर्थिक अवस्था प्रमाणित सम्बन्धमा",
    clause: "यस वडा क्षेत्रमा बसोबास गर्दै सामान्य आर्थिक अवस्था भएको",
  },
  RELATIONSHIP_PROOF: {
    subject_np: "नाता प्रमाणित सम्बन्धमा",
    clause: "निवेदनमा उल्लेखित व्यक्तिसँग नाता सम्बन्ध कायम रहेको",
  },
  LAND_OWNERSHIP_PROOF: {
    subject_np: "जग्गा स्वामित्व प्रमाणित सम्बन्धमा",
    clause: "यस वडा क्षेत्र भित्र जग्गा स्वामित्व राखी बसेको",
  },
  OTHER: {
    subject_np: "सिफारिस सम्बन्धमा",
    clause: null,
  },
};

const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
function toNepaliDigits(value) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/[0-9]/g, (d) => NEPALI_DIGITS[Number(d)]);
}

// ── Normalize address shape ─────────────────────────────────────────────
// The CREATE form builds formData.address as a nested object:
//   { applicant_province, applicant_district, ..., ward_nepali_province, ... }
//
// But the backend (RecommendationLetterModel / RecommendationLetterResponse)
// stores/returns these as FLAT top-level fields on the letter itself, since
// there's no separate address table like birth registration has:
//   { applicant_province, applicant_district, ..., ward_nepali_province, ... }
//   directly on the letter — no `.address` wrapper.
//
// So when the Edit/View page fetches a letter from the API and passes it
// straight into this component as formData, formData.address is undefined
// and everything showed "—". This helper accepts EITHER shape: it prefers
// formData.address.* (create-form) and falls back to formData.* (API/edit
// page), the same pattern normalize() uses in the birth registration Preview.
function normalizeAddress(formData = {}) {
  const nested = formData.address || {};
  return {
    applicant_province:
      nested.applicant_province ?? formData.applicant_province ?? "",
    applicant_district:
      nested.applicant_district ?? formData.applicant_district ?? "",
    applicant_municipality:
      nested.applicant_municipality ?? formData.applicant_municipality ?? "",
    applicant_ward_number:
      nested.applicant_ward_number ?? formData.applicant_ward_number ?? "",
    applicant_tole: nested.applicant_tole ?? formData.applicant_tole ?? "",
    ward_nepali_province:
      nested.ward_nepali_province ?? formData.ward_nepali_province ?? "",
    ward_nepali_district:
      nested.ward_nepali_district ?? formData.ward_nepali_district ?? "",
    ward_nepali_municipality:
      nested.ward_nepali_municipality ??
      formData.ward_nepali_municipality ??
      "",
    ward_nepali_name:
      nested.ward_nepali_name ?? formData.ward_nepali_name ?? "",
    ward_type: nested.ward_type ?? formData.ward_type ?? "",
  };
}

function buildApplicantAddressLine(address = {}) {
  return [
    address.applicant_district ? `${address.applicant_district} जिल्ला` : null,
    address.applicant_municipality,
    address.applicant_ward_number
      ? `वडा नं. ${toNepaliDigits(address.applicant_ward_number)}`
      : null,
    address.applicant_tole,
  ]
    .filter(Boolean)
    .join(", ");
}

function RecommendationPreview({ formData = {}, documents = {} }) {
  const info = LETTER_TYPE_INFO[formData?.letter_type] || {};
  const subjectNp =
    formData?.letter_type === "OTHER" && formData?.letter_type_other
      ? `${formData.letter_type_other} सम्बन्धमा`
      : info.subject_np || "सिफारिस सम्बन्धमा";
  const clause = info.clause || formData?.letter_type_other || "";

  // Works whether formData.address is a nested object (create form) or
  // formData carries the address fields flat at the top level (API /
  // Edit-Recommendation-Letter page response).
  const address = normalizeAddress(formData);

  return (
    <div
      className="bg-white shadow-md mx-auto relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "16mm 18mm",
        fontFamily: '"Noto Sans Devanagari", "Noto Sans", Arial, sans-serif',
        fontSize: "13px",
        color: "#000",
      }}
    >
      {/* ── HEADER ── */}
      <div className="flex items-center">
        <div style={{ width: 90, height: 90 }}>
          <img
            src={logo}
            alt="Nepal Government"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 text-center">
          <div style={{ fontSize: 12 }}>नेपाल सरकार</div>
          <div
            style={{
              color: "#b3261e",
              fontWeight: "bold",
              fontSize: 20,
              marginTop: 2,
            }}
          >
            {address.ward_nepali_municipality || "—"}
          </div>
          <div
            style={{
              color: "#b3261e",
              fontWeight: "bold",
              fontSize: 26,
              marginTop: 2,
            }}
          >
            {toNepaliDigits(address.applicant_ward_number) || "—"} नं वडा
            कार्यालय
          </div>
          <div style={{ fontSize: 10, marginTop: 2 }}>
            {address.ward_nepali_district || "—"},{" "}
            {address.ward_nepali_province || "—"}, नेपाल
          </div>
        </div>
        <div style={{ width: 90 }} />
      </div>
      <div style={{ borderBottom: "2px solid #8a5a1f", marginTop: 8 }} />

      {/* ── META ROW ── */}
      <div
        className="flex justify-between"
        style={{ fontSize: 12, marginTop: 10 }}
      >
        <div>पत्र संख्या : पेश गरेपछि उत्पन्न हुनेछ</div>
        <div>मिति : ...................</div>
      </div>

      {/* ── TO / SUBJECT ── */}
      <div style={{ marginTop: 22, fontSize: 13 }}>श्री जो जस सँग सम्बन्ध।</div>
      <div
        style={{
          marginTop: 14,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 14,
        }}
      >
        विषय :- {subjectNp}।
      </div>

      {/* ── BODY ── */}
      <div
        style={{
          marginTop: 16,
          fontSize: 13,
          lineHeight: 1.9,
          textAlign: "justify",
        }}
      >
        उपरोक्त सम्बन्धमा यस {buildApplicantAddressLine(address)} बस्ने
        श्री/सुश्री <strong>{formData?.applicant_full_name_np || "—"}</strong>{" "}
        (नागरिकता प्रमाणपत्र नं.{" "}
        {toNepaliDigits(formData?.applicant_citizenship_no) || "—"}) {clause}{" "}
        भन्ने व्यहोरा निजको निवेदन र यस वडा कार्यालयमा उपलब्ध अभिलेखको आधारमा
        प्रमाणित गरी, निजलाई "{formData?.purpose || "—"}" प्रयोजनका लागि यो
        सिफारिस पत्र यसै वडा कार्यालयबाट जारी गरिएको व्यहोरा अनुरोध साथ जानकारी
        गराइन्छ।
      </div>

      {/* ── SIGNATURE / STAMP ── */}
      <div
        className="flex justify-between items-end"
        style={{ marginTop: 60, fontSize: 12 }}
      >
        <div>दर्ता मिति : पेश गरेपछि उत्पन्न हुनेछ</div>
        <div className="text-right">
          <div
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              minWidth: 220,
              minHeight: 80,
            }}
          />
          <div style={{ fontWeight: 600, marginTop: 4 }}>
            .......................
            <br />
            वडा अध्यक्ष / Ward Chairperson
          </div>
          <div
            className="ml-auto flex items-center justify-center text-center"
            style={{ marginTop: 6, width: 120, minHeight: 90, fontSize: 10 }}
          >
            वडा कार्यालयको छाप
            <br />
            (Office Stamp)
          </div>
        </div>
      </div>

      {/* ── FOOTER NOTE ── */}
      <div
        className="absolute text-center"
        style={{
          bottom: "26mm",
          left: "18mm",
          right: "34mm",
          fontSize: 9,
          color: "#555",
        }}
      >
        नोट : यस प्रमाणपत्रमा कुनै काटछाँट वा केरमेट गरी परिवर्तन गरेमा कानुन
        बमोजिम कारबाही हुनेछ।
      </div>

      {/* ── QR Corner ── */}
      <div
        className="absolute text-center"
        style={{ bottom: "8mm", right: "18mm" }}
      >
        <div
          className="flex items-center justify-center border border-dashed border-gray-300 text-gray-400"
          style={{ width: 70, height: 70, fontSize: 8 }}
        >
          QR
        </div>
        <div style={{ fontSize: 8, marginTop: 2 }}>
          पेश गरेपछि उत्पन्न हुनेछ
        </div>
      </div>

      {/* ── Attached Documents ── */}
      <DocumentsPreview documents={documents} formData={formData} />
    </div>
  );
}

// ── Attached documents preview ──────────────────────────────────────────
// Mirrors DocumentsPreview from the birth registration Preview.jsx: each
// uploaded document gets its own full-width, larger preview box (instead
// of a small thumbnail), stacked vertically with a label underneath, so
// officers reviewing the printed/PDF letter can actually read the
// citizenship/supporting documents rather than squint at a 96x96 crop.
//
// Two different data shapes feed this component depending on where the
// preview is opened from:
//
// 1. CREATE FORM (before submission): files only exist in the browser's
//    memory, as `documents.applicant_citizenship.front = { file, previewUrl }`
//    with previewUrl being a blob: URL or the string "pdf".
//
// 2. VIEW/EDIT page (after submission): the letter is fetched from
//    GET /v1/recommendation-letter/{letter_id}, which returns the DB row —
//    there are no in-memory files, only stored path/URL STRINGS on the
//    letter itself: applicant_citizenship_front_path,
//    applicant_citizenship_back_path, supporting_document_path (see
//    RecommendationLetterModel).
//
// This version tries the in-memory `documents` shape first, and falls back
// to building a URL from formData's stored `*_path` fields.
//
// NOTE: `*_path` values may be either a LEGACY path relative to the
// backend's static/ mount ("recommendation_letter/{letter_id}/{filename}",
// pre-Cloudinary), or a full https://res.cloudinary.com/... URL (current
// uploads). buildStaticUrl handles both — a full URL is used as-is, only a
// bare relative path gets the ${API_URL}/static/ prefix added.
function buildStaticUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/static/${path}`;
}

function isPdfPath(path) {
  return typeof path === "string" && path.toLowerCase().endsWith(".pdf");
}

function DocumentsPreview({ documents, formData = {} }) {
  const rows = [];

  const memFront = documents?.applicant_citizenship?.front;
  const memBack = documents?.applicant_citizenship?.back;
  const memSupporting = documents?.supporting_document;

  // 1) In-memory previews (create-form flow, pre-submission)
  if (memFront?.previewUrl)
    rows.push({
      rowKey: "citizenship_front",
      label: "नागरिकता अगाडि (Citizenship - Front)",
      url: memFront.previewUrl,
      isPdf: memFront.previewUrl === "pdf",
    });
  if (memBack?.previewUrl)
    rows.push({
      rowKey: "citizenship_back",
      label: "नागरिकता पछाडि (Citizenship - Back)",
      url: memBack.previewUrl,
      isPdf: memBack.previewUrl === "pdf",
    });
  if (memSupporting?.previewUrl)
    rows.push({
      rowKey: "supporting_document",
      label: "सहयोगी कागजात (Supporting Document)",
      url: memSupporting.previewUrl,
      isPdf: memSupporting.previewUrl === "pdf",
    });

  // 2) Fallback to stored paths/URLs from the API (view/edit-page flow,
  //    post-submission) — only used for whichever rows step 1 didn't fill,
  //    so a partially-hydrated `documents` prop still works correctly.
  const haveFront = rows.some((r) => r.rowKey === "citizenship_front");
  const haveBack = rows.some((r) => r.rowKey === "citizenship_back");
  const haveSupporting = rows.some((r) => r.rowKey === "supporting_document");

  if (!haveFront && formData.applicant_citizenship_front_path) {
    rows.push({
      rowKey: "citizenship_front",
      label: "नागरिकता अगाडि (Citizenship - Front)",
      url: buildStaticUrl(formData.applicant_citizenship_front_path),
      isPdf: isPdfPath(formData.applicant_citizenship_front_path),
    });
  }
  if (!haveBack && formData.applicant_citizenship_back_path) {
    rows.push({
      rowKey: "citizenship_back",
      label: "नागरिकता पछाडि (Citizenship - Back)",
      url: buildStaticUrl(formData.applicant_citizenship_back_path),
      isPdf: isPdfPath(formData.applicant_citizenship_back_path),
    });
  }
  if (!haveSupporting && formData.supporting_document_path) {
    rows.push({
      rowKey: "supporting_document",
      label: "सहयोगी कागजात (Supporting Document)",
      url: buildStaticUrl(formData.supporting_document_path),
      isPdf: isPdfPath(formData.supporting_document_path),
    });
  }

  if (rows.length === 0) return null;

  return (
    <div style={{ border: "1px solid #000", marginTop: 6 }}>
      <div
        style={{
          fontWeight: "bold",
          fontSize: 13,
          padding: "3px 6px",
          borderBottom: "1px solid #000",
        }}
      >
        संलग्न कागजातहरू (Attached Documents)
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "14px 6px",
        }}
      >
        {rows.map(({ rowKey, label, url, isPdf }) => (
          <div
            key={rowKey}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: 10,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #999",
                overflow: "hidden",
                background: "#fafafa",
              }}
            >
              {isPdf ? (
                url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 14, color: "#1d4ed8" }}
                  >
                    PDF हेर्नुहोस् (View PDF)
                  </a>
                ) : (
                  <span style={{ fontSize: 14, color: "#555" }}>PDF</span>
                )
              ) : (
                <img
                  src={url}
                  alt={label}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                marginTop: 8,
                textAlign: "center",
                lineHeight: 1.3,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendationPreview;
