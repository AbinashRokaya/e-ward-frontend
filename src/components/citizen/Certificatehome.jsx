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
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  DOCUMENT_REQUESTED: {
    ne: "थप कागजात आवश्यक",
    en: "More documents needed",
    className:
      "bg-amber-50 text-amber-800 border-amber-200",
  },

  DRAFT: {
    ne: "मस्यौदा — पेश गरिएको छैन",
    en: "Draft — not yet submitted",
    className:
      "bg-slate-100 text-slate-600 border-slate-200",
  },

  RESOLVED: {
    ne: "समाधान भयो",
    en: "Resolved",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  CANCELLED: {
    ne: "रद्द गरिएको",
    en: "Cancelled",
    className:
      "bg-gray-100 text-gray-700 border-gray-200",
  },

  COMPLETED: {
    ne: "सम्पन्न",
    en: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

// -----------------------------------------------------------------------------
// EXTRACT LIST FROM API RESPONSE
// -----------------------------------------------------------------------------

function extractList(payload) {
  if (!payload) {
    return [];
  }

  // Example:
  // { data: [...] }
  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  // Example:
  // { data: { items: [...] } }
  if (
    payload.data &&
    typeof payload.data === "object"
  ) {
    const firstArray = Object.values(
      payload.data,
    ).find((value) => Array.isArray(value));

    if (firstArray) {
      return firstArray;
    }
  }

  // Example:
  // { items: [...] }
  const directArray = Object.values(payload).find(
    (value) => Array.isArray(value),
  );

  return directArray || [];
}

// -----------------------------------------------------------------------------
// GET CURRENT STAGE
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
// FORMAT DATE
// -----------------------------------------------------------------------------

function formatDate(dateValue, isNepali) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    isNepali ? "ne-NP" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

// -----------------------------------------------------------------------------
// STAGE TRACKER
// -----------------------------------------------------------------------------

function StageTracker({ status, isNepali }) {
  const currentIndex = getStageIndex(status);

  return (
    <div className="mt-4">
      {/* Horizontal scroll on small screens */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center min-w-max gap-1">
          {STAGES.map((stage, index) => {
            const done =
              currentIndex >= 0 &&
              index < currentIndex;

            const current =
              index === currentIndex;

            return (
              <React.Fragment key={stage.key}>
                <div
                  className={`
                    flex items-center gap-1.5
                    px-2.5 py-1.5
                    rounded-full
                    text-[11px]
                    font-medium
                    border
                    transition-colors
                    ${
                      current
                        ? "bg-blue-900 text-white border-blue-900"
                        : done
                          ? "bg-blue-50 text-blue-900 border-blue-100"
                          : "bg-white text-slate-400 border-slate-200"
                    }
                  `}
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

                {index <
                  STAGES.length - 1 && (
                  <span
                    className={`
                      w-3 h-px shrink-0
                      ${
                        currentIndex >= 0 &&
                        index < currentIndex
                          ? "bg-blue-300"
                          : "bg-slate-200"
                      }
                    `}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Current stage */}
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
// STATUS BADGE
// -----------------------------------------------------------------------------

function StatusBadge({ status, isNepali }) {
  const terminal = TERMINAL[status];

  if (!terminal) {
    return null;
  }

  return (
    <span
      className={`
        text-xs
        font-semibold
        px-3
        py-1
        rounded-full
        border
        shrink-0
        ${terminal.className}
      `}
    >
      {isNepali
        ? terminal.ne
        : terminal.en}
    </span>
  );
}

// -----------------------------------------------------------------------------
// SINGLE APPLICATION CARD
// -----------------------------------------------------------------------------

function ApplicationCard({
  document,
  isNepali,
}) {
  const currentStageIndex =
    getStageIndex(document.status);

  const inApprovalChain =
    currentStageIndex !== -1;

  const terminal =
    TERMINAL[document.status];

  return (
    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
      {/* Application Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800">
            {isNepali
              ? document.labelNe
              : document.labelEn}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {isNepali
              ? "आवेदन मिति: "
              : "Applied: "}

            {formatDate(
              document.created_at,
              isNepali,
            )}
          </p>

          {document.id && (
            <p className="text-[11px] text-slate-400 mt-1 break-all">
              {isNepali
                ? "आवेदन नं.: "
                : "Application ID: "}

              {document.id}
            </p>
          )}
        </div>

        <StatusBadge
          status={document.status}
          isNepali={isNepali}
        />
      </div>

      {/* Approval Chain */}
      {inApprovalChain ? (
        <StageTracker
          status={document.status}
          isNepali={isNepali}
        />
      ) : !terminal ? (
        <div className="mt-3 p-2.5 rounded-lg bg-slate-100 border border-slate-200">
          <p className="text-xs text-slate-500">
            {isNepali
              ? "स्थिति उपलब्ध छैन"
              : "Status unavailable"}

            {document.status
              ? ` (${document.status})`
              : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export default function MyDocuments() {
  const { language } =
    useLanguage() || {};

  const isNepali =
    language !== "en";

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [failedSources, setFailedSources] =
    useState([]);

  // ---------------------------------------------------------------------------
  // LOAD ALL APPLICATIONS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      setLoading(true);

      const failed = [];

      const results =
        await Promise.all(
          SOURCES.map(
            async (source) => {
              try {
                const response =
                  await fetch(
                    `${API_URL}${source.path}`,
                    {
                      method: "GET",
                      credentials: "include",
                    },
                  );

                let payload = null;

                try {
                  payload =
                    await response.json();
                } catch {
                  payload = null;
                }

                if (!response.ok) {
                  const error =
                    new Error(
                      `HTTP ${response.status}`,
                    );

                  if (payload) {
                    error.detail =
                      payload.detail;
                  }

                  throw error;
                }

                const records =
                  extractList(payload);

                return records
                  .filter(
                    (record) =>
                      record &&
                      typeof record ===
                        "object",
                  )
                  .map((record) => ({
                    id:
                      record[
                        source.idKey
                      ],

                    labelNe:
                      source.labelNe,

                    labelEn:
                      source.labelEn,

                    status:
                      record[
                        source.statusKey
                      ],

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
            },
          ),
        );

      if (cancelled) {
        return;
      }

      // -----------------------------------------------------------------------
      // MERGE + SORT
      // -----------------------------------------------------------------------

      const merged =
        results
          .flat()
          .sort((a, b) => {
            if (!a.created_at) {
              return 1;
            }

            if (!b.created_at) {
              return -1;
            }

            return (
              new Date(
                b.created_at,
              ) -
              new Date(
                a.created_at,
              )
            );
          });

      setDocuments(merged);
      setFailedSources(failed);
      setLoading(false);

      // -----------------------------------------------------------------------
      // PARTIAL FAILURE NOTIFICATION
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
    }

    loadDocuments().catch(
      (error) => {
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
      },
    );

    return () => {
      cancelled = true;
    };
  }, [isNepali]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
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

      {/* Partial Failure Warning */}
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

      {/* Loading */}
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
        /* Empty State */
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
        /* Application List */
        <div className="space-y-3">
          {documents.map(
            (document, index) => (
              <ApplicationCard
                key={
                  document.id ||
                  `${document.labelEn}-${index}`
                }
                document={document}
                isNepali={isNepali}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}