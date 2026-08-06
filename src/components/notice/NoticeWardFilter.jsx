import React, { useMemo, useState } from "react";

const selectStyle =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white";

function NoticeWardFilter({ wards = [], onWardSelect }) {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [wardNo, setWardNo] = useState("");

  const provinces = useMemo(
    () =>
      [...new Set(wards.map((w) => w.ward_province))].filter(Boolean).sort(),
    [wards],
  );

  const districts = useMemo(() => {
    if (!province) return [];
    return [
      ...new Set(
        wards
          .filter((w) => w.ward_province === province)
          .map((w) => w.ward_district),
      ),
    ]
      .filter(Boolean)
      .sort();
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
    ]
      .filter(Boolean)
      .sort();
  }, [wards, province, district]);

  const filteredWards = useMemo(() => {
    if (!province || !district || !municipality) return [];
    return wards
      .filter(
        (w) =>
          w.ward_province?.toLowerCase() === province.toLowerCase() &&
          w.ward_district?.toLowerCase() === district.toLowerCase() &&
          w.ward_municipality?.toLowerCase() === municipality.toLowerCase(),
      )
      .sort((a, b) => Number(a.ward_no) - Number(b.ward_no));
  }, [wards, province, district, municipality]);

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    setProvince(value);
    setDistrict("");
    setMunicipality("");
    setWardNo("");
    onWardSelect?.(null);
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setDistrict(value);
    setMunicipality("");
    setWardNo("");
    onWardSelect?.(null);
  };

  const handleMunicipalityChange = (e) => {
    const value = e.target.value;
    setMunicipality(value);
    setWardNo("");
    onWardSelect?.(null);
  };

  const handleWardChange = (e) => {
    const value = e.target.value;
    setWardNo(value);
    const match = filteredWards.find((w) => String(w.ward_no) === value);
    onWardSelect?.(match ? match.ward_id : null);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
      <select
        value={province}
        onChange={handleProvinceChange}
        className={selectStyle}
      >
        <option value="">Province</option>
        {provinces.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        value={district}
        onChange={handleDistrictChange}
        disabled={!province}
        className={selectStyle}
      >
        <option value="">District</option>
        {districts.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={municipality}
        onChange={handleMunicipalityChange}
        disabled={!district}
        className={selectStyle}
      >
        <option value="">Municipality</option>
        {municipalities.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={wardNo}
        onChange={handleWardChange}
        disabled={!municipality}
        className={selectStyle}
      >
        <option value="">Ward</option>
        {filteredWards.map((w) => (
          <option key={w.ward_id} value={w.ward_no}>
            Ward {w.ward_no}
            {w.ward_name ? ` — ${w.ward_name}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export default NoticeWardFilter;
