import { useEffect, useState } from "react";
import ChildInfo from "../components/birthregistration-component/ChildInfo";
import logo from "../assets/nepal-sarkar.png";
import FatherInfo from "../components/birthregistration-component/FatherInfo";
import MotherInfo from "../components/birthregistration-component/MotherInfo";
import AddressInfo from "../components/birthregistration-component/AddressInfo";
import InformantInfo from "../components/birthregistration-component/InformantInfo";
import Preview from "../components/Preview";
import { birthRegistrationSchema } from "../validation/birth-certificate-validation";
import API_URL from "../api/api";
import { toast } from "react-toastify";

let inital_data = {
  register_ward_id: "",
  child: {
    child_first_name: "",
    child_middle_name: "",
    child_last_name: "",
    child_nepali_first_name: "",
    child_nepali_middle_name: "",
    child_nepali_last_name: "",
    child_gender: "",
    child_dob_bs: "",
    child_dob_ad: "",
    child_time_of_birth: "",
    child_birth_place: "",
    child_birth_kind: "",
    child_weight_kg: 0,
  },
  parents: [
    {
      parent_first_name: "",
      parent_middle_name: "",
      parent_last_name: "",
      parent_nepali_first_name: "",
      parent_nepali_middle_name: "",
      parent_nepali_last_name: "",
      parent_type: "FATHER",
      parent_citizenship_no: "",
      parent_nid_no: "",
      parent_occupation: "",
      parent_nationality: "",
      parent_contact_no: "",
    },
    {
      parent_first_name: "",
      parent_middle_name: "",
      parent_last_name: "",
      parent_nepali_first_name: "",
      parent_nepali_middle_name: "",
      parent_nepali_last_name: "",
      parent_type: "MOTHER",
      parent_citizenship_no: "",
      parent_nid_no: "",
      parent_occupation: "",
      parent_nationality: "",
      parent_contact_no: "",
    },
  ],
  nominees: [
    {
      nominee_first_name: "",
      nominee_middle_name: "",
      nominee_last_name: "",
      nominee_nepali_first_name: "",
      nominee_nepali_middle_name: "",
      nominee_nepali_last_name: "",
      nominee_citizenship_no: "",
      nominee_address: "",
      nominee_contact_no: "",
      nominee_witness_order: 0,
      nominee_relationship: "",
    },
  ],
  address: {
    child_province: "",
    child_district: "",
    child_municipality: "",
    child_ward_number: 0,
    child_tole: "",
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
  father_citizenship: {
    front: { file: null, previewUrl: null },
    back: { file: null, previewUrl: null },
  },
  mother_citizenship: {
    front: { file: null, previewUrl: null },
    back: { file: null, previewUrl: null },
  },
  hospital_birth_certificate: { file: null, previewUrl: null },
  vaccination_card: { file: null, previewUrl: null },
});

const DOCUMENT_FIELDS = [
  {
    key: "father_citizenship",
    label: "बुबाको नागरिकता (Father's Citizenship)",
    dual: true,
  },
  {
    key: "mother_citizenship",
    label: "आमाको नागरिकता (Mother's Citizenship)",
    dual: true,
  },
  {
    key: "hospital_birth_certificate",
    label: "अस्पताल जन्म प्रमाणपत्र (Hospital Birth Certificate)",
  },
  { key: "vaccination_card", label: "खोप कार्ड (Vaccination Card)" },
];

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
                    onFileSelected={(file) =>
                      onSelect(field.key, file, "front")
                    }
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

function BirthRegistration({ wards }) {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(inital_data);
  const [documents, setDocuments] = useState(emptyDocuments());
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  function handleDocumentSelect(key, file, side) {
    setDocuments((prev) => {
      const previewUrl =
        file.type === "application/pdf" ? "pdf" : URL.createObjectURL(file);

      if (side) {
        const prevSlot = prev[key]?.[side];
        if (prevSlot?.previewUrl) URL.revokeObjectURL(prevSlot.previewUrl);
        return {
          ...prev,
          [key]: {
            ...prev[key],
            [side]: { file, previewUrl },
          },
        };
      }

      if (prev[key]?.previewUrl) URL.revokeObjectURL(prev[key].previewUrl);
      return {
        ...prev,
        [key]: { file, previewUrl },
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const body = new FormData();
    body.append("register_ward_id", formData.register_ward_id);
    body.append("child", JSON.stringify(formData.child));
    body.append("parents", JSON.stringify(formData.parents));
    body.append("nominees", JSON.stringify(formData.nominees));
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

    fetch(`${API_URL}/v1/birth-registration`, {
      method: "POST",
      credentials: "include",
      body,
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw data;
          }
          return data;
        });
      })
      .then((data) => {
        console.log("Submission successful", data);
        toast.success("Birth registration submitted successfully!");
        setFormData(inital_data);
        setDocuments(emptyDocuments());
      })
      .catch((err) => {
        console.error("Submission failed:", err);
        toast.error(err?.detail || "Birth registration submission failed.");
      })
      .finally(() => setSubmitting(false));
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

          <Preview formData={formData} documents={documents} />
        </div>
      ) : (
        <form
          required
          className="min-h-screen bg-gray-100 p-8 flex flex-col max-w-6xl mx-auto gap-4 "
          onSubmit={handleSubmit}
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
                <h1 className="text-4xl font-bold">Birth Registration</h1>
              </div>
            </div>

            <ChildInfo
              setFormData={setFormData}
              formData={formData}
              handleChange={handleChange}
            />
            <FatherInfo
              setFormData={setFormData}
              formData={formData}
              handleChange={handleChange}
            />
            <MotherInfo
              setFormData={setFormData}
              formData={formData}
              handleChange={handleChange}
            />
            <AddressInfo
              setFormData={setFormData}
              formData={formData}
              handleChange={handleChange}
            />
            <InformantInfo
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
              onClick={() => setShowPreview(true)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-6 py-2 rounded-md cursor-pointer transition-colors"
            >
              👁️ Preview Certificate
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-300 hover:bg-slate-300 disabled:bg-blue-200 px-6 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-2"
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

export default BirthRegistration;
