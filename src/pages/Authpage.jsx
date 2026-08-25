import { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api/api";
import { LoginContext } from "../components/context/LoginContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import govImage from "../assets/gov.jpg";

const tokens = {
  page: "min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans py-10 relative",
  card: "bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden w-full max-w-2xl",
  input:
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-blue-900 focus:ring-1 focus:ring-blue-900 disabled:bg-slate-100 disabled:cursor-not-allowed",
  select:
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed",
  label: "block text-xs font-semibold text-slate-700 mb-1",
  buttonPrimary:
    "w-full bg-blue-900 hover:bg-blue-950 disabled:bg-blue-300 text-white text-sm font-medium py-2.5 rounded-md transition-colors cursor-pointer shadow-sm mt-2",
  bannerSuccess:
    "bg-green-50 text-green-800 border border-green-200 p-3 rounded-md text-xs mb-4",
  bannerError:
    "bg-red-50 text-red-700 border border-red-200 p-3 rounded-md text-xs mb-4",
  sectionHeading:
    "text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 mt-4",
};

// Backend validates user_provience against exactly this list — keep in sync
// with provience_list in schema/user_schema.py.
const PROVINCES_FIXED = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

// Role -> destination after login. Keep in sync with the route list in
// main.jsx (admin / citizen / wardchairperson / wardsecretary / validation).
const ROLE_ROUTES = {
  superadmin: "/admin",
  citizen: "/citizen",
  wardchairperson: "/wardchairperson",
  wardsecretary: "/wardsecretary",
  datavalidationofficer: "/validation",
};

export default function AuthPage({ setRole: propSetRole, setisLogin: propSetIsLogin }) {
  const navigate = useNavigate();
  const loginContext = useContext(LoginContext) || {};
  const { login: authContextLogin } = useAuth() || {};
  const { language, setLanguage } = useLanguage();

  const isNepali = language === "ne";

  // One sign-in form for everyone. There used to be Citizen / Ward Official
  // tabs here, but both posted to the same /v1/users/login endpoint with the
  // same fields — the tab only changed the button label. The backend returns
  // user_role and ROLE_ROUTES sends each person to the right dashboard, so
  // asking people to self-select a portal was busywork they could get wrong.
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // ---- Login fields ----
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ---- Registration fields (match UserRegisterationRequest exactly) ----
  const [userName, setUserName] = useState("");
  const [userNepaliName, setUserNepaliName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userCitizenshipNumber, setUserCitizenshipNumber] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [wardNumber, setWardNumber] = useState("");

  const [wards, setWards] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch ward list once, only when registration mode is active.
  useEffect(() => {
    if (!isRegisterMode) return;
    const fetchWards = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/admin/ward`);
        const data = await res.json();
        setWards(data?.data?.ward_list ?? data?.data ?? []);
      } catch (err) {
        console.error("Failed to load wards", err);
      }
    };
    fetchWards();
  }, [isRegisterMode]);

  // Address cascade — district/municipality options depend on province/district
  // chosen so far, cross-checked against the real ward list.
  const districts = useMemo(() => {
    if (!province) return [];
    return [
      ...new Set(
        wards.filter((w) => w.ward_province === province).map((w) => w.ward_district),
      ),
    ].sort();
  }, [wards, province]);

  const municipalities = useMemo(() => {
    if (!province || !district) return [];
    return [
      ...new Set(
        wards
          .filter((w) => w.ward_province === province && w.ward_district === district)
          .map((w) => w.ward_municipality),
      ),
    ].sort();
  }, [wards, province, district]);

  const filteredWards = useMemo(() => {
    if (!province || !district || !municipality) return [];
    return wards
      .filter(
        (w) =>
          w.ward_province === province &&
          w.ward_district === district &&
          w.ward_municipality === municipality,
      )
      .sort((a, b) => Number(a.ward_no) - Number(b.ward_no));
  }, [wards, province, district, municipality]);

  const handleProvinceChange = (e) => {
    setProvince(e.target.value);
    setDistrict("");
    setMunicipality("");
    setWardNumber("");
  };
  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setMunicipality("");
    setWardNumber("");
  };
  const handleMunicipalityChange = (e) => {
    setMunicipality(e.target.value);
    setWardNumber("");
  };

  const updateAuthState = (userData, token) => {
    const role = userData.user_role || userData.role || "citizen";

    // Only store the token if the backend actually returned one — the real
    // credential is the httpOnly access_token cookie, so this may be absent.
    if (token) localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", role);

    if (loginContext.setisLogin) loginContext.setisLogin(true);
    if (loginContext.setRole) loginContext.setRole(role);
    if (propSetIsLogin) propSetIsLogin(true);
    if (propSetRole) propSetRole(role);
    if (authContextLogin) authContextLogin(userData, token);

    return role;
  };

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setBanner(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/v1/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_phone_number: loginPhone,
          password: loginPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setBanner({
          type: "error",
          message:
            data?.detail ||
            (isNepali
              ? "लगइन असफल भयो। फोन नम्बर वा पासवर्ड जाँच गर्नुहोस्।"
              : "Login failed. Check your phone number and password."),
        });
        return;
      }

      const userDetails = data?.data?.user_details;

      // Only user_details is required. This previously also demanded
      // access_token in the response body and failed the login without it —
      // but the backend sets that as an httpOnly cookie, so a perfectly
      // valid login could be rejected with "Unexpected response from server".
      if (!userDetails) {
        setBanner({
          type: "error",
          message: isNepali
            ? "सर्भरबाट अपेक्षित डाटा प्राप्त भएन।"
            : "Unexpected response from server.",
        });
        return;
      }

      const role = updateAuthState(userDetails, data?.data?.access_token);
      // Fallback is "/" — there is no "/home" route in main.jsx.
      navigate(ROLE_ROUTES[role] || "/");
    } catch (err) {
      console.error("Login request failed:", err);
      setBanner({
        type: "error",
        message: isNepali
          ? "सर्भरसँग जडान गर्न सकिएन। पछि पुनः प्रयास गर्नुहोस्।"
          : "Could not reach the server. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setBanner(null);

    if (password !== confirmPassword) {
      setBanner({
        type: "error",
        message: isNepali
          ? "पासवर्डहरू मिलेनन्। कृपया पुनः जाँच गर्नुहोस्।"
          : "Passwords do not match. Please verify.",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_name: userName,
        user_nepali_name: userNepaliName,
        user_phone_number: userPhone,
        user_citizenship_number: userCitizenshipNumber,
        user_email: userEmail,
        user_provience: province,
        user_district: district,
        user_municipality: municipality,
        user_ward_number: wardNumber ? Number(wardNumber) : undefined,
        password,
      };

      const res = await fetch(`${API_URL}/v1/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setBanner({
          type: "error",
          message:
            data?.detail ||
            (isNepali
              ? "दर्ता असफल भयो। कृपया सबै विवरण जाँच गर्नुहोस्।"
              : "Registration failed. Please check all fields."),
        });
        return;
      }

      setBanner({
        type: "success",
        message: isNepali
          ? "दर्ता सफल भयो! तपाईंको खाता वडा कार्यालयको स्वीकृतिको पर्खाइमा छ।"
          : "Registration successful! Your account is awaiting ward-office approval.",
      });
      setIsRegisterMode(false);
    } catch (err) {
      console.error("Register request failed:", err);
      setBanner({
        type: "error",
        message: isNepali
          ? "सर्भरसँग जडान गर्न सकिएन। पछि पुनः प्रयास गर्नुहोस्।"
          : "Could not reach the server. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={tokens.page}>
      {/* Translation Toggle Bar */}
      <div className="absolute top-4 right-6 flex items-center gap-1 bg-slate-200/80 border border-slate-300 rounded-full p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setLanguage("ne")}
          className={`cursor-pointer px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isNepali
              ? "bg-blue-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          नेपाली
        </button>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`cursor-pointer px-3 py-1 rounded-full text-xs font-bold transition-all ${
            !isNepali
              ? "bg-blue-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          English
        </button>
      </div>

      <div className={tokens.card}>
        <div className="p-6">
          <div className="flex justify-center mb-3">
            <img
              src={govImage}
              alt="Government Logo"
              className="w-14 h-14 object-contain rounded-full shadow-xs border border-slate-100"
            />
          </div>

          <h2 className="text-xl font-bold text-center text-slate-800 mb-1">
            {isRegisterMode
              ? isNepali
                ? "नयाँ नागरिक दर्ता"
                : "Register Citizen Account"
              : isNepali
                ? "लगइन गर्नुहोस्"
                : "Sign In"}
          </h2>
          <p className="text-xs text-center text-slate-500 mb-5">
            {isRegisterMode
              ? isNepali
                ? "वडा सेवा प्राप्त गर्न विवरण भर्नुहोस्"
                : "Fill details to receive ward services"
              : isNepali
                ? "नागरिक तथा वडा कर्मचारी दुवैका लागि"
                : "For citizens and ward officials alike"}
          </p>

          {banner && (
            <div
              className={
                banner.type === "success" ? tokens.bannerSuccess : tokens.bannerError
              }
            >
              {banner.message}
            </div>
          )}

          {!isRegisterMode ? (
            // ---------------------------------------------------------------
            // LOGIN FORM — one form for every role
            // ---------------------------------------------------------------
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className={tokens.label}>
                  {isNepali ? "मोबाइल नम्बर (Mobile Number)" : "Mobile Number"}
                </label>
                <input
                  type="tel"
                  required
                  pattern="(98|97)[0-9]{8}"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className={tokens.input}
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div>
                <label className={tokens.label}>
                  {isNepali ? "पासवर्ड (Password)" : "Password"}
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={tokens.input}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={loading} className={tokens.buttonPrimary}>
                {loading
                  ? isNepali
                    ? "कृपया पर्खनुहोस्..."
                    : "Please wait..."
                  : isNepali
                    ? "लगइन गर्नुहोस्"
                    : "Sign In"}
              </button>
            </form>
          ) : (
            // ---------------------------------------------------------------
            // REGISTER FORM — citizens only. Staff accounts are created by an
            // admin via /v1/admin/user/, not through self-registration.
            // ---------------------------------------------------------------
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <h3 className={tokens.sectionHeading}>
                {isNepali ? "व्यक्तिगत विवरण" : "Personal Details"}
              </h3>

              <div>
                <label className={tokens.label}>
                  {isNepali ? "पूरा नाम (Full Name)" : "Full Name"}
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={tokens.input}
                  placeholder="e.g. Ram Bahadur Thapa"
                />
              </div>

              <div>
                <label className={tokens.label}>
                  {isNepali ? "नाम (नेपालीमा)" : "Name (in Nepali)"}
                </label>
                <input
                  type="text"
                  required
                  value={userNepaliName}
                  onChange={(e) => setUserNepaliName(e.target.value)}
                  className={tokens.input}
                  placeholder="राम बहादुर थापा"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={tokens.label}>
                    {isNepali ? "मोबाइल नम्बर (Mobile Number)" : "Mobile Number"}
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="(98|97)[0-9]{8}"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className={tokens.input}
                    placeholder="98XXXXXXXX"
                  />
                </div>
                <div>
                  <label className={tokens.label}>
                    {isNepali
                      ? "नागरिकता नम्बर (Citizenship No.)"
                      : "Citizenship Number"}
                  </label>
                  <input
                    type="text"
                    required
                    value={userCitizenshipNumber}
                    onChange={(e) => setUserCitizenshipNumber(e.target.value)}
                    className={tokens.input}
                    placeholder="12-34-56789"
                  />
                </div>
              </div>

              <div>
                <label className={tokens.label}>
                  {isNepali ? "इमेल ठेगाना (Email Address)" : "Email Address"}
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className={tokens.input}
                  placeholder="ram@example.com"
                />
              </div>

              <h3 className={tokens.sectionHeading}>
                {isNepali ? "ठेगाना विवरण" : "Address Details"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={tokens.label}>
                    {isNepali ? "प्रदेश (Province)" : "Province"}
                  </label>
                  <select
                    required
                    value={province}
                    onChange={handleProvinceChange}
                    className={tokens.select}
                  >
                    <option value="">
                      {isNepali ? "-- प्रदेश छान्नुहोस् --" : "-- Select Province --"}
                    </option>
                    {PROVINCES_FIXED.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={tokens.label}>
                    {isNepali ? "जिल्ला (District)" : "District"}
                  </label>
                  <select
                    required
                    value={district}
                    onChange={handleDistrictChange}
                    disabled={!province}
                    className={tokens.select}
                  >
                    <option value="">
                      {isNepali ? "-- जिल्ला छान्नुहोस् --" : "-- Select District --"}
                    </option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={tokens.label}>
                    {isNepali ? "नगरपालिका (Municipality)" : "Municipality"}
                  </label>
                  <select
                    required
                    value={municipality}
                    onChange={handleMunicipalityChange}
                    disabled={!district}
                    className={tokens.select}
                  >
                    <option value="">
                      {isNepali
                        ? "-- नगरपालिका छान्नुहोस् --"
                        : "-- Select Municipality --"}
                    </option>
                    {municipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={tokens.label}>
                    {isNepali ? "वडा नं. (Ward No.)" : "Ward No."}
                  </label>
                  <select
                    required
                    value={wardNumber}
                    onChange={(e) => setWardNumber(e.target.value)}
                    disabled={!municipality}
                    className={tokens.select}
                  >
                    <option value="">
                      {isNepali ? "-- वडा छान्नुहोस् --" : "-- Select Ward --"}
                    </option>
                    {filteredWards.map((w) => (
                      <option key={w.ward_id} value={w.ward_no}>
                        {isNepali ? `वडा नं. ${w.ward_no}` : `Ward No. ${w.ward_no}`}
                        {w.ward_name ? ` — ${w.ward_name}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 className={tokens.sectionHeading}>
                {isNepali ? "खाता सुरक्षा" : "Account Security"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={tokens.label}>
                    {isNepali ? "पासवर्ड (Password)" : "Password"}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={tokens.input}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className={tokens.label}>
                    {isNepali
                      ? "पुनः पासवर्ड (Confirm Password)"
                      : "Confirm Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={tokens.input}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className={tokens.buttonPrimary}>
                {loading
                  ? isNepali
                    ? "पेश गर्दै..."
                    : "Submitting..."
                  : isNepali
                    ? "खाता सिर्जना गर्नुहोस्"
                    : "Register Account"}
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              {isRegisterMode
                ? isNepali
                  ? "अघि नै खाता छ?"
                  : "Already have an account?"
                : isNepali
                  ? "नागरिक खाता छैन?"
                  : "No citizen account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setBanner(null);
                }}
                className="text-blue-900 font-bold hover:underline cursor-pointer ml-1"
              >
                {isRegisterMode
                  ? isNepali
                    ? "लगइन गर्नुहोस्"
                    : "Sign In Here"
                  : isNepali
                    ? "यहाँ दर्ता गर्नुहोस्"
                    : "Register Here"}
              </button>
            </p>
            {!isRegisterMode && (
              <p className="text-[11px] text-slate-400 mt-2">
                {isNepali
                  ? "वडा कर्मचारी खाता वडा कार्यालयबाट प्रदान गरिन्छ।"
                  : "Ward staff accounts are issued by the ward office."}
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        © {new Date().getFullYear()} वडा कार्यालय — Ward Office.{" "}
        {isNepali ? "सबै अधिकार सुरक्षित।" : "All rights reserved."}
      </p>
    </div>
  );
}