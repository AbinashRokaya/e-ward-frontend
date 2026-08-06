import { useMemo } from "react";

// Nepali display labels for the ward_type enum coming back from the backend.
const MUNICIPALITY_TYPE_LABELS = {
  METROPOLITAN_CITY: "महानगरपालिका",
  SUB_METROPOLITAN_CITY: "उपमहानगरपालिका",
  MUNICIPALITY: "नगरपालिका",
  RURAL_MUNICIPALITY: "गाउँपालिका",
};

/**
 * Reusable cascading Province -> District -> Municipality -> Ward selector.
 * Used three times inside DeathAddressInfo (deceased / death place / informant),
 * mirroring the single cascade used in the birth registration AddressInfo.jsx.
 *
 * prefix        e.g. "deceased" | "death_place" | "informant"
 * fields        current values for {prefix}_province / _district / _municipality / _ward_number / _tole
 * onChange(next) receives the fully updated fields object for this block
 * isPrimary     when true, this is the block whose ward determines
 *               register_ward_id + address.ward_nepali_* (mirrors birth's single AddressInfo)
 * onPrimaryWardResolved(wardOrNull) only called when isPrimary is true
 */
function WardCascadeSelector({
  wards = [],
  prefix,
  title,
  fields,
  onChange,
  required = true,
  isPrimary = false,
  onPrimaryWardResolved,
}) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

  const province = fields[`${prefix}_province`] || "";
  const district = fields[`${prefix}_district`] || "";
  const municipality = fields[`${prefix}_municipality`] || "";
  const wardNumber = fields[`${prefix}_ward_number`] || "";
  const tole = fields[`${prefix}_tole`] || "";

  const provinces = useMemo(() => {
    return [...new Set(wards.map((w) => w.ward_province))].sort();
  }, [wards]);

  const districts = useMemo(() => {
    if (!province) return [];
    return [
      ...new Set(
        wards
          .filter((w) => w.ward_province === province)
          .map((w) => w.ward_district),
      ),
    ].sort();
  }, [wards, province]);

  const municipalities = useMemo(() => {
    if (!province || !district) return [];
    return [
      ...new Set(
        wards
          .filter(
            (w) => w.ward_province === province && w.ward_district === district,
          )
          .map((w) => w.ward_municipality),
      ),
    ].sort();
  }, [wards, province, district]);

  const filteredWards = useMemo(() => {
    if (!province || !district || !municipality) return [];
    return wards
      .filter(
        (w) =>
          w.ward_province?.toLowerCase() === province?.toLowerCase() &&
          w.ward_district?.toLowerCase() === district?.toLowerCase() &&
          w.ward_municipality?.toLowerCase() === municipality?.toLowerCase(),
      )
      .sort((a, b) => Number(a.ward_no) - Number(b.ward_no));
  }, [wards, province, district, municipality]);

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    onChange({
      [`${prefix}_province`]: value,
      [`${prefix}_district`]: "",
      [`${prefix}_municipality`]: "",
      [`${prefix}_ward_number`]: "",
    });
    if (isPrimary) onPrimaryWardResolved?.(null);
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    onChange({
      [`${prefix}_district`]: value,
      [`${prefix}_municipality`]: "",
      [`${prefix}_ward_number`]: "",
    });
    if (isPrimary) onPrimaryWardResolved?.(null);
  };

  const handleMunicipalityChange = (e) => {
    const value = e.target.value;
    onChange({
      [`${prefix}_municipality`]: value,
      [`${prefix}_ward_number`]: "",
    });
    if (isPrimary) onPrimaryWardResolved?.(null);
  };

  const handleWardChange = (e) => {
    const wardNo = Number(e.target.value);
    const ward = filteredWards.find((w) => Number(w.ward_no) === wardNo);
    if (!ward) return;

    onChange({
      [`${prefix}_ward_number`]: wardNo,
    });

    if (isPrimary) onPrimaryWardResolved?.(ward);
  };

  const handleToleChange = (e) => {
    onChange({ [`${prefix}_tole`]: e.target.value });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-700 mb-4">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>प्रदेश (Province)</label>
          <select
            value={province}
            onChange={handleProvinceChange}
            required={required}
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- प्रदेश छान्नुहोस् (Select Province) --</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>जिल्ला (District)</label>
          <select
            value={district}
            onChange={handleDistrictChange}
            disabled={!province}
            required={required}
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- जिल्ला छान्नुहोस् (Select District) --</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>नगरपालिका / गाउँपालिका (Municipality)</label>
          <select
            value={municipality}
            onChange={handleMunicipalityChange}
            disabled={!district}
            required={required}
            className={`${inputStyle} bg-white`}
          >
            <option value="">
              -- नगरपालिका छान्नुहोस् (Select Municipality) --
            </option>
            {municipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>वडा नं. (Ward No.)</label>
          <select
            value={wardNumber}
            onChange={handleWardChange}
            disabled={!municipality}
            required={required}
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- वडा छान्नुहोस् (Select Ward) --</option>
            {filteredWards.map((w) => (
              <option key={w.ward_id} value={w.ward_no}>
                Ward {w.ward_no} — {w.ward_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label>टोल / सडक (Tole / Street)</label>
        <input
          type="text"
          value={tole}
          onChange={handleToleChange}
          required={required}
          placeholder="टोल वा सडकको नाम (Enter Tole or Street Name)"
          className={inputStyle}
        />
      </div>

      {isPrimary && (
        <p className="mt-3 text-xs text-gray-500">
          यो ठेगानाले दर्ता हुने वडा कार्यालय निर्धारण गर्दछ। (This address
          determines the registering ward office.)
        </p>
      )}
    </div>
  );
}

export { MUNICIPALITY_TYPE_LABELS };
export default WardCascadeSelector;
