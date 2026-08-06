// components/complaint/complaintStyles.js

export const COMPLAINT_CATEGORIES = [
  {
    value: "INFRASTRUCTURE",
    label: "पूर्वाधार (Infrastructure)",
    requiresLocation: true,
  },
  {
    value: "SERVICE_DELAY",
    label: "सेवा ढिलाई (Service Delay)",
    requiresLocation: false,
  },
  {
    value: "STAFF_MISCONDUCT",
    label: "कर्मचारी दुर्व्यवहार (Staff Misconduct)",
    requiresLocation: false,
  },
  {
    value: "CORRUPTION",
    label: "भ्रष्टाचार (Corruption)",
    requiresLocation: false,
  },
  {
    value: "WATER_SUPPLY",
    label: "खानेपानी (Water Supply)",
    requiresLocation: true,
  },
  { value: "SANITATION", label: "सफाई (Sanitation)", requiresLocation: true },
  { value: "OTHER", label: "अन्य (Other)", requiresLocation: false },
];

export function categoryRequiresLocation(value) {
  return (
    COMPLAINT_CATEGORIES.find((c) => c.value === value)?.requiresLocation ??
    false
  );
}

export function categoryLabel(value) {
  return (
    COMPLAINT_CATEGORIES.find((c) => c.value === value)?.label ?? value ?? "—"
  );
}

export const CATEGORY_STYLES = {
  INFRASTRUCTURE: "bg-orange-100 text-orange-700",
  SERVICE_DELAY: "bg-yellow-100 text-yellow-700",
  STAFF_MISCONDUCT: "bg-red-100 text-red-700",
  CORRUPTION: "bg-purple-100 text-purple-700",
  WATER_SUPPLY: "bg-blue-100 text-blue-700",
  SANITATION: "bg-green-100 text-green-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export const STATUS_LABELS = {
  DRAFT: "मस्यौदा",
  SUBMITTED: "पेश गरिएको (Submitted)",
  APPROVED: "स्वीकृत (Approved)",
  VERIFIED: "प्रमाणित (Verified)",
  RESOLVED: "समाधान भएको (Resolved)",
  REJECTED: "अस्वीकृत (Rejected)",
};

// Reachable statuses for filter dropdowns — DRAFT excluded since
// complaints are never shown to reviewers or citizens in that state
export const COMPLAINT_STATUSES = Object.keys(STATUS_LABELS).filter(
  (s) => s !== "DRAFT",
);

export const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-gray-500",
  SUBMITTED: "bg-slate-100 text-slate-700",
  APPROVED: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-indigo-100 text-indigo-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function statusLabel(value) {
  return STATUS_LABELS[value] ?? value ?? "—";
}

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA");
}
