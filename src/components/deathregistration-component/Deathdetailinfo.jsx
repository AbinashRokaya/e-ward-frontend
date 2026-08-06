import { toast } from "react-toastify";
import * as BS from "bikram-sambat-js";

// NOTE: enum values below are assumed to mirror enums/death_enum.py —
// double check DeathTimePeriodType / DeathPlaceType / DeathCauseType
// against the backend before shipping.
const TIME_PERIOD_OPTIONS = [
  { value: "MORNING", label: "बिहान (Morning)" },
  { value: "AFTERNOON", label: "दिउँसो (Afternoon)" },
  { value: "EVENING", label: "साँझ (Evening)" },
  { value: "NIGHT", label: "रात (Night)" },
];

const DEATH_TYPE_OPTIONS = [
  { value: "NATURAL", label: "प्राकृतिक (Natural)" },
  { value: "ACCIDENT", label: "दुर्घटना (Accident)" },
  { value: "SUICIDE", label: "आत्महत्या (Suicide)" },
  { value: "HOMICIDE", label: "हत्या (Homicide)" },
  { value: "OTHER", label: "अन्य (Other)" },
];

function DeathDetailInfo({ setFormData, formData, handleChange }) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:invalid:border-blue-500 focus:invalid:ring-blue-500";

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      death_detail: { ...prev.death_detail, [name]: value },
    }));
  };

  const handleDurationChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        death_detail: { ...prev.death_detail, [name]: "" },
      }));
      return;
    }
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    setFormData((prev) => ({
      ...prev,
      death_detail: { ...prev.death_detail, [name]: value },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-red-700 mb-6">
        मृत्यु सम्बन्धी विवरण (Death Detail)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>
            मृत्यु मिति (AD){" "}
            <span className="text-xs text-gray-500">
              (used only to compute the BS date)
            </span>
          </label>
          <input
            type="date"
            name="death_date_ad_helper"
            onChange={(e) => {
              const adDate = e.target.value;
              if (adDate === "") return;
              const date = new Date(adDate);
              const now = new Date();
              if (date > now) {
                toast.error("Death date must be in the past");
                return;
              }
              const bsDate = BS.ADToBS(adDate);
              setFormData((prev) => ({
                ...prev,
                death_detail: {
                  ...prev.death_detail,
                  death_date_bs: bsDate,
                },
              }));
            }}
            required
            className={inputStyle}
          />
        </div>
        <div>
          <label>मृत्यु मिति (BS)</label>
          <input
            type="text"
            name="death_date_bs"
            value={formData.death_detail.death_date_bs}
            readOnly
            className={`${inputStyle} bg-gray-100`}
          />
        </div>

        <div>
          <label>
            मृत्यु समय अवधि (Time Period) <i>(Optional)</i>
          </label>
          <select
            name="death_time_period"
            value={formData.death_detail.death_time_period}
            onChange={handleDetailChange}
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- छान्नुहोस् (Select) --</option>
            {TIME_PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>
            मृत्यु समय (Exact Time) <i>(Optional)</i>
          </label>
          <input
            type="time"
            name="death_time"
            value={formData.death_detail.death_time}
            onChange={handleDetailChange}
            className={inputStyle}
          />
        </div>

        <div>
          <label>मृत्यु स्थान (Place of Death)</label>
          <select
            name="death_place_type"
            value={formData.death_detail.death_place_type}
            onChange={handleDetailChange}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="HOSPITAL">अस्पताल (Hospital)</option>
            <option value="HOME">घर (Home)</option>
            <option value="OTHER">अन्य (Other)</option>
          </select>
        </div>
        {formData.death_detail.death_place_type === "OTHER" && (
          <div>
            <label>स्थान विवरण (Place Detail)</label>
            <input
              type="text"
              name="death_place_other_detail"
              value={formData.death_detail.death_place_other_detail}
              onChange={handleDetailChange}
              placeholder="स्थान खुलाउनुहोस्"
              required
              className={inputStyle}
            />
          </div>
        )}

        <div>
          <label>मृत्युको प्रकार (Type of Death)</label>
          <select
            name="death_type"
            value={formData.death_detail.death_type}
            onChange={handleDetailChange}
            required
            className={`${inputStyle} bg-white`}
          >
            {DEATH_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {formData.death_detail.death_type === "OTHER" && (
          <div>
            <label>प्रकार विवरण (Type Detail)</label>
            <input
              type="text"
              name="death_type_other_detail"
              value={formData.death_detail.death_type_other_detail}
              onChange={handleDetailChange}
              placeholder="प्रकार खुलाउनुहोस्"
              required
              className={inputStyle}
            />
          </div>
        )}
      </div>

      <div className="mt-4">
        <label>
          मृत्युको कारण (Cause of Death — as per medical opinion, if any){" "}
          <i>(Optional)</i>
        </label>
        <textarea
          name="death_cause"
          value={formData.death_detail.death_cause}
          onChange={handleDetailChange}
          rows={3}
          placeholder="मृत्युको कारण लेख्नुहोस्"
          className={inputStyle}
        />
      </div>

      <div className="mt-4">
        <label className="block mb-2">
          मृत्यु भएको ठेगानामा बसोबास गरेको अवधि (Duration of residence at place
          of death) <i>(Optional)</i>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="residence_duration_years"
            value={formData.death_detail.residence_duration_years}
            onChange={handleDurationChange}
            placeholder="वर्ष (Years)"
            className={inputStyle}
          />
          <input
            type="text"
            name="residence_duration_months"
            value={formData.death_detail.residence_duration_months}
            onChange={handleDurationChange}
            placeholder="महिना (Months)"
            className={inputStyle}
          />
          <input
            type="text"
            name="residence_duration_days"
            value={formData.death_detail.residence_duration_days}
            onChange={handleDurationChange}
            placeholder="दिन (Days)"
            className={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

export default DeathDetailInfo;
