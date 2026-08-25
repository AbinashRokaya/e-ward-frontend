import React, { useEffect, useState } from "react";
import API_URL from "../../api/api";
import { useLanguage } from "../../context/LanguageContext";

// One consolidated status view across every module a citizen can apply to.
// There is no single "all my applications" endpoint on the backend — each
// module exposes its own citizen-scoped list, so fetch all five in parallel
// and merge. A module that fails contributes nothing rather than breaking
// the whole section.
const SOURCES = [
  { path: "/v1/citizen/birth/all", labelNe: "जन्म दर्ता", labelEn: "Birth Registration", idKey: "register_id", statusKey: "register_status" },
  { path: "/v1/death-registration/", labelNe: "मृत्यु दर्ता", labelEn: "Death Registration", idKey: "register_id", statusKey: "register_status" },
  { path: "/v1/migration-registration/", labelNe: "बसाइँसराइ दर्ता", labelEn: "Migration Registration", idKey: "migration_id", statusKey: "migration_status" },
  { path: "/v1/recommendation-letter/", labelNe: "सिफारिस पत्र", labelEn: "Recommendation Letter", idKey: "letter_id", statusKey: "letter_status" },
  { path: "/v1/complaint/", labelNe: "गुनासो", labelEn: "Complaint", idKey: "complaint_id", statusKey: "complaint_status" },
];

// ---------------------------------------------------------------------------
// APPROVAL CHAIN — citizen submits -> data-validation officer -> ward
// secretary -> ward chairperson -> certificate issued.
//
// ⚠️ VERIFY against your backend. Which enum value each officer sets was
// inferred from the enum ordering, not confirmed. If the secretary sets
// APPROVED rather than the validation officer, just reorder the `status`
// values below — nothing else changes.
// ---------------------------------------------------------------------------
const STAGES = [
  { status: "SUBMITTED", ne: "पेश गरियो", en: "Submitted", icon: "📤" },
  { status: "APPROVED", ne: "सञ्चालकद्वारा प्रमाणित", en: "Verified by Operator", icon: "🖥️" },
  { status: "VERIFIED", ne: "सचिवद्वारा प्रमाणित", en: "Verified by Secretary", icon: "🖊️" },
  { status: "FORWARDED_TO_CHAIRPERSON", ne: "अध्यक्षद्वारा प्रमाणित", en: "Verified by Chairman", icon: "🎖️" },
  { status: "CERTIFICATE_ISSUED", ne: "अन्तिम स्वीकृत — प्रमाणपत्र जारी", en: "Fully Verified — Certificate Issued", icon: "✅" },
];

// Statuses outside the linear chain, which need their own treatment.
const TERMINAL = {
  REJECTED: { ne: "अस्वीकृत", en: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
  DOCUMENT_REQUESTED: { ne: "थप कागजात आवश्यक", en: "More documents needed", className: "bg-amber-50 text-amber-800 border-amber-200" },
  DRAFT: { ne: "मस्यौदा — पेश गरिएको छैन", en: "Draft — not yet submitted", className: "bg-slate-100 text-slate-600 border-slate-200" },
  RESOLVED: { ne: "समाधान भयो", en: "Resolved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

function extractList(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return firstArray || [];
}

function StageTracker({ status, isNepali }) {
  const currentIndex = STAGES.findIndex((s) => s.status === status);

  return (
    <div className="mt-3 flex items-center gap-0.5 flex-wrap">
      {STAGES.map((stage, i) => {
        const done = currentIndex >= 0 && i < currentIndex;
        const current = i === currentIndex;

        return (
          <React.Fragment key={stage.status}>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                current
                  ? "bg-blue-900 text-white border-blue-900"
                  : done
                    ? "bg-blue-50 text-blue-900 border-blue-100"
                    : "bg-white text-slate-400 border-slate-200"
              }`}
              title={isNepali ? stage.en : stage.ne}
            >
              <span aria-hidden="true">{done ? "✓" : stage.icon}</span>
              <span>{isNepali ? stage.ne : stage.en}</span>
            </div>
            {i < STAGES.length - 1 && (
              <span
                className={`w-3 h-px shrink-0 ${done ? "bg-blue-300" : "bg-slate-200"}`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function MyDocuments() {
  const { language } = useLanguage() || {};
  const isNepali = language !== "en";

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      SOURCES.map((source) =>
        fetch(`${API_URL}${source.path}`, { method: "GET", credentials: "include" })
          .then((res) => (res.ok ? res.json() : null))
          .then((payload) =>
            extractList(payload).map((record) => ({
              id: record[source.idKey],
              labelNe: source.labelNe,
              labelEn: source.labelEn,
              status: record[source.statusKey],
              created_at: record.created_at,
            })),
          )
          .catch((err) => {
            console.error(`Failed to load ${source.path}:`, err);
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
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching documents:", err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

      {loading ? (
        <p className="text-sm text-slate-500">
          {isNepali ? "लोड हुँदैछ..." : "Loading..."}
        </p>
      ) : documents.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3 mx-auto">
            📄
          </div>
          <p className="text-sm text-slate-500">
            {isNepali
              ? "तपाईंले हालसम्म कुनै पनि आवेदन पेश गर्नुभएको छैन।"
              : "You haven't submitted any applications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, index) => {
            const terminal = TERMINAL[doc.status];
            const inChain = STAGES.some((s) => s.status === doc.status);

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
                  <StageTracker status={doc.status} isNepali={isNepali} />
                ) : !terminal ? (
                  <p className="mt-2 text-xs text-slate-400">
                    {isNepali ? "स्थिति उपलब्ध छैन" : "Status unavailable"}
                    {doc.status ? ` (${doc.status})` : ""}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}