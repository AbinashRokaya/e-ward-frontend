import React, { useMemo, useState } from "react";

// Nepali display labels for the ward_type enum coming back from the backend.
const MUNICIPALITY_TYPE_LABELS = {
  METROPOLITAN_CITY: "महानगरपालिका",
  SUB_METROPOLITAN_CITY: "उपमहानगरपालिका",
  MUNICIPALITY: "नगरपालिका",
  RURAL_MUNICIPALITY: "गाउँपालिका",
};

// This block only decides WHICH ward office the application is being filed
// at (register_ward_id) — it mirrors AddressInfo's cascading selects, but
// the Nepali display fields it resolves are for on-screen confirmation only
// and are kept in local state, since the migration schema doesn't store a
// ward_nepali_* mirror on the registration itself (unlike birth registration).
function WardOfficeInfo({ wards = [], setFormData, formData }) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

  const [office, setOffice] = useState({
    province: "",
    district: "",
    municipality: "",
    ward_no: "",
    ward_nepali_province: "",
    ward_nepali_district: "",
    ward_nepali_municipality: "",
    ward_nepali_name: "",
    ward_type: "",
  });

  const provinces = useMemo(
    () => [...new Set(wards.map((w) => w.ward_province))].sort(),
    [wards],
  );

  const districts = useMemo(() => {
    if (!office.province) return [];
    return [
      ...new Set(
        wards
          .filter((w) => w.ward_province === office.province)
          .map((w) => w.ward_district),
      ),
    ].sort();
  }, [wards, office.province]);

  const municipalities = useMemo(() => {
    if (!office.province || !office.district) return [];
    return [
      ...new Set(
        wards
          .filter(
            (w) =>
              w.ward_province === office.province &&
              w.ward_district === office.district,
          )
          .map((w) => w.ward_municipality),
      ),
    ].sort();
  }, [wards, office.province, office.district]);

  const filteredWards = useMemo(() => {
    if (!office.province || !office.district || !office.municipality) return [];
    return wards
      .filter(
        (w) =>
          w.ward_province === office.province &&
          w.ward_district === office.district &&
          w.ward_municipality === office.municipality,
      )
      .sort((a, b) => Number(a.ward_no) - Number(b.ward_no));
  }, [wards, office.province, office.district, office.municipality]);

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    const province = wards.find((w) => w.ward_province === value);

    setOffice({
      province: value,
      district: "",
      municipality: "",
      ward_no: "",
      ward_nepali_province: province?.ward_nepali_province || "",
      ward_nepali_district: "",
      ward_nepali_municipality: "",
      ward_nepali_name: "",
      ward_type: "",
    });
    setFormData((prev) => ({ ...prev, register_ward_id: "" }));
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    const district = wards.find(
      (w) => w.ward_province === office.province && w.ward_district === value,
    );

    setOffice((prev) => ({
      ...prev,
      district: value,
      municipality: "",
      ward_no: "",
      ward_nepali_district: district?.ward_nepali_district || "",
      ward_nepali_municipality: "",
      ward_nepali_name: "",
      ward_type: "",
    }));
    setFormData((prev) => ({ ...prev, register_ward_id: "" }));
  };

  const handleMunicipalityChange = (e) => {
    const value = e.target.value;
    const municipality = wards.find(
      (w) =>
        w.ward_province === office.province &&
        w.ward_district === office.district &&
        w.ward_municipality === value,
    );

    setOffice((prev) => ({
      ...prev,
      municipality: value,
      ward_no: "",
      ward_nepali_municipality: municipality?.ward_nepali_municipality || "",
      ward_nepali_name: "",
      ward_type: municipality?.ward_type || "",
    }));
    setFormData((prev) => ({ ...prev, register_ward_id: "" }));
  };

  const handleWardChange = (e) => {
    const wardNo = Number(e.target.value);
    const ward = filteredWards.find((w) => Number(w.ward_no) === wardNo);
    if (!ward) return;

    setOffice((prev) => ({
      ...prev,
      ward_no: wardNo,
      ward_nepali_name: ward.ward_nepali_name,
      ward_nepali_province: ward.ward_nepali_province,
      ward_nepali_district: ward.ward_nepali_district,
      ward_nepali_municipality: ward.ward_nepali_municipality,
      ward_type: ward.ward_type,
    }));
    setFormData((prev) => ({ ...prev, register_ward_id: ward.ward_id }));
  };

  const wardTypeLabel = MUNICIPALITY_TYPE_LABELS[office.ward_type] || "";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-green-700 mb-6">
        वडा कार्यालय (Ward Office — where this application is filed)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>प्रदेश (Province)</label>
          <select
            value={office.province}
            onChange={handleProvinceChange}
            required
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
            value={office.district}
            onChange={handleDistrictChange}
            disabled={!office.province}
            required
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
          <label>गाउँपालिका/नगरपालिका (Local Level)</label>
          <select
            value={office.municipality}
            onChange={handleMunicipalityChange}
            disabled={!office.district}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">
              -- स्थानीय तह छान्नुहोस् (Select Local Level) --
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
            value={office.ward_no}
            onChange={handleWardChange}
            disabled={!office.municipality}
            required
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

      {office.ward_no !== "" && (
        <p className="text-sm text-gray-500 mt-3">
          {office.ward_nepali_province}, {office.ward_nepali_district},{" "}
          {office.ward_nepali_municipality} ({wardTypeLabel}),{" "}
          {office.ward_nepali_name}
        </p>
      )}
    </div>
  );
}

export default WardOfficeInfo;
