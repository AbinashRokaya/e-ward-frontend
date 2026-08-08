import React, { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { useLanguage } from "../../context/LanguageContext";
import logo from "../../assets/nepal-sarkar.png";

const ROLE_ROUTES = {
  admin: "/admin",
  citizen: "/citizen",
  wardchairperson: "/wardchairperson",
  wardsecretary: "/wardsecretary",
  datavalidationofficer: "/validation",
};

const getNavItems = (t = {}, language = "ne", isLoggedIn = false, userRole = null) => {
  const isNepali = language === "ne" || language === "np";

  const items = [
    { to: "/", label: t.home || (isNepali ? "गृहपृष्ठ" : "Home"), icon: "🏠" },
    { to: "/about", label: t.about || (isNepali ? "हाम्रो बारे" : "About Us"), icon: "📷" },
    { to: "/services", label: t.services || (isNepali ? "सेवाहरू" : "Services"), icon: "📋" },
    { to: "/NoticeBoard", label: t.notice || (isNepali ? "सूचना" : "Notices"), icon: "📢" },
    { to: "/documents", label: t.documents || (isNepali ? "कागजातहरू" : "Documents"), icon: "📄" },
    { to: "/citizen", label: t.reports || (isNepali ? "फारमको स्थिति" : "Form Status"), icon: "📝" },
    { to: "/contact", label: t.contact || (isNepali ? "सम्पर्क" : "Contact"), icon: "📞" },
  ];

  if (isLoggedIn && userRole && userRole !== "citizen" && ROLE_ROUTES[userRole]) {
    items.splice(1, 0, {
      to: ROLE_ROUTES[userRole],
      label: t.dashboard || (isNepali ? "ड्यासबोर्ड" : "Dashboard"),
      icon: "🗂️",
    });
  }

  return items;
};

function Header() {
  const loginContext = useContext(LoginContext) || {};
  const isLoginContext = loginContext.isLogin ?? false;
  const userRole = loginContext.userRole ?? null;
  const setisLogin = loginContext.setisLogin || (() => {});
  const setRole = loginContext.setRole || (() => {});

  const languageContext = useLanguage() || {};
  const language = languageContext.language || "ne";
  const setLanguage = languageContext.setLanguage || (() => {});
  const t = languageContext.t || {};

  const navigate = useNavigate();
  const location = useLocation();

  const [fontStep, setFontStep] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [hasToken, setHasToken] = useState(
    Boolean(localStorage.getItem("token") || localStorage.getItem("user"))
  );

  useEffect(() => {
    const checkToken = () => {
      setHasToken(Boolean(localStorage.getItem("token") || localStorage.getItem("user")));
    };
    checkToken();
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, [location.pathname]);

  const isLoggedIn = isLoginContext || hasToken;
  const isNepali = language === "ne" || language === "np";
  const NAV_ITEMS = getNavItems(t, language, isLoggedIn, userRole);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setisLogin(false);
    setRole(null);
    setHasToken(false);
    setMobileOpen(false);
    navigate("/login");
  };

  return (
    <header className="w-full bg-white shadow-sm font-sans border-b border-slate-200">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={logo}
              alt="Nepal Government Logo"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-blue-950 tracking-tight leading-tight">
                {isNepali ? "ई-वडा व्यवस्थापन प्रणाली" : "E-Ward Management System"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium hidden xs:block">
                {isNepali
                  ? "स्थानीय सरकार, जनतासँगको सार्थक सम्बन्ध"
                  : "Local government, meaningful relationship with citizens"}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs sm:text-sm text-slate-600 shrink-0">
            <div className="flex items-center gap-1 bg-slate-200/80 border border-slate-300 rounded-full p-1 shadow-sm">
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

            <div className="flex items-center gap-1">
              {[0, 1, 2].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setFontStep(step)}
                  className={`px-2 py-0.5 rounded border text-xs transition-all cursor-pointer ${
                    fontStep === step
                      ? "border-blue-950 bg-blue-50 text-blue-950 font-bold"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                  aria-label={`Change font size level ${step}`}
                >
                  {step === 0 ? "A-" : step === 1 ? "A" : "A+"}
                </button>
              ))}
            </div>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>🚪</span>
                <span>{t.logout || (isNepali ? "लगआउट" : "Logout")}</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                className="bg-blue-950 hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>👤</span>
                <span>{t.login || (isNepali ? "लगइन" : "Login")}</span>
              </NavLink>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 text-slate-700 hover:text-blue-950 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className="text-xl">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      <nav className="hidden sm:block bg-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? "bg-white text-blue-950 border-blue-950 font-bold rounded-t-lg"
                    : "text-blue-100 border-transparent hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <nav className="sm:hidden bg-blue-950 border-t border-blue-900 px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-blue-950 font-bold"
                    : "text-blue-100 hover:bg-white/10"
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-3 mt-3 border-t border-blue-900/80 flex items-center justify-between text-xs text-blue-100">
            <div className="flex items-center gap-1 bg-blue-900 border border-blue-800 rounded-full p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setLanguage("ne")}
                className={`cursor-pointer px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isNepali
                    ? "bg-white text-blue-950 shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                नेपाली
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`cursor-pointer px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  !isNepali
                    ? "bg-white text-blue-950 shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                English
              </button>
            </div>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-semibold text-xs cursor-pointer flex items-center gap-1"
              >
                <span>🚪</span>
                <span>{t.logout || "Logout"}</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="bg-white text-blue-950 px-3 py-1.5 rounded-md font-bold text-xs"
              >
                {t.login || "Login"}
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;