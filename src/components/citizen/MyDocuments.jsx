import React, { useEffect, useState } from "react";
import API_URL from "../../api/api";
import { useLanguage } from "../../context/LanguageContext";
import { notify } from "../../utils/notify";

// One consolidated status view across every module a citizen can apply to.
// There is no single "all my applications" endpoint on the backend — each
// module exposes its own citizen-scoped list, so fetch all five in parallel
// and merge.
//
// FIELD NAMES: idKey/statusKey below are read from the shapes used elsewhere
// in the app (BirthCertificateTableCitizen uses registration_id /
// register_status). If a status shows as "unavailable" for a module, that
// module's key names differ — log one record and correct its entry here.
const SOURCES = [
  {
    path: "/v1/citizen/birth/all",
    labelNe: "जन्म दर्ता",
    labelEn: "Birth Registration",
    idKey: "registration_id",
    statusKey: "register_status",
  },
  {
    path: "/v1/death-registration/",
    labelNe: "मृत्यु दर्ता",
    labelEn: "Death Registration",
    idKey: "registration_id",
    statusKey: "register_status",
  },
  {
    path: "/v1/migration-registration/",
    labelNe: "बसाइँसराइ दर्ता",
    labelEn: "Migration Registration",
    idKey: "migration_id",
    statusKey: "migration_status",
  },
  {
    path: "/v1/recommendation-letter/",
    labelNe: "सिफारिस पत्र",
    labelEn: "Recommendation Letter",
    idKey: "letter_id",
    statusKey: "letter_status",
  },
  {
    path: "/v1/complaint/",
    labelNe: "गुनासो",
    labelEn: "Complaint",
    idKey: "complaint_id",
    statusKey: "complaint_status",
    isComplaint: true,
  },
];

// ---------------------------------------------------------------------------
// Registration life-cycle, matching the backend's BirthRegistrationStatus /
// DeathRegistrationStatus enums and the STATUS_STEPS already used in
// BirthCertificateTableCitizen: SUBMITTED → APPROVED → VERIFIED →
// CERTIFICATE_ISSUED.
//
// An earlier version of this file included FORWARDED_TO_CHAIRPERSON as a
// fifth stage. That value only exists in ComplaintStatus, not in the
// registration enums — so registrations displayed a stage that could never
// be reached, making every application look permanently one step short.
// ---------------------------------------------------------------------------
const REGISTRATION_STAGES = [
  { status: "SUBMITTED", ne: "पेश गरियो", en: "Submitted", icon: "📤" },
  {
    status: "APPROVED",
    ne: "सञ्चालकद्वारा प्रमाणित",
    en: "Verified by Operator",
    icon: "🖥️",
  },
  {
    status: "VERIFIED",
    ne: "सचिवद्वारा प्रमाणित",
    en: "Verified by Secretary",
    icon: "🖊️",
  },
  {
    status: "CERTIFICATE_ISSUED",
    ne: "अध्यक्षद्वारा जारी",
    en: "Issued by Chairperson",
    icon: "🎖️",
  },
];

// Complaints follow a different path — they get resolved rather than
// certified, and they DO have a forwarded-to-chairperson stage.
const COMPLAINT_STAGES = [
  { status: "SUBMITTED", ne: "पेश गरियो", en: "Submitted", icon: "📤" },
  {
    status: "APPROVED",
    ne: "सञ्चालकद्वारा प्रमाणित",
    en: "Verified by Operator",
    icon: "🖥️",
  },
  {
    status: "FORWARDED_TO_CHAIRPERSON",
    ne: "अध्यक्षकहाँ पठाइयो",
    en: "Forwarded to Chairperson",
    icon: "📨",
  },
  { status: "RESOLVED", ne: "समाधान भयो", en: "Resolved", icon: "✅" },
];

// Statuses outside the linear chain, which need their own treatment.
const TERMINAL = {
  REJECTED: {
    ne: "अस्वीकृत",
    en: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  DOCUMENT_REQUESTED: {
    ne: "थप कागजात आवश्यक",
    en: "More documents needed",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  DRAFT: {
    ne: "मस्यौदा — पेश गरिएको छैन",
    en: "Draft — not yet submitted",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

function extractList(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return firstArray || [];
}

// Reject entries can come from any role and the exact field names vary by
// endpoint, so probe a few common keys rather than assuming one shape.
// Same approach as BirthCertificateTableCitizen.
function describeRejection(entry) {
  if (!entry || typeof entry !== "object") return null;
  const role =
    entry.role || entry.rejected_by_role || entry.rejected_role || null;
  const reason =
    entry.reason ||
    entry.remarks ||
    entry.comment ||
    entry.message ||
    entry.note ||
    entry.reject_text ||
    null;
  if (role && reason) return `${role}: ${reason}`;
  return reason || role || null;
}

function StageTracker({ status, stages, isNepali }) {
  const currentIndex = stages.findIndex((s) => s.status === status);

  return (
    <div className="mt-3 flex items-center gap-0.5 flex-wrap">
      {stages.map((stage, i) => {
        const done = currentIndex >= 0 && i < currentIndex;
        const current = i === currentIndex;
        const pending = currentIndex >= 0 && i === currentIndex + 1;

        return (
          <React.Fragment key={stage.status}>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                current
                  ? "bg-blue-900 text-white border-blue-900"
                  : done
                    ? "bg-blue-50 text-blue-900 border-blue-100"
                    : pending
                      ? // The next step is dashed rather than flat grey, so
                        // it reads as "coming up" instead of "not applicable".
                        "bg-white text-slate-500 border-slate-300 border-dashed"
                      : "bg-white text-slate-400 border-slate-200"
              }`}
              title={isNepali ? stage.en : stage.ne}
            >
              <span aria-hidden="true">{done ? "✓" : stage.icon}</span>
              <span>{isNepali ? stage.ne : stage.en}</span>
            </div>
            {i < stages.length - 1 && (
              <span
                className={`w-3 h-px shrink-0 ${
                  done ? "bg-blue-300" : "bg-slate-200"
                }`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// One-line summary of where the application sits and who acts next, since
// the pill row alone doesn't say "waiting on X".
function NextStepNote({ status, stages, isNepali }) {
  const currentIndex = stages.findIndex((s) => s.status === status);
  if (currentIndex < 0) return null;

  const next = stages[currentIndex + 1];
  if (!next) {
    return (
      <p className="mt-2 text-xs text-emerald-700 font-medium">
        {isNepali
          ? "✅ प्रक्रिया पूरा भयो।"
          : "✅ This application is complete."}
      </p>
    );
  }

  return (
    <p className="mt-2 text-xs text-slate-500">
      {isNepali
        ? `अब पर्खाइमा: ${next.ne}`
        : `Waiting on: ${next.en}`}
    </p>
  );
}

export default function MyDocuments() {
  const { language } = useLanguage() || {};
  const isNepali = language !== "en";

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedSources, setFailedSources] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const failures = [];

    Promise.all(
      SOURCES.map((source) =>
        fetch(`${API_URL}${source.path}`, {
          method: "GET",
          credentials: "include",
        })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((payload) =>
            extractList(payload).map((record) => ({
              id: record[source.idKey],
              labelNe: source.labelNe,
              labelEn: source.labelEn,
              isComplaint: Boolean(source.isComplaint),
              status: record[source.statusKey],
              created_at: record.created_at,
              // Rejection details, if the backend attached any. Shown so a
              // rejected applicant learns WHY without opening the record.
              reject: Array.isArray(record.reject) ? record.reject : [],
              rejectText: record.reject_text || null,
            })),
          )
          .catch((err) => {
            // Record which module failed rather than silently contributing
            // nothing — otherwise a citizen with a pending birth
            // registration sees "no applications" and assumes it was lost.
            console.error(`Failed to load ${source.path}:`, err);
            failures.push(isNepali ? source.labelNe : source.labelEn);
            return [];
          }),
      ),
    )
      .then((groups) => {
        if (cancelled) return;
        const merged = groups.flat().sort((a, b) => {
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setDocuments(merged);
        setFailedSources(failures);
        if (failures.length > 0) {
          notify.error(
            `Could not load: ${failures.join(", ")}. Some applications may be missing from this list.`,
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching documents:", err);
        notify.loadFailed("your applications", err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // isNepali only affects the label text in the failure list, so there's
    // no need to refetch everything when the language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allFailed = failedSources.length === SOURCES.length;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-5 pb-3 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">
          {isNepali ? "मेरो आवेदनहरूको स्थिति" : "My Application Status"}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isNepali
            ? "तपाईंले पेश गर्नुभएका सबै आवेदनहरू कुन चरणमा छन् हेर्नुहोस्।"
            : "Track where each of your submitted applications currently sits."}
        </p>
      </div>

      {!loading && failedSources.length > 0 && !allFailed && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          {isNepali
            ? `यी सेवाहरूको जानकारी लोड हुन सकेन: ${failedSources.join(", ")}। यो सूची अपूर्ण हुन सक्छ।`
            : `Couldn't load: ${failedSources.join(", ")}. This list may be incomplete.`}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">
          {isNepali ? "लोड हुँदैछ..." : "Loading..."}
        </p>
      ) : documents.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3 mx-auto">
            {allFailed ? "⚠️" : "📄"}
          </div>
          {/* Never claim "you haven't submitted anything" when the requests
              simply failed — those are very different messages to receive. */}
          <p className="text-sm text-slate-500">
            {allFailed
              ? isNepali
                ? "जानकारी लोड हुन सकेन। कृपया पुनः प्रयास गर्नुहोस्।"
                : "Couldn't load your applications. Please try again."
              : isNepali
                ? "तपाईंले हालसम्म कुनै पनि आवेदन पेश गर्नुभएको छैन।"
                : "You haven't submitted any applications yet."}
          </p>
          {allFailed && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-xs font-semibold text-blue-900 underline cursor-pointer"
            >
              {isNepali ? "पुनः प्रयास" : "Retry"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, index) => {
            const stages = doc.isComplaint
              ? COMPLAINT_STAGES
              : REGISTRATION_STAGES;
            const terminal = TERMINAL[doc.status];
            const inChain = stages.some((s) => s.status === doc.status);

            const rejectionReasons = [
              ...doc.reject.map(describeRejection).filter(Boolean),
              doc.rejectText,
            ].filter(Boolean);

            return (
              <div
                key={doc.id || index}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50/60"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {isNepali ? doc.labelNe : doc.labelEn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isNepali ? "आवेदन मिति: " : "Applied: "}
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  {/* Rejected / draft / awaiting-documents get a plain badge —
                      a progress track would misrepresent a stopped
                      application as one still moving forward. */}
                  {terminal && (
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border shrink-0 ${terminal.className}`}
                    >
                      {isNepali ? terminal.ne : terminal.en}
                    </span>
                  )}
                </div>

                {inChain ? (
                  <>
                    <StageTracker
                      status={doc.status}
                      stages={stages}
                      isNepali={isNepali}
                    />
                    <NextStepNote
                      status={doc.status}
                      stages={stages}
                      isNepali={isNepali}
                    />
                  </>
                ) : !terminal ? (
                  // Status came back empty or as a value in neither list —
                  // say so plainly rather than guessing at a stage.
                  <p className="mt-2 text-xs text-slate-400">
                    {isNepali ? "स्थिति उपलब्ध छैन" : "Status unavailable"}
                    {doc.status ? ` (${doc.status})` : ""}
                  </p>
                ) : null}

                {/* A rejection is only actionable if the citizen can see the
                    reason, so surface it here rather than only in the record. */}
                {doc.status === "REJECTED" && rejectionReasons.length > 0 && (
                  <div className="mt-3 text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2">
                    <strong>
                      {isNepali ? "अस्वीकृतिको कारण:" : "Reason for rejection:"}
                    </strong>{" "}
                    {rejectionReasons.join(" | ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}