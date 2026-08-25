import { useState } from "react";
import MigrationAddressSelect from "../components/migratioregistration-component/MigrationAddressSelect";
import ApplicantInfo from "../components/migratioregistration-component/Applicantinfo";
import MigrationPreview from "../components/migratioregistration-component/Migrationpreview";
import WardOfficeInfo from "../components/migratioregistration-component/Wardofficeinfo";
import MigrationAddressBlock from "../components/migratioregistration-component/Migrationaddressblock";
import FamilyMembersInfo from "../components/migratioregistration-component/Familymembersinfo";
import EnclosuresInfo from "../components/migratioregistration-component/Enclosuresinfo";
import MigrationDetailInfo from "../components/migratioregistration-component/MigrationDetailinfo";
import logo from "../assets/nepal-sarkar.png";
import API_URL from "../api/api";
import { notify } from "../utils/notify";
import {
  validateMigrationRegistration,
  migrationRegistrationWarnings,
  isFamilyMemberStarted,
} from "../validation/migration-registration-validation";

let initial_data = {
  register_ward_id: "",
  register_submitted_by: 1,
  applicant: {
    applicant_full_name_np: "",
    applicant_full_name_en: "",
    applicant_gender: "",
    applicant_dob_bs: "",
    applicant_dob_ad: "",
    applicant_citizenship_no: "",
    applicant_nationality: "",
    applicant_occupation: "",
    applicant_contact_no: "",
  },
  addresses: [
    {
      address_type: "PERMANENT",
      province: "",
      district: "",
      municipality: "",
      ward_number: "",
      tole: "",
    },
    {
      address_type: "CURRENT",
      province: "",
      district: "",
      municipality: "",
      ward_number: "",
      tole: "",
    },
    {
      address_type: "NEW",
      province: "",
      district: "",
      municipality: "",
      ward_number: "",
      tole: "",
    },
  ],
  migration_detail: {
    migration_date_bs: "",
    migration_date_ad: "",
    migration_reason: "",
    migration_reason_other: "",
  },
  family_members: [
    {
      member_name_np: "",
      member_name_en: "",
      member_relationship: "",
      member_gender: "",
      member_dob_bs: "",
      member_dob_ad: "",
      member_citizenship_no: "",
      member_remarks: "",
    },
  ],
  enclosure_citizenship_copy: false,
  enclosure_address_proof: false,
  enclosure_destination_proof: false,
  enclosure_photo_count: 2,
  enclosure_other: "",
};

// ── Document upload state ──────────────────────────────────────────────────
// applicant_citizenship is two-sided (front/back), matching birth
// registration's citizenship pattern. The rest are single documents.
const emptyDocuments = () => ({
  applicant_citizenship: {
    front: { file: null, previewUrl: null },
    back: { file: null, previewUrl: null },
  },
  address_proof: { file: null, previewUrl: null },
  destination_proof: { file: null, previewUrl: null },
  applicant_photo: { file: null, previewUrl: null },
});

const DOCUMENT_FIELDS = [
  {
    key: "applicant_citizenship",
    label: "निवेदकको नागरिकता (Applicant's Citizenship)",
    dual: true,
  },
  {
    key: "address_proof",
    label: "ठेगाना प्रमाण (Address Proof)",
  },
  {
    key: "destination_proof",
    label: "गन्तव्य प्रमाण (Destination Proof)",
  },
  {
    key: "applicant_photo",
    label: "निवेदकको फोटो (Applicant Photo)",
  },
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

// `currentUser` is whoever is already logged in (a ward-level citizen or
// staff account) — their ward is already fixed by their login, so this
// page reads register_ward_id from currentUser.user_ward_id instead of
// asking them to pick a ward office on the form.
//
// NOTE: that wiring doesn't exist yet — no currentUser prop is passed in and
// register_ward_id is never appended to the request body. The backend treats
// it as optional, so submissions still go through, but the record won't be
// tied to a ward until this is connected.
function MigrationRegistration({ wards }) {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(initial_data);
  const [documents, setDocuments] = useState(emptyDocuments());
  const [submitting, setSubmitting] = useState(false);

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

      const prevSlot = prev[key];
      if (prevSlot?.previewUrl && prevSlot.previewUrl !== "pdf")
        URL.revokeObjectURL(prevSlot.previewUrl);
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
    const errors = validateMigrationRegistration(formData);
    if (notify.firstError(errors)) return;

    migrationRegistrationWarnings(formData).forEach((w) => notify.warn(w));

    setSubmitting(true);

    const addressesPayload = formData.addresses.map((a) => ({
      ...a,
      ward_number: Number(a.ward_number) || 0,
    }));

    // The form always renders one blank family-member row. Sending it would
    // create a nameless member record, so only rows the person actually
    // started filling in are submitted.
    const familyMembersPayload = formData.family_members.filter(
      isFamilyMemberStarted,
    );

    // Router expects these as separate multipart Form fields (see
    // create_migration_registration), not one combined "payload" field.
    const body = new FormData();
    body.append("applicant", JSON.stringify(formData.applicant));
    body.append("addresses", JSON.stringify(addressesPayload));
    body.append("migration_detail", JSON.stringify(formData.migration_detail));
    body.append("family_members", JSON.stringify(familyMembersPayload));
    body.append(
      "enclosure_citizenship_copy",
      formData.enclosure_citizenship_copy,
    );
    body.append("enclosure_address_proof", formData.enclosure_address_proof);
    body.append(
      "enclosure_destination_proof",
      formData.enclosure_destination_proof,
    );
    body.append("enclosure_photo_count", formData.enclosure_photo_count || 0);
    if (formData.enclosure_other)
      body.append("enclosure_other", formData.enclosure_other);

    // documents — field names must match the router's UploadFile params
    const front = documents.applicant_citizenship.front.file;
    const back = documents.applicant_citizenship.back.file;
    if (front) body.append("applicant_citizenship_front", front);
    if (back) body.append("applicant_citizenship_back", back);
    if (documents.address_proof.file)
      body.append("address_proof", documents.address_proof.file);
    if (documents.destination_proof.file)
      body.append("destination_proof", documents.destination_proof.file);
    if (documents.applicant_photo.file)
      body.append("applicant_photo", documents.applicant_photo.file);

    fetch(`${API_URL}/v1/migration-registration/`, {
      method: "POST",
      credentials: "include",
      body, // no Content-Type — browser sets multipart boundary
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) throw data;
          return data;
        }),
      )
      .then(() => {
        notify.success("Migration registration submitted successfully!");
        setFormData(initial_data);
        setDocuments(emptyDocuments());
        setShowPreview(false);
      })
      .catch((err) => {
        // notify.apiError unpacks FastAPI's `detail`, which is a LIST of
        // validation objects for its own 422s and a plain string for our
        // HTTPException calls.
        notify.apiError(err, "Migration registration submission failed.");
      })
      .finally(() => setSubmitting(false));
  }

  // Validate before previewing too — reviewing a certificate built from
  // incomplete data just means finding the same problems twice.
  function handlePreview() {
    const errors = validateMigrationRegistration(formData);
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

          <MigrationPreview formData={formData} documents={documents} />

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
                <h1 className="text-4xl font-bold">
                  Migration Certificate Application
                </h1>
              </div>
            </div>

            <ApplicantInfo setFormData={setFormData} formData={formData} />

            <MigrationAddressBlock
              addressType="PERMANENT"
              title="स्थायी ठेगाना (Permanent Address)"
              wards={wards}
              setFormData={setFormData}
              formData={formData}
            />
            <MigrationAddressSelect
              addressType="CURRENT"
              title="हालको ठेगाना (Address at Time of Leaving)"
              wards={wards}
              setFormData={setFormData}
              formData={formData}
            />
            <MigrationAddressSelect
              addressType="NEW"
              title="बसाईसराई गर्ने स्थान (New Address / Destination)"
              wards={wards}
              setFormData={setFormData}
              formData={formData}
            />

            <MigrationDetailInfo setFormData={setFormData} formData={formData} />

            <FamilyMembersInfo setFormData={setFormData} formData={formData} />

            <EnclosuresInfo setFormData={setFormData} formData={formData} />

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

export default MigrationRegistration;