import { toast } from "react-toastify";
import * as BS from "bikram-sambat-js";

const REASON_OPTIONS = [
  { value: "EMPLOYMENT", en: "Employment", np: "रोजगारी" },
  { value: "STUDY", en: "Study", np: "अध्ययन" },
  { value: "BUSINESS", en: "Business", np: "व्यवसाय" },
  { value: "MARRIAGE", en: "Marriage", np: "विवाह" },
  { value: "SETTLEMENT", en: "Settlement", np: "बसोबास" },
  { value: "OTHER", en: "Other", np: "अन्य" },
];

function MigrationDetailInfo({ setFormData, formData }) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  const detail = formData.migration_detail;

  const handleDateChange = (e) => {
    const adDate = e.target.value;
    const date = new Date(adDate);
    const now = new Date();

    if (date > now) {
      toast.error("Date of migration cannot be in the future");
      return;
    }

    const bsDate = BS.ADToBS(adDate);

    setFormData((prev) => ({
      ...prev,
      migration_detail: {
        ...prev.migration_detail,
        migration_date_ad: adDate,
        migration_date_bs: bsDate,
      },
    }));
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      migration_detail: {
        ...prev.migration_detail,
        migration_reason: value,
        migration_reason_other:
          value === "OTHER" ? prev.migration_detail.migration_reason_other : "",
      },
    }));
  };

  const handleOtherChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      migration_detail: {
        ...prev.migration_detail,
        migration_reason_other: e.target.value,
      },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-orange-700 mb-6">
        बसाईसराई गर्ने विवरण (Migration Details)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>बसाईसराई गर्ने मिति (AD)</label>
          <input
            type="date"
            value={detail.migration_date_ad}
            onChange={handleDateChange}
            required
            className={inputStyle}
          />
        </div>
        <div>
          <label>बसाईसराई गर्ने मिति (वि.सं.)</label>
          <input
            type="text"
            value={detail.migration_date_bs}
            readOnly
            className={inputStyle}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block mb-2">
          बसाईसराईको कारण (Reason for Migration)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {REASON_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 border border-gray-300 rounded-lg p-3 cursor-pointer"
            >
              <input
                type="radio"
                name="migration_reason"
                value={opt.value}
                checked={detail.migration_reason === opt.value}
                onChange={handleReasonChange}
                required
              />
              {opt.np} ({opt.en})
            </label>
          ))}
        </div>

        {detail.migration_reason === "OTHER" && (
          <input
            type="text"
            value={detail.migration_reason_other}
            onChange={handleOtherChange}
            placeholder="कारण खुलाउनुहोस् (Specify reason)"
            required
            className={`${inputStyle} mt-3`}
          />
        )}
      </div>
    </div>
  );
}

export default MigrationDetailInfo;
