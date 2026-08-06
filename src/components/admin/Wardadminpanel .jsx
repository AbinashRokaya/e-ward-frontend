import { useState } from "react";

// ── Constants (mirrors backend enums) ─────────────────────────────────────────
const PROVINCE_LIST = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

const OFFICER_ROLES = [
  { value: "wardchairperson", label: "Ward Chairperson", labelNp: "वडाध्यक्ष" },
  { value: "wardsecretary", label: "Ward Secretary", labelNp: "वडा सचिव" },
  {
    value: "datavalidationofficer",
    label: "Data Validation Officer",
    labelNp: "डेटा अधिकृत",
  },
];

const ROLE_COLOR = {
  wardchairperson: "bg-purple-100 text-purple-700",
  wardsecretary: "bg-blue-100   text-blue-700",
  datavalidationofficer: "bg-green-100  text-green-700",
};

const inputStyle =
  "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_WARDS = [
  {
    ward_id: "a1b2c3d4",
    ward_name: "Central Ward",
    ward_no: 1,
    ward_municipality: "Kathmandu",
    ward_district: "Kathmandu",
    ward_province: "Bagmati",
    ward_contact_number: "9801234567",
    ward_email: "ward1@kathmandu.gov.np",
  },
  {
    ward_id: "e5f6g7h8",
    ward_name: "North Ward",
    ward_no: 3,
    ward_municipality: "Lalitpur",
    ward_district: "Lalitpur",
    ward_province: "Bagmati",
    ward_contact_number: "9807654321",
    ward_email: "ward3@lalitpur.gov.np",
  },
];

const MOCK_OFFICERS = [
  {
    user_id: 1,
    user_name: "ram_prasad",
    user_phone_number: "9841000001",
    user_citizenship_number: "12-01-0001",
    user_province: "Bagmati",
    user_district: "Kathmandu",
    user_municipality: "Kathmandu",
    user_ward_number: 1,
    user_role: "wardchairperson",
  },
  {
    user_id: 2,
    user_name: "sita_kumari",
    user_phone_number: "9841000002",
    user_citizenship_number: "12-01-0002",
    user_province: "Bagmati",
    user_district: "Kathmandu",
    user_municipality: "Kathmandu",
    user_ward_number: 1,
    user_role: "wardsecretary",
  },
  {
    user_id: 3,
    user_name: "hari_bahadur",
    user_phone_number: "9841000003",
    user_citizenship_number: "12-01-0003",
    user_province: "Bagmati",
    user_district: "Lalitpur",
    user_municipality: "Lalitpur",
    user_ward_number: 3,
    user_role: "datavalidationofficer",
  },
];

// ── Shared helpers ────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div
      className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${isSuccess ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
    >
      <span>{isSuccess ? "✓" : "✕"}</span>
      {toast.message}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

function RoleBadge({ role }) {
  const found = OFFICER_ROLES.find((r) => r.value === role);
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[role] ?? "bg-gray-100 text-gray-600"}`}
    >
      {found?.label ?? role}
    </span>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  return [toast, show];
}

// Generic confirm-delete modal
function ConfirmDeleteModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  deleting,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-100 text-red-600 rounded-full p-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            रद्द गर्नुहोस् (Cancel)
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Spinner /> Removing…
              </>
            ) : (
              "हटाउनुहोस् (Delete)"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ward validation ───────────────────────────────────────────────────────────
function validateWard(form) {
  const e = {};
  if (!form.ward_name.trim()) e.ward_name = "Ward name is required.";
  if (!form.ward_no || isNaN(Number(form.ward_no)) || Number(form.ward_no) < 1)
    e.ward_no = "Enter a valid ward number.";
  if (!form.ward_municipality.trim())
    e.ward_municipality = "Municipality is required.";
  if (!form.ward_district.trim()) e.ward_district = "District is required.";
  if (!form.ward_province) e.ward_province = "Select a province.";
  if (!/^\d{7,15}$/.test(form.ward_contact_number))
    e.ward_contact_number = "Enter a valid contact number (7–15 digits).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ward_email))
    e.ward_email = "Enter a valid email address.";
  return e;
}

// ── Officer validation ────────────────────────────────────────────────────────
function validateOfficer(form) {
  const e = {};
  if (!form.user_name.trim()) e.user_name = "Username is required.";
  if (!/^\d{7,15}$/.test(form.user_phone_number))
    e.user_phone_number = "Enter a valid phone number (7–15 digits).";
  if (!form.user_citizenship_number.trim())
    e.user_citizenship_number = "Citizenship number is required.";
  if (!form.user_province) e.user_province = "Select a province.";
  if (!form.user_district.trim()) e.user_district = "District is required.";
  if (!form.user_municipality.trim())
    e.user_municipality = "Municipality is required.";
  if (
    !form.user_ward_number ||
    isNaN(Number(form.user_ward_number)) ||
    Number(form.user_ward_number) < 1
  )
    e.user_ward_number = "Enter a valid ward number.";
  if (!form.user_role) e.user_role = "Select a role.";
  return e;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WARD SECTION
// ═══════════════════════════════════════════════════════════════════════════════

const initialWardForm = {
  ward_name: "",
  ward_no: "",
  ward_municipality: "",
  ward_district: "",
  ward_province: "",
  ward_contact_number: "",
  ward_email: "",
};

// Shared form body used for both "add" (inline) and "edit" (modal) modes
function WardForm({ formData, errors, onChange, onContactChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          वडाको नाम (Ward Name)
        </label>
        <input
          type="text"
          name="ward_name"
          value={formData.ward_name}
          onChange={onChange}
          placeholder="वडाको नाम लेख्नुहोस्"
          className={`${inputStyle} ${errors.ward_name ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.ward_name} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          वडा नम्बर (Ward Number)
        </label>
        <input
          type="number"
          name="ward_no"
          value={formData.ward_no}
          onChange={(e) => {
            if (!isNaN(Number(e.target.value))) onChange(e);
          }}
          placeholder="१, २, ३…"
          min={1}
          className={`${inputStyle} ${errors.ward_no ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.ward_no} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          नगरपालिका (Municipality)
        </label>
        <input
          type="text"
          name="ward_municipality"
          value={formData.ward_municipality}
          onChange={onChange}
          placeholder="नगरपालिका लेख्नुहोस्"
          className={`${inputStyle} ${errors.ward_municipality ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.ward_municipality} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          जिल्ला (District)
        </label>
        <input
          type="text"
          name="ward_district"
          value={formData.ward_district}
          onChange={onChange}
          placeholder="जिल्ला लेख्नुहोस्"
          className={`${inputStyle} ${errors.ward_district ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.ward_district} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          प्रदेश (Province)
        </label>
        <select
          name="ward_province"
          value={formData.ward_province}
          onChange={onChange}
          className={`${inputStyle} bg-white ${errors.ward_province ? "border-red-400" : ""}`}
        >
          <option value="">-- प्रदेश छान्नुहोस् --</option>
          {PROVINCE_LIST.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <FieldError msg={errors.ward_province} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          सम्पर्क नम्बर (Contact Number)
        </label>
        <input
          type="tel"
          name="ward_contact_number"
          value={formData.ward_contact_number}
          onChange={onContactChange}
          placeholder="98XXXXXXXX"
          className={`${inputStyle} ${errors.ward_contact_number ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.ward_contact_number} />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          इमेल (Email Address)
        </label>
        <input
          type="email"
          name="ward_email"
          value={formData.ward_email}
          onChange={onChange}
          placeholder="ward@municipality.gov.np"
          className={`${inputStyle} ${errors.ward_email ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.ward_email} />
      </div>
    </div>
  );
}

function AddWardForm({ onSuccess }) {
  const [formData, setFormData] = useState(initialWardForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, showToast] = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleContactChange = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setFormData((prev) => ({ ...prev, ward_contact_number: e.target.value }));
    if (errors.ward_contact_number)
      setErrors((prev) => ({ ...prev, ward_contact_number: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateWard(formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      // Replace with: POST /v1/admin/ward
      await new Promise((r) => setTimeout(r, 800));
      onSuccess({
        ...formData,
        ward_id: Math.random().toString(36).slice(2, 10),
        ward_no: Number(formData.ward_no),
      });
      setFormData(initialWardForm);
      showToast("Ward created successfully!", "success");
    } catch {
      showToast("Failed to create ward. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <Toast toast={toast} />
      <h2 className="text-2xl font-semibold text-blue-700 mb-6">
        वडा थप्नुहोस् (Add New Ward)
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <WardForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onContactChange={handleContactChange}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData(initialWardForm);
              setErrors({});
            }}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            रद्द गर्नुहोस् (Reset)
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner /> सिर्जना गर्दै…
              </>
            ) : (
              "वडा थप्नुहोस् (Add Ward)"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Edit-ward modal
function EditWardModal({ ward, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    ...ward,
    ward_no: String(ward.ward_no),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleContactChange = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setFormData((prev) => ({ ...prev, ward_contact_number: e.target.value }));
    if (errors.ward_contact_number)
      setErrors((prev) => ({ ...prev, ward_contact_number: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateWard(formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      // Replace with: PUT /v1/admin/ward/{ward.ward_id}
      await new Promise((r) => setTimeout(r, 700));
      onSaved({ ...formData, ward_no: Number(formData.ward_no) });
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-blue-700">
            वडा सम्पादन गर्नुहोस् (Edit Ward)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <WardForm
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onContactChange={handleContactChange}
          />
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              रद्द गर्नुहोस् (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Spinner /> अद्यावधिक गर्दै…
                </>
              ) : (
                "परिवर्तन सुरक्षित गर्नुहोस् (Save Changes)"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WardTable({ wards, onEdit, onDeleteRequest }) {
  if (!wards.length)
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        कुनै वडा भेटिएन। माथि थप्नुहोस्।
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-50 text-blue-800 text-left">
            {[
              "#",
              "Ward Name",
              "No.",
              "Municipality",
              "District",
              "Province",
              "Contact",
              "Email",
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
          {wards.map((w, i) => (
            <tr
              key={w.ward_id}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800">
                {w.ward_name}
              </td>
              <td className="px-3 py-2">{w.ward_no}</td>
              <td className="px-3 py-2">{w.ward_municipality}</td>
              <td className="px-3 py-2">{w.ward_district}</td>
              <td className="px-3 py-2">{w.ward_province}</td>
              <td className="px-3 py-2">{w.ward_contact_number}</td>
              <td className="px-3 py-2 text-blue-600 truncate max-w-[140px]">
                {w.ward_email}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <button
                  onClick={() => onEdit(w)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteRequest(w)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OFFICER SECTION
// ═══════════════════════════════════════════════════════════════════════════════

const initialOfficerForm = {
  user_name: "",
  user_phone_number: "",
  user_citizenship_number: "",
  user_province: "",
  user_district: "",
  user_municipality: "",
  user_ward_number: "",
  user_role: "",
};

function OfficerForm({
  formData,
  errors,
  onChange,
  onWardSelect,
  onPhoneChange,
  onCitizenshipChange,
  onRolePick,
  wards,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          वडा छान्नुहोस् (Select Ward){" "}
          <span className="text-gray-400 text-xs font-normal">
            — auto-fills location
          </span>
        </label>
        <select
          name="user_ward_number"
          value={formData.user_ward_number}
          onChange={onWardSelect}
          className={`${inputStyle} bg-white ${errors.user_ward_number ? "border-red-400" : ""}`}
        >
          <option value="">-- वडा छान्नुहोस् --</option>
          {wards.map((w) => (
            <option key={w.ward_id} value={w.ward_no}>
              Ward {w.ward_no} — {w.ward_name} ({w.ward_municipality})
            </option>
          ))}
        </select>
        <FieldError msg={errors.user_ward_number} />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          भूमिका (Role)
        </label>
        <div className="flex flex-wrap gap-3 mt-1">
          {OFFICER_ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onRolePick(r.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.user_role === r.value ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400" : "border-gray-300 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"}`}
            >
              <span className="block text-xs text-gray-400">{r.labelNp}</span>
              {r.label}
            </button>
          ))}
        </div>
        <FieldError msg={errors.user_role} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          प्रयोगकर्ता नाम (Username)
        </label>
        <input
          type="text"
          name="user_name"
          value={formData.user_name}
          onChange={onChange}
          placeholder="username_here"
          className={`${inputStyle} ${errors.user_name ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.user_name} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          फोन नम्बर (Phone Number)
        </label>
        <input
          type="tel"
          name="user_phone_number"
          value={formData.user_phone_number}
          onChange={onPhoneChange}
          placeholder="98XXXXXXXX"
          className={`${inputStyle} ${errors.user_phone_number ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.user_phone_number} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          नागरिकता नम्बर (Citizenship Number)
        </label>
        <input
          type="text"
          name="user_citizenship_number"
          value={formData.user_citizenship_number}
          onChange={onCitizenshipChange}
          placeholder="XX-XX-XXXX"
          className={`${inputStyle} ${errors.user_citizenship_number ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.user_citizenship_number} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          प्रदेश (Province)
        </label>
        <select
          name="user_province"
          value={formData.user_province}
          onChange={onChange}
          className={`${inputStyle} bg-white ${errors.user_province ? "border-red-400" : ""}`}
        >
          <option value="">-- प्रदेश छान्नुहोस् --</option>
          {PROVINCE_LIST.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <FieldError msg={errors.user_province} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          जिल्ला (District)
        </label>
        <input
          type="text"
          name="user_district"
          value={formData.user_district}
          onChange={onChange}
          placeholder="जिल्ला लेख्नुहोस्"
          className={`${inputStyle} ${errors.user_district ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.user_district} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          नगरपालिका (Municipality)
        </label>
        <input
          type="text"
          name="user_municipality"
          value={formData.user_municipality}
          onChange={onChange}
          placeholder="नगरपालिका लेख्नुहोस्"
          className={`${inputStyle} ${errors.user_municipality ? "border-red-400" : ""}`}
        />
        <FieldError msg={errors.user_municipality} />
      </div>
    </div>
  );
}

function AssignOfficerForm({ wards, onSuccess }) {
  const [formData, setFormData] = useState(initialOfficerForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, showToast] = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleWardSelect = (e) => {
    const wardNo = Number(e.target.value);
    const ward = wards.find((w) => w.ward_no === wardNo);
    setFormData((prev) => ({
      ...prev,
      user_ward_number: e.target.value,
      ...(ward
        ? {
            user_municipality: ward.ward_municipality,
            user_district: ward.ward_district,
            user_province: ward.ward_province,
          }
        : {}),
    }));
    if (errors.user_ward_number)
      setErrors((prev) => ({ ...prev, user_ward_number: undefined }));
  };

  const handlePhoneChange = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setFormData((prev) => ({ ...prev, user_phone_number: e.target.value }));
    if (errors.user_phone_number)
      setErrors((prev) => ({ ...prev, user_phone_number: undefined }));
  };

  const handleCitizenshipChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      user_citizenship_number: e.target.value,
    }));
    if (errors.user_citizenship_number)
      setErrors((prev) => ({ ...prev, user_citizenship_number: undefined }));
  };

  const handleRolePick = (value) => {
    setFormData((prev) => ({ ...prev, user_role: value }));
    if (errors.user_role)
      setErrors((prev) => ({ ...prev, user_role: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateOfficer(formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      // Replace with: POST /v1/admin/user/
      await new Promise((r) => setTimeout(r, 800));
      onSuccess({
        ...formData,
        user_id: Date.now(),
        user_ward_number: Number(formData.user_ward_number),
      });
      setFormData(initialOfficerForm);
      showToast("Officer assigned successfully!", "success");
    } catch {
      showToast("Failed to assign officer. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <Toast toast={toast} />
      <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
        अधिकृत नियुक्त गर्नुहोस् (Assign Ward Officer)
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <OfficerForm
          formData={formData}
          errors={errors}
          wards={wards}
          onChange={handleChange}
          onWardSelect={handleWardSelect}
          onPhoneChange={handlePhoneChange}
          onCitizenshipChange={handleCitizenshipChange}
          onRolePick={handleRolePick}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData(initialOfficerForm);
              setErrors({});
            }}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            रद्द गर्नुहोस् (Reset)
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner /> नियुक्त गर्दै…
              </>
            ) : (
              "अधिकृत नियुक्त गर्नुहोस् (Assign Officer)"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Edit-officer modal
function EditOfficerModal({ officer, wards, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    ...officer,
    user_ward_number: String(officer.user_ward_number),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleWardSelect = (e) => {
    const wardNo = Number(e.target.value);
    const ward = wards.find((w) => w.ward_no === wardNo);
    setFormData((prev) => ({
      ...prev,
      user_ward_number: e.target.value,
      ...(ward
        ? {
            user_municipality: ward.ward_municipality,
            user_district: ward.ward_district,
            user_province: ward.ward_province,
          }
        : {}),
    }));
    if (errors.user_ward_number)
      setErrors((prev) => ({ ...prev, user_ward_number: undefined }));
  };
  const handlePhoneChange = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setFormData((prev) => ({ ...prev, user_phone_number: e.target.value }));
    if (errors.user_phone_number)
      setErrors((prev) => ({ ...prev, user_phone_number: undefined }));
  };
  const handleCitizenshipChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      user_citizenship_number: e.target.value,
    }));
    if (errors.user_citizenship_number)
      setErrors((prev) => ({ ...prev, user_citizenship_number: undefined }));
  };
  const handleRolePick = (value) => {
    setFormData((prev) => ({ ...prev, user_role: value }));
    if (errors.user_role)
      setErrors((prev) => ({ ...prev, user_role: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateOfficer(formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      // Replace with: PUT /v1/admin/user/{officer.user_id}
      await new Promise((r) => setTimeout(r, 700));
      onSaved({
        ...formData,
        user_ward_number: Number(formData.user_ward_number),
      });
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-indigo-700">
            अधिकृत सम्पादन गर्नुहोस् (Edit Officer)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <OfficerForm
            formData={formData}
            errors={errors}
            wards={wards}
            onChange={handleChange}
            onWardSelect={handleWardSelect}
            onPhoneChange={handlePhoneChange}
            onCitizenshipChange={handleCitizenshipChange}
            onRolePick={handleRolePick}
          />
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              रद्द गर्नुहोस् (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Spinner /> अद्यावधिक गर्दै…
                </>
              ) : (
                "परिवर्तन सुरक्षित गर्नुहोस् (Save Changes)"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OfficerTable({ officers, onEdit, onDeleteRequest, wards }) {
  const [roleFilter, setRoleFilter] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = officers.filter((o) => {
    const matchRole = !roleFilter || o.user_role === roleFilter;
    const matchWard = !wardFilter || String(o.user_ward_number) === wardFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.user_name.toLowerCase().includes(q) ||
      o.user_municipality.toLowerCase().includes(q);
    return matchRole && matchWard && matchSearch;
  });

  return (
    <div>
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          सबै अधिकृतहरू (All Officers)
        </h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम वा नगरपालिका खोज्नुहोस्…"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            {OFFICER_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
          >
            <option value="">All Wards</option>
            {wards.map((w) => (
              <option key={w.ward_id} value={String(w.ward_no)}>
                Ward {w.ward_no} – {w.ward_municipality}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        {!filtered.length ? (
          <p className="text-gray-400 text-sm text-center py-8">
            कुनै अधिकृत भेटिएन।
          </p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800 text-left">
                {[
                  "#",
                  "Username",
                  "Role",
                  "Ward No.",
                  "Municipality",
                  "District",
                  "Province",
                  "Phone",
                  "Citizenship",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 font-semibold whitespace-nowrap border-b border-indigo-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr
                  key={o.user_id}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {o.user_name}
                  </td>
                  <td className="px-3 py-2">
                    <RoleBadge role={o.user_role} />
                  </td>
                  <td className="px-3 py-2">Ward {o.user_ward_number}</td>
                  <td className="px-3 py-2">{o.user_municipality}</td>
                  <td className="px-3 py-2">{o.user_district}</td>
                  <td className="px-3 py-2">{o.user_province}</td>
                  <td className="px-3 py-2">{o.user_phone_number}</td>
                  <td className="px-3 py-2">{o.user_citizenship_number}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      onClick={() => onEdit(o)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteRequest(o)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { key: "wards", label: "वडा सूची (Ward List)", section: "ward" },
  { key: "add-ward", label: "+ नयाँ वडा (Add Ward)", section: "ward" },
  { key: "officers", label: "अधिकृत सूची (Officer List)", section: "officer" },
  {
    key: "add-officer",
    label: "+ अधिकृत नियुक्त (Assign)",
    section: "officer",
  },
];

export default function WardAdminPanel() {
  const [wards, setWards] = useState(MOCK_WARDS);
  const [officers, setOfficers] = useState(MOCK_OFFICERS);
  const [activeTab, setActiveTab] = useState("wards");
  const [wardSearch, setWardSearch] = useState("");

  // Edit modal state
  const [editingWard, setEditingWard] = useState(null);
  const [editingOfficer, setEditingOfficer] = useState(null);

  // Delete confirm state
  const [deleteWardTarget, setDeleteWardTarget] = useState(null);
  const [deleteOfficerTarget, setDeleteOfficerTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [panelToast, showPanelToast] = useToast();

  // ── Ward CRUD ──
  const handleAddWard = (w) => {
    setWards((p) => [w, ...p]);
    setActiveTab("wards");
  };

  const handleWardSaved = (updated) => {
    setWards((prev) =>
      prev.map((w) => (w.ward_id === updated.ward_id ? updated : w)),
    );
    setEditingWard(null);
    showPanelToast("Ward updated successfully!", "success");
  };

  const confirmDeleteWard = async () => {
    setDeleting(true);
    try {
      // Replace with: DELETE /v1/admin/ward/{deleteWardTarget.ward_id}
      await new Promise((r) => setTimeout(r, 600));
      setWards((prev) =>
        prev.filter((w) => w.ward_id !== deleteWardTarget.ward_id),
      );
      setDeleteWardTarget(null);
      showPanelToast("Ward removed successfully!", "success");
    } finally {
      setDeleting(false);
    }
  };

  // ── Officer CRUD ──
  const handleAddOfficer = (o) => {
    setOfficers((p) => [o, ...p]);
    setActiveTab("officers");
  };

  const handleOfficerSaved = (updated) => {
    setOfficers((prev) =>
      prev.map((o) => (o.user_id === updated.user_id ? updated : o)),
    );
    setEditingOfficer(null);
    showPanelToast("Officer updated successfully!", "success");
  };
  ConfirmDeleteModal;

  const confirmDeleteOfficer = async () => {
    setDeleting(true);
    try {
      // Replace with: DELETE /v1/admin/user/{deleteOfficerTarget.user_id}
      await new Promise((r) => setTimeout(r, 600));
      setOfficers((prev) =>
        prev.filter((o) => o.user_id !== deleteOfficerTarget.user_id),
      );
      setDeleteOfficerTarget(null);
      showPanelToast("Officer removed successfully!", "success");
    } finally {
      setDeleting(false);
    }
  };

  const filteredWards = wards.filter(
    (w) =>
      w.ward_name.toLowerCase().includes(wardSearch.toLowerCase()) ||
      w.ward_municipality.toLowerCase().includes(wardSearch.toLowerCase()) ||
      w.ward_district.toLowerCase().includes(wardSearch.toLowerCase()),
  );

  const currentSection =
    TABS.find((t) => t.key === activeTab)?.section ?? "ward";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg p-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7m-9 5v6h4v-6m-4 0H9m6 0h-2"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">
              Admin Portal
            </p>
            <h1 className="text-lg font-bold leading-tight">
              वडा व्यवस्थापन (Ward Management)
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="bg-white/10 border border-white/20 text-xs px-3 py-1 rounded-full">
            {wards.length} wards
          </span>
          <span className="bg-white/10 border border-white/20 text-xs px-3 py-1 rounded-full">
            {officers.length} officers
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {panelToast && (
          <div className="fixed top-4 right-4 z-50 w-80">
            <Toast toast={panelToast} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Wards",
              value: wards.length,
              color: "text-blue-700",
            },
            {
              label: "Total Officers",
              value: officers.length,
              color: "text-indigo-700",
            },
            {
              label: "Municipalities",
              value: new Set(wards.map((w) => w.ward_municipality)).size,
              color: "text-green-700",
            },
            {
              label: "Unassigned Roles",
              value: Math.max(wards.length * 3 - officers.length, 0),
              color: "text-orange-700",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <span className="self-center text-xs text-gray-400 font-semibold px-2 uppercase tracking-wide">
              Ward
            </span>
            {TABS.filter((t) => t.section === "ward").map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <span className="self-center text-xs text-gray-400 font-semibold px-2 uppercase tracking-wide">
              Officer
            </span>
            {TABS.filter((t) => t.section === "officer").map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Role coverage per ward */}
        {currentSection === "officer" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              वडाअनुसार भूमिका स्थिति (Role Coverage per Ward)
            </h3>
            <div className="flex flex-wrap gap-3">
              {wards.map((w) => {
                const wardOfficers = officers.filter(
                  (o) =>
                    o.user_municipality === w.ward_municipality &&
                    o.user_ward_number === w.ward_no,
                );
                const assignedRoles = wardOfficers.map((o) => o.user_role);
                return (
                  <div
                    key={w.ward_id}
                    className="border border-gray-200 rounded-lg p-3 min-w-[200px]"
                  >
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Ward {w.ward_no} — {w.ward_municipality}
                    </p>
                    <div className="flex flex-col gap-1">
                      {OFFICER_ROLES.map((r) => (
                        <div
                          key={r.value}
                          className="flex items-center gap-1.5"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${assignedRoles.includes(r.value) ? "bg-green-500" : "bg-gray-200"}`}
                          ></span>
                          <span className="text-xs text-gray-600">
                            {r.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab content */}
        {activeTab === "wards" && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                सबै वडाहरू (All Wards)
              </h2>
              <input
                type="text"
                value={wardSearch}
                onChange={(e) => setWardSearch(e.target.value)}
                placeholder="नाम, जिल्ला वा नगरपालिका खोज्नुहोस्…"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="p-4">
              <WardTable
                wards={filteredWards}
                onEdit={setEditingWard}
                onDeleteRequest={setDeleteWardTarget}
              />
            </div>
          </div>
        )}

        {activeTab === "add-ward" && <AddWardForm onSuccess={handleAddWard} />}

        {activeTab === "officers" && (
          <div className="bg-white rounded-xl shadow-md">
            <OfficerTable
              officers={officers}
              onEdit={setEditingOfficer}
              onDeleteRequest={setDeleteOfficerTarget}
              wards={wards}
            />
          </div>
        )}

        {activeTab === "add-officer" && (
          <AssignOfficerForm wards={wards} onSuccess={handleAddOfficer} />
        )}
      </main>

      {/* Modals */}
      {editingWard && (
        <EditWardModal
          ward={editingWard}
          onClose={() => setEditingWard(null)}
          onSaved={handleWardSaved}
        />
      )}
      {editingOfficer && (
        <EditOfficerModal
          officer={editingOfficer}
          wards={wards}
          onClose={() => setEditingOfficer(null)}
          onSaved={handleOfficerSaved}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteWardTarget}
        title="वडा हटाउनुहोस्? (Delete Ward?)"
        description={
          deleteWardTarget
            ? `"${deleteWardTarget.ward_name}" (Ward ${deleteWardTarget.ward_no}) लाई स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`
            : ""
        }
        onCancel={() => setDeleteWardTarget(null)}
        onConfirm={confirmDeleteWard}
        deleting={deleting}
      />
      <ConfirmDeleteModal
        open={!!deleteOfficerTarget}
        title="अधिकृत हटाउनुहोस्? (Delete Officer?)"
        description={
          deleteOfficerTarget
            ? `"${deleteOfficerTarget.user_name}" लाई वडा ${deleteOfficerTarget.user_ward_number} बाट हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।`
            : ""
        }
        onCancel={() => setDeleteOfficerTarget(null)}
        onConfirm={confirmDeleteOfficer}
        deleting={deleting}
      />
    </div>
  );
}
