import React from "react";
import logo from "../assets/nepal-sarkar.png";

// Converts any digits found in a value into Devanagari (Nepali) numerals.
// Works for numbers, numeric strings, and strings that mix digits with text.
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
function toNepaliNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/[0-9]/g, (d) => NEPALI_DIGITS[d]);
}

// Maximum allowed child birth weight, in kilograms.
const MAX_CHILD_WEIGHT_KG = 5;

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

  // Raw (untranslated) birth weight, used for numeric validation.
  const rawWeight = raw.child_weight_kg ?? child.child_weight_kg ?? "";
  const parsedWeight = parseFloat(rawWeight);
  const hasWeight = rawWeight !== "" && rawWeight !== null && rawWeight !== undefined;
  const isWeightValid =
    !hasWeight || isNaN(parsedWeight) || parsedWeight <= MAX_CHILD_WEIGHT_KG;

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

    // Birth weight: display value (Nepali digits), raw numeric value, and validity flag.
    child_weight_kg: toNepaliNumber(rawWeight),
    child_weight_kg_raw: hasWeight ? parsedWeight : null,
    child_weight_valid: isWeightValid,

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
    father_nationality:
      raw.father_nationality ?? father.parent_nationality ?? "नेपाली",

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
    mother_nationality:
      raw.mother_nationality ?? mother.parent_nationality ?? "नेपाली",

    marriage_reg_date: toNepaliNumber(
      raw.marriage_reg_date ?? raw.marriage_registration_date ?? "",
    ),
    marriage_reg_no: toNepaliNumber(
      raw.marriage_reg_no ?? raw.marriage_registration_no ?? "",
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
    nominee_citizenship_no: toNepaliNumber(
      raw.nominee_citizenship_no ?? nominee.nominee_citizenship_no ?? "",
    ),
    nominee_contact_no: toNepaliNumber(
      raw.nominee_contact_no ?? nominee.nominee_contact_no ?? "",
    ),

    registration_no: toNepaliNumber(raw.registration_no ?? ""),
    registration_date: toNepaliNumber(raw.registration_date ?? ""),
    issue_date: toNepaliNumber(raw.issue_date ?? ""),
    nin: toNepaliNumber(raw.nin ?? ""),

    registrar_name: raw.registrar_name ?? "",
    registrar_designation: raw.registrar_designation ?? "",

    // rejection
    reject_text: raw.reject?.reject_text ?? raw.reject_text ?? "",
  };
}

const RELATION_LABELS = {
  FATHER: "बुबा",
  MOTHER: "आमा",
  GRANDFATHER: "हजुरबुबा",
  GRANDMOTHER: "हजुरआमा",
  GUARDIAN: "संरक्षक",
  OTHER: "अन्य",
};

function Birth_certificate({
  formData: rawFormData,
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

  const sharedAddress = [
    formData.shared_province && `${formData.shared_province} प्रदेश`,
    formData.shared_district && `${formData.shared_district} जिल्ला`,
    formData.shared_municipality,
    formData.shared_ward && `वडा नं. ${formData.shared_ward}`,
    formData.shared_tole,
  ]
    .filter(Boolean)
    .join(", ");

  const genderLabel =
    formData.child_gender === "MALE"
      ? "पुरुष (MALE)"
      : formData.child_gender === "FEMALE"
        ? "महिला (FEMALE)"
        : formData.child_gender === "OTHER"
          ? "अन्य (OTHER)"
          : "";

  const birthKindLabel =
    formData.child_birth_kind === "SINGLE"
      ? "एकल (Single)"
      : formData.child_birth_kind === "TWIN"
        ? "जुडुवा (Twin)"
        : formData.child_birth_kind === "TRIPLET_OR_MORE"
          ? "तेस्रो वा सोभन्दा बढी (Triplet or more)"
          : "";

  const birthPlaceLabel =
    formData.child_birth_place === "HOME"
      ? "घरमा (Home)"
      : formData.child_birth_place === "HOSPITAL"
        ? "स्वास्थ्य संस्था (Hospital)"
        : formData.child_birth_place === "OTHER"
          ? "अन्य (Other)"
          : "";

  const relationLabel = RELATION_LABELS[formData.nominee_relationship] || "";

  // Birth weight display: red + bold + warning text if it exceeds the allowed max.
  const weightValue = formData.child_weight_kg ? (
    <span
      style={{
        color: formData.child_weight_valid ? "inherit" : "#c00",
        fontWeight: formData.child_weight_valid ? "normal" : "bold",
      }}
    >
      {formData.child_weight_kg} के.जी. (kg)
      {!formData.child_weight_valid && (
        <>
          {" "}
          ⚠ अमान्य तौल: ५ के.जी. भन्दा बढी हुन सक्दैन (Invalid: weight cannot
          exceed 5 kg)
        </>
      )}
    </span>
  ) : (
    ""
  );

  // ── Fixed-proportion column widths so long address text never distorts
  // the layout — matches the official form's clean, evenly-spaced columns.
  const s = {
    page: {
      fontFamily: "'Noto Sans Devanagari', 'Noto Sans', Arial, sans-serif",
      fontSize: 12,
      color: "#000",
      background: "#fff",
      padding: "10mm 12mm",
      width: "210mm",
      minWidth: "210mm",
      boxSizing: "border-box",
      margin: "0 auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: 6,
      tableLayout: "fixed",
    },
    label: {
      border: "1px solid #000",
      padding: "5px 8px",
      fontWeight: 600,
      fontSize: 12,
      verticalAlign: "top",
      background: "#fafafa",
      wordWrap: "break-word",
    },
    colon: {
      border: "1px solid #000",
      borderLeft: "none",
      padding: "5px 4px",
      textAlign: "center",
      verticalAlign: "top",
    },
    value: {
      border: "1px solid #000",
      borderLeft: "none",
      padding: "5px 8px",
      fontSize: 12,
      verticalAlign: "top",
      wordWrap: "break-word",
      overflowWrap: "break-word",
    },
    sectionHead: {
      border: "1px solid #000",
      padding: "4px 8px",
      fontWeight: "bold",
      fontSize: 13,
      textAlign: "center",
      background: "#fdeee0",
    },
  };

  // Single-table column proportions: label 24% | colon 3% | value 73%
  const COL_LABEL = "24%";
  const COL_COLON = "3%";
  const COL_VALUE = "73%";

  // Two-column (father/mother) table proportions, symmetric halves:
  // label 15% | colon 2% | value 33%  ×2  = 100%
  const HALF_LABEL = "15%";
  const HALF_COLON = "2%";
  const HALF_VALUE = "33%";

  // A single label:value row spanning the full table width
  const Row = ({ label, value, valueColSpan = 1 }) => (
    <tr>
      <td style={{ ...s.label, width: COL_LABEL }}>{label}</td>
      <td style={{ ...s.colon, width: COL_COLON }}>:</td>
      <td style={s.value} colSpan={valueColSpan}>
        {value || ""}
      </td>
    </tr>
  );

  // Two side-by-side label:value cells (used inside father/mother table)
  const HalfRow = ({ leftLabel, leftValue, rightLabel, rightValue }) => (
    <tr>
      <td style={{ ...s.label, width: HALF_LABEL }}>{leftLabel}</td>
      <td style={{ ...s.colon, width: HALF_COLON }}>:</td>
      <td style={{ ...s.value, width: HALF_VALUE }}>{leftValue || ""}</td>
      <td style={{ ...s.label, width: HALF_LABEL }}>{rightLabel}</td>
      <td style={{ ...s.colon, width: HALF_COLON }}>:</td>
      <td style={{ ...s.value, width: HALF_VALUE }}>{rightValue || ""}</td>
    </tr>
  );

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
        <img src={logo} alt="Nepal Sarkar" style={{ width: 70, height: 70 }} />
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
                minWidth: 100,
              }}
            >
              {formData.child_ward_number || ""}
            </span>
            ,&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 100,
              }}
            >
              {formData.child_municipality || ""}
            </span>
            &nbsp;नगरपालिका
          </div>
          <div style={{ fontSize: 12, marginTop: 2 }}>
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 90,
              }}
            >
              {formData.child_district || ""}
            </span>
            &nbsp;जिल्ला,&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 90,
              }}
            >
              {formData.child_province || ""}
            </span>
            &nbsp;प्रदेश
          </div>
          <div style={{ fontWeight: "bold", fontSize: 13, marginTop: 6 }}>
            Government of Nepal
          </div>
          <div style={{ fontSize: 12 }}>Office of the Local Registrar</div>
        </div>
        <div
          style={{
            border: "1px dashed #000",
            padding: "6px 10px",
            minWidth: 130,
            minHeight: 70,
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          कार्यालयको छाप
          <br />
          (Official Stamp)
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1.5px solid #000",
          margin: "6px 0",
        }}
      />

      {/* ── TITLE ── */}
      <div style={{ textAlign: "center", margin: "6px 0 8px" }}>
        <div style={{ fontWeight: "bold", fontSize: 24, letterSpacing: 1 }}>
          जन्म दर्ता प्रमाणपत्र
        </div>
        <div style={{ fontWeight: "bold", fontSize: 16, marginTop: 2 }}>
          (Birth Registration Certificate)
        </div>
      </div>

      {/* ── REGISTRATION META ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginBottom: 4,
        }}
      >
        <div>
          दर्ता नम्बर (Registration No.)&nbsp;:&nbsp;
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 160,
            }}
          >
            {formData.registration_no || ""}
          </span>
        </div>
        <div>
          दर्ता मिति (Date of Registration)&nbsp;:&nbsp;
          <span
            style={{
              borderBottom: "1px dotted #000",
              display: "inline-block",
              minWidth: 140,
            }}
          >
            {formData.registration_date || ""}
          </span>
        </div>
      </div>
      <div style={{ fontSize: 12, marginBottom: 4 }}>
        प्रमाणपत्र जारी मिति (Date of Issue)&nbsp;:&nbsp;
        <span
          style={{
            borderBottom: "1px dotted #000",
            display: "inline-block",
            minWidth: 140,
          }}
        >
          {formData.issue_date || ""}
        </span>
      </div>
      <div style={{ fontSize: 12, marginBottom: 4 }}>
        राष्ट्रिय परिचय नम्बर (NIN)&nbsp;:&nbsp;
        <span
          style={{
            borderBottom: "1px dotted #000",
            display: "inline-block",
            minWidth: 260,
          }}
        >
          {formData.nin || ""}
        </span>
      </div>

      {/* ── CHILD DETAILS ── */}
      <table style={s.table}>
        <colgroup>
          <col style={{ width: COL_LABEL }} />
          <col style={{ width: COL_COLON }} />
          <col style={{ width: COL_VALUE }} />
        </colgroup>
        <tbody>
          <Row label="पूरा नाम (Full Name)" value={fullName} />
          <Row
            label="जन्म मिति (Date of Birth)"
            value={
              formData.child_dob_bs || formData.child_dob_ad
                ? `${formData.child_dob_bs || ""}${
                    formData.child_dob_ad
                      ? ` (ई.सं. ${formData.child_dob_ad})`
                      : ""
                  }`
                : ""
            }
          />
          <Row label="लिङ्ग (Sex)" value={genderLabel} />
          <Row
            label="स्थायी ठेगाना (Permanent Address)"
            value={sharedAddress}
          />
          <Row
            label="जन्म स्थान (Birth Place)"
            value={[
              formData.child_province,
              formData.child_district,
              formData.child_municipality,
              formData.child_ward_number &&
                `वडा नं. ${formData.child_ward_number}`,
              formData.child_tole,
            ]
              .filter(Boolean)
              .join(", ")}
          />
          <Row
            label="जन्म भएको स्थान (Location of Birth)"
            value={birthPlaceLabel}
          />
          <Row label="जन्मको किसिम (Type of Birth)" value={birthKindLabel} />
          <Row
            label="जन्मको समयको तौल (Birth Weight)"
            value={weightValue}
          />
        </tbody>
      </table>

      {/* ── FATHER / MOTHER DETAILS ── */}
      <table style={s.table}>
        <colgroup>
          <col style={{ width: HALF_LABEL }} />
          <col style={{ width: HALF_COLON }} />
          <col style={{ width: HALF_VALUE }} />
          <col style={{ width: HALF_LABEL }} />
          <col style={{ width: HALF_COLON }} />
          <col style={{ width: HALF_VALUE }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={s.sectionHead} colSpan={3}>
              बाबुको विवरण (Father's Details)
            </td>
            <td style={s.sectionHead} colSpan={3}>
              आमाको विवरण (Mother's Details)
            </td>
          </tr>
          <HalfRow
            leftLabel="पूरा नाम (Full Name)"
            leftValue={fatherFullName}
            rightLabel="पूरा नाम (Full Name)"
            rightValue={motherFullName}
          />
          <HalfRow
            leftLabel="नागरिकता नं./ NIN वा पासपोर्ट नं."
            leftValue={formData.father_citizenship_no}
            rightLabel="नागरिकता नं./ NIN वा पासपोर्ट नं."
            rightValue={formData.mother_citizenship_no}
          />
          <HalfRow
            leftLabel="स्थायी ठेगाना (Permanent Address)"
            leftValue={sharedAddress}
            rightLabel="स्थायी ठेगाना (Permanent Address)"
            rightValue={sharedAddress}
          />
          <HalfRow
            leftLabel="पेशा (Occupation)"
            leftValue={formData.father_occupation}
            rightLabel="पेशा (Occupation)"
            rightValue={formData.mother_occupation}
          />
          <HalfRow
            leftLabel="राष्ट्रियता (Nationality)"
            leftValue={formData.father_nationality}
            rightLabel="राष्ट्रियता (Nationality)"
            rightValue={formData.mother_nationality}
          />
        </tbody>
      </table>

      {/* ── MARRIAGE REGISTRATION ── */}
      <table style={s.table}>
        <colgroup>
          <col style={{ width: COL_LABEL }} />
          <col style={{ width: COL_COLON }} />
          <col style={{ width: COL_VALUE }} />
        </colgroup>
        <tbody>
          <Row
            label="विवाह दर्ता मिति (Date of Marriage Registration)"
            value={formData.marriage_reg_date}
          />
          <Row
            label="विवाह दर्ता नं. (Marriage Registration No.)"
            value={formData.marriage_reg_no}
          />
        </tbody>
      </table>

      {/* ── INFORMANT'S DETAILS ── */}
      <table style={s.table}>
        <colgroup>
          <col style={{ width: COL_LABEL }} />
          <col style={{ width: COL_COLON }} />
          <col style={{ width: COL_VALUE }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={s.sectionHead} colSpan={3}>
              सूचनादाताको विवरण (Informant's Details)
            </td>
          </tr>
          <Row label="पूरा नाम (Full Name)" value={informantFullName} />
          <Row
            label="नागरिकता नं./ NIN वा पासपोर्ट नं."
            value={formData.nominee_citizenship_no}
          />
          <Row label="ठेगाना (Address)" value={sharedAddress} />
          <Row
            label="सम्पर्क नं. (Contact No.)"
            value={formData.nominee_contact_no}
          />
          <Row label="सम्बन्ध (Relation with Child)" value={relationLabel} />
        </tbody>
      </table>

      {/* ── SIGNATURE ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 24,
          fontSize: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 10 }}>
            दर्ता गर्नेको हस्ताक्षर (Signature)&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 220,
              }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            स्थानीय पञ्जिकाधिकारीको नाम (Name of Local Registrar)&nbsp;:&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 220,
              }}
            >
              {formData.registrar_name || ""}
            </span>
          </div>
          <div>
            पद (Designation)&nbsp;:&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 220,
              }}
            >
              {formData.registrar_designation || ""}
            </span>
          </div>
        </div>
        <div
          style={{
            border: "1px dashed #000",
            minWidth: 150,
            minHeight: 80,
            marginLeft: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            textAlign: "center",
          }}
        >
          कार्यालयको छाप
          <br />
          (Official Stamp)
        </div>
      </div>
    </div>
  );
}

export default Birth_certificate;