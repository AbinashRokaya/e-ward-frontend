import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import API_URL from "../api/api";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../components/context/LoginContext";
import { transliterateToNepali } from "../utils/nepaliTransliteration"; // adjust path to match your project structure

// ---------------------------------------------------------------------------
// Design tokens — shared across the whole e-Ward system.
// Keep every page importing from a single source like this (or a
// tailwind.config.js theme extension) so nothing drifts out of sync again.
//
//   Primary   : navy   (blue-900)   — headers, primary actions, active states
//   Accent    : crimson (red-700)   — used ONLY for errors/danger, never decoration
//   Success   : green  (green-700)  — confirmation states only
//   Surface   : white / slate-50    — cards / page background
//   Border    : slate-200 / slate-300
//   Radius    : rounded-md everywhere (formal, not playful)
// ---------------------------------------------------------------------------
const tokens = {
  page: "min-h-screen bg-slate-50 flex flex-col",
  card: "bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden",

  input:
    "w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-blue-900 focus:ring-1 focus:ring-blue-900 disabled:bg-slate-100 disabled:cursor-not-allowed",
  label: "block text-sm font-medium text-slate-700 mb-1",
  helperError: "text-red-700 text-xs mt-1",
  sectionHeading:
    "text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3",

  tabBase: "py-3.5 text-sm font-medium transition-colors border-b-2",
  tabActive: "text-blue-900 border-blue-900 bg-blue-50",
  tabInactive:
    "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50",

  buttonPrimary:
    "w-full bg-blue-900 hover:bg-blue-950 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-md transition-colors",
  linkButton: "text-blue-900 font-medium hover:underline",

  bannerSuccess: "bg-green-50 text-green-800 border border-green-200",
  bannerError: "bg-red-50 text-red-700 border border-red-200",
};

const initialFormData = {
  user_name: "",
  user_phone_number: "",
  user_citizenship_number: "",
  user_email: "",
  password: "",
  user_nepali_name: "",
  confirm_password: "",
  address: {
    child_province: "",
    child_district: "",
    child_municipality: "",
    child_ward_number: "",
  },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { isLogin, setisLogin, setRole, userRole } = useContext(LoginContext);
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [wards, setWards] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loginData, setLoginData] = useState({
    user_phone_number: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null); // { type: "success" | "error", message }
  const romanBuffer = useRef({});
  const passthroughKeys = [
    "Tab",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "CapsLock",
    "Delete",
    "Escape",
  ];

  const updateNepaliField = (fieldName, romanValue) => {
    romanBuffer.current[fieldName] = romanValue;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: transliterateToNepali(romanValue),
    }));
  };

  const handleNepaliKeyDown = (e, fieldName) => {
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      const buf = (romanBuffer.current[fieldName] || "").slice(0, -1);
      updateNepaliField(fieldName, buf);
      return;
    }
    if (passthroughKeys.includes(e.key)) return;
    if (e.key.length === 1) {
      e.preventDefault();
      const buf = (romanBuffer.current[fieldName] || "") + e.key;
      updateNepaliField(fieldName, buf);
    }
  };

  const handleNepaliPaste = (e, fieldName) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const buf = (romanBuffer.current[fieldName] || "") + pasted;
    updateNepaliField(fieldName, buf);
  };

  // Fetch ward list once — same single-call, client-side-filter pattern
  // used across the rest of the app.
  useEffect(() => {
    if (mode !== "register") return;
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
  }, [mode]);

  // -------------------------------------------------------------------------
  // Address cascading logic (province -> district -> municipality -> ward)
  // -------------------------------------------------------------------------
  const provinces = useMemo(
    () => [...new Set(wards.map((w) => w.ward_province))].sort(),
    [wards],
  );

  const districts = useMemo(() => {
    if (!formData.address.child_province) return [];
    return [
      ...new Set(
        wards
          .filter((w) => w.ward_province === formData.address.child_province)
          .map((w) => w.ward_district),
      ),
    ].sort();
  }, [wards, formData.address.child_province]);

  const municipalities = useMemo(() => {
    if (!formData.address.child_province || !formData.address.child_district)
      return [];
    return [
      ...new Set(
        wards
          .filter(
            (w) =>
              w.ward_province === formData.address.child_province &&
              w.ward_district === formData.address.child_district,
          )
          .map((w) => w.ward_municipality),
      ),
    ].sort();
  }, [wards, formData.address.child_province, formData.address.child_district]);

  const filteredWards = useMemo(() => {
    const { child_province, child_district, child_municipality } =
      formData.address;
    if (!child_province || !child_district || !child_municipality) return [];
    return wards
      .filter(
        (w) =>
          w.ward_province?.toLowerCase() === child_province?.toLowerCase() &&
          w.ward_district?.toLowerCase() === child_district?.toLowerCase() &&
          w.ward_municipality?.toLowerCase() ===
            child_municipality?.toLowerCase(),
      )
      .sort((a, b) => Number(a.ward_no) - Number(b.ward_no));
  }, [wards, formData.address]);

  const handleAddressField = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    handleAddressField("child_province", value);
    handleAddressField("child_district", "");
    handleAddressField("child_municipality", "");
    handleAddressField("child_ward_number", "");
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    handleAddressField("child_district", value);
    handleAddressField("child_municipality", "");
    handleAddressField("child_ward_number", "");
  };

  const handleMunicipalityChange = (e) => {
    const value = e.target.value;
    handleAddressField("child_municipality", value);
    handleAddressField("child_ward_number", "");
  };

  const handleWardChange = (e) => {
    handleAddressField("child_ward_number", e.target.value);
  };

  // -------------------------------------------------------------------------
  // Field handlers
  // -------------------------------------------------------------------------
  const handleNameChange = (e) => {
    setFormData((prev) => ({ ...prev, user_name: e.target.value }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // digits only
    if (value.length > 10) return;
    setFormData((prev) => ({ ...prev, user_phone_number: value }));
  };

  // Same masking pattern used for parent_citizenship_no elsewhere in the app:
  // digits and hyphens only, e.g. "12-34-56789".
  const handleCitizenshipChange = (e) => {
    const value = e.target.value;
    if (!/^[0-9-]*$/.test(value)) return;
    setFormData((prev) => ({ ...prev, user_citizenship_number: value }));
  };
  const handleEmailChange = (e) => {
    setFormData((prev) => ({ ...prev, user_email: e.target.value }));
  };
  const handlePasswordChange = (e) => {
    setFormData((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleConfirmPasswordChange = (e) => {
    setFormData((prev) => ({ ...prev, confirm_password: e.target.value }));
  };

  const handleLoginPhoneChange = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    if (value.length > 10) return;
    setLoginData((prev) => ({ ...prev, user_phone_number: value }));
  };

  const handleLoginPasswordChange = (e) => {
    setLoginData((prev) => ({ ...prev, password: e.target.value }));
  };

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------
  const validateRegister = () => {
    const next = {};
    if (!formData.user_name.trim())
      next.user_name = "पूरा नाम आवश्यक छ (Full name is required)";
    if (!/^(98|97)\d{8}$/.test(formData.user_phone_number))
      next.user_phone_number =
        "मान्य नेपाली मोबाइल नम्बर आवश्यक छ (Enter a valid Nepali mobile number)";
    if (!formData.user_citizenship_number.trim())
      next.user_citizenship_number =
        "नागरिकता नम्बर आवश्यक छ (Citizenship number is required)";
    if (!formData.user_nepali_name.trim())
      next.user_nepali_name = "नेपाली नाम आवश्यक छ (Nepali name is required)";
    if (!formData.address.child_province)
      next.child_province = "प्रदेश छान्नुहोस् (Select a province)";
    if (!formData.address.child_district)
      next.child_district = "जिल्ला छान्नुहोस् (Select a district)";
    if (!formData.address.child_municipality)
      next.child_municipality = "नगरपालिका छान्नुहोस् (Select a municipality)";
    if (!formData.address.child_ward_number)
      next.child_ward_number = "वडा छान्नुहोस् (Select a ward)";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.user_email.trim()))
      next.user_email =
        "मान्य इमेल ठेगाना आवश्यक छ (Enter a valid email address)";
    if (formData.password.length < 8)
      next.password =
        "पासवर्ड कम्तिमा ८ अक्षरको हुनुपर्छ (Password must be at least 8 characters)";
    if (formData.password !== formData.confirm_password)
      next.confirm_password = "पासवर्ड मेल खाएन (Passwords do not match)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateLogin = () => {
    const next = {};
    if (!/^(98|97)\d{8}$/.test(loginData.user_phone_number))
      next.login_phone =
        "मान्य नेपाली मोबाइल नम्बर आवश्यक छ (Enter a valid Nepali mobile number)";
    if (!loginData.password)
      next.login_password = "पासवर्ड आवश्यक छ (Password is required)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // -------------------------------------------------------------------------
  // Submit handlers
  // -------------------------------------------------------------------------
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    if (!validateRegister()) return;

    setSubmitting(true);
    try {
      const payload = {
        user_name: formData.user_name,
        user_phone_number: formData.user_phone_number,
        user_citizenship_number: formData.user_citizenship_number,
        user_email: formData.user_email,
        user_nepali_name: formData.user_nepali_name,
        user_provience: formData.address.child_province,
        user_district: formData.address.child_district,
        user_municipality: formData.address.child_municipality,
        user_ward_number: Number(formData.address.child_ward_number),
        password: formData.password,
      };

      const res = await fetch(`${API_URL}/v1/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "दर्ता असफल भयो (Registration failed)");
      }

      setBanner({
        type: "success",
        message:
          "दर्ता सफल भयो। तपाईंको खाता वडा कार्यालयबाट स्वीकृतिको पर्खाइमा छ। (Registration successful. Your account is awaiting ward-office approval.)",
      });
      setFormData(initialFormData);
      navigate("/");
    } catch (err) {
      setBanner({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    if (!validateLogin()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/v1/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "लगइन असफल भयो (Login failed)");
      }
      setRole(data.data.user_details.user_role);
      setisLogin(true);
      setBanner({
        type: "success",
        message: "लगइन सफल भयो (Login successful)",
      });
      navigate("/");
    } catch (err) {
      setBanner({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setBanner(null);
  };

  return (
    <div className={tokens.page}>
      {/* ---------------------------------------------------------------- */}
      {/* Government header bar — appears the same way on every page      */}
      {/* ---------------------------------------------------------------- */}

      {/* ---------------------------------------------------------------- */}
      {/* Auth card                                                        */}
      {/* ---------------------------------------------------------------- */}
      <main className="flex-1 flex items-start md:items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className={tokens.card}>
            {/* Tab switcher */}
            <div className="grid grid-cols-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`${tokens.tabBase} ${
                  mode === "login" ? tokens.tabActive : tokens.tabInactive
                }`}
              >
                लगइन (Login)
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`${tokens.tabBase} ${
                  mode === "register" ? tokens.tabActive : tokens.tabInactive
                }`}
              >
                दर्ता (Register)
              </button>
            </div>

            <div className="p-6 md:p-8">
              <h1 className="text-lg font-semibold text-slate-800 mb-1">
                {mode === "login"
                  ? "खातामा लगइन गर्नुहोस् (Sign in to your account)"
                  : "नयाँ खाता दर्ता गर्नुहोस् (Create a new account)"}
              </h1>
              <p className="text-sm text-slate-500 mb-6">
                {mode === "login"
                  ? "आफ्नो मोबाइल नम्बर र पासवर्ड प्रयोग गरी लगइन गर्नुहोस्।"
                  : "दर्ता पछि तपाईंको खाता वडा कार्यालयको स्वीकृतिको पर्खाइमा रहनेछ।"}
              </p>

              {banner && (
                <div
                  role="status"
                  className={`mb-5 rounded-md p-3 text-sm ${
                    banner.type === "success"
                      ? tokens.bannerSuccess
                      : tokens.bannerError
                  }`}
                >
                  {banner.message}
                </div>
              )}

              {mode === "login" ? (
                <form
                  onSubmit={handleLoginSubmit}
                  className="space-y-5"
                  noValidate
                >
                  <div>
                    <label className={tokens.label}>
                      मोबाइल नम्बर (Mobile Number)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-100 text-slate-500 text-sm">
                        +977
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={loginData.user_phone_number}
                        onChange={handleLoginPhoneChange}
                        placeholder="98XXXXXXXX"
                        aria-invalid={!!errors.login_phone}
                        className={`${tokens.input} rounded-l-none`}
                      />
                    </div>
                    {errors.login_phone && (
                      <p className={tokens.helperError}>{errors.login_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className={tokens.label}>पासवर्ड (Password)</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={handleLoginPasswordChange}
                        placeholder="••••••••"
                        aria-invalid={!!errors.login_password}
                        className={`${tokens.input} pr-24`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-900 hover:underline"
                      >
                        {showPassword
                          ? "लुकाउनुहोस् (Hide)"
                          : "देखाउनुहोस् (Show)"}
                      </button>
                    </div>
                    {errors.login_password && (
                      <p className={tokens.helperError}>
                        {errors.login_password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={tokens.buttonPrimary}
                  >
                    {submitting
                      ? "लगइन गर्दै... (Signing in...)"
                      : "लगइन गर्नुहोस् (Sign In)"}
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    खाता छैन?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className={tokens.linkButton}
                    >
                      यहाँ दर्ता गर्नुहोस् (Register here)
                    </button>
                  </p>
                </form>
              ) : (
                <form
                  onSubmit={handleRegisterSubmit}
                  className="space-y-6"
                  noValidate
                >
                  {/* Personal details ------------------------------------------------ */}
                  <div>
                    <h2 className={tokens.sectionHeading}>
                      व्यक्तिगत विवरण (Personal Details)
                    </h2>
                    <div className="space-y-5">
                      <div>
                        <label className={tokens.label}>
                          पूरा नाम (Full Name)
                        </label>
                        <input
                          type="text"
                          value={formData.user_name}
                          onChange={handleNameChange}
                          placeholder="राम बहादुर श्रेष्ठ"
                          aria-invalid={!!errors.user_name}
                          className={tokens.input}
                        />
                        {errors.user_name && (
                          <p className={tokens.helperError}>
                            {errors.user_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={tokens.label}>
                          नाम (नेपालीमा) (Name in Nepali)
                        </label>
                        <input
                          type="text"
                          value={formData.user_nepali_name}
                          onKeyDown={(e) =>
                            handleNepaliKeyDown(e, "user_nepali_name")
                          }
                          onPaste={(e) =>
                            handleNepaliPaste(e, "user_nepali_name")
                          }
                          onChange={() => {}}
                          placeholder="English मा टाइप गर्नुहोस्, नेपालीमा देखिनेछ"
                          aria-invalid={!!errors.user_nepali_name}
                          className={tokens.input}
                        />
                        {errors.user_nepali_name && (
                          <p className={tokens.helperError}>
                            {errors.user_nepali_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={tokens.label}>
                          मोबाइल नम्बर (Mobile Number)
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-100 text-slate-500 text-sm">
                            +977
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formData.user_phone_number}
                            onChange={handlePhoneChange}
                            placeholder="98XXXXXXXX"
                            aria-invalid={!!errors.user_phone_number}
                            className={`${tokens.input} rounded-l-none`}
                          />
                        </div>
                        {errors.user_phone_number && (
                          <p className={tokens.helperError}>
                            {errors.user_phone_number}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={tokens.label}>
                          नागरिकता नम्बर (Citizenship Number)
                        </label>
                        <input
                          type="text"
                          value={formData.user_citizenship_number}
                          onChange={handleCitizenshipChange}
                          placeholder="12-34-56789"
                          aria-invalid={!!errors.user_citizenship_number}
                          className={tokens.input}
                        />
                        {errors.user_citizenship_number && (
                          <p className={tokens.helperError}>
                            {errors.user_citizenship_number}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={tokens.label}>
                          इमेल ठेगाना (Email Address)
                        </label>
                        <input
                          type="email"
                          value={formData.user_email}
                          onChange={handleEmailChange}
                          placeholder="ram@example.com"
                          aria-invalid={!!errors.user_email}
                          className={tokens.input}
                        />
                        {errors.user_email && (
                          <p className={tokens.helperError}>
                            {errors.user_email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address ---------------------------------------------------------- */}
                  <div className="border-t border-slate-100 pt-5">
                    <h2 className={tokens.sectionHeading}>
                      ठेगाना विवरण (Address Details)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={tokens.label}>
                          प्रदेश (Province)
                        </label>
                        <select
                          value={formData.address.child_province}
                          onChange={handleProvinceChange}
                          aria-invalid={!!errors.child_province}
                          className={`${tokens.input} bg-white`}
                        >
                          <option value="">
                            -- प्रदेश छान्नुहोस् (Select Province) --
                          </option>
                          {provinces.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        {errors.child_province && (
                          <p className={tokens.helperError}>
                            {errors.child_province}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={tokens.label}>
                          जिल्ला (District)
                        </label>
                        <select
                          value={formData.address.child_district}
                          onChange={handleDistrictChange}
                          disabled={!formData.address.child_province}
                          aria-invalid={!!errors.child_district}
                          className={`${tokens.input} bg-white`}
                        >
                          <option value="">
                            -- जिल्ला छान्नुहोस् (Select District) --
                          </option>
                          {districts.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        {errors.child_district && (
                          <p className={tokens.helperError}>
                            {errors.child_district}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={tokens.label}>
                          नगरपालिका (Municipality)
                        </label>
                        <select
                          value={formData.address.child_municipality}
                          onChange={handleMunicipalityChange}
                          disabled={!formData.address.child_district}
                          aria-invalid={!!errors.child_municipality}
                          className={`${tokens.input} bg-white`}
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
                        {errors.child_municipality && (
                          <p className={tokens.helperError}>
                            {errors.child_municipality}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={tokens.label}>
                          वडा नं. (Ward No.)
                        </label>
                        <select
                          value={formData.address.child_ward_number}
                          onChange={handleWardChange}
                          disabled={!formData.address.child_municipality}
                          aria-invalid={!!errors.child_ward_number}
                          className={`${tokens.input} bg-white`}
                        >
                          <option value="">
                            -- वडा छान्नुहोस् (Select Ward) --
                          </option>
                          {filteredWards.map((w) => (
                            <option key={w.ward_id} value={w.ward_no}>
                              वडा नं. {w.ward_no} — {w.ward_name}
                            </option>
                          ))}
                        </select>
                        {errors.child_ward_number && (
                          <p className={tokens.helperError}>
                            {errors.child_ward_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Credentials -------------------------------------------------------- */}
                  <div className="border-t border-slate-100 pt-5">
                    <h2 className={tokens.sectionHeading}>
                      खाता सुरक्षा (Account Security)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={tokens.label}>
                          पासवर्ड (Password)
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={handlePasswordChange}
                          placeholder="कम्तिमा ८ अक्षर"
                          aria-invalid={!!errors.password}
                          className={tokens.input}
                        />
                        {errors.password && (
                          <p className={tokens.helperError}>
                            {errors.password}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={tokens.label}>
                          पासवर्ड पुष्टि (Confirm Password)
                        </label>
                        <input
                          type="password"
                          value={formData.confirm_password}
                          onChange={handleConfirmPasswordChange}
                          placeholder="फेरि टाइप गर्नुहोस्"
                          aria-invalid={!!errors.confirm_password}
                          className={tokens.input}
                        />
                        {errors.confirm_password && (
                          <p className={tokens.helperError}>
                            {errors.confirm_password}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={tokens.buttonPrimary}
                  >
                    {submitting
                      ? "पेश गर्दै... (Submitting...)"
                      : "दर्ता गर्नुहोस् (Register)"}
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    पहिले नै खाता छ?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className={tokens.linkButton}
                    >
                      लगइन गर्नुहोस् (Log in)
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            © {new Date().getFullYear()} वडा कार्यालय — Ward Office. सबै अधिकार
            सुरक्षित। (All rights reserved.)
          </p>
        </div>
      </main>
    </div>
  );
}
