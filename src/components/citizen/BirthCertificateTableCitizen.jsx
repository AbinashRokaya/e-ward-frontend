import React from "react";

// Ordered life-cycle of a registration.
// Add/rename stages here if your backend statuses change.
const STATUS_STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "approved", label: "Approved" },
  { key: "verified", label: "Verified" },
  { key: "certificate_issue", label: "Certificate Issued" },
];

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

// Turns a raw status string into an index on STATUS_STEPS.
// Falls back to -1 (nothing reached yet) for unknown/blank statuses,
// and treats "draft" as "before submitted".
function getStepIndex(status) {
  const normalized = normalizeStatus(status);
  if (normalized === "draft") return -1;
  const index = STATUS_STEPS.findIndex((s) => s.key === normalized);
  return index;
}

function isRejectedStatus(status) {
  const normalized = normalizeStatus(status);
  return normalized === "reject" || normalized === "rejected";
}

// Reject entries can come from any role (chairperson, secretary, admin, etc.)
// and the exact field names may vary by endpoint, so we probe a few common
// keys instead of assuming one shape.
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
    null;
  if (role && reason) return `${role}: ${reason}`;
  return role || reason || null;
}

function StatusCarousel({ status, reject }) {
  const currentIndex = getStepIndex(status);
  const rejections = Array.isArray(reject) ? reject : [];
  const isRejected = isRejectedStatus(status);

  const rejectionTooltip = rejections
    .map(describeRejection)
    .filter(Boolean)
    .join(" | ");

  if (isRejected) {
    return (
      <div
        className="flex items-center gap-2"
        title={rejectionTooltip || "Rejected"}
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-red-500 text-white ring-4 ring-red-100">
          ✕
        </div>
        <span className="text-xs font-semibold text-red-600">Rejected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center" title={status || "DRAFT"}>
      {STATUS_STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const isLast = i === STATUS_STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center w-[84px]">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isDone
                    ? "bg-blue-600 text-white"
                    : isActive
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={`mt-1 text-[10px] text-center leading-tight whitespace-nowrap ${
                  isDone || isActive
                    ? "text-blue-700 font-semibold"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`h-0.5 w-6 -mt-4 shrink-0 ${
                  i < currentIndex ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BirthCertificateTableCitizen({
  birth,
  onView,
  onEdit,
  onDeleteRequest,
}) {
  if (!birth.length)
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        कुनै birth भेटिएन। माथि थप्नुहोस्।
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-50 text-blue-800 text-left">
            {[
              "#",
              "Registration Id",
              "Registration Ward Id",
              "Register Submitted By",
              "Register Status",

              "",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-semibold whitespace-nowrap border-b border-blue-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {birth.map((b, i) => (
            <tr
              key={i}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800">
                {b.registration_id}
              </td>
              <td className="px-3 py-2">{b.register_ward_id}</td>
              <td className="px-3 py-2">{b.register_submitted_by}</td>
              <td className="px-3 py-2">
                <StatusCarousel status={b.register_status} reject={b.reject} />
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <button
                  onClick={() =>
                    isRejectedStatus(b.register_status) ? onEdit(b) : onView(b)
                  }
                  className={`text-xs font-medium transition-colors mr-3 ${
                    isRejectedStatus(b.register_status)
                      ? "text-red-600 hover:text-red-800"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  {isRejectedStatus(b.register_status) ? "Edit" : "View"}
                </button>
                {/* <button
                  onClick={() => onDeleteRequest(b)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                >
                  Remove
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BirthCertificateTableCitizen;
