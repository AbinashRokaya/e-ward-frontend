// ─────────────────────────────────────────────────────────────────────────
// NOTE ON IMPORT PATHS: your original Admin.jsx imported these as "./WardTable"
// etc. — i.e. sitting in the same folder as Admin.jsx itself. Adjust the
// paths below to match wherever that folder actually is in your repo
// (I've guessed "admin-component" to match your existing
// "birthregistration-component" / "deathregistration-component" naming).
// ─────────────────────────────────────────────────────────────────────────
import WardTable from "../../components/admin/WardTable";
import AddWardForm from "../../components/admin/AddWardForm";
import EditWardModal from "../../components/admin/EditWardModal";
import OfficerTable from "../../components/admin/OfficerTable";
import AssignOfficerForm from "../../components/admin/AssignOfficerForm";
import EditOfficerModal from "../../components/admin/EditOfficerModal";

// ─────────────────────────────────────────────────────────────────────────
// Add a new admin-managed entity by adding one object here — EntityManager
// and AdminHome read everything from this list. Copy the "officer" block
// as a template (it's the more complex one, since it also depends on the
// ward list) for whatever's next.
//
// Fields:
//   key                  - unique id
//   label / labelNp      - shown on cards and headings
//   icon                 - single emoji for the landing page card
//   color                - key into colorClasses.js
//   fetchEndpoint        - GET endpoint for the full list
//   getRecords(data)     - pulls the array out of the response body
//                          (wards nests under data.ward_list, officers don't)
//   deleteEndpoint(id)   - DELETE endpoint for one record
//   idField              - primary key field name on each record
//   TableComponent       - existing table component (used as-is, unmodified)
//   recordsPropName      - prop name TableComponent expects for the array
//                          (WardTable wants `wards`, OfficerTable wants
//                          `officers` — kept as config instead of rewriting
//                          those components to a uniform prop name)
//   FormComponent        - existing "add new" component. It does its own
//                          POST internally and calls onSuccess(newRecord) —
//                          EntityManager just prepends that to the list.
//   EditModalComponent   - existing edit modal. It does its own PUT
//                          internally and calls onSaved(updatedRecord) —
//                          EntityManager replaces that record in the list.
//   editRecordPropName   - prop name EditModalComponent expects for the
//                          record being edited (`ward` / `officer`)
//   extraProps(wards)    - extra props every component below needs beyond
//                          records/callbacks (officer components need the
//                          ward list, for the ward-number dropdown)
//   getSearchValue(r)    - string to filter the search box against
//   searchPlaceholder
//   listLabel / addLabel / sectionTitle
//   deleteTitle
//   getDeleteDescription(r)
// ─────────────────────────────────────────────────────────────────────────

export const ADMIN_ENTITY_TYPES = {
  ward: {
    key: "ward",
    label: "Ward",
    labelNp: "वडा",
    icon: "🏛️",
    color: "blue",
    fetchEndpoint: "/v1/admin/ward",
    getRecords: (data) => data.data.ward_list,
    deleteEndpoint: (id) => `/v1/admin/ward/${id}`,
    idField: "ward_id",
    TableComponent: WardTable,
    recordsPropName: "wards",
    FormComponent: AddWardForm,
    EditModalComponent: EditWardModal,
    editRecordPropName: "ward",
    extraProps: () => ({}),
    getSearchValue: (w) =>
      `${w.ward_name} ${w.ward_municipality} ${w.ward_district}`,
    searchPlaceholder: "नाम, जिल्ला वा नगरपालिका खोज्नुहोस्…",
    listLabel: "वडा सूची (Ward List)",
    addLabel: "+ नयाँ वडा (Add Ward)",
    sectionTitle: "सबै वडाहरू (All Wards)",
    deleteTitle: "वडा हटाउनुहोस्? (Delete Ward?)",
    getDeleteDescription: (w) =>
      `"${w.ward_name}" (Ward ${w.ward_no}) लाई स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`,
  },

  officer: {
    key: "officer",
    label: "Officer",
    labelNp: "अधिकृत",
    icon: "🧑‍💼",
    color: "green",
    fetchEndpoint: "/v1/admin/users/officers",
    getRecords: (data) => data.data,
    deleteEndpoint: (id) => `/v1/admin/user/${id}`,
    idField: "user_id",
    TableComponent: OfficerTable,
    recordsPropName: "officers",
    FormComponent: AssignOfficerForm,
    EditModalComponent: EditOfficerModal,
    editRecordPropName: "officer",
    extraProps: (wards) => ({ wards }),
    getSearchValue: (o) =>
      `${o.user_name ?? ""} ${o.user_phone_number ?? ""} ${o.user_ward_number ?? ""}`,
    searchPlaceholder: "नाम, फोन वा वडा नं. खोज्नुहोस्…",
    listLabel: "अधिकृत सूची (Officer List)",
    addLabel: "+ अधिकृत नियुक्त (Assign)",
    sectionTitle: "सबै अधिकृतहरू (All Officers)",
    deleteTitle: "अधिकृत हटाउनुहोस्? (Delete Officer?)",
    getDeleteDescription: (o) =>
      `"${o.user_name}" लाई वडा ${o.user_ward_number} बाट हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`,
  },

  // Template for the next admin-managed entity — copy this, rename the
  // key, point the components at real ones once they exist. Good
  // candidates for your e-ward system: certificate-type settings, notice
  // board posts, document templates, audit logs.
  // documentTemplate: {
  //   key: "documentTemplate",
  //   label: "Document Template",
  //   labelNp: "कागजात ढाँचा",
  //   icon: "📄",
  //   color: "violet",
  //   fetchEndpoint: "/v1/admin/templates",
  //   getRecords: (data) => data.data,
  //   deleteEndpoint: (id) => `/v1/admin/templates/${id}`,
  //   idField: "template_id",
  //   TableComponent: TemplateTable,
  //   recordsPropName: "templates",
  //   FormComponent: AddTemplateForm,
  //   EditModalComponent: EditTemplateModal,
  //   editRecordPropName: "template",
  //   extraProps: () => ({}),
  //   getSearchValue: (t) => t.template_name,
  //   searchPlaceholder: "ढाँचाको नाम खोज्नुहोस्…",
  //   listLabel: "ढाँचा सूची (Template List)",
  //   addLabel: "+ नयाँ ढाँचा (Add Template)",
  //   sectionTitle: "सबै ढाँचाहरू (All Templates)",
  //   deleteTitle: "ढाँचा हटाउनुहोस्?",
  //   getDeleteDescription: (t) => `"${t.template_name}" लाई हटाइनेछ।`,
  // },
};

export const ADMIN_ENTITY_LIST = Object.values(ADMIN_ENTITY_TYPES);
