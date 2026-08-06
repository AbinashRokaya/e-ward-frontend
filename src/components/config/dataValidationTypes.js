// ─────────────────────────────────────────────────────────────────────────
// Same pattern as certificateTypes.js / adminEntityTypes.js — one config
// object per review queue. This one is simpler than the admin entities:
// there's no "add" tab, since these are incoming submissions being
// reviewed, not records the validator creates themselves.
//
// NOTE ON IMPORT PATHS: adjust these to match your real folder — your
// screenshot shows a "datavalidation" folder under components, so these
// assume BirthCertificateTable / CitizenTable / EditBirthRegistrationModal /
// EditCitizen all live at src/components/datavalidation/.
//
// NOTE ON TAX: tax is deliberately NOT added to VALIDATION_TYPES below.
// Every entry here assumes the shape "citizen submitted something, DVO
// reviews/approves/rejects it" — that's what ValidationManager +
// EditModalComponent are built for. Tax data works the other way (the
// DVO/survey team enters the data directly; citizens only view/pay/dispute),
// so it doesn't fit this config's fields (no fetchEndpoint-as-review-queue,
// no single EditModalComponent that makes sense as both add AND edit).
// Tax instead gets its own TAX_TAB + TaxDataValidationHome, wired directly
// into DataValidationHome.jsx the same way ANALYTICS_TAB already bypasses
// this file. See DataValidationHome.jsx for that wiring.
// ─────────────────────────────────────────────────────────────────────────
import BirthCertificateTable from "../datavalidation/BirthCertificateTable";

import CitizenTable from "../datavalidation/CitizenTable";
import EditCitizen from "../datavalidation/EditCitizen";
import EditBirthRegistrationModal from "../datavalidation/ EditBirthRegistrationModal";

import DeathCertificateTable from "../datavalidation/DeathCertificateTable";
import EditDeathRegistrationModal from "../datavalidation/EditDeathRegistrationModal";

import MigrationCertificateTable from "../datavalidation/MigrationCertificateTable";
import EditMigrationRegistrationModal from "../datavalidation/EditMigrationRegistrationModal";
import RecommendationLetterTable from "../datavalidation/RecommendationLetterTable";
import EditRecommendationModal from "../datavalidation/EditRecommendationModal";
import EditComplaintOfficerModal from "../datavalidation/EditComplaintOfficerModal";
import ComplaintTable from "../complaint/ComplaintTable";
import NoticeDetailView from "../notice/NoticeDetailView";
import NoticeTable from "../notice/NoticeTable";

// Fields:
//   key, label, labelNp, icon, color   - same as other configs
//   fetchEndpoint / getRecords(data)   - list fetch + how to pull the array out
//   allowDelete                        - birth certificates don't get a
//                                         delete action in your table (the
//                                         button is commented out); citizens do
//   deleteEndpoint(id) / idField       - only used when allowDelete is true
//   TableComponent / recordsPropName   - existing table, used as-is
//   EditModalComponent                 - this is really a "review" modal
//                                         (view + approve/reject), reused as-is
//   editRecordPropName                 - prop name it expects for the record
//   getSearchValue(r) / searchPlaceholder
//   listLabel / sectionTitle
//   statusFilters                      - null if the queue has no status
//                                         tabs (birth doesn't); an array of
//                                         {key, label} if it does (citizen)
//   statusField                        - field to filter on, when
//                                         statusFilters is set
//   deleteTitle / getDeleteDescription - only used when allowDelete is true

export const VALIDATION_TYPES = {
  birth_certificate: {
    key: "birth_certificate",
    label: "Birth Certificate",
    labelNp: "जन्म प्रमाणपत्र",
    icon: "👶",
    color: "blue",
    fetchEndpoint: "/v1/data-validation/all",
    getRecords: (data) => data.data,
    allowDelete: false,
    deleteEndpoint: (id) => `/v1/birth-registration/${id}`,
    idField: "registration_id",
    TableComponent: BirthCertificateTable,
    recordsPropName: "birth",
    EditModalComponent: EditBirthRegistrationModal,
    editRecordPropName: "birth",
    getSearchValue: (b) => b.child?.child_first_name ?? "",
    searchPlaceholder: "Search by child's name",
    listLabel: "Birth Certificate List",
    sectionTitle: "All Wards Birth Certificates",
    statusFilters: null,
    statusField: null,
    deleteTitle: "जन्म दर्ता हटाउनुहोस्? (Delete Birth Registration?)",
    getDeleteDescription: (b) =>
      `"${b.child?.child_first_name ?? "this record"}" को जन्म दर्ता स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`,
  },

  citizen: {
    key: "citizen",
    label: "Citizen",
    labelNp: "नागरिक",
    icon: "🧑",
    color: "green",
    fetchEndpoint: "/v1/users",
    getRecords: (data) => data.data.user_list,
    allowDelete: true,
    deleteEndpoint: (id) => `/v1/users/${id}`,
    idField: "user_id",
    TableComponent: CitizenTable,
    recordsPropName: "citizen",
    EditModalComponent: EditCitizen,
    editRecordPropName: "citizen",
    getSearchValue: (c) => c.user_name ?? "",
    searchPlaceholder: "Search by citizen name",
    listLabel: "Citizen List",
    sectionTitle: "All Citizens",
    statusFilters: [
      { key: "all", label: "All" },
      { key: "pending", label: "Pending" },
      { key: "approved", label: "Approved" },
      { key: "rejected", label: "Rejected" },
    ],
    statusField: "user_status",
    deleteTitle: "नागरिक हटाउनुहोस्? (Delete Citizen?)",
    getDeleteDescription: (c) =>
      `"${c.user_name}" लाई स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`,
  },

  death_certificate: {
    key: "death_certificate",
    label: "Death Certificate",
    labelNp: "मृत्यु प्रमाणपत्र",
    icon: "🕊️",
    color: "red",
    fetchEndpoint: "/v1/data-validation/death/all",
    getRecords: (data) => data.data,
    allowDelete: false,
    deleteEndpoint: (id) => `/v1/death-registration/${id}`,
    idField: "registration_id",
    TableComponent: DeathCertificateTable,
    recordsPropName: "death",
    EditModalComponent: EditDeathRegistrationModal,
    editRecordPropName: "death",
    getSearchValue: (d) => d.deceased?.deceased_first_name ?? "",
    searchPlaceholder: "Search by deceased's name",
    listLabel: "Death Certificate List",
    sectionTitle: "All Wards Death Certificates",
    statusFilters: null,
    statusField: null,
    deleteTitle: "मृत्यु दर्ता हटाउनुहोस्?",
    getDeleteDescription: (d) =>
      `"${d.deceased?.deceased_first_name}" लाई हटाइनेछ।`,
  },

  // Migration schema's PK is migration_id, not registration_id — the
  // idField and modal both use that instead of following the birth/death
  // naming. applicant name is also a single full-name field per language
  // (applicant_full_name_en/np), not first/middle/last, matching how the
  // migration registration schema actually stores it.
  migration_certificate: {
    key: "migration_certificate",
    label: "Migration Certificate",
    labelNp: "बसाईसराई प्रमाणपत्र",
    icon: "🧳",
    color: "violet",
    fetchEndpoint: "/v1/data-validation/migration/all",
    getRecords: (data) => data.data,
    allowDelete: false,
    deleteEndpoint: (id) => `/v1/migration-registration/${id}`,
    idField: "migration_id",
    TableComponent: MigrationCertificateTable,
    recordsPropName: "migration",
    EditModalComponent: EditMigrationRegistrationModal,
    editRecordPropName: "migration",
    getSearchValue: (m) => m.applicant?.applicant_full_name_en ?? "",
    searchPlaceholder: "Search by applicant's name",
    listLabel: "Migration Certificate List",
    sectionTitle: "All Wards Migration Certificates",
    statusFilters: null,
    statusField: null,
    deleteTitle: "बसाईसराई दर्ता हटाउनुहोस्?",
    getDeleteDescription: (m) =>
      `"${m.applicant?.applicant_full_name_np ?? m.applicant?.applicant_full_name_en ?? "this record"}" लाई हटाइनेछ।`,
  },
  recommendation_letter: {
    key: "recommendation_letter",
    label: "Recommendation Letter",
    labelNp: "सिफारिस पत्र",
    icon: "📄",
    color: "amber",
    fetchEndpoint: "/v1/recommendation-letter/officer/all", // ← was "/ward/all" — that returns every status; validation queue should only show SUBMITTED
    getRecords: (data) => data.data,
    allowDelete: false,
    deleteEndpoint: (id) => `/v1/recommendation-letter/${id}`,
    idField: "letter_id",
    TableComponent: RecommendationLetterTable,
    recordsPropName: "recommendation",
    EditModalComponent: EditRecommendationModal,
    editRecordPropName: "recommendation",
    getSearchValue: (r) => r.applicant_full_name_en ?? "",
    searchPlaceholder: "Search by applicant's name",
    listLabel: "Recommendation Letter List",
    sectionTitle: "All Wards Recommendation Letters",
    statusFilters: null,
    statusField: null,
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
    fetchEndpoint: "/v1/complaint/officer/all",
    getRecords: (data) => data.data,
    allowDelete: false,
    deleteEndpoint: (id) => `/v1/complaint/${id}`,
    idField: "complaint_id",
    TableComponent: ComplaintTable,
    recordsPropName: "complaints",
    EditModalComponent: EditComplaintOfficerModal,
    editRecordPropName: "complaint",
    getSearchValue: (c) => c.subject ?? "",
    searchPlaceholder: "Search by subject",
    listLabel: "Complaint List",
    sectionTitle: "All Wards Complaints",
    statusFilters: null,
    statusField: null,
    deleteTitle: "गुनासो हटाउनुहोस्?",
    getDeleteDescription: (c) => `"${c.subject ?? "this record"}" लाई हटाइनेछ।`,
  },
  notice: {
    key: "notice",
    label: "Notice",
    labelNp: "सूचना",
    icon: "📢",
    color: "sky",
    fetchEndpoint: "/v1/notice/officer/all",
    getRecords: (data) => data.data,
    allowDelete: false,
    deleteEndpoint: null,
    idField: "notice_id",
    TableComponent: NoticeTable,
    recordsPropName: "notices",
    ViewComponent: NoticeDetailView,
    EditModalComponent: NoticeDetailView,
    editRecordPropName: "notice",
    getSearchValue: (n) => n.notice_title ?? "",
    searchPlaceholder: "Search by title",
    listLabel: "Notice List",
    sectionTitle: "All Wards Notices",
    statusFilters: null,
    statusField: null,
  },
};

export const VALIDATION_LIST = Object.values(VALIDATION_TYPES);
