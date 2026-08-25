import { useState } from "react";
import logo from "../assets/nepal-sarkar.png";

import API_URL from "../api/api";
import { notify } from "../utils/notify";
import {
  validateDeathRegistration,
  deathRegistrationWarnings,
} from "../validation/death-registration-validation";
import DeceasedInfo from "../components/deathregistration-component/Deceasedinfo";
import DeathDetailInfo from "../components/deathregistration-component/Deathdetailinfo";
import DeathAddressInfo from "../components/deathregistration-component/Deathaddressinfo";
import DeathInformantInfo from "../components/deathregistration-component/Deathinformantinfo";
import DeathPreview from "../components/deathregistration-component/Deathpreview";

// registration_no / page_no removed — the backend fills these in
// automatically (office-use fields), same reasoning as birth registration.
// register_submitted_by also removed — the backend sets this from the
// logged-in user (current_user.user_id), same as birth registration.
let initial_data = {
  register_ward_id: "",
  deceased: {
    deceased_first_name: "",
    deceased_middle_name: "",
    deceased_last_name: "",
    deceased_nepali_first_name: "",
    deceased_nepali_middle_name: "",
    deceased_nepali_last_name: "",
    deceased_gender: "",
    deceased_dob_bs: "",
    deceased_dob_ad: "",
    deceased_age_years: "",
    deceased_age_months: "",
    deceased_age_days: "",
    deceased_marital_status: "UNMARRIED",
    deceased_citizenship_no: "",
    deceased_occupation: "",
    deceased_other_id_no: "",
  },
  death_detail: {
    death_date_bs: "",
    death_time_period: "",
    death_time: "",
    death_place_type: "HOSPITAL",
    death_place_other_detail: "",
    death_cause: "",
    death_type: "NATURAL",
    death_type_other_detail: "",
    residence_duration_years: "",
    residence_duration_months: "",
    residence_duration_days: "",
  },
  informant: {
    informant_name: "",
    informant_relationship: "",
    informant_contact_no: "",
    declared_date_bs: "",
  },
  address: {
    deceased_province: "",
    deceased_district: "",
    deceased_municipality: "",
    deceased_ward_number: "",
    deceased_tole: "",

    death_place_province: "",
    death_place_district: "",
    death_place_municipality: "",
    death_place_ward_number: "",
    death_place_tole: "",

    informant_province: "",
    informant_district: "",
    informant_municipality: "",
    informant_ward_number: "",
    informant_tole: "",

    ward_nepali_name: "",
    ward_nepali_municipality: "",
    ward_nepali_district: "",
    ward_nepali_province: "",
  },
};

// ── Document upload state ──────────────────────────────────────────────────
// Citizenship documents are two-sided, so they store { front, back } each
// shaped like { file, previewUrl }. Single-sided documents keep the old
// { file, previewUrl } shape directly.
const emptyDocuments = () => ({
  deceased_citizenship: {
    front: { file: null, previewUrl: null },
    back: { file: null, previewUrl: null },
  },
  informant_citizenship: {
    front: { file: null, previewUrl: null },
    back: { file: null, previewUrl: null },
  },
  hospital_death_report: { file: null, previewUrl: null },
  police_report: { file: null, previewUrl: null },
});

const DOCUMENT_FIELDS = [
  {
    key: "deceased_citizenship",
    label: "मृतकको नागरिकता (Deceased's Citizenship)",
    dual: true,
  },
  {
    key: "informant_citizenship",
    label: "सूचना दिने व्यक्तिको नागरिकता (Informant's Citizenship)",
    dual: true,
  },
  {
    key: "hospital_death_report",
    label: "अस्पताल मृत्यु प्रतिवेदन (Hospital Death Report)",
  },
  { key: "police_report", label: "प्रहरी प्रतिवेदन (Police Report)" },
];

const MAX_FILE_BYTES = 5 * 1024 * 1024;

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

function UploadTile({ label, previewUrl, isPdf, onFileSelected }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] text-gray-500 text-center">{label}</span>
      <div className="w-20 h-20 rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
        {previewUrl ? (
          isPdf ? (
            <span className="text-[10px] text-gray-500">PDF</span>
          ) : (
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-contain"
            />
          )
        ) : (
          <span className="text-[10px] text-gray-400">छैन</span>
        )}
      </div>
      <label className="text-xs px-3 py-1.5 rounded-md cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
        {previewUrl ? "बदल्नुहोस्" : "अपलोड गर्नुहोस्"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelected(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function DocumentUploads({ documents, onSelect }) {
  return (
    <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        सहयोगी कागजातहरू (Supporting Documents)
        <span className="text-xs text-gray-400 font-normal ml-2">
          (max 5MB each)
        </span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {DOCUMENT_FIELDS.map((field) => {
          if (field.dual) {
            const front = documents?.[field.key]?.front;
            const back = documents?.[field.key]?.back;
            return (
              <div
                key={field.key}
                className="col-span-2 border border-gray-200 rounded-lg p-3"
              >
                <span className="text-xs font-medium text-gray-600 block text-center mb-2">
                  {field.label}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <UploadTile
                    label="अगाडि (Front)"
                    previewUrl={front?.previewUrl}
                    isPdf={front?.file?.type === "application/pdf"}
                    onFileSelected={(file) => onSelect(field.key, file, "front")}
                  />
                  <UploadTile
                    label="पछाडि (Back)"
                    previewUrl={back?.previewUrl}
                    isPdf={back?.file?.type === "application/pdf"}
                    onFileSelected={(file) => onSelect(field.key, file, "back")}
                  />
                </div>
              </div>
            );
          }

          const current = documents?.[field.key];
          return (
            <div
              key={field.key}
              className="border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2"
            >
              <UploadTile
                label={field.label}
                previewUrl={current?.previewUrl}
                isPdf={current?.file?.type === "application/pdf"}
                onFileSelected={(file) => onSelect(field.key, file)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeathRegistration({ wards }) {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(initial_data);
  const [documents, setDocuments] = useState(emptyDocuments());
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  function handleDocumentSelect(key, file, side) {
    // Reject oversized files at selection time rather than letting the whole
    // multi-megabyte submission fail after everything else is filled in.
    if (file.size > MAX_FILE_BYTES) {
      notify.error("File must be under 5MB.");
      return;
    }

    setDocuments((prev) => {
      const previewUrl =
        file.type === "application/pdf" ? "pdf" : URL.createObjectURL(file);

      if (side) {
        const prevSlot = prev[key]?.[side];
        // Guard the "pdf" sentinel — it isn't a real object URL, and
        // revoking it throws.
        if (prevSlot?.previewUrl && prevSlot.previewUrl !== "pdf")
          URL.revokeObjectURL(prevSlot.previewUrl);
        return {
          ...prev,
          [key]: {
            ...prev[key],
            [side]: { file, previewUrl },
          },
        };
      }

      if (prev[key]?.previewUrl && prev[key].previewUrl !== "pdf")
        URL.revokeObjectURL(prev[key].previewUrl);
      return {
        ...prev,
        [key]: { file, previewUrl },
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Validate before hitting the network, so problems come back as readable
    // messages instead of a raw 422 the person can't act on.
    const errors = validateDeathRegistration(formData);
    if (notify.firstError(errors)) return;

    // Non-blocking — a late registration or an unnatural death gets flagged
    // for attention without refusing a legitimate submission.
    deathRegistrationWarnings(formData).forEach((w) => notify.warn(w));

    setSubmitting(true);

    const body = new FormData();
    body.append("register_ward_id", formData.register_ward_id);
    body.append("deceased", JSON.stringify(formData.deceased));
    body.append("death_detail", JSON.stringify(formData.death_detail));
    body.append("informant", JSON.stringify(formData.informant));
    body.append("address", JSON.stringify(formData.address));

    DOCUMENT_FIELDS.forEach((field) => {
      if (field.dual) {
        const front = documents[field.key].front.file;
        const back = documents[field.key].back.file;
        if (front) body.append(`${field.key}_front`, front);
        if (back) body.append(`${field.key}_back`, back);
      } else if (documents[field.key].file) {
        body.append(field.key, documents[field.key].file);
      }
    });

    // Trailing slash matches the API spec — without it FastAPI issues a
    // redirect, which can drop the auth cookie on a cross-origin request.
    fetch(`${API_URL}/v1/death-registration/`, {
      method: "POST",
      credentials: "include",
      body,
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then(() => {
        notify.success("Death registration submitted successfully!");
        setFormData(initial_data);
        setDocuments(emptyDocuments());
        setShowPreview(false);
      })
      .catch((err) => {
        // notify.apiError unpacks FastAPI's `detail`, which is a LIST of
        // validation objects for its own 422s and a plain string for our
        // HTTPException calls.
        notify.apiError(err, "Death registration submission failed.");
      })
      .finally(() => setSubmitting(false));
  }

  // Validate before previewing too — reviewing a certificate built from
  // incomplete data just means finding the same problems twice.
  function handlePreview() {
    const errors = validateDeathRegistration(formData);
    if (notify.firstError(errors)) return;
    setShowPreview(true);
  }

  return (
    <>
      {showPreview ? (
        <div className="min-h-screen bg-gray-100 p-8 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md cursor-pointer transition-colors"
            >
              ← पछाडि जानुहोस् (Back to Form)
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
            >
              🖨️ Print / Download
            </button>
          </div>

          <DeathPreview formData={formData} documents={documents} />

          {/* Submit from the preview too — otherwise the person has to go back
              to the form to do the thing they just finished reviewing. */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Spinner /> पेश गर्दै…
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      ) : (
        <form
          className="min-h-screen bg-gray-100 p-8 flex flex-col max-w-6xl mx-auto gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={logo}
                alt="Government of Nepal"
                className="w-16 h-16 object-contain"
              />
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest">
                  Government of Nepal
                </p>
                <h1 className="text-4xl font-bold">Death Registration</h1>
              </div>
            </div>

            <DeceasedInfo
              setFormData={setFormData}
              formData={formData}
              handleChange={handleChange}
            />
            <DeathDetailInfo
              setFormData={setFormData}
              formData={formData}
              handleChange={handleChange}
            />
            <DeathAddressInfo
              wards={wards}
              setFormData={setFormData}
              formData={formData}
            />
            <DeathInformantInfo
              setFormData={setFormData}
              formData={formData}
              handleChange={handleChange}
            />

            <div className="bg-white rounded-lg p-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentUploads
                documents={documents}
                onSelect={handleDocumentSelect}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handlePreview}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-6 py-2 rounded-md cursor-pointer transition-colors"
            >
              👁️ Preview Certificate
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Spinner /> पेश गर्दै…
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

export default DeathRegistration;