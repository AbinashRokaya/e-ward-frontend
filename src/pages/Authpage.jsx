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

// Backend validates user_provience against exactly this list.
const PROVINCES_FIXED = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

// -------------------------------------------------------------
// ROLE -> DESTINATION AFTER LOGIN
//
// IMPORTANT:
// citizen is now "/" so citizens are sent to the HOME PAGE.
//
// Staff/admin roles continue going to their respective dashboards.
// -------------------------------------------------------------
const ROLE_ROUTES = {
  superadmin: "/admin",

  // CHANGED FROM "/citizen" TO "/"
  citizen: "/",

  wardchairperson: "/wardchairperson",
  wardsecretary: "/wardsecretary",
  datavalidationofficer: "/validation",
};

export default function AuthPage({
  setRole: propSetRole,
  setisLogin: propSetIsLogin,
}) {
  const navigate = useNavigate();

  const loginContext = useContext(LoginContext) || {};

  const { login: authContextLogin } = useAuth() || {};

  const { language, setLanguage } = useLanguage();

  const isNepali = language === "ne";

  // -------------------------------------------------------------
  // LOGIN / REGISTER MODE
  // -------------------------------------------------------------
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // -------------------------------------------------------------
  // LOGIN FIELDS
  // -------------------------------------------------------------
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // -------------------------------------------------------------
  // REGISTRATION FIELDS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // FETCH WARDS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isRegisterMode) return;

    const fetchWards = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/admin/ward`);

        const data = await res.json();

        setWards(data?.data?.ward_list ?? data?.data ?? []);
      } catch (err) {
        console.error("Failed to load wards:", err);
      }
    };

    fetchWards();
  }, [isRegisterMode]);

  // -------------------------------------------------------------
  // DISTRICTS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // MUNICIPALITIES
  // -------------------------------------------------------------
  const municipalities = useMemo(() => {
    if (!province || !district) return [];

    return [
      ...new Set(
        wards
          .filter(
            (w) =>
              w.ward_province === province &&
              w.ward_district === district,
          )
          .map((w) => w.ward_municipality),
      ),
    ].sort();
  }, [wards, province, district]);

  // -------------------------------------------------------------
  // WARDS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // ADDRESS CHANGE HANDLERS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // UPDATE AUTH STATE
  // -------------------------------------------------------------
  const updateAuthState = (userData, token) => {
    const role =
      userData?.user_role ||
      userData?.role ||
      "citizen";

    // Store token only if backend sends one.
    if (token) {
      localStorage.setItem("token", token);
    }

    // Store user information.
    localStorage.setItem(
      "user",
      JSON.stringify(userData),
    );

    // Store role.
    localStorage.setItem("userRole", role);

    // Old LoginContext
    if (loginContext.setisLogin) {
      loginContext.setisLogin(true);
    }

    if (loginContext.setRole) {
      loginContext.setRole(role);
    }

    // Parent component state if provided.
    if (propSetIsLogin) {
      propSetIsLogin(true);
    }

    if (propSetRole) {
      propSetRole(role);
    }

    // New AuthContext
    if (authContextLogin) {
      authContextLogin(userData, token);
    }

    return role;
  };

  // -------------------------------------------------------------
  // LOGIN
  // -------------------------------------------------------------
  async function handleLoginSubmit(e) {
    e.preventDefault();

    setBanner(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/v1/users/login`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_phone_number: loginPhone,
            password: loginPassword,
          }),
        },
      );

      const data = await res.json().catch(() => null);

      // ---------------------------------------------------------
      // LOGIN FAILED
      // ---------------------------------------------------------
      if (!res.ok) {
        setBanner({
          type: "error",

          message:
            typeof data?.detail === "string"
              ? data.detail
              : isNepali
                ? "लगइन असफल भयो। फोन नम्बर वा पासवर्ड जाँच गर्नुहोस्।"
                : "Login failed. Check your phone number and password.",
        });

        return;
      }

      // ---------------------------------------------------------
      // GET USER DETAILS
      // ---------------------------------------------------------
      const userDetails =
        data?.data?.user_details;

      if (!userDetails) {
        setBanner({
          type: "error",

          message: isNepali
            ? "सर्भरबाट अपेक्षित डाटा प्राप्त भएन।"
            : "Unexpected response from server.",
        });

        return;
      }

      // ---------------------------------------------------------
      // SAVE LOGIN STATE
      // ---------------------------------------------------------
      const role = updateAuthState(
        userDetails,
        data?.data?.access_token,
      );

      // ---------------------------------------------------------
      // REDIRECT AFTER LOGIN
      //
      // CITIZEN:
      //       /
      //
      // ADMIN:
      //       /admin
      //
      // WARD CHAIRPERSON:
      //       /wardchairperson
      //
      // WARD SECRETARY:
      //       /wardsecretary
      //
      // DATA VALIDATION:
      //       /validation
      // ---------------------------------------------------------
      const destination =
        ROLE_ROUTES[role] || "/";

      console.log(
        "Logged in role:",
        role,
      );

      console.log(
        "Redirecting to:",
        destination,
      );

      navigate(destination, {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Login request failed:",
        err,
      );

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

  // -------------------------------------------------------------
  // REGISTER
  // -------------------------------------------------------------
  async function handleRegisterSubmit(e) {
    e.preventDefault();

    setBanner(null);

    // Password check
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

        user_citizenship_number:
          userCitizenshipNumber,

        user_email: userEmail,

        user_provience: province,

        user_district: district,

        user_municipality: municipality,

        user_ward_number: wardNumber
          ? Number(wardNumber)
          : undefined,

        password,
      };

      const res = await fetch(
        `${API_URL}/v1/users/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await res
        .json()
        .catch(() => null);

      // ---------------------------------------------------------
      // REGISTRATION FAILED
      // ---------------------------------------------------------
      if (!res.ok) {
        let errorMessage =
          isNepali
            ? "दर्ता असफल भयो। कृपया सबै विवरण जाँच गर्नुहोस्।"
            : "Registration failed. Please check all fields.";

        if (
          typeof data?.detail === "string"
        ) {
          errorMessage = data.detail;
        } else if (
          Array.isArray(data?.detail)
        ) {
          errorMessage = data.detail
            .map((item) => item?.msg)
            .filter(Boolean)
            .join("; ");
        }

        setBanner({
          type: "error",
          message: errorMessage,
        });

        return;
      }

      // ---------------------------------------------------------
      // REGISTRATION SUCCESS
      // ---------------------------------------------------------
      setBanner({
        type: "success",

        message: isNepali
          ? "दर्ता सफल भयो! तपाईंको खाता वडा कार्यालयको स्वीकृतिको पर्खाइमा छ।"
          : "Registration successful! Your account is awaiting ward-office approval.",
      });

      // Switch back to login.
      setIsRegisterMode(false);

      // Clear registration fields.
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(
        "Register request failed:",
        err,
      );

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

  // -------------------------------------------------------------
  // UI
  // -------------------------------------------------------------
  return (
    <div className={tokens.page}>

      {/* Language Toggle */}
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

      {/* Card */}
      <div className={tokens.card}>

        <div className="p-6">

          {/* Logo */}
          <div className="flex justify-center mb-3">
            <img
              src={govImage}
              alt="Government Logo"
              className="w-14 h-14 object-contain rounded-full shadow-xs border border-slate-100"
            />
          </div>

          {/* Heading */}
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

          {/* Banner */}
          {banner && (
            <div
              className={
                banner.type === "success"
                  ? tokens.bannerSuccess
                  : tokens.bannerError
              }
            >
              {banner.message}
            </div>
          )}

          {/* =====================================================
              LOGIN FORM
          ===================================================== */}
          {!isRegisterMode ? (
            <form
              onSubmit={handleLoginSubmit}
              className="space-y-3"
            >

              {/* Mobile */}
              <div>
                <label className={tokens.label}>
                  {isNepali
                    ? "मोबाइल नम्बर (Mobile Number)"
                    : "Mobile Number"}
                </label>

                <input
                  type="tel"
                  required
                  pattern="(98|97)[0-9]{8}"
                  value={loginPhone}
                  onChange={(e) =>
                    setLoginPhone(e.target.value)
                  }
                  className={tokens.input}
                  placeholder="98XXXXXXXX"
                />
              </div>

              {/* Password */}
              <div>
                <label className={tokens.label}>
                  {isNepali
                    ? "पासवर्ड (Password)"
                    : "Password"}
                </label>

                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(
                      e.target.value,
                    )
                  }
                  className={tokens.input}
                  placeholder="••••••••"
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={tokens.buttonPrimary}
              >
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

            /* ===================================================
               REGISTER FORM
            =================================================== */

            <form
              onSubmit={handleRegisterSubmit}
              className="space-y-3"
            >

              {/* Personal Details */}
              <h3 className={tokens.sectionHeading}>
                {isNepali
                  ? "व्यक्तिगत विवरण"
                  : "Personal Details"}
              </h3>

              {/* Full Name */}
              <div>
                <label className={tokens.label}>
                  {isNepali
                    ? "पूरा नाम (Full Name)"
                    : "Full Name"}
                </label>

                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) =>
                    setUserName(e.target.value)
                  }
                  className={tokens.input}
                  placeholder="e.g. Ram Bahadur Thapa"
                />
              </div>

              {/* Nepali Name */}
              <div>
                <label className={tokens.label}>
                  {isNepali
                    ? "नाम (नेपालीमा)"
                    : "Name (in Nepali)"}
                </label>

                <input
                  type="text"
                  required
                  value={userNepaliName}
                  onChange={(e) =>
                    setUserNepaliName(
                      e.target.value,
                    )
                  }
                  className={tokens.input}
                  placeholder="राम बहादुर थापा"
                />
              </div>

              {/* Phone + Citizenship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>
                  <label className={tokens.label}>
                    {isNepali
                      ? "मोबाइल नम्बर (Mobile Number)"
                      : "Mobile Number"}
                  </label>

                  <input
                    type="tel"
                    required
                    pattern="(98|97)[0-9]{8}"
                    value={userPhone}
                    onChange={(e) =>
                      setUserPhone(e.target.value)
                    }
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
                    onChange={(e) =>
                      setUserCitizenshipNumber(
                        e.target.value,
                      )
                    }
                    className={tokens.input}
                    placeholder="12-34-56789"
                  />
                </div>

              </div>

              {/* Email */}
              <div>
                <label className={tokens.label}>
                  {isNepali
                    ? "इमेल ठेगाना (Email Address)"
                    : "Email Address"}
                </label>

                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }
                  className={tokens.input}
                  placeholder="ram@example.com"
                />
              </div>

              {/* Address */}
              <h3 className={tokens.sectionHeading}>
                {isNepali
                  ? "ठेगाना विवरण"
                  : "Address Details"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Province */}
                <div>
                  <label className={tokens.label}>
                    {isNepali
                      ? "प्रदेश (Province)"
                      : "Province"}
                  </label>

                  <select
                    required
                    value={province}
                    onChange={handleProvinceChange}
                    className={tokens.select}
                  >
                    <option value="">
                      {isNepali
                        ? "-- प्रदेश छान्नुहोस् --"
                        : "-- Select Province --"}
                    </option>

                    {PROVINCES_FIXED.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className={tokens.label}>
                    {isNepali
                      ? "जिल्ला (District)"
                      : "District"}
                  </label>

                  <select
                    required
                    value={district}
                    onChange={handleDistrictChange}
                    disabled={!province}
                    className={tokens.select}
                  >
                    <option value="">
                      {isNepali
                        ? "-- जिल्ला छान्नुहोस् --"
                        : "-- Select District --"}
                    </option>

                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Municipality */}
                <div>
                  <label className={tokens.label}>
                    {isNepali
                      ? "नगरपालिका (Municipality)"
                      : "Municipality"}
                  </label>

                  <select
                    required
                    value={municipality}
                    onChange={
                      handleMunicipalityChange
                    }
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

                {/* Ward */}
                <div>
                  <label className={tokens.label}>
                    {isNepali
                      ? "वडा नं. (Ward No.)"
                      : "Ward No."}
                  </label>

                  <select
                    required
                    value={wardNumber}
                    onChange={(e) =>
                      setWardNumber(
                        e.target.value,
                      )
                    }
                    disabled={!municipality}
                    className={tokens.select}
                  >
                    <option value="">
                      {isNepali
                        ? "-- वडा छान्नुहोस् --"
                        : "-- Select Ward --"}
                    </option>

                    {filteredWards.map((w) => (
                      <option
                        key={w.ward_id}
                        value={w.ward_no}
                      >
                        {isNepali
                          ? `वडा नं. ${w.ward_no}`
                          : `Ward No. ${w.ward_no}`}
                        {w.ward_name
                          ? ` — ${w.ward_name}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Account Security */}
              <h3 className={tokens.sectionHeading}>
                {isNepali
                  ? "खाता सुरक्षा"
                  : "Account Security"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Password */}
                <div>
                  <label className={tokens.label}>
                    {isNepali
                      ? "पासवर्ड (Password)"
                      : "Password"}
                  </label>

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value,
                      )
                    }
                    className={tokens.input}
                    placeholder="••••••••"
                  />
                </div>

                {/* Confirm Password */}
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
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value,
                      )
                    }
                    className={tokens.input}
                    placeholder="••••••••"
                  />
                </div>

              </div>

              {/* Register */}
              <button
                type="submit"
                disabled={loading}
                className={tokens.buttonPrimary}
              >
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

          {/* =====================================================
              SWITCH LOGIN / REGISTER
          ===================================================== */}

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">

            <p className="text-xs text-slate-600">

              {isRegisterMode
                ? isNepali
                  ? "अघि नै खाता छ?"
                  : "Already have an account?"
                : isNepali
                  ? "नागरिक खाता छैन?"
                  : "No citizen account?"}

              {" "}

              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(
                    !isRegisterMode,
                  );

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

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 mt-4">
        © {new Date().getFullYear()} वडा कार्यालय — Ward Office.{" "}

        {isNepali
          ? "सबै अधिकार सुरक्षित।"
          : "All rights reserved."}
      </p>

    </div>
  );
}