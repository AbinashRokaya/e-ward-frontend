import logo from "../../assets/nepal-sarkar.png";

// Converts any digits found in a value into Devanagari (Nepali) numerals.
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
function toNepaliNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/[0-9]/g, (d) => NEPALI_DIGITS[d]);
}

// Only the 7 provinces have a fixed Nepali translation available without a
// full district/municipality gazetteer — district and tole are left as
// typed, since those come from free text or the ward list's English names.
const PROVINCE_NEPALI_MAP = {
  Koshi: "कोशी",
  Madhesh: "मधेश",
  Bagmati: "बागमती",
  Gandaki: "गण्डकी",
  Lumbini: "लुम्बिनी",
  Karnali: "कर्णाली",
  Sudurpashchim: "सुदूरपश्चिम",
};
function toNepaliProvince(value) {
  if (!value) return "";
  return PROVINCE_NEPALI_MAP[value] || value;
}

// Splits a "YYYY-MM-DD" style BS date string into its three parts for the
// वर्ष/महिना/गते column layout the form uses. Falls back gracefully if the
// stored format doesn't match.
function splitBsDate(value) {
  if (!value) return { year: "", month: "", day: "" };
  const parts = String(value).split(/[-/.]/).filter(Boolean);
  return {
    year: toNepaliNumber(parts[0] || ""),
    month: toNepaliNumber(parts[1] || ""),
    day: toNepaliNumber(parts[2] || ""),
  };
}

const MARITAL_LABELS = {
  UNMARRIED: "अविवाहित",
  MARRIED: "विवाहित",
  WIDOWED: "विधुर/विधवा",
  DIVORCED: "अन्य",
};

const TIME_PERIOD_LABELS = {
  MORNING: "बिहान",
  AFTERNOON: "दिउँसो",
  EVENING: "साँझ",
  NIGHT: "राति",
};

// Same keys/labels as the DOCUMENT_FIELDS used on the death registration
// form step, so the preview shows exactly what was uploaded there.
// Citizenship documents are two-sided (dual: true), so their state is
// { front, back } instead of a single { file, previewUrl }.
const DOCUMENT_FIELDS_META = {
  deceased_citizenship: {
    label: "मृतकको नागरिकता (Deceased's Citizenship)",
    dual: true,
  },
  informant_citizenship: {
    label: "सूचना दिने व्यक्तिको नागरिकता (Informant's Citizenship)",
    dual: true,
  },
  hospital_death_report: {
    label: "अस्पताल मृत्यु प्रतिवेदन (Hospital Death Report)",
  },
  police_report: { label: "प्रहरी प्रतिवेदन (Police Report)" },
};

function normalize(raw = {}) {
  const deceased = raw.deceased || {};
  const deathDetail = raw.death_detail || {};
  const informant = raw.informant || {};
  const address = raw.address || {};

  const deceasedNameNp = [
    deceased.deceased_nepali_first_name,
    deceased.deceased_nepali_middle_name,
    deceased.deceased_nepali_last_name,
  ]
    .filter(Boolean)
    .join(" ");
  const deceasedNameEn = [
    deceased.deceased_first_name,
    deceased.deceased_middle_name,
    deceased.deceased_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const dob = splitBsDate(deceased.deceased_dob_bs);
  const dod = splitBsDate(deathDetail.death_date_bs);

  return {
    deceased_name_np: deceasedNameNp,
    deceased_name_en: deceasedNameEn,
    deceased_gender: deceased.deceased_gender || "",
    dob,
    age_years: toNepaliNumber(deceased.deceased_age_years),
    age_months: toNepaliNumber(deceased.deceased_age_months),
    age_days: toNepaliNumber(deceased.deceased_age_days),
    marital_status: deceased.deceased_marital_status || "",

    deceased_province: toNepaliProvince(address.deceased_province),
    deceased_district: address.deceased_district || "",
    deceased_ward: toNepaliNumber(address.deceased_ward_number),
    deceased_tole: address.deceased_tole || "",

    citizenship_no: toNepaliNumber(deceased.deceased_citizenship_no),
    occupation: deceased.deceased_occupation || "",
    other_id_no: toNepaliNumber(deceased.deceased_other_id_no),

    dod,
    time_period: deathDetail.death_time_period || "",
    death_time: toNepaliNumber(deathDetail.death_time),

    death_place_province: toNepaliProvince(address.death_place_province),
    death_place_district: address.death_place_district || "",
    death_place_ward: toNepaliNumber(address.death_place_ward_number),
    death_place_tole: address.death_place_tole || "",
    death_place_type: deathDetail.death_place_type || "",
    death_place_other_detail: deathDetail.death_place_other_detail || "",

    death_cause: deathDetail.death_cause || "",
    death_type: deathDetail.death_type || "",
    death_type_other_detail: deathDetail.death_type_other_detail || "",

    residence_years: toNepaliNumber(deathDetail.residence_duration_years),
    residence_months: toNepaliNumber(deathDetail.residence_duration_months),
    residence_days: toNepaliNumber(deathDetail.residence_duration_days),

    informant_name: informant.informant_name || "",
    informant_relationship: informant.informant_relationship || "",
    informant_province: toNepaliProvince(address.informant_province),
    informant_district: address.informant_district || "",
    informant_ward: toNepaliNumber(address.informant_ward_number),
    informant_tole: address.informant_tole || "",
    informant_contact_no: toNepaliNumber(informant.informant_contact_no),
    declared_date_bs: toNepaliNumber(informant.declared_date_bs),

    ward_nepali_name: address.ward_nepali_name || "",
    ward_nepali_municipality: address.ward_nepali_municipality || "",
    ward_nepali_district: address.ward_nepali_district || "",
    ward_nepali_province: address.ward_nepali_province || "",

    reject_text: raw.reject?.reject_text ?? raw.reject_text ?? "",
  };
}

// Shows thumbnails for whatever documents were selected on the death
// registration form step. `documents` has the same shape as
// DeathRegistration's document state: { [key]: { file, previewUrl } },
// previewUrl === "pdf" for PDF uploads.
function DocumentsPreview({ documents, sectionHeadStyle }) {
  if (!documents) return null;

  // Flatten { deceased_citizenship: { front, back } } into individual rows,
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
    <div style={{ border: "1px solid #000", marginTop: 8 }}>
      <div style={sectionHeadStyle}>संलग्न कागजातहरू (Attached Documents)</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "14px",
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

function DeathPreview({
  formData: rawFormData,
  documents,
  rejectText,
  onRejectChange,
  showRejectSection = false,
}) {
  const d = normalize(rawFormData);

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

  const Blank = ({ minWidth = 120 }) => (
    <span
      style={{
        borderBottom: "1px dotted #000",
        display: "inline-block",
        minWidth,
        fontSize: 12,
      }}
    />
  );

  const Field = ({ label, value, minWidth = 140 }) => (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
      <span>{label}&nbsp;:&nbsp;</span>
      <span
        style={{
          borderBottom: "1px dotted #000",
          display: "inline-block",
          minWidth,
          fontSize: 12,
        }}
      >
        {value || ""}
      </span>
    </span>
  );

  // Three-column वर्ष/महिना/गते (or दिन) date-part layout used for both DOB
  // and date of death.
  const DatePartsRow = ({ label, parts }) => (
    <div style={s.inlineGroup}>
      <span style={{ minWidth: 130 }}>{label}&nbsp;:</span>
      <span style={s.dateCell}>
        वर्ष&nbsp;
        <Blank minWidth={50} />
      </span>
      <span style={s.dateCell}>
        महिना&nbsp;
        <Blank minWidth={40} />
      </span>
      <span style={s.dateCell}>
        गते&nbsp;
        <Blank minWidth={40} />
      </span>
      <span style={{ fontSize: 12, marginLeft: 6 }}>
        {parts.year && parts.month && parts.day
          ? `(${parts.year}/${parts.month}/${parts.day})`
          : ""}
      </span>
    </div>
  );

  const AddressLine = ({ label, province, district, ward, tole }) => (
    <div>
      <div style={s.inlineGroup}>
        <span style={{ minWidth: 130 }}>{label}&nbsp;:</span>
        <Field label="प्रदेश" value={province} minWidth={100} />
        <Field label="जिल्ला" value={district} minWidth={100} />
        <Field label="वडा नं." value={ward} minWidth={60} />
      </div>
      <div style={{ ...s.inlineGroup, paddingLeft: 138 }}>
        <Field label="टोल/बस्ती" value={tole} minWidth={220} />
      </div>
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
    box: { border: "1px solid #000", marginTop: 8 },
    secHead: {
      fontWeight: "bold",
      fontSize: 13,
      padding: "4px 8px",
      background: "#000",
      color: "#fff",
    },
    cbRow: {
      display: "flex",
      alignItems: "center",
      padding: "3px 8px",
      fontSize: 12,
      flexWrap: "wrap",
      gap: 10,
    },
    inlineGroup: {
      display: "flex",
      alignItems: "baseline",
      gap: 8,
      flexWrap: "wrap",
      padding: "3px 8px",
      fontSize: 12,
    },
    dateCell: {
      display: "inline-flex",
      alignItems: "baseline",
      gap: 2,
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
          <div style={{ fontWeight: "bold", fontSize: 18, color: "#c00000" }}>
            नेपाल सरकार
          </div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>गृह मन्त्रालय</div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>स्थानिय तह</div>
          <div style={{ fontSize: 11 }}>
            (गा.पा. / न.पा. / उप-महानगरपालिका / महानगरपालिका)
          </div>
          <div style={{ fontWeight: "bold", fontSize: 20, marginTop: 4 }}>
            वडा कार्यालय
          </div>
          <div style={{ fontSize: 12, marginTop: 3 }}>
            वडा नं.&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 70,
              }}
            >
              {d.deceased_ward || d.ward_nepali_name || ""}
            </span>
          </div>
          <div style={{ fontSize: 12, marginTop: 2 }}>
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 150,
              }}
            >
              {d.ward_nepali_province || d.deceased_province || ""}
            </span>
            ,&nbsp;नेपाल
          </div>
        </div>
        <div
          style={{
            border: "1px solid #000",
            padding: "5px 10px",
            minWidth: 150,
            fontSize: 11,
          }}
        >
          <div
            style={{ fontWeight: "bold", textAlign: "center", marginBottom: 6 }}
          >
            कार्यालय प्रयोगको लागि
          </div>
          <div style={{ marginBottom: 4 }}>
            दर्ता नं.&nbsp;:&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 70,
              }}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            दर्ता मिति&nbsp;:&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 70,
              }}
            />
          </div>
          <div>
            पाना नं.&nbsp;:&nbsp;
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
          मृत्यु दर्ता फाराम
        </div>
        <div style={{ fontSize: 11, marginTop: 1 }}>
          (मृत्यु दर्ता नियमावली, २०५४ को नियम ४ सम्बन्धी)
        </div>
        <div style={{ fontSize: 11 }}>
          दर्ता गराउन आउने व्यक्तिले यो फाराम साँचाकै पूर्ण रूपमा भरि रूजु गरी
          पेस गर्नुपर्छ ।
        </div>
      </div>

      {/* ── १. मृतकको व्यक्तिगत विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>१. मृतकको व्यक्तिगत विवरण</div>

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 130 }}>(क) पूरा नाम (नेपालीमा)&nbsp;:</span>
          <Blank minWidth={220} />
          <span>{d.deceased_name_np}</span>
        </div>
        <div style={s.inlineGroup}>
          <span style={{ minWidth: 130 }}>
            (ख) पूरा नाम (अङ्ग्रेजीमा)&nbsp;:
          </span>
          <Blank minWidth={220} />
          <span>{d.deceased_name_en}</span>
        </div>

        <div style={s.cbRow}>
          <span style={{ minWidth: 60 }}>(ग) लिङ्ग&nbsp;:</span>
          <span>
            <Box checked={d.deceased_gender === "MALE"} />
            पुरुष
          </span>
          <span>
            <Box checked={d.deceased_gender === "FEMALE"} />
            महिला
          </span>
          <span>
            <Box checked={d.deceased_gender === "OTHER"} />
            अन्य
          </span>
        </div>

        <DatePartsRow label="(घ) जन्म मिति (वि.सं.)" parts={d.dob} />

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 130 }}>(ङ) उमेर&nbsp;:</span>
          <span>वर्ष&nbsp;{d.age_years}</span>
          <span>महिना&nbsp;{d.age_months}</span>
          <span>दिन&nbsp;{d.age_days}</span>
        </div>

        <div style={s.cbRow}>
          <span style={{ minWidth: 130 }}>(च) वैवाहिक स्थिति&nbsp;:</span>
          <span>
            <Box checked={d.marital_status === "UNMARRIED"} />
            अविवाहित
          </span>
          <span>
            <Box checked={d.marital_status === "MARRIED"} />
            विवाहित
          </span>
          <span>
            <Box checked={d.marital_status === "WIDOWED"} />
            विधुर/विधवा
          </span>
          <span>
            <Box checked={d.marital_status === "DIVORCED"} />
            अन्य
          </span>
        </div>

        <AddressLine
          label="(छ) स्थायी ठेगाना"
          province={d.deceased_province}
          district={d.deceased_district}
          ward={d.deceased_ward}
          tole={d.deceased_tole}
        />

        <div style={s.inlineGroup}>
          <Field
            label="(ज) नागरिकता नं."
            value={d.citizenship_no}
            minWidth={160}
          />
          <span style={{ minWidth: 30 }} />
          <Field label="(झ) पेशा" value={d.occupation} minWidth={140} />
        </div>

        <div style={s.inlineGroup}>
          <Field
            label="(ञ) अन्य परिचय नं. (भएमा)"
            value={d.other_id_no}
            minWidth={200}
          />
        </div>
      </div>

      {/* ── २. मृत्यु सम्बन्धी विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>२. मृत्यु सम्बन्धी विवरण</div>

        <DatePartsRow label="(क) मृत्यु मिति (वि.सं.)" parts={d.dod} />

        <div style={s.cbRow}>
          <span style={{ minWidth: 130 }}>(ख) मृत्यु समय&nbsp;:</span>
          <span>
            <Box checked={d.time_period === "MORNING"} />
            बिहान
          </span>
          <span>
            <Box checked={d.time_period === "AFTERNOON"} />
            दिउँसो
          </span>
          <span>
            <Box checked={d.time_period === "EVENING"} />
            साँझ
          </span>
          <span>
            <Box checked={d.time_period === "NIGHT"} />
            राति
          </span>
          <span style={{ marginLeft: 10 }}>समय&nbsp;:&nbsp;</span>
          <Blank minWidth={80} />
          <span>{d.death_time}</span>
        </div>

        <AddressLine
          label="(ग) मृत्यु स्थान"
          province={d.death_place_province}
          district={d.death_place_district}
          ward={d.death_place_ward}
          tole={d.death_place_tole}
        />
        <div style={s.cbRow}>
          <span style={{ minWidth: 130 }} />
          <span>
            <Box checked={d.death_place_type === "HOME"} />
            घर
          </span>
          <span>
            <Box checked={d.death_place_type === "HOSPITAL"} />
            अस्पताल
          </span>
          <span>
            <Box checked={d.death_place_type === "OTHER"} />
            अन्य&nbsp;(खुले)&nbsp;
          </span>
          <Blank minWidth={140} />
          <span>
            {d.death_place_type === "OTHER" ? d.death_place_other_detail : ""}
          </span>
        </div>

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 130 }}>
            (घ) मृत्युको कारण (चिकित्सकको राय अनुसार भएमा)&nbsp;:
          </span>
          <Blank minWidth={400} />
        </div>
        <div style={{ padding: "0 8px 4px 138px", fontSize: 12 }}>
          {d.death_cause}
        </div>

        <div style={s.cbRow}>
          <span style={{ minWidth: 130 }}>(ङ) मृत्युको प्रकार&nbsp;:</span>
          <span>
            <Box checked={d.death_type === "NATURAL"} />
            प्राकृतिक
          </span>
          <span>
            <Box checked={d.death_type === "ACCIDENT"} />
            दुर्घटना
          </span>
          <span>
            <Box checked={d.death_type === "SUICIDE"} />
            आत्महत्या
          </span>
          <span>
            <Box checked={d.death_type === "HOMICIDE"} />
            हत्या
          </span>
          <span>
            <Box checked={d.death_type === "OTHER"} />
            अन्य&nbsp;(खुले)&nbsp;
          </span>
          <Blank minWidth={120} />
          <span>
            {d.death_type === "OTHER" ? d.death_type_other_detail : ""}
          </span>
        </div>

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 130 }}>
            (च) मृत्यु भएको ठेगानामा मृतक बसोबास गरेको अवधि&nbsp;:
          </span>
          <span>वर्ष&nbsp;{d.residence_years}</span>
          <span>महिना&nbsp;{d.residence_months}</span>
          <span>दिन&nbsp;{d.residence_days}</span>
        </div>
      </div>

      {/* ── ३. जानकारी दिने व्यक्तिको विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>३. जानकारी दिने व्यक्तिको विवरण</div>

        <div style={s.inlineGroup}>
          <Field label="(क) नाम" value={d.informant_name} minWidth={220} />
          <span style={{ minWidth: 30 }} />
          <Field
            label="(ख) सम्बन्ध"
            value={d.informant_relationship}
            minWidth={140}
          />
        </div>

        <AddressLine
          label="(ग) ठेगाना"
          province={d.informant_province}
          district={d.informant_district}
          ward={d.informant_ward}
          tole={d.informant_tole}
        />

        <div style={s.inlineGroup}>
          <Field
            label="(घ) सम्पर्क नं."
            value={d.informant_contact_no}
            minWidth={160}
          />
          <span style={{ minWidth: 30 }} />
          <span>(ङ) दस्तखत&nbsp;:&nbsp;</span>
          <Blank minWidth={150} />
        </div>
      </div>

      {/* ── घोषणा ── */}
      <div style={{ ...s.box, padding: "8px" }}>
        <div style={{ textAlign: "center", fontSize: 12 }}>
          माथि उल्लेखित विवरणहरू सही छन् । झुटा ठहरेमा प्रचलित कानुन बमोजिम हुने
          सजाय भोग्न तयार छु ।
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 20,
            marginTop: 8,
            fontSize: 12,
          }}
        >
          <span>
            मिति&nbsp;:&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 100,
              }}
            >
              {d.declared_date_bs}
            </span>
          </span>
          <span>
            दस्तखत&nbsp;:&nbsp;
            <span
              style={{
                borderBottom: "1px dotted #000",
                display: "inline-block",
                minWidth: 100,
              }}
            />
          </span>
        </div>
      </div>

      {/* ── संलग्न कागजातहरू (checklist) ── */}
      <div style={{ ...s.box, padding: "8px" }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>
          संलग्न कागजातहरू&nbsp;: (✓ चिन्ह लगाउनुहोस्)
        </div>
        <div style={{ ...s.cbRow, padding: 0 }}>
          <span>
            <Box
              checked={
                !!documents?.deceased_citizenship?.front?.previewUrl ||
                !!documents?.deceased_citizenship?.back?.previewUrl
              }
            />
            मृतकको नागरिकता प्रतिलिपि
          </span>
          <span>
            <Box checked={!!documents?.hospital_death_report?.previewUrl} />
            अस्पताल/स्वास्थ्य संस्थाको सिफारिस (भएमा)
          </span>
        </div>
        <div style={{ ...s.cbRow, padding: 0 }}>
          <span>
            <Box
              checked={
                !!documents?.informant_citizenship?.front?.previewUrl ||
                !!documents?.informant_citizenship?.back?.previewUrl
              }
            />
            सूचना दिने व्यक्तिको नागरिकता प्रतिलिपि
          </span>
          <span>
            <Box checked={!!documents?.police_report?.previewUrl} />
            प्रहरी प्रतिवेदन (भएमा)
          </span>
        </div>
        <div style={{ ...s.inlineGroup, paddingTop: 0 }}>
          <span>
            <Box />
            अन्य&nbsp;:&nbsp;
          </span>
          <Blank minWidth={250} />
        </div>
      </div>

      {/* ── संलग्न कागजातहरू (uploaded document thumbnails) ── */}
      <DocumentsPreview documents={documents} sectionHeadStyle={s.secHead} />

      {/* ── Reject section (only in officer review flows) ── */}
      {showRejectSection && (
        <div style={{ ...s.box, padding: "8px" }}>
          <div style={{ fontSize: 12, marginBottom: 6, color: "#555" }}>
            अस्वीकृतिको कारण (Reject Reason)&nbsp;:
          </div>
          <textarea
            rows={3}
            value={rejectText}
            onChange={(e) => onRejectChange?.(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #fc8181",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 12,
              fontFamily:
                "'Noto Sans Devanagari', 'Noto Sans', Arial, sans-serif",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              background: "#fff",
            }}
            placeholder="अस्वीकृतिको कारण लेख्नुहोस् (Enter rejection reason)..."
          />
        </div>
      )}

      {/* ── Note ── */}
      <div style={{ fontSize: 11, marginTop: 6 }}>
        <strong>नोट&nbsp;:</strong> मृत्युभएको ३५ (पैंतीस) दिन भित्र दर्ता
        गराउनु कानुनी दायित्व हो ।
      </div>
    </div>
  );
}

export default DeathPreview;
