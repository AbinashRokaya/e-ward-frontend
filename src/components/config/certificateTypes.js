import BirthRegistration from "../../pages/BirthRegistration";
import DeathRegistration from "../../pages/Deathregistration";
import MigrationRegistration from "../../pages/MigrationRegistration";
import Preview from "../Preview";
import DeathPreview from "../DeathPreview";
import MigrationPreview from "../migratioregistration-component/Migrationpreview";
import RecommendationLetter from "../../pages/RecommendationLetter";
import RecommendationPreview from "../recommendation-component/RecommendationPreview";
import FileComplaint from "../../pages/FileComplaint";
import ComplaintPreview from "../complaint/ComplaintPreview";
import ComplaintList from "../complaint/ComplaintList";
import AllComplaintsList from "../complaint/AllComplaintsList";
import NoticeManagement from "../notice/NoticeManagement";

import NoticeDetailView from "../notice/NoticeDetailView";

// ADD — adjust this path to wherever you actually place the file;
// per the file-structure discussion this lives at
// src/components/citizen/MyTaxDashboard.jsx
import MyTaxDashboard from "../citizen/MyTaxDashboard";

// FIX — this was missing, which is why EditComponent was null for birth
// and CertificateManager fell back to the "coming soon" toast even
// though the component itself was already built.
import EditBirthRegistrationCitizen from "../citizen/EditBirthRegistrationCitizen";

// ─────────────────────────────────────────────────────────────────────────
// Add a new certificate type by adding one object here — CertificateManager
// and CertificateHome read everything from this list, so nothing else needs
// to change. Copy the "death" block as a starting template for the next one
// (e.g. migration) and swap the endpoints / field names.
//
// Fields:
//   key                   - unique id, also used in the URL (/certificates/:key)
//   label                 - shown on cards, tabs, headings
//   icon                  - single emoji, shown on the landing page card
//   color                 - tailwind color name used for accents (blue/red/violet…)
//   apiBase               - e.g. "/v1/citizen/death"  (list = apiBase + "/all",
//                            detail = apiBase + "/:id")
//   certificateDownloadPath(id) - full backend path to the issued PDF
//   FormComponent         - the "+ Add" form component for this certificate
//   PreviewComponent      - read-only preview component (submitted/approved)
//   EditComponent         - edit + resubmit component for rejected records
//                            (null until built — CertificateManager falls back
//                            to a "coming soon" message instead of crashing)
//   getSearchValue(record)- returns the string to filter the search box against
//   searchLabel           - placeholder text for the search input
//   statusField           - top-level field holding the registration status
//   issuedStatus          - the exact status string that means "PDF issued"
//   getDisplayName(record)- one-line name shown in the table for that record
//   ListComponent          - (optional) fully replaces the generic list tab.
//                            Used when a type doesn't fit the search/filter/
//                            table shape — currently "notice" and "tax".
// ─────────────────────────────────────────────────────────────────────────
export const CERTIFICATE_TYPES = {
  birth: {
    key: "birth",
    label: "Birth Certificate",
    icon: "👶",
    color: "blue",
    apiBase: "/v1/citizen/birth",
    registrationBase: "/v1/birth-registration",
    certificateDownloadPath: (id) =>
      `/v1/birth-registration/${id}/certificate/download`,
    getId: (r) => r.registration_id,
    FormComponent: BirthRegistration,
    PreviewComponent: Preview,
    EditComponent: EditBirthRegistrationCitizen, // ← was null — this is the fix
    getSearchValue: (r) => r.child?.child_first_name ?? "",
    searchLabel: "Search by child's name",
    statusField: "register_status",
    issuedStatus: "CERTIFICATE_ISSUED",
    getDisplayName: (r) =>
      [r.child?.child_first_name, r.child?.child_last_name]
        .filter(Boolean)
        .join(" ") || "—",
  },

  death: {
    key: "death",
    label: "Death Certificate",
    icon: "🕊️",
    color: "red",
    apiBase: "/v1/death-registration",
    registrationBase: "/v1/death-registration",
    certificateDownloadPath: (id) =>
      `/v1/death-registration/${id}/certificate/download`,
    getId: (r) => r.registration_id,
    FormComponent: DeathRegistration,
    PreviewComponent: DeathPreview,
    EditComponent: null,
    getSearchValue: (r) => r.deceased?.deceased_first_name ?? "",
    searchLabel: "Search by deceased's name",
    statusField: "register_status",
    issuedStatus: "CERTIFICATE_ISSUED",
    getDisplayName: (r) =>
      [r.deceased?.deceased_first_name, r.deceased?.deceased_last_name]
        .filter(Boolean)
        .join(" ") || "—",
  },

  migration: {
    key: "migration",
    label: "Migration Certificate",
    icon: "🧳",
    color: "violet",
    apiBase: "/v1/migration-registration",
    registrationBase: "/v1/migration-registration",
    certificateDownloadPath: (id) =>
      `/v1/migration-registration/${id}/certificate/download`,
    getId: (r) => r.migration_id,
    FormComponent: MigrationRegistration,
    PreviewComponent: MigrationPreview,
    EditComponent: null,
    getSearchValue: (r) => r.applicant?.applicant_full_name_en ?? "",
    searchLabel: "Search by applicant's name",
    statusField: "register_status",
    issuedStatus: "CERTIFICATE_ISSUED",
    getDisplayName: (r) =>
      r.applicant?.applicant_full_name_np ||
      r.applicant?.applicant_full_name_en ||
      "—",
  },

  recommendation: {
    key: "recommendation",
    label: "Recommendation Letter",
    icon: "📄",
    color: "amber",
    apiBase: "/v1/recommendation-letter",
    registrationBase: "/v1/recommendation-letter",
    certificateDownloadPath: (id) =>
      `/v1/recommendation-letter/${id}/certificate/download`,
    getId: (r) => r.letter_id,
    FormComponent: RecommendationLetter,
    PreviewComponent: RecommendationPreview,
    EditComponent: null,
    getSearchValue: (r) => r.applicant_full_name_en ?? "",
    searchLabel: "Search by applicant's name",
    statusField: "register_status",
    issuedStatus: "CERTIFICATE_ISSUED",
    getDisplayName: (r) =>
      r.applicant_full_name_np || r.applicant_full_name_en || "—",
  },
  complaint: {
    key: "complaint",
    label: "Complaint",
    icon: "📢",
    color: "rose",
    apiBase: "/v1/complaint",
    registrationBase: "/v1/complaint",
    certificateDownloadPath: null,
    getId: (r) => r.complaint_id,
    FormComponent: FileComplaint,
    PreviewComponent: ComplaintPreview,
    EditComponent: null,
    getSearchValue: (r) => r.subject ?? "",
    searchLabel: "Search by subject",
    statusField: "complaint_status",
    issuedStatus: "RESOLVED",
    getDisplayName: (r) => r.subject || "—",
  },
  notice: {
    key: "notice",
    label: "Ward Notices",
    icon: "📢",
    color: "sky",
    apiBase: "/v1/notice",
    getId: (r) => r.notice_id,
    FormComponent: null,
    PreviewComponent: NoticeDetailView,
    EditComponent: null,
    ListComponent: NoticeManagement,
    getSearchValue: (n) => n.notice_title ?? "",
    searchLabel: "Search by title",
    statusField: "notice_status",
    issuedStatus: "PUBLISHED",
    getDisplayName: (n) => n.notice_title || "—",
  },

  // ADD — tax. No FormComponent: citizens don't create tax records, the
  // DVO/survey team does (see TaxDataValidationHome on the admin side).
  // Citizens only view what's been assessed, pay, and dispute — all of
  // which lives inside MyTaxDashboard via ListComponent, same escape
  // hatch "notice" already uses for its own custom list view.
  tax: {
    key: "tax",
    label: "My Tax",
    icon: "💰",
    color: "emerald",
    apiBase: "/v1/tax",
    getId: (r) => r.id,
    FormComponent: null,
    PreviewComponent: null,
    EditComponent: null,
    ListComponent: MyTaxDashboard,
    getSearchValue: () => "",
    searchLabel: "",
    statusField: "status",
    issuedStatus: "PAID",
    getDisplayName: () => "—",
  },
};
export const CERTIFICATE_LIST = Object.values(CERTIFICATE_TYPES);
