// components/complaint/ComplaintPreview.jsx
import logo from "../../assets/nepal-sarkar.png";
import {
  COMPLAINT_CATEGORIES,
  STATUS_LABELS,
  formatDate,
} from "./complaintStyles";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
function isImagePath(path) {
  const lower = path.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function AttachmentsPreview({ attachments, apiUrl, sectionHeadStyle }) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div style={{ border: "1px solid #000", marginTop: 8 }}>
      <div style={sectionHeadStyle}>संलग्न प्रमाणहरू (Attached Evidence)</div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: "14px" }}
      >
        {attachments.map((path, i) => {
          const url = `${apiUrl}/static/${path}`;
          const isImg = isImagePath(path);
          return (
            <div
              key={path}
              style={{
                width: 220,
                border: "1px solid #ccc",
                borderRadius: 6,
                padding: 10,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 220,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed #999",
                  overflow: "hidden",
                  background: "#fafafa",
                }}
              >
                {isImg ? (
                  <img
                    src={url}
                    alt={`Attachment ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 14, color: "#555" }}>PDF</span>
                )}
              </div>
              <div style={{ fontSize: 12, marginTop: 8, textAlign: "center" }}>
                Attachment {i + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComplaintPreview({
  complaint,
  apiUrl,
  rejectText,
  onRejectChange,
  showRejectSection = false,
}) {
  // ── GUARD: bail out early if complaint hasn't loaded yet ──
  // This is what was crashing at line 82 (complaint.attachment_1_path)
  // when complaint was undefined/null (e.g. still loading, or not found).
  if (!complaint) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          fontFamily: "'Noto Sans Devanagari', 'Noto Sans', Arial, sans-serif",
          color: "#555",
        }}
      >
        गुनासो लोड हुँदैछ... (Loading complaint...)
      </div>
    );
  }

  const attachments = [
    complaint.attachment_1_path,
    complaint.attachment_2_path,
    complaint.attachment_3_path,
  ].filter(Boolean);

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
          <div style={{ fontWeight: 600, fontSize: 13 }}>स्थानिय तह</div>
          <div style={{ fontSize: 11 }}>
            (गा.पा. / न.पा. / उप-महानगरपालिका / महानगरपालिका)
          </div>
          <div style={{ fontWeight: "bold", fontSize: 20, marginTop: 4 }}>
            वडा कार्यालय
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
            गुनासो नं.&nbsp;:&nbsp;
            <span style={{ fontWeight: 600 }}>
              {complaint.complaint_number}
            </span>
          </div>
          <div>
            मिति&nbsp;:&nbsp;<span>{formatDate(complaint.created_at)}</span>
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

      <div style={{ textAlign: "center", margin: "6px 0 2px" }}>
        <div style={{ fontWeight: "bold", fontSize: 22, letterSpacing: 2 }}>
          गुनासो दर्ता फाराम
        </div>
        <div style={{ fontSize: 11, marginTop: 1 }}>
          (नागरिक गुनासो व्यवस्थापन सम्बन्धी फाराम)
        </div>
      </div>

      {/* ── १. गुनासो विवरण ── */}
      <div style={s.box}>
        <div style={s.secHead}>१. गुनासो विवरण (Complaint Details)</div>

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 130 }}>(क) विषय (Subject)&nbsp;:</span>
          <Blank minWidth={300} />
          <span>{complaint.subject}</span>
        </div>

        <div style={s.cbRow}>
          <span style={{ minWidth: 130 }}>(ख) श्रेणी (Category)&nbsp;:</span>
          {COMPLAINT_CATEGORIES.map(({ value, label }) => (
            <span key={value}>
              <Box checked={complaint.complaint_category === value} />
              {label}
            </span>
          ))}
        </div>

        {complaint.location && (
          <div style={s.inlineGroup}>
            <span style={{ minWidth: 130 }}>(ग) स्थान (Location)&nbsp;:</span>
            <Blank minWidth={250} />
            <span>{complaint.location}</span>
          </div>
        )}

        <div style={s.inlineGroup}>
          <span style={{ minWidth: 130 }}>(घ) अवस्था (Status)&nbsp;:</span>
          <span style={{ fontWeight: 600 }}>
            {STATUS_LABELS[complaint.complaint_status] ||
              complaint.complaint_status}
          </span>
        </div>

        <div style={{ padding: "3px 8px" }}>
          <div style={{ minWidth: 130, marginBottom: 4 }}>
            (ङ) विवरण (Description)&nbsp;:
          </div>
          <div
            style={{
              border: "1px dotted #000",
              minHeight: 80,
              padding: 8,
              fontSize: 12,
              whiteSpace: "pre-wrap",
            }}
          >
            {complaint.description}
          </div>
        </div>
      </div>

      {/* ── संलग्न प्रमाणहरू checklist ── */}
      <div style={{ ...s.box, padding: "8px" }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>
          संलग्न प्रमाणहरू&nbsp;: (✓ चिन्ह लगाउनुहोस्)
        </div>
        <div style={{ ...s.cbRow, padding: 0 }}>
          <span>
            <Box checked={attachments.length > 0} />
            फोटो / कागजात प्रमाण संलग्न ({attachments.length})
          </span>
        </div>
      </div>

      <AttachmentsPreview
        attachments={attachments}
        apiUrl={apiUrl}
        sectionHeadStyle={s.secHead}
      />

      {/* ── समाधान (Resolution) ── */}
      {complaint.complaint_status === "RESOLVED" && (
        <div style={{ ...s.box, padding: "8px" }}>
          <div style={s.secHead}>समाधान (Resolution)</div>
          {complaint.resolution_note && (
            <div style={{ padding: 8, fontSize: 12, whiteSpace: "pre-wrap" }}>
              {complaint.resolution_note}
            </div>
          )}
          {complaint.resolution_image_path && (
            <div
              style={{
                padding: "0 8px 12px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={`${apiUrl}/static/${complaint.resolution_image_path}`}
                alt="Resolution proof"
                style={{
                  maxWidth: "100%",
                  maxHeight: 320,
                  objectFit: "contain",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── अस्वीकृति कारण ── */}
      {complaint.complaint_status === "REJECTED" &&
        complaint.reject?.length > 0 && (
          <div style={{ ...s.box, padding: "8px" }}>
            <div style={s.secHead}>अस्वीकृतिको कारण (Rejection Reason)</div>
            <div style={{ padding: 8, fontSize: 12, whiteSpace: "pre-wrap" }}>
              {complaint.reject[complaint.reject.length - 1].reject_text}
            </div>
          </div>
        )}

      {/* ── Reject input — always visible when a reviewer has it open ── */}
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

      <div style={{ fontSize: 11, marginTop: 6 }}>
        <strong>नोट&nbsp;:</strong> गुनासो निवारण म्याद सम्बन्धी सूचना पछि
        उपलब्ध हुनेछ ।
      </div>
    </div>
  );
}

export default ComplaintPreview;
