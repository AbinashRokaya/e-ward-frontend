// ─────────────────────────────────────────────────────────────────────────
// Same pattern as wardChairpersonTypes.js — one object per certificate type
// at the secretary stage. Simpler split than chairperson's (single
// "forwarded" status vs. everything else, no separate rejected exclusion),
// so the config is a bit leaner.
//
// NOTE ON IMPORT PATHS: adjust to match your real folders.
// ─────────────────────────────────────────────────────────────────────────

import BirthCertificateTable from "../datavalidation/BirthCertificateTable";
import EditBirthRegistrationWardSecretaryModal from "../ward_secretary/EditBirthRegistrationWardSecretaryModal";

import DeathCertificateTable from "../datavalidation/DeathCertificateTable";
import EditDeathRegistrationWardSecretaryModal from "../ward_secretary/EditDeathRegistrationWardSecretaryModal";

import MigrationCertificateTable from "../datavalidation/MigrationCertificateTable";
import EditMigrationRegistrationWardSecretaryModal from "../ward_secretary/EditMigrationRegistrationWardSecretaryModal";

import RecommendationLetterTable from "../datavalidation/RecommendationLetterTable";
import EditRecommendationWardSecretaryModal from "../ward_secretary/EditRecommendationWardSecretaryModal";
import ComplaintTable from "../complaint/ComplaintTable";
import EditComplaintWardSecretaryModal from "../ward_secretary/EditComplaintWardSecretaryModal";

// Fields:
//   key, label, labelNp, icon, color
//   fetchEndpoint / getRecords(data)   - list fetch + how to pull the array out
//   deleteEndpoint(id) / idField
//   TableComponent / recordsPropName   - existing table, used as-is
//   EditModalComponent                 - the verify/reject modal
//   editRecordPropName                 - prop name it expects for the record
//   needsWards                         - true if EditModalComponent also
//                                         needs the ward list
//   getSearchValue(r) / searchPlaceholder
//   sectionTitleVerification / sectionTitleForwarded
//   verificationTabLabel / forwardedTabLabel
//   statusField / forwardedStatus
//                                       - "verification" tab = anything
//                                         that ISN'T forwardedStatus
//                                         (matches the original page's
//                                         logic exactly — no rejected
//                                         exclusion, unlike chairperson)
//   deleteTitle / getDeleteDescription

import NoticeTable from "../notice/NoticeTable";
import EditNoticeWardSecretaryModal from "../ward_secretary/EditNoticeWardSecretaryModal";
import NoticeDetailView from "../notice/NoticeDetailView";

// Used by notice's filterFields below — kept local since NoticeFilters.jsx
// doesn't export these (it only has its own private NOTICE_TYPES copy).
const NOTICE_TYPES = [
  "PUBLIC",
  "TENDER",
  "VACANCY",
  "TAX",
  "MEETING",
  "HEALTH",
  "EDUCATION",
  "DISASTER",
  "EVENT",
  "OTHER",
];
const NOTICE_STATUSES = ["DRAFT", "PUBLISHED", "EXPIRED", "ARCHIVED"];

export const WARD_SECRETARY_TYPES = {
  birth_certificate: {
    key: "birth_certificate",
    label: "Birth Certificate",
    labelNp: "जन्म प्रमाणपत्र",
    icon: "👶",
    color: "blue",
    fetchEndpoint: "/v1/ward-secretary/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/birth-registration/${id}`,
    idField: "registration_id",
    TableComponent: BirthCertificateTable,
    recordsPropName: "birth",
    EditModalComponent: EditBirthRegistrationWardSecretaryModal,
    editRecordPropName: "birth",
    needsWards: true,
    getSearchValue: (b) => b.child?.child_first_name ?? "",
    searchPlaceholder: "Search by child's name",
    sectionTitleVerification:
      "प्रमाणीकरण पर्खाइमा रहेका (Pending Verification)",
    sectionTitleForwarded: "सिफारिस पठाइएका अभिलेखहरू (Forwarded for Approval)",
    verificationTabLabel: "कागजात प्रमाणीकरण (Verify Birth Documents)",
    forwardedTabLabel: "सिफारिस पठाइएको (Forwarded for Approval)",
    statusField: "register_status",
    forwardedStatus: "FORWARDED_TO_CHAIRPERSON",
    deleteTitle: "जन्म दर्ता हटाउनुहोस्? (Delete Birth Registration?)",
    getDeleteDescription: (b) =>
      `"${b.child?.child_first_name ?? "this record"}" को जन्म दर्ता स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`,
  },

  death_certificate: {
    key: "death_certificate",
    label: "Death Certificate",
    labelNp: "मृत्यु प्रमाणपत्र",
    icon: "🕊️",
    color: "red",
    fetchEndpoint: "/v1/ward-secretary/death/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/death-registration/${id}`,
    idField: "registration_id",
    TableComponent: DeathCertificateTable,
    recordsPropName: "death",
    EditModalComponent: EditDeathRegistrationWardSecretaryModal,
    editRecordPropName: "death",
    needsWards: true,
    getSearchValue: (d) => d.deceased?.deceased_first_name ?? "",
    searchPlaceholder: "Search by deceased's name",
    sectionTitleVerification:
      "प्रमाणीकरण पर्खाइमा रहेका (Pending Verification)",
    sectionTitleForwarded: "सिफारिस पठाइएका अभिलेखहरू (Forwarded for Approval)",
    verificationTabLabel: "कागजात प्रमाणीकरण (Verify Death Documents)",
    forwardedTabLabel: "सिफारिस पठाइएको (Forwarded for Approval)",
    statusField: "register_status",
    forwardedStatus: "FORWARDED_TO_CHAIRPERSON",
    deleteTitle: "मृत्यु दर्ता हटाउनुहोस्? (Delete Death Registration?)",
    getDeleteDescription: (d) =>
      `"${d.deceased?.deceased_first_name ?? "this record"}" को मृत्यु दर्ता स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`,
  },

  // Migration's PK is migration_id, not registration_id — idField and the
  // modal's fetch URL both reflect that, same distinction carried over
  // from the datavalidation config for this certificate type.
  migration_certificate: {
    key: "migration_certificate",
    label: "Migration Certificate",
    labelNp: "बसाईसराई प्रमाणपत्र",
    icon: "🧳",
    color: "violet",
    fetchEndpoint: "/v1/ward-secretary/migration/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/migration-registration/${id}`,
    idField: "migration_id",
    TableComponent: MigrationCertificateTable,
    recordsPropName: "migration",
    EditModalComponent: EditMigrationRegistrationWardSecretaryModal,
    editRecordPropName: "migration",
    needsWards: true,
    getSearchValue: (m) => m.applicant?.applicant_full_name_en ?? "",
    searchPlaceholder: "Search by applicant's name",
    sectionTitleVerification:
      "प्रमाणीकरण पर्खाइमा रहेका (Pending Verification)",
    sectionTitleForwarded: "सिफारिस पठाइएका अभिलेखहरू (Forwarded for Approval)",
    verificationTabLabel: "कागजात प्रमाणीकरण (Verify Migration Documents)",
    forwardedTabLabel: "सिफारिस पठाइएको (Forwarded for Approval)",
    statusField: "register_status",
    forwardedStatus: "FORWARDED_TO_CHAIRPERSON",
    deleteTitle: "बसाईसराई दर्ता हटाउनुहोस्?",
    getDeleteDescription: (m) =>
      `"${m.applicant?.applicant_full_name_np ?? m.applicant?.applicant_full_name_en ?? "this record"}" लाई हटाइनेछ।`,
  },

  // Letter's PK is letter_id, not registration_id — same "different key
  // name" wrinkle as migration_certificate above. reject is a list
  // relationship on this model (unlike birth's single object), which is
  // why EditRecommendationWardSecretaryModal reads formData.reject?.[0]
  // instead of formData.reject directly.
  recommendation_letter: {
    key: "recommendation_letter",
    label: "Recommendation Letter",
    labelNp: "सिफारिस पत्र",
    icon: "📄",
    color: "amber",
    fetchEndpoint: "/v1/ward-secretary/recommendation/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/recommendation-letter/${id}`,
    idField: "letter_id",
    TableComponent: RecommendationLetterTable,
    recordsPropName: "recommendation",
    EditModalComponent: EditRecommendationWardSecretaryModal,
    editRecordPropName: "recommendation",
    needsWards: true,
    getSearchValue: (r) => r.applicant_full_name_en ?? "",
    searchPlaceholder: "Search by applicant's name",
    sectionTitleVerification:
      "प्रमाणीकरण पर्खाइमा रहेका (Pending Verification)",
    sectionTitleForwarded: "सिफारिस पठाइएका अभिलेखहरू (Forwarded for Approval)",
    verificationTabLabel: "कागजात प्रमाणीकरण (Verify Recommendation Documents)",
    forwardedTabLabel: "सिफारिस पठाइएको (Forwarded for Approval)",
    statusField: "register_status",
    forwardedStatus: "FORWARDED_TO_CHAIRPERSON",
    deleteTitle: "सिफारिस पत्र हटाउनुहोस्?",
    getDeleteDescription: (r) =>
      `"${r.applicant_full_name_np ?? r.applicant_full_name_en ?? "this record"}" लाई हटाइनेछ।`,
  },
  complaint: {
    key: "complaint",
    label: "Complaint",
    labelNp: "गुनासो",
    icon: "📢",
    color: "rose",
    fetchEndpoint: "/v1/ward-secretary/complaint/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/complaint/${id}`,
    idField: "complaint_id",
    TableComponent: ComplaintTable,
    recordsPropName: "complaints",
    EditModalComponent: EditComplaintWardSecretaryModal,
    editRecordPropName: "complaint",
    needsWards: false,
    getSearchValue: (c) => c.subject ?? "",
    searchPlaceholder: "Search by subject",
    hasStatusTabs: false,
    sectionTitle: "गुनासो (Complaints Awaiting Action)",
    deleteTitle: "गुनासो हटाउनुहोस्?",
    getDeleteDescription: (c) => `"${c.subject ?? "this record"}" लाई हटाइनेछ।`,
  },
  notice: {
    key: "notice",
    label: "Notice",
    labelNp: "सूचना",
    icon: "📢",
    color: "sky",
    fetchEndpoint: "/v1/notice/ward-secretary/all", // ← was: (wardId) => `/v1/notice/${wardId}/all`
    getRecords: (data) => data.data,
    deleteEndpoint: null,
    idField: "notice_id",
    TableComponent: NoticeTable,
    recordsPropName: "notices",
    EditModalComponent: EditNoticeWardSecretaryModal,
    ViewComponent: NoticeDetailView,
    editRecordPropName: "notice",
    needsWards: false,
    getSearchValue: (n) => n.notice_title ?? "",
    searchPlaceholder: "Search by title",
    hasStatusTabs: false,
    sectionTitle: "सूचना व्यवस्थापन (Manage Notices)",
    allowAdd: true,
    addButtonLabel: "+ Add Notice",
    filterFields: [
      {
        id: "notice_type",
        label: "Type",
        kind: "select",
        options: NOTICE_TYPES,
        allLabel: "All Types",
      },
      {
        id: "notice_status",
        label: "Status",
        kind: "select",
        options: NOTICE_STATUSES,
        allLabel: "All Statuses",
      },
      {
        id: "date_from",
        label: "From",
        kind: "date-from",
        recordField: "created_at",
      },
      {
        id: "date_to",
        label: "To",
        kind: "date-to",
        recordField: "created_at",
      },
    ],
    deleteTitle: "सूचना हटाउनुहोस्?",
    getDeleteDescription: (n) =>
      `"${n.notice_title ?? "this notice"}" लाई हटाइनेछ।`,
  },
};

export const WARD_SECRETARY_LIST = Object.values(WARD_SECRETARY_TYPES);
