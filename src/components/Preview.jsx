import React from "react";
import logo from "../assets/nepal-sarkar.png";

// Converts any digits found in a value into Devanagari (Nepali) numerals.
// Works for numbers, numeric strings, and strings that mix digits with text.
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
function toNepaliNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/[0-9]/g, (d) => NEPALI_DIGITS[d]);
}

// Same keys/labels as the DOCUMENT_FIELDS used on the form step, so the
// preview shows exactly what was uploaded there. Citizenship documents are
// two-sided (dual: true), so their state is { front, back } instead of a
// single { file, previewUrl }.
const DOCUMENT_FIELDS_META = {
  father_citizenship: {
    label: "बुबाको नागरिकता (Father's Citizenship)",
    dual: true,
  },
  mother_citizenship: {
    label: "आमाको नागरिकता (Mother's Citizenship)",
    dual: true,
  },
  hospital_birth_certificate: {
    label: "अस्पताल जन्म प्रमाणपत्र (Hospital Birth Certificate)",
  },
  vaccination_card: { label: "खोप कार्ड (Vaccination Card)" },
};

function normalize(raw = {}) {
  const child = raw.child || {};
  const address = raw.address || {};
  const parents = raw.parents || [];
  const nominees = raw.nominees || [];

  const father =
    parents.find((p) => p.parent_type === "FATHER") || parents[0] || {};
  const mother =
    parents.find((p) => p.parent_type === "MOTHER") || parents[1] || {};
  const nominee = nominees[0] || {};

  // Prefer the Nepali values that were added on the address step.
  // Fall back to the English/legacy values only if the Nepali ones are missing.
  const sharedProvince =
    address.ward_nepali_province ||
    raw.child_province ||
    address.child_province ||
    address.child_provience ||
    "";
  const sharedDistrict =
    address.ward_nepali_district ||
    raw.child_district ||
    address.child_district ||
    "";
  const sharedMunicipality =
    address.ward_nepali_municipality ||
    raw.child_municipality ||
    address.child_municipality ||
    "";
  const sharedTole =
    address.ward_nepali_name || raw.child_tole || address.child_tole || "";
  const sharedWardRaw =
    raw.child_ward_number ?? address.child_ward_number ?? "";
  const sharedWard = toNepaliNumber(sharedWardRaw);

  return {
    child_first_name:
      child.child_nepali_first_name ||
      raw.child_first_name ||
      child.child_first_name ||
      "",
    child_middle_name:
      child.child_nepali_middle_name ||
      raw.child_middle_name ||
      child.child_middle_name ||
      "",
    child_last_name:
      child.child_nepali_last_name ||
      raw.child_last_name ||
      child.child_last_name ||
      "",
    child_gender: raw.child_gender ?? child.child_gender ?? "",
    child_dob_bs: toNepaliNumber(raw.child_dob_bs ?? child.child_dob_bs ?? ""),
    child_dob_ad: toNepaliNumber(raw.child_dob_ad ?? child.child_dob_ad ?? ""),
    child_time_of_birth: toNepaliNumber(
      raw.child_time_of_birth ?? child.child_time_of_birth ?? "",
    ),
    child_birth_place: raw.child_birth_place ?? child.child_birth_place ?? "",
    child_birth_kind: raw.child_birth_kind ?? child.child_birth_kind ?? "",
    child_weight_kg: toNepaliNumber(
      raw.child_weight_kg ?? child.child_weight_kg ?? "",
    ),

    child_province: sharedProvince,
    child_district: sharedDistrict,
    child_municipality: sharedMunicipality,
    child_ward_number: sharedWard,
    child_tole: sharedTole,

    // shared address for parents/informant
    shared_province: sharedProvince,
    shared_district: sharedDistrict,
    shared_municipality: sharedMunicipality,
    shared_ward: sharedWard,
    shared_tole: sharedTole,

    father_first_name:
      father.parent_nepali_first_name ||
      raw.father_first_name ||
      father.parent_first_name ||
      "",
    father_middle_name:
      father.parent_nepali_middle_name ||
      raw.father_middle_name ||
      father.parent_middle_name ||
      "",
    father_last_name:
      father.parent_nepali_last_name ||
      raw.father_last_name ||
      father.parent_last_name ||
      "",
    father_citizenship_no: toNepaliNumber(
      raw.father_citizenship_no ?? father.parent_citizenship_no ?? "",
    ),
    father_occupation: raw.father_occupation ?? father.parent_occupation ?? "",
    father_contact_no: toNepaliNumber(
      raw.father_contact_no ?? father.parent_contact_no ?? "",
    ),

    mother_first_name:
      mother.parent_nepali_first_name ||
      raw.mother_first_name ||
      mother.parent_first_name ||
      "",
    mother_middle_name:
      mother.parent_nepali_middle_name ||
      raw.mother_middle_name ||
      mother.parent_middle_name ||
      "",
    mother_last_name:
      mother.parent_nepali_last_name ||
      raw.mother_last_name ||
      mother.parent_last_name ||
      "",
    mother_citizenship_no: toNepaliNumber(
      raw.mother_citizenship_no ?? mother.parent_citizenship_no ?? "",
    ),
    mother_occupation: raw.mother_occupation ?? mother.parent_occupation ?? "",
    mother_contact_no: toNepaliNumber(
      raw.mother_contact_no ?? mother.parent_contact_no ?? "",
    ),

    nominee_first_name:
      nominee.nominee_nepali_first_name ||
      raw.nominee_first_name ||
      nominee.nominee_first_name ||
      "",
    nominee_middle_name:
      nominee.nominee_nepali_middle_name ||
      raw.nominee_middle_name ||
      nominee.nominee_middle_name ||
      "",
    nominee_last_name:
      nominee.nominee_nepali_last_name ||
      raw.nominee_last_name ||
      nominee.nominee_last_name ||
      "",
    nominee_relationship:
      raw.nominee_relationship ?? nominee.nominee_relationship ?? "",
    nominee_contact_no: toNepaliNumber(
      raw.nominee_contact_no ?? nominee.nominee_contact_no ?? "",
    ),

    // rejection
    reject_text: raw.reject?.reject_text ?? raw.reject_text ?? "",
  };
}

// Shows thumbnails for whatever documents were selected on the form step.
// `documents` has the same shape as BirthRegistration's document state:
// { [key]: { file, previewUrl } }, previewUrl === "pdf" for PDF uploads.
function DocumentsPreview({ documents }) {
  if (!documents) return null;

  // Flatten { father_citizenship: { front, back } } into individual rows,
  // and single-sided documents into their own row, so both citizenship
  // sides get shown separately without special-casing the render below.
  const rows = [];
  Object.entries(DOCUMENT_FIELDS_META).forEach(([key, meta]) => {
    const entry = documents[key];
    if (!entry) return;
    if (meta.dual) {
      if (entry.front?.previewUrl) {
        rows.push({
          rowKey: `${key}_front`,
          label: `${meta.label} — अगाडि (Front)`,
          doc: entry.front,
        });
      }
      if (entry.back?.previewUrl) {
        rows.push({
          rowKey: `${key}_back`,
          label: `${meta.label} — पछाडि (Back)`,
          doc: entry.back,
        });
      }
    } else if (entry.previewUrl) {
      rows.push({ rowKey: key, label: meta.label, doc: entry });
    }
  });

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
        {rows.map(({ rowKey, label, doc }) => {
          const isPdf = doc.previewUrl === "pdf";
          return (
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
                  <span style={{ fontSize: 14, color: "#555" }}>PDF</span>
                ) : (
                  <img
                    src={doc.previewUrl}
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
          );
        })}
      </div>
    </div>
  );
}

function Preview({
  formData: rawFormData,
  documents,
  rejectText,
  onRejectChange,
  showRejectSection = false,
}) {
  const formData = normalize(rawFormData);

  const fullName = [
    formData.child_first_name,
    formData.child_middle_name,
    formData.child_last_name,
  ]
    .filter(Boolean)
    .join(" ");
  const fatherFullName = [
    formData.father_first_name,
    formData.father_middle_name,
    formData.father_last_name,
  ]
    .filter(Boolean)
    .join(" ");
  const motherFullName = [
    formData.mother_first_name,
    formData.mother_middle_name,
    formData.mother_last_name,
  ]
    .filter(Boolean)
    .join(" ");
  const informantFullName = [
    formData.nominee_first_name,
    formData.nominee_middle_name,
    formData.nominee_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const Box = ({ checked }) => (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        border: "1px solid #000",
        marginRight: 3,
        verticalAlign: "middle",
        background: checked ? "#000" : "transparent",
        flexShrink: 0,
      }}
    />
  );

  const DotRow = ({ num, label, value, style }) => (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        padding: "2px 6px",
        fontSize: 12,
        ...style,
      }}
    >
      {num && <span style={{ minWidth: 22 }}>{num}</span>}
      <span style={{ whiteSpace: "nowrap" }}>{label}&nbsp;:&nbsp;</span>
      <span
        style={{
          flex: 1,
          borderBottom: "1px dotted #000",
          minHeight: 15,
          paddingLeft: 2,
          fontSize: 12,
        }}
      >
        {value || ""}
      </span>
    </div>
  );

  // Shared address row for parents/informant
  const AddressRow = ({ num }) => (
    <div style={{ ...s.inlineGroup, fontSize: 12 }}>
      <span style={{ minWidth: 22 }}>{num}</span>
      <span>स्थायी ठेगाना&nbsp;: प्रदेश&nbsp;</span>
      <span
        style={{
          borderBottom: "1px dotted #000",
          display: "inline-block",
          minWidth: 70,
        }}
      >
        {formData.shared_province}
      </span>
      <span>&nbsp;जिल्ला&nbsp;</span>
      <span
        style={{
          borderBottom: "1px dotted #000",
          display: "inline-block",
          minWidth: 80,
        }}
      >
        {formData.shared_district}
      </span>
      <span>&nbsp;स्थानीय तह&nbsp;</span>
      <span
        style={{
          borderBottom: "1px dotted #000",
          display: "inline-block",
          minWidth: 80,
        }}
      >
        {formData.shared_municipality}
      </span>
      <span>&nbsp;वडा नं.&nbsp;</span>
      <span
        style={{
          borderBottom: "1px dotted #000",
          display: "inline-block",
          minWidth: 50,
        }}
      >
        {formData.shared_ward}
      </span>
      <span>&nbsp;टोल/बस्ती&nbsp;</span>
      <span
        style={{
          borderBottom: "1px dotted #000",
          display: "inline-block",
          minWidth: 60,
        }}
      >
        {formData.shared_tole}
      </span>
    </div>
  );

  const s = {
    page: {
      fontFamily: "'Noto Sans Devanagari', 'Noto Sans', Arial, sans-serif",
      fontSize: 12,
      color: "#000",
      background: "#fff",
      padding: "10mm 12mm",
      width: "210mm",
      boxSizing: "border-box",
    },
    box: { border: "1px solid #000", marginTop: 6 },
    secHead: {
      fontWeight: "bold",
      fontSize: 13,
      padding: "3px 6px",
      borderBottom: "1px solid #000",
    },
    cbRow: {
      display: "flex",
      alignItems: "center",
      padding: "3px 6px",
      fontSize: 12,
      flexWrap: "wrap",
      gap: 10,
    },
    inlineGroup: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      flexWrap: "wrap",
      padding: "2px 6px",
      fontSize: 12,
    },
  };

  return (
    <div style={s.page}>
      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <img src={logo} alt="Nepal Sarkar" style={{ width: 65, height: 65 }} />
        <div style={{ textAlign: "center", flex: 1, padding: "0 10px" }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>नेपाल सरकार</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>स्थानीय तह</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            स्थानीय पञ्जिकाधिकारीको कार्यालय
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            वडा नं.&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 140,
              }}
            >
              {formData.child_ward_number || ""}
            </span>
            &nbsp;नगरपालिका / गाउँपालिका
          </div>
          <div style={{ fontSize: 12, marginTop: 2 }}>
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 100,
              }}
            >
              {formData.child_district || ""}
            </span>
            &nbsp;जिल्ला,&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 100,
              }}
            >
              {formData.child_province || ""}
            </span>
            &nbsp;प्रदेश
          </div>
        </div>
        <div
          style={{
            border: "1px solid #000",
            padding: "5px 10px",
            minWidth: 130,
            fontSize: 11,
          }}
        >
          <div style={{ marginBottom: 6 }}>
            दर्ता नं.&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 70,
              }}
            />
          </div>
          <div>
            मिति&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 70,
              }}
            />
          </div>
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1.5px solid #000",
          margin: "5px 0",
        }}
      />

      {/* ── TITLE ── */}
      <div style={{ textAlign: "center", margin: "6px 0 2px" }}>
        <div style={{ fontWeight: "bold", fontSize: 22, letterSpacing: 2 }}>
          जन्म सूचना फाराम
        </div>
        <div style={{ fontSize: 11, marginTop: 1 }}>
          (स्थानीय पञ्जिकाधिकारी नियमावली, २०७७ को नियम ३ बमोजिम)
        </div>
        <div style={{ fontSize: 11 }}>
          (यो फाराम भरको ३५ दिन भित्र सम्बन्धित वडा कार्यालयमा पेश गर्नुपर्नेछ
          ।)
        </div>
      </div>

      {/* ── क. बच्चाको विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>क. बच्चाको विवरण</div>
        <DotRow num="१." label="पूरा नाम" value={fullName} />

        <div style={s.cbRow}>
          <span style={{ minWidth: 22 }}>२.</span>
          <span>लिङ्ग&nbsp;:</span>
          <span>
            <Box checked={formData.child_gender === "MALE"} />
            पुरुष
          </span>
          <span>
            <Box checked={formData.child_gender === "FEMALE"} />
            महिला
          </span>
          <span>
            <Box checked={formData.child_gender === "OTHER"} />
            अन्य
          </span>
        </div>

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 22 }}>३.</span>
          <span>जन्म मिति (वि.सं.)&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 130,
            }}
          >
            {formData.child_dob_bs || ""}
          </span>
          <span>&nbsp;(ई.सं.&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 110,
            }}
          >
            {formData.child_dob_ad || ""}
          </span>
          <span>)</span>
        </div>

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 22 }}>४.</span>
          <span>जन्म समय&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 140,
            }}
          >
            {formData.child_time_of_birth || ""}
          </span>
          <span>&nbsp;बजे</span>
        </div>

        <div style={{ padding: "2px 6px", fontSize: 12 }}>
          <span style={{ minWidth: 22, display: "inline-block" }}>५.</span>
          <span>जन्म स्थान&nbsp;:</span>
        </div>
        <div style={{ ...s.inlineGroup, paddingLeft: 28, gap: 8 }}>
          <span>(क) प्रदेश&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 100,
            }}
          >
            {formData.child_province || ""}
          </span>
          <span>&nbsp;&nbsp;(ख) जिल्ला&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 100,
            }}
          >
            {formData.child_district || ""}
          </span>
          <span>&nbsp;&nbsp;(ग) स्थानीय तह&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 100,
            }}
          >
            {formData.child_municipality || ""}
          </span>
        </div>
        <div style={{ ...s.inlineGroup, paddingLeft: 28 }}>
          <span>(घ) वडा नं.&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 100,
            }}
          >
            {formData.child_ward_number || ""}
          </span>
          <span>&nbsp;&nbsp;(ङ) टोल/बस्ती&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 120,
            }}
          >
            {formData.child_tole || ""}
          </span>
        </div>

        <div style={s.cbRow}>
          <span style={{ minWidth: 22 }}>६.</span>
          <span>जन्म भएको स्थान&nbsp;:</span>
          <span>
            <Box checked={formData.child_birth_place === "HOME"} />
            घरमा
          </span>
          <span>
            <Box checked={formData.child_birth_place === "HOSPITAL"} />
            स्वास्थ्य संस्था
          </span>
          <span>
            <Box checked={formData.child_birth_place === "OTHER"} />
            अन्य&nbsp;(
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 80,
              }}
            />
            )
          </span>
        </div>

        <div style={{ ...s.cbRow, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span style={{ minWidth: 22 }}>७.</span>
              <span>बच्चा कतिलौं जन्म हो&nbsp;:</span>
              <span>
                <Box />
                पहिलो
              </span>
              <span>
                <Box />
                दोस्रो
              </span>
              <span>
                <Box />
                तेस्रो
              </span>
              <span>
                <Box />
                चौथो वा सोभन्दा माथि
              </span>
            </div>
            <div style={{ paddingLeft: 26, fontSize: 11 }}>
              (जीवित जन्मको आधारमा)
            </div>
          </div>
        </div>

        <div style={s.cbRow}>
          <span style={{ minWidth: 22 }}>८.</span>
          <span>जन्म प्रकार&nbsp;:</span>
          <span style={{ minWidth: 30 }} />
          <span>
            <Box checked={formData.child_birth_kind === "SINGLE"} />
            एकल (Single)
          </span>
          <span style={{ minWidth: 20 }} />
          <span>
            <Box checked={formData.child_birth_kind === "TWIN"} />
            जुडुवा (Twin)
          </span>
          <span style={{ minWidth: 20 }} />
          <span>
            <Box checked={formData.child_birth_kind === "TRIPLET_OR_MORE"} />
            तेसो वा बढी (Triplet or more)
          </span>
        </div>

        <div style={s.cbRow}>
          <span style={{ minWidth: 22 }}>९.</span>
          <span>जन्मको प्रकार&nbsp;:</span>
          <span style={{ minWidth: 18 }} />
          <span>
            <Box />
            सामान्य (Normal)
          </span>
          <span style={{ minWidth: 20 }} />
          <span>
            <Box />
            शल्यक्रिया (Caesarean)
          </span>
          <span style={{ minWidth: 20 }} />
          <span>
            <Box />
            अन्य&nbsp;(
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 100,
              }}
            />
            )
          </span>
        </div>

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 22 }}>१०.</span>
          <span>जन्मको तौल&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 130,
            }}
          >
            {formData.child_weight_kg || ""}
          </span>
          <span>&nbsp;के.जी.</span>
        </div>

        <DotRow
          num="११."
          label="जन्म भएको क्रममा सहयोग गर्नेको नाम र प्रकार"
          value=""
        />
      </div>

      {/* ── ख. बुबाको विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>ख. बुबाको विवरण</div>
        <DotRow num="१." label="पूरा नाम" value={fatherFullName} />
        <div style={s.inlineGroup}>
          <span style={{ minWidth: 22 }}>२.</span>
          <span>नागरिकता नं.&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 160,
            }}
          >
            {formData.father_citizenship_no || ""}
          </span>
        </div>
        <AddressRow num="३." />
        <div style={s.inlineGroup}>
          <span style={{ minWidth: 22 }}>४.</span>
          <span>पेशा&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 160,
            }}
          >
            {formData.father_occupation || ""}
          </span>
          <span style={{ minWidth: 40 }} />
          <span>५. सम्पर्क नं.&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 130,
            }}
          >
            {formData.father_contact_no || ""}
          </span>
        </div>
      </div>

      {/* ── ग. आमाको विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>ग. आमाको विवरण</div>
        <DotRow num="१." label="पूरा नाम" value={motherFullName} />
        <div style={s.inlineGroup}>
          <span style={{ minWidth: 22 }}>२.</span>
          <span>नागरिकता नं.&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 160,
            }}
          >
            {formData.mother_citizenship_no || ""}
          </span>
        </div>
        <AddressRow num="३." />
        <div style={s.inlineGroup}>
          <span style={{ minWidth: 22 }}>४.</span>
          <span>पेशा&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 160,
            }}
          >
            {formData.mother_occupation || ""}
          </span>
          <span style={{ minWidth: 40 }} />
          <span>५. सम्पर्क नं.&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 130,
            }}
          >
            {formData.mother_contact_no || ""}
          </span>
        </div>
      </div>

      {/* ── घ. सूचनादिने व्यक्तिको विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>घ. सूचनादिने व्यक्तिको विवरण</div>
        <DotRow num="१." label="पूरा नाम" value={informantFullName} />
        <div style={s.cbRow}>
          <span style={{ minWidth: 22 }}>२.</span>
          <span>सम्बन्ध&nbsp;:</span>
          <span>
            <Box checked={formData.nominee_relationship === "FATHER"} />
            बुबा
          </span>
          <span>
            <Box checked={formData.nominee_relationship === "MOTHER"} />
            आमा
          </span>
          <span>
            <Box
              checked={["GRANDFATHER", "GRANDMOTHER", "GUARDIAN"].includes(
                formData.nominee_relationship,
              )}
            />
            आफन्त
          </span>
          <span>
            <Box checked={formData.nominee_relationship === "OTHER"} />
            अन्य&nbsp;(
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 90,
              }}
            />
            )
          </span>
        </div>
        <AddressRow num="३." />
        <div style={s.inlineGroup}>
          <span style={{ minWidth: 22 }}>४.</span>
          <span>सम्पर्क नं.&nbsp;:&nbsp;</span>
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 200,
            }}
          >
            {formData.nominee_contact_no || ""}
          </span>
        </div>
      </div>

      {/* ── संलग्न कागजातहरू (uploaded documents) ── */}
      <DocumentsPreview documents={documents} />

      {/* ── घोषणा ── */}

      {/* ── कार्यालय प्रयोगका लागि ── */}
      <div style={{ ...s.box, marginTop: 8 }}>
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 13,
            padding: "2px 0",
            borderBottom: "1px solid #000",
            background: "#f5f5f5",
          }}
        >
          कार्यालय प्रयोगका लागि
        </div>
      </div>

      {/* ── Note ── */}
      <div style={{ fontSize: 11, marginTop: 6 }}>
        <strong>नोट&nbsp;:</strong> यो फाराम भरियेको मितिले ३५ दिन भित्र
        सम्बन्धित वडा कार्यालयमा पेश गर्नुपर्नेछ ।
      </div>
    </div>
  );
}

export default Preview;
