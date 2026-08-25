import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "https://web-based-e-ward-management-system.onrender.com";

// Order doesn't matter much, but put your most-issued cert types first
// since this stops at the first match.
const VERIFY_ENDPOINTS = [
  {
    type: "birth",
    label: "Birth Certificate",
    icon: "👶",
    color: "blue",
    url: (id) => `${API_BASE}/v1/birth-registration/certificate/verify/${id}`,
  },
  {
    type: "death",
    label: "Death Certificate",
    icon: "🕊️",
    color: "slate",
    url: (id) => `${API_BASE}/v1/death-registration/certificate/verify/${id}`,
  },
  {
    type: "migration",
    label: "Migration Certificate",
    icon: "🧳",
    color: "violet",
    url: (id) =>
      `${API_BASE}/v1/migration-registration/certificate/verify/${id}`,
  },
  {
    type: "recommendation",
    label: "Recommendation Letter",
    icon: "📄",
    color: "amber",
    url: (id) =>
      `${API_BASE}/v1/recommendation-letter/certificate/verify/${id}`,
  },
];

// Tailwind class groups per accent color — kept as static, fully-written
// class strings (not built with template literals) so Tailwind's JIT
// scanner can actually see and generate them at build time.
const COLOR_STYLES = {
  blue: {
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-100",
    iconBg: "bg-blue-600",
    accentText: "text-blue-700",
  },
  slate: {
    badgeBg: "bg-slate-50",
    badgeText: "text-slate-700",
    badgeBorder: "border-slate-200",
    iconBg: "bg-slate-600",
    accentText: "text-slate-700",
  },
  violet: {
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    badgeBorder: "border-violet-100",
    iconBg: "bg-violet-600",
    accentText: "text-violet-700",
  },
  amber: {
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-100",
    iconBg: "bg-amber-600",
    accentText: "text-amber-700",
  },
};

// Different certificate types return their subject's name under
// different keys (child_full_name for birth, deceased_full_name for
// death, applicant_full_name_np/en for migration & recommendation).
// This tries the most likely keys in order rather than hardcoding one.
function getSubjectName(data) {
  return (
    data.child_full_name ||
    data.deceased_full_name ||
    data.applicant_full_name_np ||
    data.applicant_full_name_en ||
    data.full_name ||
    "—"
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-10 w-10 text-blue-600"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

export default function VerifyCertificate() {
  const { id } = useParams();
  const [status, setStatus] = useState("loading"); // loading | valid | invalid
  const [data, setData] = useState(null);
  const [endpoint, setEndpoint] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function checkCertificate() {
      for (const ep of VERIFY_ENDPOINTS) {
        try {
          const res = await fetch(ep.url(id));
          if (res.ok) {
            const json = await res.json();
            if (cancelled) return;
            setData(json.data || json);
            setEndpoint(ep);
            setStatus("valid");
            return;
          }
        } catch (err) {
          // network error on this endpoint — just try the next one
        }
      }
      if (!cancelled) setStatus("invalid");
    }

    checkCertificate();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const colors = endpoint ? COLOR_STYLES[endpoint.color] : COLOR_STYLES.blue;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* ── Header ── */}
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Government of Nepal — Ward Office
          </p>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Certificate Verification
          </h1>
        </div>

        {/* ── Loading state ── */}
        {status === "loading" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-sm text-gray-500">
              प्रमाणपत्र प्रमाणीकरण गर्दै… (Verifying certificate…)
            </p>
          </div>
        )}

        {/* ── Invalid / not found ── */}
        {status === "invalid" && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            <div className="bg-red-50 px-6 py-8 flex flex-col items-center text-center border-b border-red-100">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-2xl text-white mb-3">
                ✕
              </div>
              <h2 className="text-lg font-semibold text-red-800">
                Certificate Not Found
              </h2>
              <p className="text-sm text-red-600 mt-1">
                यो प्रमाणपत्र प्रमाणित गर्न सकिएन। (This certificate could not
                be verified.)
              </p>
            </div>
            <div className="px-6 py-5 text-sm text-gray-600">
              This certificate ID may be invalid, revoked, or not yet issued. If
              you believe this is an error, please contact your ward office
              directly.
              <div className="mt-3 text-xs text-gray-400 font-mono break-all">
                ID: {id}
              </div>
            </div>
          </div>
        )}

        {/* ── Valid ── */}
        {status === "valid" && data && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Status banner */}
            <div className="bg-green-50 px-6 py-6 flex flex-col items-center text-center border-b border-green-100">
              <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-2xl text-white mb-3">
                ✓
              </div>
              <h2 className="text-lg font-semibold text-green-800">
                Certificate is Valid
              </h2>
              <p className="text-sm text-green-600 mt-1">
                यो प्रमाणपत्र प्रमाणित भएको छ। (This certificate is authentic.)
              </p>
            </div>

            {/* Cert type badge */}
            <div className="px-6 pt-5">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}`}
              >
                <span
                  className={`w-6 h-6 rounded-full ${colors.iconBg} text-white flex items-center justify-center text-xs`}
                >
                  {endpoint.icon}
                </span>
                {endpoint.label}
              </div>
            </div>

            {/* Details */}
            <div className="px-6 py-5">
              <dl className="divide-y divide-gray-100">
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-gray-500">Certificate No.</dt>
                  <dd className="font-medium text-gray-900 text-right">
                    {data.certificate_no || "—"}
                  </dd>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium text-gray-900 text-right">
                    {getSubjectName(data)}
                  </dd>
                </div>
                {data.register_status && (
                  <div className="flex justify-between py-3 text-sm">
                    <dt className="text-gray-500">Status</dt>
                    <dd
                      className={`font-medium text-right ${colors.accentText}`}
                    >
                      {data.register_status}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-gray-500">Issued Date</dt>
                  <dd className="font-medium text-gray-900 text-right">
                    {formatDate(data.issued_date)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* PDF link */}
            {data.pdf_url && (
              <div className="px-6 pb-6">
                <a
                  href={data.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg ${colors.iconBg} text-white font-medium text-sm px-4 py-3 hover:opacity-90 transition-opacity`}
                >
                  ⬇ View / Download Certificate PDF
                </a>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by the Ward Management System — Government of Nepal
        </p>
      </div>
    </div>
  );
}
