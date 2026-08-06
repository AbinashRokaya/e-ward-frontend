import React, { useMemo, useState } from "react";

function MigrationAddressSelect({
  addressType,
  title,
  subtitle,
  wards = [],
  setFormData,
  formData,
}) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

  const index = formData.addresses.findIndex(
    (a) => a.address_type === addressType,
  );
  const address = formData.addresses[index];

  const [selection, setSelection] = useState({
    province: address?.province || "",
    district: address?.district || "",
    municipality: address?.municipality || "",
    ward_no: address?.ward_number || "",
  });

  const provinces = useMemo(
    () => [...new Set(wards.map((w) => w.ward_province))].sort(),
    [wards],
  );

  const districts = useMemo(() => {
    if (!selection.province) return [];
    return [
      ...new Set(
        wards
          .filter((w) => w.ward_province === selection.province)
          .map((w) => w.ward_district),
      ),
    ].sort();
  }, [wards, selection.province]);

  const municipalities = useMemo(() => {
    if (!selection.province || !selection.district) return [];
    return [
      ...new Set(
        wards
          .filter(
            (w) =>
              w.ward_province === selection.province &&
              w.ward_district === selection.district,
          )
          .map((w) => w.ward_municipality),
      ),
    ].sort();
  }, [wards, selection.province, selection.district]);

  const filteredWards = useMemo(() => {
    if (!selection.province || !selection.district || !selection.municipality)
      return [];
    return wards
      .filter(
        (w) =>
          w.ward_province === selection.province &&
          w.ward_district === selection.district &&
          w.ward_municipality === selection.municipality,
      )
      .sort((a, b) => Number(a.ward_no) - Number(b.ward_no));
  }, [wards, selection.province, selection.district, selection.municipality]);

  const updateAddress = (patch) => {
    setFormData((prev) => {
      const updated = [...prev.addresses];
      updated[index] = { ...updated[index], ...patch };
      return { ...prev, addresses: updated };
    });
  };

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    const match = wards.find((w) => w.ward_province === value);

    setSelection({
      province: value,
      district: "",
      municipality: "",
      ward_no: "",
    });
    updateAddress({
      province: value,
      district: "",
      municipality: "",
      ward_number: "",
      province_np: match?.ward_nepali_province || "",
      district_np: "",
      municipality_np: "",
      ward_name_np: "",
    });
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    const match = wards.find(
      (w) =>
        w.ward_province === selection.province && w.ward_district === value,
    );

    setSelection((prev) => ({
      ...prev,
      district: value,
      municipality: "",
      ward_no: "",
    }));
    updateAddress({
      district: value,
      municipality: "",
      ward_number: "",
      district_np: match?.ward_nepali_district || "",
      municipality_np: "",
      ward_name_np: "",
    });
  };

  const handleMunicipalityChange = (e) => {
    const value = e.target.value;
    const match = wards.find(
      (w) =>
        w.ward_province === selection.province &&
        w.ward_district === selection.district &&
        w.ward_municipality === value,
    );

    setSelection((prev) => ({ ...prev, municipality: value, ward_no: "" }));
    updateAddress({
      municipality: value,
      ward_number: "",
      municipality_np: match?.ward_nepali_municipality || "",
      ward_name_np: "",
    });
  };

  const handleWardChange = (e) => {
    const wardNo = Number(e.target.value);
    const ward = filteredWards.find((w) => Number(w.ward_no) === wardNo);
    if (!ward) return;

    setSelection((prev) => ({ ...prev, ward_no: wardNo }));
    updateAddress({
      ward_number: wardNo,
      province_np: ward.ward_nepali_province || "",
      district_np: ward.ward_nepali_district || "",
      municipality_np: ward.ward_nepali_municipality || "",
      ward_name_np: ward.ward_nepali_name || "",
    });
  };

  const handleToleChange = (e) => {
    updateAddress({ tole: e.target.value });
  };

  if (!address) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-purple-700 mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>प्रदेश (Province)</label>
          <select
            value={selection.province}
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
            value={selection.district}
            onChange={handleDistrictChange}
            disabled={!selection.province}
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
            value={selection.municipality}
            onChange={handleMunicipalityChange}
            disabled={!selection.district}
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
            value={selection.ward_no}
            onChange={handleWardChange}
            disabled={!selection.municipality}
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

      <div className="mt-4">
        <label>टोल/गाउँ (Tole/Village)</label>
        <input
          type="text"
          value={address.tole}
          onChange={handleToleChange}
          placeholder="टोल/गाउँको नाम"
          className={inputStyle}
        />
      </div>

      {/* ── Read-only Nepali equivalents — same block as birth's AddressInfo ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <label>प्रदेश (नेपाली)</label>
          <input
            type="text"
            value={address.province_np || ""}
            readOnly
            className={`${inputStyle} bg-gray-100`}
          />
        </div>

        <div>
          <label>जिल्ला (नेपाली)</label>
          <input
            type="text"
            value={address.district_np || ""}
            readOnly
            className={`${inputStyle} bg-gray-100`}
          />
        </div>

        <div>
          <label>गाउँपालिका/नगरपालिका (नेपाली)</label>
          <input
            type="text"
            value={address.municipality_np || ""}
            readOnly
            className={`${inputStyle} bg-gray-100`}
          />
        </div>

        <div>
          <label>वडाको नाम (नेपाली)</label>
          <input
            type="text"
            value={address.ward_name_np || ""}
            readOnly
            placeholder="वडा छान्दा स्वतः देखिनेछ"
            className={`${inputStyle} bg-gray-100`}
          />
        </div>
      </div>
    </div>
  );
}

export default MigrationAddressSelect;
