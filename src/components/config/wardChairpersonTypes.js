// ─────────────────────────────────────────────────────────────────────────
// Same pattern as the other config files — one object per certificate type
// at the chairperson stage. This queue has a two-way status split (pending
// signature vs. issued) rather than the simple approve/reject of
// dataValidationTypes.js, so it gets its own manager component.
//
// NOTE ON IMPORT PATHS: adjust to match your real folders.
// ─────────────────────────────────────────────────────────────────────────

import BirthCertificateTable from "../datavalidation/BirthCertificateTable";
import EditBirthRegistrationWardChairpersonModal from "../ward_chairperson/EditBirthRegistrationWardChairpersonModal";

import DeathCertificateTable from "../datavalidation/DeathCertificateTable";
import EditDeathRegistrationWardChairpersonModal from "../ward_chairperson/EditDeathRegistrationWardChairpersonModal";

import MigrationCertificateTable from "../datavalidation/MigrationCertificateTable";
import EditMigrationRegistrationWardChairpersonModal from "../ward_chairperson/EditMigrationRegistrationWardChairpersonModal";

import RecommendationLetterTable from "../datavalidation/RecommendationLetterTable";
import EditRecommendationWardChairpersonModal from "../ward_chairperson/EditRecommendationWardChairpersonModal";
import EditComplaintWardChairpersonModal from "../ward_chairperson/EditComplaintWardChairpersonModal";
import ComplaintTable from "../complaint/ComplaintTable";
import NoticeDetailView from "../notice/NoticeDetailView";
import NoticeTable from "../notice/NoticeTable";

// Fields:
//   key, label, labelNp, icon, color
//   fetchEndpoint / getRecords(data)   - list fetch + how to pull the array out
//   deleteEndpoint(id) / idField
//   TableComponent / recordsPropName   - existing table, used as-is
//   EditModalComponent                 - the approve/reject/issue modal
//   editRecordPropName                 - prop name it expects for the record
//   needsWards                         - true if EditModalComponent also
//                                         needs the ward list (chairperson's
//                                         modal does, for the `wards` prop)
//   getSearchValue(r) / searchPlaceholder
//   sectionTitlePending / sectionTitleIssued
//   pendingTabLabel / issuedTabLabel
//   statusField / issuedStatus / rejectedStatus
//                                       - "pending" = anything that's
//                                         neither issuedStatus nor
//                                         rejectedStatus (matches the
//                                         original page's logic exactly)
//   deleteTitle / getDeleteDescription

export const WARD_CHAIRPERSON_TYPES = {
  birth_certificate: {
    key: "birth_certificate",
    label: "Birth Certificate",
    labelNp: "जन्म प्रमाणपत्र",
    icon: "👶",
    color: "blue",
    fetchEndpoint: "/v1/ward-chairperson/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/birth-registration/${id}`,
    idField: "registration_id",
    TableComponent: BirthCertificateTable,
    recordsPropName: "birth",
    EditModalComponent: EditBirthRegistrationWardChairpersonModal,
    editRecordPropName: "birth",
    needsWards: true,
    getSearchValue: (b) => b.child?.child_first_name ?? "",
    searchPlaceholder: "Search by child's name",
    sectionTitlePending: "स्वीकृतिको पर्खाइमा रहेका (Pending Signatures)",
    sectionTitleIssued: "जारी गरिएका प्रमाणपत्रहरू (Issued Certificates)",
    pendingTabLabel: "स्वीकृतिको पर्खाइमा (Pending Signatures)",
    issuedTabLabel: "जारी गरिएका प्रमाणपत्र (Issued Certificates)",
    statusField: "register_status",
    issuedStatus: "CERTIFICATE_ISSUED",
    rejectedStatus: "REJECTED",
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
    fetchEndpoint: "/v1/ward-chairperson/death/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/death-registration/${id}`,
    idField: "registration_id",
    TableComponent: DeathCertificateTable,
    recordsPropName: "death",
    EditModalComponent: EditDeathRegistrationWardChairpersonModal,
    editRecordPropName: "death",
    needsWards: true,
    getSearchValue: (d) => d.deceased?.deceased_first_name ?? "",
    searchPlaceholder: "Search by deceased's name",
    sectionTitlePending: "स्वीकृतिको पर्खाइमा रहेका (Pending Signatures)",
    sectionTitleIssued: "जारी गरिएका प्रमाणपत्रहरू (Issued Certificates)",
    pendingTabLabel: "स्वीकृतिको पर्खाइमा (Pending Signatures)",
    issuedTabLabel: "जारी गरिएका प्रमाणपत्र (Issued Certificates)",
    statusField: "register_status",
    issuedStatus: "CERTIFICATE_ISSUED",
    rejectedStatus: "REJECTED",
    deleteTitle: "मृत्यु दर्ता हटाउनुहोस्?",
    getDeleteDescription: (d) =>
      `"${d.deceased?.deceased_first_name ?? "this record"}" लाई हटाइनेछ।`,
  },

  // Migration's PK is migration_id, not registration_id — idField and the
  // modal's fetch URL both reflect that, same distinction carried over
  // from the datavalidation and ward-secretary configs for this type.
  migration_certificate: {
    key: "migration_certificate",
    label: "Migration Certificate",
    labelNp: "बसाईसराई प्रमाणपत्र",
    icon: "🧳",
    color: "violet",
    fetchEndpoint: "/v1/ward-chairperson/migration/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/migration-registration/${id}`,
    idField: "migration_id",
    TableComponent: MigrationCertificateTable,
    recordsPropName: "migration",
    EditModalComponent: EditMigrationRegistrationWardChairpersonModal,
    editRecordPropName: "migration",
    needsWards: true,
    getSearchValue: (m) => m.applicant?.applicant_full_name_en ?? "",
    searchPlaceholder: "Search by applicant's name",
    sectionTitlePending: "स्वीकृतिको पर्खाइमा रहेका (Pending Signatures)",
    sectionTitleIssued: "जारी गरिएका प्रमाणपत्रहरू (Issued Certificates)",
    pendingTabLabel: "स्वीकृतिको पर्खाइमा (Pending Signatures)",
    issuedTabLabel: "जारी गरिएका प्रमाणपत्र (Issued Certificates)",
    statusField: "register_status",
    issuedStatus: "CERTIFICATE_ISSUED",
    rejectedStatus: "REJECTED",
    deleteTitle: "बसाईसराई दर्ता हटाउनुहोस्?",
    getDeleteDescription: (m) =>
      `"${m.applicant?.applicant_full_name_np ?? m.applicant?.applicant_full_name_en ?? "this record"}" लाई हटाइनेछ।`,
  },

  // Letter's PK is letter_id, not registration_id, and reject is a list
  // relationship on this model (unlike birth's single object) — same
  // wrinkles carried over from the datavalidation / ward-secretary
  // configs for this type.
  //
  // issuedStatus is "CERTIFICATE_ISSUED" — recommendation letters now
  // mirror birth's flow exactly: SUBMITTED → (secretary) VERIFIED →
  // (chairperson) CERTIFICATE_ISSUED. issue_certificate_for_recommendation_letter
  // sets this status once the certificate/PDF is generated.
  recommendation_letter: {
    key: "recommendation_letter",
    label: "Recommendation Letter",
    labelNp: "सिफारिस पत्र",
    icon: "📄",
    color: "amber",
    fetchEndpoint: "/v1/ward-chairperson/recommendation/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/recommendation-letter/${id}`,
    idField: "letter_id",
    TableComponent: RecommendationLetterTable,
    recordsPropName: "recommendation",
    EditModalComponent: EditRecommendationWardChairpersonModal,
    editRecordPropName: "recommendation",
    needsWards: true,
    getSearchValue: (r) => r.applicant_full_name_en ?? "",
    searchPlaceholder: "Search by applicant's name",
    sectionTitlePending: "स्वीकृतिको पर्खाइमा रहेका (Pending Signatures)",
    sectionTitleIssued: "जारी गरिएका प्रमाणपत्रहरू (Issued Certificates)",
    pendingTabLabel: "स्वीकृतिको पर्खाइमा (Pending Signatures)",
    issuedTabLabel: "जारी गरिएका प्रमाणपत्र (Issued Certificates)",
    statusField: "register_status",
    issuedStatus: "CERTIFICATE_ISSUED",
    rejectedStatus: "REJECTED",
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
    fetchEndpoint: "/v1/ward-chairperson/complaint/all",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/complaint/${id}`,
    idField: "complaint_id",
    TableComponent: ComplaintTable,
    recordsPropName: "complaints",
    EditModalComponent: EditComplaintWardChairpersonModal,
    editRecordPropName: "complaint",
    needsWards: false,
    getSearchValue: (c) => c.subject ?? "",
    searchPlaceholder: "Search by subject",
    sectionTitlePending: "समाधानको पर्खाइमा रहेका (Pending Resolution)",
    sectionTitleIssued: "समाधान भएका गुनासोहरू (Resolved Complaints)",
    pendingTabLabel: "समाधानको पर्खाइमा (Pending Resolution)",
    issuedTabLabel: "समाधान भएका (Resolved)",
    statusField: "complaint_status",
    issuedStatus: "RESOLVED",
    rejectedStatus: "REJECTED",
    deleteTitle: "गुनासो हटाउनुहोस्?",
    getDeleteDescription: (c) => `"${c.subject ?? "this record"}" लाई हटाइनेछ।`,
  },
  notice: {
    key: "notice",
    label: "Notice",
    labelNp: "सूचना",
    icon: "📢",
    color: "sky",
    fetchEndpoint: "/v1/notice/ward-secretary/all",
    getRecords: (data) => data.data,
    deleteEndpoint: null,
    idField: "notice_id",
    TableComponent: NoticeTable,
    recordsPropName: "notices",
    ViewComponent: NoticeDetailView,
    EditModalComponent: NoticeDetailView,
    editRecordPropName: "notice",
    needsWards: false,
    getSearchValue: (n) => n.notice_title ?? "",
    searchPlaceholder: "Search by title",
    hasStatusTabs: false,
    sectionTitle: "सूचना (Ward Notices)",
  },
};

export const WARD_CHAIRPERSON_LIST = Object.values(WARD_CHAIRPERSON_TYPES);
