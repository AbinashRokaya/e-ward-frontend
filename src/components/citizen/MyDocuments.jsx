import React, { useEffect, useState } from "react";
import API_URL from "../../api/api";
import { useLanguage } from "../../context/LanguageContext";
import { notify } from "../../utils/notify";

// -----------------------------------------------------------------------------
// APPLICATION SOURCES
// -----------------------------------------------------------------------------

const SOURCES = [
  {
    path: "/v1/citizen/birth/all",
    labelNe: "जन्म दर्ता",
    labelEn: "Birth Registration",
    idKey: "register_id",
    statusKey: "register_status",
  },
  {
    path: "/v1/death-registration/",
    labelNe: "मृत्यु दर्ता",
    labelEn: "Death Registration",
    idKey: "register_id",
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
  },
];

// -----------------------------------------------------------------------------
// APPROVAL CHAIN
// -----------------------------------------------------------------------------
//
// Citizen
//    ↓
// Submitted
//    ↓
// Data Validation Officer
//    ↓
// Ward Secretary
//    ↓
// Ward Chairman
//    ↓
// Certificate Issued
//
// IMPORTANT:
// The aliases below support both your CURRENT backend statuses and the
// descriptive statuses we may use later.
//
// CURRENT backend:
// APPROVED                  -> Data Validation Officer
// VERIFIED                  -> Ward Secretary
// FORWARDED_TO_CHAIRPERSON  -> Ward Chairman
//
// FUTURE / DESCRIPTIVE:
// VALIDATION_OFFICER_VERIFIED
// SECRETARY_VERIFIED
// CHAIRMAN_VERIFIED
// -----------------------------------------------------------------------------

const STAGES = [
  {
    key: "SUBMITTED",
    statuses: ["SUBMITTED"],
    ne: "पेश गरियो",
    en: "Submitted",
    icon: "📤",
  },

  {
    key: "VALIDATION_OFFICER_VERIFIED",
    statuses: [
      "VALIDATION_OFFICER_VERIFIED",
      "APPROVED",
    ],
    ne: "डाटा प्रमाणीकरण अधिकृतद्वारा प्रमाणित",
    en: "Verified by Data Validation Officer",
    icon: "🖥️",
  },

  {
    key: "SECRETARY_VERIFIED",
    statuses: [
      "SECRETARY_VERIFIED",
      "VERIFIED",
    ],
    ne: "वडा सचिवद्वारा प्रमाणित",
    en: "Verified by Ward Secretary",
    icon: "🖊️",
  },

  {
    key: "CHAIRMAN_VERIFIED",
    statuses: [
      "CHAIRMAN_VERIFIED",
      "FORWARDED_TO_CHAIRPERSON",
    ],
    ne: "वडा अध्यक्षद्वारा प्रमाणित",
    en: "Verified by Ward Chairman",
    icon: "🎖️",
  },

  {
    key: "CERTIFICATE_ISSUED",
    statuses: ["CERTIFICATE_ISSUED"],
    ne: "प्रमाणपत्र जारी",
    en: "Certificate Issued",
    icon: "✅",
  },
];

// -----------------------------------------------------------------------------
// TERMINAL STATUSES
// -----------------------------------------------------------------------------

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

  RESOLVED: {
    ne: "समाधान भयो",
    en: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

// -----------------------------------------------------------------------------
// Extract list from API response
// -----------------------------------------------------------------------------

function extractList(payload) {
  const data = payload?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const firstArray = Object.values(data).find((value) =>
    Array.isArray(value),
  );

  return firstArray || [];
}

// -----------------------------------------------------------------------------
// Find current stage
// -----------------------------------------------------------------------------

function getStageIndex(status) {
  if (!status) {
    return -1;
  }

  return STAGES.findIndex((stage) =>
    stage.statuses.includes(status),
  );
}

// -----------------------------------------------------------------------------
// Stage Tracker
// -----------------------------------------------------------------------------

function StageTracker({ status, isNepali }) {
  const currentIndex = getStageIndex(status);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-0.5 flex-wrap">
        {STAGES.map((stage, index) => {
          const done =
            currentIndex >= 0 && index < currentIndex;

          const current =
            index === currentIndex;

          return (
            <React.Fragment key={stage.key}>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                  current
                    ? "bg-blue-900 text-white border-blue-900"
                    : done
                      ? "bg-blue-50 text-blue-900 border-blue-100"
                      : "bg-white text-slate-400 border-slate-200"
                }`}
                title={
                  isNepali
                    ? stage.en
                    : stage.ne
                }
              >
                <span aria-hidden="true">
                  {done ? "✓" : stage.icon}
                </span>

                <span>
                  {isNepali
                    ? stage.ne
                    : stage.en}
                </span>
              </div>

              {index < STAGES.length - 1 && (
                <span
                  className={`w-3 h-px shrink-0 ${
                    currentIndex >= 0 &&
                    index < currentIndex
                      ? "bg-blue-300"
                      : "bg-slate-200"
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Current responsible officer                                      */}
      {/* ----------------------------------------------------------------- */}

      {currentIndex >= 0 && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs font-semibold text-blue-900">
            {isNepali
              ? `हालको चरण: ${STAGES[currentIndex].ne}`
              : `Current stage: ${STAGES[currentIndex].en}`}
          </p>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export default function MyDocuments() {
  const { language } = useLanguage() || {};

  const isNepali = language !== "en";

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedSources, setFailedSources] = useState([]);

  // ---------------------------------------------------------------------------
  // Load applications
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadDocuments = async () => {
      setLoading(true);

      const failed = [];

      const results = await Promise.all(
        SOURCES.map(async (source) => {
          try {
            const response = await fetch(
              `${API_URL}${source.path}`,
              {
                method: "GET",
                credentials: "include",
              },
            );

            if (!response.ok) {
              let errorData = null;

              try {
                errorData = await response.json();
              } catch {
                // Response may not contain JSON.
              }

              const error = new Error(
                `HTTP ${response.status}`,
              );

              if (errorData) {
                error.detail =
                  errorData.detail;
              }

              throw error;
            }

            const payload =
              await response.json();

            const records =
              extractList(payload);

            return records.map((record) => ({
              id: record[source.idKey],

              labelNe:
                source.labelNe,

              labelEn:
                source.labelEn,

              status:
                record[source.statusKey],

              created_at:
                record.created_at,
            }));
          } catch (error) {
            console.error(
              `Failed to load ${source.path}:`,
              error,
            );

            failed.push(source);

            return [];
          }
        }),
      );

      if (cancelled) {
        return;
      }

      // -----------------------------------------------------------------------
      // Merge and sort applications
      // -----------------------------------------------------------------------

      const merged = results
        .flat()
        .sort((a, b) => {
          if (!a.created_at) {
            return 1;
          }

          if (!b.created_at) {
            return -1;
          }

          return (
            new Date(b.created_at) -
            new Date(a.created_at)
          );
        });

      setDocuments(merged);
      setFailedSources(failed);
      setLoading(false);

      // -----------------------------------------------------------------------
      // Notify about failed modules
      // -----------------------------------------------------------------------

      if (failed.length > 0) {
        const failedNames =
          failed.map((source) =>
            isNepali
              ? source.labelNe
              : source.labelEn,
          );

        notify.error(
          isNepali
            ? `केही सेवाहरूको जानकारी लोड हुन सकेन: ${failedNames.join(
                ", ",
              )}`
            : `Could not load: ${failedNames.join(
                ", ",
              )}. Some applications may be missing.`,
        );
      }
    };

    loadDocuments().catch((error) => {
      if (cancelled) {
        return;
      }

      console.error(
        "Error fetching applications:",
        error,
      );

      setDocuments([]);
      setFailedSources(SOURCES);
      setLoading(false);

      notify.loadFailed(
        isNepali
          ? "तपाईंका आवेदनहरू"
          : "your applications",
        error,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [isNepali]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

      {/* ----------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ----------------------------------------------------------------- */}

      <div className="mb-5 pb-3 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">
          {isNepali
            ? "मेरो आवेदनहरूको स्थिति"
            : "My Application Status"}
        </h2>

        <p className="text-xs text-slate-500 mt-0.5">
          {isNepali
            ? "तपाईंले पेश गर्नुभएका सबै आवेदनहरू कुन चरणमा छन् हेर्नुहोस्।"
            : "Track where each of your submitted applications currently sits."}
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Partial Failure Warning                                          */}
      {/* ----------------------------------------------------------------- */}

      {!loading &&
        failedSources.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <span
                className="text-base shrink-0"
                aria-hidden="true"
              >
                ⚠️
              </span>

              <div>
                <p className="text-xs font-semibold text-amber-800">
                  {isNepali
                    ? "केही जानकारी लोड हुन सकेन"
                    : "Some information could not be loaded"}
                </p>

                <p className="text-xs text-amber-700 mt-1">
                  {isNepali
                    ? `यी सेवाहरूको जानकारी उपलब्ध छैन: ${failedSources
                        .map(
                          (source) =>
                            source.labelNe,
                        )
                        .join(", ")}।`
                    : `The following services could not be loaded: ${failedSources
                        .map(
                          (source) =>
                            source.labelEn,
                        )
                        .join(", ")}.`}
                </p>

                <p className="text-[11px] text-amber-600 mt-1">
                  {isNepali
                    ? "तल देखाइएको आवेदन सूची अपूर्ण हुन सक्छ।"
                    : "The application list shown below may be incomplete."}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* ----------------------------------------------------------------- */}
      {/* Loading                                                          */}
      {/* ----------------------------------------------------------------- */}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-900 rounded-full animate-spin" />

          <span>
            {isNepali
              ? "लोड हुँदैछ..."
              : "Loading..."}
          </span>
        </div>
      ) : documents.length === 0 ? (

        /* --------------------------------------------------------------- */
        /* Empty State                                                     */
        /* --------------------------------------------------------------- */

        <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3 mx-auto">
            {failedSources.length ===
            SOURCES.length
              ? "⚠️"
              : "📄"}
          </div>

          {failedSources.length ===
          SOURCES.length ? (
            <>
              <p className="text-sm text-red-700 font-medium">
                {isNepali
                  ? "आवेदनहरूको जानकारी लोड हुन सकेन।"
                  : "Couldn't load your applications."}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {isNepali
                  ? "कृपया आफ्नो इन्टरनेट जडान जाँच गरी पुनः प्रयास गर्नुहोस्।"
                  : "Please check your connection and try again."}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-3 text-xs font-semibold text-blue-900 underline cursor-pointer"
              >
                {isNepali
                  ? "पुनः प्रयास गर्नुहोस्"
                  : "Retry"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                {isNepali
                  ? "तपाईंले हालसम्म कुनै पनि आवेदन पेश गर्नुभएको छैन।"
                  : "You haven't submitted any applications yet."}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {isNepali
                  ? "तपाईंले पेश गर्नुभएका आवेदनहरू यहाँ देखिनेछन्।"
                  : "Your submitted applications will appear here."}
              </p>
            </>
          )}
        </div>
      ) : (

        /* --------------------------------------------------------------- */
        /* Application List                                                */
        /* --------------------------------------------------------------- */

        <div className="space-y-3">
          {documents.map((doc, index) => {
            const terminal =
              TERMINAL[doc.status];

            const currentStageIndex =
              getStageIndex(doc.status);

            const inChain =
              currentStageIndex !== -1;

            return (
              <div
                key={doc.id || index}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50/60"
              >

                {/* ------------------------------------------------------- */}
                {/* Application Header                                      */}
                {/* ------------------------------------------------------- */}

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {isNepali
                        ? doc.labelNe
                        : doc.labelEn}
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {isNepali
                        ? "आवेदन मिति: "
                        : "Applied: "}

                      {doc.created_at
                        ? new Date(
                            doc.created_at,
                          ).toLocaleDateString()
                        : "—"}
                    </p>

                    {/* Application ID */}
                    {doc.id && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isNepali
                          ? "आवेदन नं.: "
                          : "Application ID: "}
                        {doc.id}
                      </p>
                    )}
                  </div>

                  {/* ----------------------------------------------------- */}
                  {/* Terminal Status Badge                                */}
                  {/* ----------------------------------------------------- */}

                  {terminal && (
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border shrink-0 ${terminal.className}`}
                    >
                      {isNepali
                        ? terminal.ne
                        : terminal.en}
                    </span>
                  )}
                </div>

                {/* ------------------------------------------------------- */}
                {/* Approval Chain                                          */}
                {/* ------------------------------------------------------- */}

                {inChain ? (
                  <StageTracker
                    status={doc.status}
                    isNepali={isNepali}
                  />
                ) : !terminal ? (

                  /* ----------------------------------------------------- */
                  /* Unknown Status                                        */
                  /* ----------------------------------------------------- */

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                    <p className="text-xs text-slate-500">
                      {isNepali
                        ? "स्थिति उपलब्ध छैन"
                        : "Status unavailable"}

                      {doc.status
                        ? ` (${doc.status})`
                        : ""}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}