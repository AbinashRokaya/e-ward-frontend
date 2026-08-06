import React, { useEffect, useMemo, useState } from "react";
import API_URL from "../../api/api";

const MUNICIPALITY_TYPE_LABELS = {
  METROPOLITAN_CITY: "महानगरपालिका",
  SUB_METROPOLITAN_CITY: "उपमहानगरपालिका",
  MUNICIPALITY: "नगरपालिका",
  RURAL_MUNICIPALITY: "गाउँपालिका",
};

/**
 * Cascading province -> district -> municipality -> ward picker, reusable
 * for the death-place and informant address groups on the death form.
 */
function WardPicker({
  wards,
  prefix,
  province,
  district,
  municipality,
  wardNumber,
  onProvinceChange,
  onDistrictChange,
  onMunicipalityChange,
  onWardChange,
  inputStyle,
  colorClass,
  title,
}) {
  const provinces = useMemo(
    () => [...new Set(wards.map((w) => w.ward_province))].sort(),
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

  return (
    <div>
      <h3 className={`text-lg font-semibold ${colorClass} mb-3`}>{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>प्रदेश (Province)</label>
          <select
            value={province}
            onChange={(e) => onProvinceChange(e.target.value)}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- प्रदेश छान्नुहोस् --</option>
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
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={!province}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- जिल्ला छान्नुहोस् --</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>नगरपालिका / गाउँपालिका</label>
          <select
            value={municipality}
            onChange={(e) => onMunicipalityChange(e.target.value)}
            disabled={!district}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- नगरपालिका छान्नुहोस् --</option>
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
            onChange={(e) =>
              onWardChange(Number(e.target.value), filteredWards)
            }
            disabled={!municipality}
            required
            className={`${inputStyle} bg-white`}
          >
            <option value="">-- वडा छान्नुहोस् --</option>
            {filteredWards.map((w) => (
              <option key={w.ward_id} value={w.ward_no}>
                Ward {w.ward_no} — {w.ward_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function DeathAddressInfo({ wards = [], setFormData, formData }) {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

  const [sameAsDeceasedForDeath, setSameAsDeceasedForDeath] = useState(false);
  const [sameAsDeceasedForInformant, setSameAsDeceasedForInformant] =
    useState(false);

  // ── Deceased's permanent address — fetched read-only from the backend.
  // This is the ONLY address on this form locked to the account's own
  // ward; death place and informant address stay as free cascading
  // pickers below, since a death can happen in any ward in the country
  // and the informant can live anywhere.
  const [myAddress, setMyAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");

  const addr = formData.address;

  useEffect(() => {
    let cancelled = false;
    setAddressLoading(true);
    setAddressError("");

    fetch(`${API_URL}/v1/death-registration/my-address`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        }),
      )
      .then((data) => {
        if (cancelled) return;
        const a = data.data;
        setMyAddress(a);
        setFormData((prev) => ({
          ...prev,
          register_ward_id: a.register_ward_id,
          address: {
            ...prev.address,
            deceased_province: a.deceased_province,
            deceased_district: a.deceased_district,
            deceased_municipality: a.deceased_municipality,
            deceased_ward_number: a.deceased_ward_number,
            ward_nepali_province: a.ward_nepali_province,
            ward_nepali_district: a.ward_nepali_district,
            ward_nepali_municipality: a.ward_nepali_municipality,
            ward_nepali_name: a.ward_nepali_name,
          },
        }));
      })
      .catch((err) => {
        if (cancelled) return;
        const detail = err?.detail;
        setAddressError(
          Array.isArray(detail)
            ? detail
                .map((d) => d?.msg)
                .filter(Boolean)
                .join("; ")
            : typeof detail === "string"
              ? detail
              : "तपाईंको ठेगाना लोड गर्न सकिएन। (Could not load your address.)",
        );
      })
      .finally(() => {
        if (!cancelled) setAddressLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeceasedToleChange = (value) =>
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, deceased_tole: value },
    }));

  // ── Death place address — free picker, can be any ward in the country ──
  const handleDeathPlaceProvinceChange = (value) =>
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        death_place_province: value,
        death_place_district: "",
        death_place_municipality: "",
        death_place_ward_number: "",
      },
    }));

  const handleDeathPlaceDistrictChange = (value) =>
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        death_place_district: value,
        death_place_municipality: "",
        death_place_ward_number: "",
      },
    }));

  const handleDeathPlaceMunicipalityChange = (value) =>
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        death_place_municipality: value,
        death_place_ward_number: "",
      },
    }));

  const handleDeathPlaceWardChange = (wardNo) =>
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, death_place_ward_number: wardNo },
    }));

  const handleSameAsDeceasedForDeath = (checked) => {
    setSameAsDeceasedForDeath(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          death_place_province: prev.address.deceased_province,
          death_place_district: prev.address.deceased_district,
          death_place_municipality: prev.address.deceased_municipality,
          death_place_ward_number: prev.address.deceased_ward_number,
          death_place_tole: prev.address.deceased_tole,
        },
      }));
    }
  };

  // ── Informant's address — free picker, informant can live anywhere ──
  const handleInformantProvinceChange = (value) =>
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        informant_province: value,
        informant_district: "",
        informant_municipality: "",
        informant_ward_number: "",
      },
    }));

  const handleInformantDistrictChange = (value) =>
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        informant_district: value,
        informant_municipality: "",
        informant_ward_number: "",
      },
    }));

  const handleInformantMunicipalityChange = (value) =>
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        informant_municipality: value,
        informant_ward_number: "",
      },
    }));

  const handleInformantWardChange = (wardNo) =>
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, informant_ward_number: wardNo },
    }));

  const handleSameAsDeceasedForInformant = (checked) => {
    setSameAsDeceasedForInformant(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          informant_province: prev.address.deceased_province,
          informant_district: prev.address.deceased_district,
          informant_municipality: prev.address.deceased_municipality,
          informant_ward_number: prev.address.deceased_ward_number,
          informant_tole: prev.address.deceased_tole,
        },
      }));
    }
  };

  const handleToleChange = (fieldName, value) =>
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [fieldName]: value },
    }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 space-y-8">
      <h2 className="text-2xl font-semibold text-green-700">
        ठेगाना जानकारी (Address Information)
      </h2>

      {/* Deceased's permanent address — read-only, from account's own ward */}
      <div>
        <h3 className="text-lg font-semibold text-green-700 mb-3">
          मृतकको स्थायी ठेगाना (Deceased's Permanent Address)
        </h3>

        {addressLoading && (
          <p className="text-sm text-gray-500 mb-4">
            ठेगाना लोड हुँदैछ… (Loading address…)
          </p>
        )}

        {!addressLoading && addressError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {addressError}
          </div>
        )}

        {!addressLoading && !addressError && (
          <>
            <p className="text-xs text-gray-500 mb-4">
              यो ठेगाना तपाईंको दर्ता खातामा आधारित छ। (This address comes from
              your registered account.)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500">प्रदेश (Province)</span>
                <span className="font-medium">
                  {myAddress?.ward_nepali_province} (
                  {myAddress?.deceased_province})
                </span>
              </div>
              <div>
                <span className="block text-gray-500">जिल्ला (District)</span>
                <span className="font-medium">
                  {myAddress?.ward_nepali_district} (
                  {myAddress?.deceased_district})
                </span>
              </div>
              <div>
                <span className="block text-gray-500">
                  नगरपालिका (Municipality)
                </span>
                <span className="font-medium">
                  {myAddress?.ward_nepali_municipality} (
                  {myAddress?.deceased_municipality})
                </span>
              </div>
              <div>
                <span className="block text-gray-500">वडा नं. (Ward No.)</span>
                <span className="font-medium">
                  {myAddress?.ward_nepali_name} — Ward{" "}
                  {myAddress?.deceased_ward_number}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label>टोल / सडक (Tole / Street)</label>
              <input
                type="text"
                value={addr.deceased_tole}
                onChange={(e) => handleDeceasedToleChange(e.target.value)}
                placeholder="टोल वा सडकको नाम"
                className={inputStyle}
              />
            </div>
          </>
        )}
      </div>

      <hr />

      {/* Death place address — always a free picker, can be any ward */}
      <div>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsDeceasedForDeath}
            onChange={(e) => handleSameAsDeceasedForDeath(e.target.checked)}
          />
          मृत्यु स्थान ठेगाना मृतकको ठेगाना जस्तै हो (Same as deceased's
          address)
        </label>
        {!sameAsDeceasedForDeath && (
          <>
            <WardPicker
              wards={wards}
              prefix="death_place"
              province={addr.death_place_province}
              district={addr.death_place_district}
              municipality={addr.death_place_municipality}
              wardNumber={addr.death_place_ward_number}
              onProvinceChange={handleDeathPlaceProvinceChange}
              onDistrictChange={handleDeathPlaceDistrictChange}
              onMunicipalityChange={handleDeathPlaceMunicipalityChange}
              onWardChange={handleDeathPlaceWardChange}
              inputStyle={inputStyle}
              colorClass="text-red-700"
              title="मृत्यु स्थान ठेगाना (Place of Death Address)"
            />
            <div className="mt-4">
              <label>टोल / सडक (Tole / Street)</label>
              <input
                type="text"
                value={addr.death_place_tole}
                onChange={(e) =>
                  handleToleChange("death_place_tole", e.target.value)
                }
                required
                placeholder="टोल वा सडकको नाम"
                className={inputStyle}
              />
            </div>
          </>
        )}
      </div>

      <hr />

      {/* Informant's address — always a free picker, informant can live anywhere */}
      <div>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsDeceasedForInformant}
            onChange={(e) => handleSameAsDeceasedForInformant(e.target.checked)}
          />
          सूचना दिने व्यक्तिको ठेगाना मृतकको ठेगाना जस्तै हो (Same as deceased's
          address)
        </label>
        {!sameAsDeceasedForInformant && (
          <>
            <WardPicker
              wards={wards}
              prefix="informant"
              province={addr.informant_province}
              district={addr.informant_district}
              municipality={addr.informant_municipality}
              wardNumber={addr.informant_ward_number}
              onProvinceChange={handleInformantProvinceChange}
              onDistrictChange={handleInformantDistrictChange}
              onMunicipalityChange={handleInformantMunicipalityChange}
              onWardChange={handleInformantWardChange}
              inputStyle={inputStyle}
              colorClass="text-orange-700"
              title="सूचना दिने व्यक्तिको ठेगाना (Informant's Address) — Optional"
            />
            <div className="mt-4">
              <label>
                टोल / सडक (Tole / Street) <i>(Optional)</i>
              </label>
              <input
                type="text"
                value={addr.informant_tole}
                onChange={(e) =>
                  handleToleChange("informant_tole", e.target.value)
                }
                placeholder="टोल वा सडकको नाम"
                className={inputStyle}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DeathAddressInfo;
