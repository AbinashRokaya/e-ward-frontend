import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api/api";
import { LoginContext } from "../components/context/LoginContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import govImage from "../assets/gov.jpg";

const LOCAL_BODY_TYPES = [
  "Rural Municipality (गाउँपालिका)",
  "Municipality (नगरपालिका)",
  "Sub-Metropolitan City (उपमहानगरपालिका)",
  "Metropolitan City (महानगरपालिका)",
];

const tokens = {
  page: "min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans py-10 relative",
  card: "bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden w-full max-w-lg",
  input:
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-blue-900 focus:ring-1 focus:ring-blue-900",
  select:
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white",
  label: "block text-xs font-semibold text-slate-700 mb-1",
  tabBase:
    "w-1/2 text-center py-3.5 text-sm font-medium transition-colors border-b-2 cursor-pointer",
  tabActive: "text-blue-900 border-blue-900 bg-blue-50 font-semibold",
  tabInactive:
    "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50",
  buttonPrimary:
    "w-full bg-blue-900 hover:bg-blue-950 disabled:bg-blue-300 text-white text-sm font-medium py-2.5 rounded-md transition-colors cursor-pointer shadow-sm mt-2",
  bannerSuccess: "bg-green-50 text-green-800 border border-green-200 p-3 rounded-md text-xs mb-4",
  bannerError: "bg-red-50 text-red-700 border border-red-200 p-3 rounded-md text-xs mb-4",
};

export default function AuthPage({ setRole: propSetRole, setisLogin: propSetIsLogin }) {
  const navigate = useNavigate();
  const loginContext = useContext(LoginContext) || {};
  const { login: authContextLogin } = useAuth() || {};
  const { language, setLanguage } = useLanguage();

  const isNepali = language === "ne";

  const [activeTab, setActiveTab] = useState("citizen");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Registration Fields
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localBodyType, setLocalBodyType] = useState(LOCAL_BODY_TYPES[1]);
  const [localBodyName, setLocalBodyName] = useState("");
  const [ward, setWard] = useState("");
  const [tole, setTole] = useState("");

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateAuthState = (userData, token) => {
    const role =
      userData.role ||
      userData.user_role ||
      (activeTab === "official" ? "wardsecretary" : "citizen");

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", role);

    if (loginContext.setisLogin) loginContext.setisLogin(true);
    if (loginContext.setRole) loginContext.setRole(role);
    if (propSetIsLogin) propSetIsLogin(true);
    if (propSetRole) propSetRole(role);
    if (authContextLogin) authContextLogin(userData, token);

    return role;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);

    if (isRegisterMode && password !== confirmPassword) {
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
      const endpoint = isRegisterMode
        ? `${API_URL}/v1/auth/register`
        : `${API_URL}/v1/auth/login`;

      const payload = isRegisterMode
        ? { fullName, mobileNumber, password, localBodyType, localBodyName, ward, tole }
        : { email: mobileNumber, password, login_type: activeTab };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // Response wasn't JSON — leave data as null, handled below
      }

      if (!res.ok) {
        const serverMessage = data?.message || data?.error;
        setBanner({
          type: "error",
          message:
            serverMessage ||
            (isNepali
              ? "प्रमाणीकरण असफल भयो। कृपया विवरण जाँच गरी पुनः प्रयास गर्नुहोस्।"
              : "Authentication failed. Please check your details and try again."),
        });
        return;
      }

      if (isRegisterMode) {
        setBanner({
          type: "success",
          message: isNepali
            ? "दर्ता सफल भयो! कृपया लगइन गर्नुहोस्।"
            : "Registration successful! Please sign in.",
        });
        setIsRegisterMode(false);
        return;
      }

      // Successful login
      const userDetails = data?.data?.user_details;
      const token = data?.data?.token;

      if (!userDetails || !token) {
        setBanner({
          type: "error",
          message: isNepali
            ? "सर्भरबाट अपेक्षित डाटा प्राप्त भएन। पुनः प्रयास गर्नुहोस्।"
            : "Unexpected response from server. Please try again.",
        });
        return;
      }

      updateAuthState(userDetails, token);
      navigate("/home");
    } catch (err) {
      console.error("Auth request failed:", err);
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
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab("citizen");
              setBanner(null);
            }}
            className={`${tokens.tabBase} ${activeTab === "citizen" ? tokens.tabActive : tokens.tabInactive}`}
          >
            {isNepali ? "नागरिक पोर्टल (Citizen Portal)" : "Citizen Portal"}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("official");
              setIsRegisterMode(false);
              setBanner(null);
            }}
            className={`${tokens.tabBase} ${activeTab === "official" ? tokens.tabActive : tokens.tabInactive}`}
          >
            {isNepali ? "वडा कर्मचारी (Ward Official)" : "Ward Official"}
          </button>
        </div>

        <div className="p-6">
          {/* Government Emblem / Logo Image */}
          <div className="flex justify-center mb-3">
            <img
              src={govImage}
              alt="Government Logo"
              className="w-14 h-14 object-contain rounded-full shadow-xs border border-slate-100"
            />
          </div>

          <h2 className="text-xl font-bold text-center text-slate-800 mb-1">
            {isRegisterMode
              ? (isNepali ? "नयाँ नागरिक दर्ता" : "Register Citizen Account")
              : activeTab === "citizen"
              ? (isNepali ? "नागरिक लगइन" : "Citizen Sign In")
              : (isNepali ? "कर्मचारी लगइन" : "Ward Staff Sign In")}
          </h2>
          <p className="text-xs text-center text-slate-500 mb-5">
            {isRegisterMode
              ? (isNepali ? "वडा सेवा प्राप्त गर्न विवरण भर्नुहोस्" : "Fill details to receive ward services")
              : (isNepali ? "ई-वडा प्रणालीमा लगइन गर्नुहोस्" : "Sign in to access e-Ward system")}
          </p>

          {banner && (
            <div className={banner.type === "success" ? tokens.bannerSuccess : tokens.bannerError}>
              {banner.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegisterMode && (
              <>
                <div>
                  <label className={tokens.label}>
                    {isNepali ? "पूरा नाम (Full Name)" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={tokens.input}
                    placeholder="e.g. Ram Bahadur Thapa"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={tokens.label}>
                      {isNepali ? "तह (Local Body Type)" : "Local Body Type"}
                    </label>
                    <select
                      value={localBodyType}
                      onChange={(e) => setLocalBodyType(e.target.value)}
                      className={tokens.select}
                    >
                      {LOCAL_BODY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={tokens.label}>
                      {isNepali ? "स्थानिय तहको नाम (Local Body Name)" : "Local Body Name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={localBodyName}
                      onChange={(e) => setLocalBodyName(e.target.value)}
                      className={tokens.input}
                      placeholder="e.g. Kathmandu Metropolitan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={tokens.label}>
                      {isNepali ? "वडा नं. (Ward No.)" : "Ward No."}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="35"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className={tokens.input}
                      placeholder="e.g. 4"
                    />
                  </div>
                  <div>
                    <label className={tokens.label}>
                      {isNepali ? "टोल (Tole)" : "Tole / Street"}
                    </label>
                    <input
                      type="text"
                      required
                      value={tole}
                      onChange={(e) => setTole(e.target.value)}
                      className={tokens.input}
                      placeholder="e.g. Baluwatar"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={tokens.label}>
                {isNepali ? "मोबाइल नम्बर (Mobile Number)" : "Mobile Number"}
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={tokens.input}
                placeholder="98XXXXXXXX"
              />
            </div>

            {isRegisterMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={tokens.label}>
                    {isNepali ? "पासवर्ड (Password)" : "Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={tokens.input}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className={tokens.label}>
                    {isNepali ? "पुनः पासवर्ड (Confirm Password)" : "Confirm Password"}
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
            ) : (
              <div>
                <label className={tokens.label}>
                  {isNepali ? "पासवर्ड (Password)" : "Password"}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={tokens.input}
                  placeholder="••••••••"
                />
              </div>
            )}

            <button type="submit" disabled={loading} className={tokens.buttonPrimary}>
              {loading
                ? (isNepali ? "कृपया पर्खनुहोस्..." : "Please wait...")
                : isRegisterMode
                ? (isNepali ? "खाता सिर्जना गर्नुहोस् (Register)" : "Register Account")
                : activeTab === "citizen"
                ? (isNepali ? "नागरिक रूपमा लगइन गर्नुहोस्" : "Sign In as Citizen")
                : (isNepali ? "कर्मचारी रूपमा लगइन गर्नुहोस्" : "Sign In as Official")}
            </button>
          </form>

          {activeTab === "citizen" && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                {isRegisterMode
                  ? (isNepali ? "अघि नै खाता छ?" : "Already have an account?")
                  : (isNepali ? "खाता छैन?" : "Don't have an account?")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setBanner(null);
                  }}
                  className="text-blue-900 font-bold hover:underline cursor-pointer ml-1"
                >
                  {isRegisterMode
                    ? (isNepali ? "लगइन गर्नुहोस् (Sign In)" : "Sign In Here")
                    : (isNepali ? "यहाँ दर्ता गर्नुहोस् (Register Here)" : "Register Here")}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}