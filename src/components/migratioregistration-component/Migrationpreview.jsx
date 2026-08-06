import logo from "../../assets/nepal-sarkar.png";

// Converts any digits found in a value into Devanagari (Nepali) numerals.
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
function toNepaliNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/[0-9]/g, (d) => NEPALI_DIGITS[d]);
}

// Fallback only — used if a saved address somehow has no province_np
// (e.g. records created before the Nepali fields existed). Once every
// address carries province_np from the ward list, this map is dead code
// kept only as a safety net.
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

// Nepali labels for the OccupationType enum — keys must match
// enums/migration_enum.py OccupationType values exactly.
const OCCUPATION_NEPALI_MAP = {
  FARMER: "कृषक",
  SERVICE: "सेवा",
  BUSINESS: "व्यवसाय",
  STUDENT: "विद्यार्थी",
  LABOUR: "मजदूर",
  HOUSEWIFE: "गृहिणी",
  UNEMPLOYED: "बेरोजगार",
  OTHER: "अन्य",
};
function toNepaliOccupation(value) {
  if (!value) return "";
  return OCCUPATION_NEPALI_MAP[value] || value;
}

const NEPALI_ROW_NUMBERS = ["१", "२", "३", "४", "५", "६", "७", "८", "९", "१०"];

// ── Document preview config ─────────────────────────────────────────────────
// Must match the keys used in MigrationRegistration's `documents` state.
const DOCUMENT_FIELDS_META = {
  applicant_citizenship: {
    label: "निवेदकको नागरिकता (Applicant's Citizenship)",
    dual: true,
  },
  address_proof: { label: "ठेगाना प्रमाण (Address Proof)" },
  destination_proof: { label: "गन्तव्य प्रमाण (Destination Proof)" },
  applicant_photo: { label: "निवेदकको फोटो (Applicant Photo)" },
};

// Same shape as MigrationRegistration's document state:
// { [key]: { file, previewUrl } } or { [key]: { front, back } } for dual docs.
// previewUrl === "pdf" for PDF uploads.
function DocumentsPreview({ documents }) {
  if (!documents) return null;

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
      <div
        style={{
          fontWeight: "bold",
          fontSize: 13,
          padding: "4px 8px",
          borderBottom: "1px solid #000",
          background: "#f2f2f2",
        }}
      >
        संलग्न कागजातहरू (Attached Documents)
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "14px 8px",
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

function findAddress(addresses, type) {
  return (addresses || []).find((a) => a.address_type === type) || {};
}

function normalize(raw = {}) {
  const applicant = raw.applicant || {};
  const migrationDetail = raw.migration_detail || {};
  const familyMembers = raw.family_members || [];

  const permanent = findAddress(raw.addresses, "PERMANENT");
  const current = findAddress(raw.addresses, "CURRENT");
  const destination = findAddress(raw.addresses, "NEW");

  // Prefer the Nepali values captured at selection time (province_np,
  // district_np, municipality_np, ward_name_np — same pattern as birth's
  // ward_nepali_* fields). Fall back to the English/typed values only if
  // an address predates those fields.
  const mapAddress = (a) => ({
    province: a.province_np || toNepaliProvince(a.province),
    district: a.district_np || a.district || "",
    municipality: a.municipality_np || a.municipality || "",
    ward: toNepaliNumber(a.ward_number),
    tole: a.ward_name_np || a.tole || "",
  });

  return {
    applicant_name_np: applicant.applicant_full_name_np || "",
    applicant_name_en: applicant.applicant_full_name_en || "",
    applicant_gender: applicant.applicant_gender || "",
    applicant_dob_bs: toNepaliNumber(applicant.applicant_dob_bs),
    applicant_dob_ad: toNepaliNumber(applicant.applicant_dob_ad),
    applicant_citizenship_no: toNepaliNumber(
      applicant.applicant_citizenship_no,
    ),
    applicant_nationality: applicant.applicant_nationality || "",
    applicant_occupation: toNepaliOccupation(applicant.applicant_occupation),
    applicant_contact_no: toNepaliNumber(applicant.applicant_contact_no),

    permanent: mapAddress(permanent),
    current: mapAddress(current),
    destination: mapAddress(destination),

    migration_date_bs: toNepaliNumber(migrationDetail.migration_date_bs),
    migration_date_ad: toNepaliNumber(migrationDetail.migration_date_ad),
    migration_reason: migrationDetail.migration_reason || "",
    migration_reason_other: migrationDetail.migration_reason_other || "",

    family_members: familyMembers.map((m) => ({
      name_np: m.member_name_np || "",
      name_en: m.member_name_en || "",
      relationship: m.member_relationship || "",
      gender: m.member_gender || "",
      dob_bs: toNepaliNumber(m.member_dob_bs),
      dob_ad: toNepaliNumber(m.member_dob_ad),
      citizenship_no: toNepaliNumber(m.member_citizenship_no),
      remarks: m.member_remarks || "",
    })),

    enclosure_citizenship_copy: !!raw.enclosure_citizenship_copy,
    enclosure_address_proof: !!raw.enclosure_address_proof,
    enclosure_destination_proof: !!raw.enclosure_destination_proof,
    enclosure_photo_count: toNepaliNumber(raw.enclosure_photo_count),
    enclosure_other: raw.enclosure_other || "",
  };
}

const REASON_OPTIONS = [
  { value: "EMPLOYMENT", label: "रोजगारी (Employment)" },
  { value: "STUDY", label: "अध्ययन (Study)" },
  { value: "BUSINESS", label: "व्यवसाय (Business)" },
  { value: "MARRIAGE", label: "विवाह (Marriage)" },
  { value: "SETTLEMENT", label: "बसोबास (Settlement)" },
];

function MigrationPreview({
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

  const AddressBlock = ({ label, addr }) => (
    <div>
      <div style={s.inlineGroup}>
        <span style={{ fontWeight: 600, minWidth: 220 }}>{label}&nbsp;:</span>
      </div>
      <div style={{ ...s.inlineGroup, paddingLeft: 20 }}>
        <Field label="प्रदेश" value={addr.province} minWidth={100} />
        <Field label="जिल्ला" value={addr.district} minWidth={100} />
        <Field label="स्थानीय तह" value={addr.municipality} minWidth={110} />
        <Field label="वडा नं." value={addr.ward} minWidth={50} />
      </div>
      <div style={{ ...s.inlineGroup, paddingLeft: 20 }}>
        <Field label="टोल/गाउँ" value={addr.tole} minWidth={400} />
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
      borderBottom: "1px solid #000",
      background: "#f2f2f2",
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
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 11,
    },
    th: {
      border: "1px solid #000",
      padding: "3px 4px",
      background: "#f2f2f2",
      fontWeight: 600,
    },
    td: {
      border: "1px solid #000",
      padding: "3px 4px",
      textAlign: "center",
      minHeight: 20,
    },
  };

  const rowCount = Math.max(5, d.family_members.length);

  return (
    <div style={s.page}>
      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 4,
          border: "1px solid #000",
          padding: 8,
        }}
      >
        <div style={{ fontSize: 12, lineHeight: 1.7 }}>
          <Field label="वडा नं." value={d.destination.ward} minWidth={90} />
          <br />
          <Field
            label="गाउँपालिका/नगरपालिका"
            value={d.destination.municipality}
            minWidth={110}
          />
          <br />
          <Field label="जिल्ला" value={d.destination.district} minWidth={110} />
          <br />
          <Field label="प्रदेश" value={d.destination.province} minWidth={110} />
        </div>

        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontWeight: "bold", fontSize: 16 }}>नेपाल सरकार</div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>स्थानीय तह</div>
          <div style={{ fontWeight: "bold", fontSize: 26, marginTop: 4 }}>
            वडा कार्यालय
          </div>
        </div>

        <div style={{ fontSize: 11, lineHeight: 2 }}>
          <div>
            दर्ता नं. (Regd. No.)&nbsp;:&nbsp;
            <Blank minWidth={90} />
          </div>
          <div>
            मिति (Date)&nbsp;:&nbsp;
            <Blank minWidth={90} />
          </div>
          <div>
            चलानी नं. (Ref. No.)&nbsp;:&nbsp;
            <Blank minWidth={90} />
          </div>
        </div>
      </div>

      {/* ── TITLE ── */}
      <div style={{ textAlign: "center", margin: "10px 0 2px" }}>
        <div style={{ fontWeight: "bold", fontSize: 18 }}>
          बसाईसराई (माईग्रेसन) प्रमाणपत्रको लागि निवेदन फाराम
        </div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>
          (Migration Certificate Application Form)
        </div>
        <div style={{ fontSize: 11, marginTop: 4 }}>
          (स्थानीय प्रशासन ऐन, २०२६ को दफा ११ बमोजिम)
        </div>
        <div style={{ fontSize: 11 }}>
          यस फाराम भरी आवश्यक कागजातसहित वडा कार्यालयमा पेश गर्नुहोला ।
        </div>
      </div>

      {/* ── १. निवेदकको व्यक्तिगत विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>
          १. निवेदकको व्यक्तिगत विवरण (Personal Details of Applicant)
        </div>

        <div style={s.inlineGroup}>
          <Field
            label="(क) पूरा नाम (नेपालीमा)"
            value={d.applicant_name_np}
            minWidth={220}
          />
        </div>
        <div style={s.inlineGroup}>
          <Field
            label="(ख) पूरा नाम (अंग्रेजीमा)"
            value={d.applicant_name_en}
            minWidth={220}
          />
        </div>

        <div style={s.cbRow}>
          <span style={{ minWidth: 90 }}>(ग) लिङ्ग (Sex)&nbsp;:</span>
          <span>
            <Box checked={d.applicant_gender === "MALE"} />
            पुरुष (Male)
          </span>
          <span>
            <Box checked={d.applicant_gender === "FEMALE"} />
            महिला (Female)
          </span>
          <span>
            <Box checked={d.applicant_gender === "OTHER"} />
            अन्य (Other)
          </span>
        </div>

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 130 }}>(घ) जन्म मिति (वि.सं.)&nbsp;:</span>
          <Blank minWidth={110} />
          <span>{d.applicant_dob_bs}</span>
          <span>&nbsp;(ई.सं.)&nbsp;:</span>
          <Blank minWidth={110} />
          <span>{d.applicant_dob_ad}</span>
        </div>

        <div style={s.inlineGroup}>
          <Field
            label="(ङ) नागरिकता नं."
            value={d.applicant_citizenship_no}
            minWidth={180}
          />
          <span style={{ minWidth: 30 }} />
          <Field
            label="(च) राष्ट्रियता"
            value={d.applicant_nationality}
            minWidth={140}
          />
        </div>

        <div style={s.inlineGroup}>
          <Field
            label="(छ) पेशा/व्यवसाय"
            value={d.applicant_occupation}
            minWidth={180}
          />
          <span style={{ minWidth: 30 }} />
          <Field
            label="(ज) सम्पर्क नं."
            value={d.applicant_contact_no}
            minWidth={140}
          />
        </div>

        <AddressBlock
          label="(झ) स्थायी ठेगाना (Permanent Address)"
          addr={d.permanent}
        />
        <AddressBlock
          label="(ञ) हालको ठेगाना (Address at the time of leaving)"
          addr={d.current}
        />
      </div>

      {/* ── २. बसाईसराई गर्ने विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>२. बसाईसराई गर्ने विवरण (Migration Details)</div>

        <AddressBlock
          label="(क) बसाईसराई गर्ने स्थान (New Address)"
          addr={d.destination}
        />

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 220 }}>
            (ख) बसाईसराई गर्ने मिति (Date of Migration)&nbsp;:
          </span>
          <Blank minWidth={100} />
          <span>{d.migration_date_bs}</span>
          <span>&nbsp;(वि.सं.)&nbsp;</span>
          <Blank minWidth={100} />
          <span>{d.migration_date_ad}</span>
          <span>&nbsp;(ई.सं.)</span>
        </div>

        <div style={s.cbRow}>
          <span style={{ minWidth: 220 }}>
            (ग) बसाईसराईको कारण (Reason for Migration)&nbsp;:
          </span>
        </div>
        <div style={{ ...s.cbRow, paddingLeft: 20 }}>
          {REASON_OPTIONS.map((opt) => (
            <span key={opt.value}>
              <Box checked={d.migration_reason === opt.value} />
              {opt.label}
            </span>
          ))}
        </div>
        <div style={{ ...s.inlineGroup, paddingLeft: 20 }}>
          <span>
            <Box checked={d.migration_reason === "OTHER"} />
            अन्य (Other)&nbsp;:&nbsp;
          </span>
          <Blank minWidth={250} />
          <span>
            {d.migration_reason === "OTHER" ? d.migration_reason_other : ""}
          </span>
        </div>
      </div>

      {/* ── ३. परिवारका सदस्यहरुको विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>
          ३. परिवारका सदस्यहरुको विवरण (Family Members Details)
        </div>
        <div style={{ padding: 8 }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th} rowSpan={2}>
                  सि.नं.
                </th>
                <th style={s.th} colSpan={2}>
                  नाम, थर
                </th>
                <th style={s.th} rowSpan={2}>
                  सम्बन्ध
                </th>
                <th style={s.th} colSpan={3}>
                  लिङ्ग
                </th>
                <th style={s.th} colSpan={2}>
                  जन्म मिति
                </th>
                <th style={s.th} rowSpan={2}>
                  नागरिकता नं.
                </th>
                <th style={s.th} rowSpan={2}>
                  कैफियत
                </th>
              </tr>
              <tr>
                <th style={s.th}>नेपालीमा</th>
                <th style={s.th}>अंग्रेजीमा</th>
                <th style={s.th}>पुरुष</th>
                <th style={s.th}>महिला</th>
                <th style={s.th}>अन्य</th>
                <th style={s.th}>वि.सं.</th>
                <th style={s.th}>ई.सं.</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, i) => {
                const m = d.family_members[i] || {};
                return (
                  <tr key={i}>
                    <td style={s.td}>{NEPALI_ROW_NUMBERS[i] || i + 1}</td>
                    <td style={s.td}>{m.name_np || ""}</td>
                    <td style={s.td}>{m.name_en || ""}</td>
                    <td style={s.td}>{m.relationship || ""}</td>
                    <td style={s.td}>
                      <Box checked={m.gender === "MALE"} />
                    </td>
                    <td style={s.td}>
                      <Box checked={m.gender === "FEMALE"} />
                    </td>
                    <td style={s.td}>
                      <Box checked={m.gender === "OTHER"} />
                    </td>
                    <td style={s.td}>{m.dob_bs || ""}</td>
                    <td style={s.td}>{m.dob_ad || ""}</td>
                    <td style={s.td}>{m.citizenship_no || ""}</td>
                    <td style={s.td}>{m.remarks || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── संलग्न कागजातहरू (uploaded documents) ── */}
      <DocumentsPreview documents={documents} />

      {/* ── ४. संलग्न कागजातहरु + ५. निवेदकको घोषणा (side by side) ── */}
      <div style={{ display: "flex", marginTop: 8, gap: 0 }}>
        <div style={{ ...s.box, marginTop: 0, flex: 1 }}>
          <div style={s.secHead}>४. संलग्न कागजातहरु (Enclosures)</div>
          <div style={{ padding: "6px 8px", fontSize: 12 }}>
            <div style={{ marginBottom: 4 }}>
              <Box checked={d.enclosure_citizenship_copy} />
              (क) नागरिकताको प्रतिलिपि
            </div>
            <div style={{ marginBottom: 4 }}>
              <Box checked={d.enclosure_address_proof} />
              (ख) हालको स्थायी ठेगानाको प्रमाण (जस्तै: नागरिकता/मतदाता
              परिचयपत्र/भाडा सम्झौता आदि)
            </div>
            <div style={{ marginBottom: 4 }}>
              <Box checked={d.enclosure_destination_proof} />
              (ग) बसाईसराई गर्ने स्थानको प्रमाण (जस्तै: जागिरको पत्र/घर
              पत्र/व्यवसाय दर्ता/भाडा सम्झौता आदि)
            </div>
            <div style={{ marginBottom: 4 }}>
              <Box checked={!!d.enclosure_photo_count} />
              (घ) पासपोर्ट साइजको फोटो – {d.enclosure_photo_count || "२"} प्रति
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <Box checked={!!d.enclosure_other} />
              <span>(ङ) अन्य&nbsp;:&nbsp;</span>
              <Blank minWidth={140} />
              <span>{d.enclosure_other}</span>
            </div>
          </div>
        </div>

        <div style={{ ...s.box, marginTop: 0, flex: 1, borderLeft: "none" }}>
          <div style={s.secHead}>
            ५. निवेदकको घोषणा (Declaration by Applicant)
          </div>
          <div style={{ padding: "6px 8px", fontSize: 12 }}>
            <p style={{ marginBottom: 8 }}>
              माथि उल्लेखित विवरण सत्य छन् । गलत ठहरेमा प्रचलित कानुन बमोजिम
              कारवाही हुने व्यहोरा बुझि यो निवेदन पेश गरेको छु ।
            </p>
            <div style={{ marginBottom: 4 }}>
              निवेदकको दस्तखत&nbsp;:&nbsp;
              <Blank minWidth={140} />
            </div>
            <div style={{ marginBottom: 4 }}>
              नाम&nbsp;:&nbsp;
              <span>{d.applicant_name_np || d.applicant_name_en}</span>
            </div>
            <div style={{ marginBottom: 4 }}>
              मिति&nbsp;:&nbsp;
              <Blank minWidth={100} />
              &nbsp;(वि.सं.)
            </div>
            <div>
              सम्पर्क नं.&nbsp;:&nbsp;
              <span>{d.applicant_contact_no}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── कार्यालय प्रयोगको लागि मात्र ── */}
      <div style={s.box}>
        <div style={{ ...s.secHead, textAlign: "center" }}>
          कार्यालय प्रयोगको लागि मात्र (For Office Use Only)
        </div>
        <div style={{ display: "flex", fontSize: 12 }}>
          <div style={{ flex: 1, padding: 8 }}>
            <div style={{ marginBottom: 6 }}>
              निवेदन रुजु गर्ने कर्मचारीको नाम&nbsp;:&nbsp;
              <Blank minWidth={160} />
            </div>
            <div style={{ marginBottom: 6 }}>
              पद&nbsp;:&nbsp;
              <Blank minWidth={160} />
            </div>
            <div style={{ marginBottom: 6 }}>
              दस्तखत&nbsp;:&nbsp;
              <Blank minWidth={160} />
            </div>
            <div>
              मिति&nbsp;:&nbsp;
              <Blank minWidth={120} />
              &nbsp;(वि.सं.)
            </div>
          </div>
          <div style={{ flex: 1, padding: 8, borderLeft: "1px solid #000" }}>
            <div style={{ marginBottom: 6 }}>
              प्रमाणपत्र जारी गर्ने अधिकारीको नाम&nbsp;:&nbsp;
              <Blank minWidth={160} />
            </div>
            <div style={{ marginBottom: 6 }}>
              पद&nbsp;:&nbsp;
              <Blank minWidth={160} />
            </div>
            <div style={{ marginBottom: 6 }}>
              दस्तखत&nbsp;:&nbsp;
              <Blank minWidth={160} />
            </div>
            <div style={{ marginBottom: 6 }}>
              मिति&nbsp;:&nbsp;
              <Blank minWidth={120} />
              &nbsp;(वि.सं.)
            </div>
            <div>
              चलानी नं.&nbsp;:&nbsp;
              <Blank minWidth={120} />
            </div>
          </div>
        </div>
      </div>

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
      <div style={{ fontSize: 11, marginTop: 6, textAlign: "center" }}>
        <strong>नोट&nbsp;:</strong> यो फाराम पूरै भरी आवश्यक कागजातसहित वडा
        कार्यालयमा पेश गर्नुपर्छ ।
      </div>
    </div>
  );
}

export default MigrationPreview;
