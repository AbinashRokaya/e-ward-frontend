import { useEffect, useState } from "react";
import API_URL from "../../api/api";

const MUNICIPALITY_TYPE_LABELS = {
  METROPOLITAN_CITY: "महानगरपालिका",
  SUB_METROPOLITAN_CITY: "उपमहानगरपालिका",
  MUNICIPALITY: "नगरपालिका",
  RURAL_MUNICIPALITY: "गाउँपालिका",
};

const inputStyle =
  "w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

// ── Address — fetched directly from the backend ────────────────────────────
// Same idea as RecommendationLetter's ApplicantAddressSection: this is NOT
// a form the citizen fills in. GET /v1/birth-registration/my-address
// resolves the logged-in account's own ward server-side, and that's what
// gets shown here, read-only. There's no "different ward" case for birth
// registration (unlike RESIDENCE_PROOF on recommendation letters), so
// there's no override checkbox — the backend always re-derives the ward
// from the session on submit regardless of what this form shows.
function AddressInfo({ setFormData, formData }) {
  const [myAddress, setMyAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setAddressLoading(true);
    setAddressError("");

    fetch(`${API_URL}/v1/birth-registration/my-address`, {
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
        const addr = data.data;
        setMyAddress(addr);
        setFormData((prev) => ({
          ...prev,
          register_ward_id: addr.register_ward_id,
          address: {
            ...prev.address,
            child_province: addr.child_province,
            child_district: addr.child_district,
            child_municipality: addr.child_municipality,
            child_ward_number: addr.child_ward_number,
            ward_nepali_province: addr.ward_nepali_province,
            ward_nepali_district: addr.ward_nepali_district,
            ward_nepali_municipality: addr.ward_nepali_municipality,
            ward_nepali_name: addr.ward_nepali_name,
            ward_type: addr.ward_type,
          },
        }));
      })
      .catch((err) => {
        if (cancelled) return;
        setAddressError(
          err?.detail ||
            "तपाईंको ठेगाना लोड गर्न सकिएन। (Could not load your address.)",
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

  const handleToleChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, child_tole: value },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-green-700 mb-2">
        ठेगाना जानकारी (Address Information)
      </h2>

      {addressLoading && (
        <p className="text-sm text-gray-500 mb-4">
          तपाईंको ठेगाना लोड हुँदैछ… (Loading your address…)
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
                {myAddress?.ward_nepali_province} ({myAddress?.child_province})
              </span>
            </div>
            <div>
              <span className="block text-gray-500">जिल्ला (District)</span>
              <span className="font-medium">
                {myAddress?.ward_nepali_district} ({myAddress?.child_district})
              </span>
            </div>
            <div>
              <span className="block text-gray-500">
                नगरपालिका (Municipality)
              </span>
              <span className="font-medium">
                {myAddress?.ward_nepali_municipality} (
                {myAddress?.child_municipality})
              </span>
            </div>
            <div>
              <span className="block text-gray-500">वडा नं. (Ward No.)</span>
              <span className="font-medium">
                {myAddress?.ward_nepali_name} — Ward{" "}
                {myAddress?.child_ward_number}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">
                स्थानीय तहको प्रकार (Local Unit Type)
              </span>
              <span className="font-medium">
                {MUNICIPALITY_TYPE_LABELS[myAddress?.ward_type] || "—"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <label>टोल / सडक (Tole / Street)</label>
            <input
              type="text"
              value={formData.address.child_tole}
              onChange={handleToleChange}
              placeholder="टोल वा सडकको नाम"
              className={inputStyle}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default AddressInfo;
