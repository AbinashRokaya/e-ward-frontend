import React, { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { LoginContext } from "../components/context/LoginContext";
import { wardApi, noticeApi } from "../api/endpoints";
import wardImage from "../assets/ward.png";

// Backend role enum is: superadmin | citizen | wardchairperson |
// wardsecretary | datavalidationofficer. Keep in sync with Header.jsx,
// AuthPage.jsx, and the route list in main.jsx.
const ROLE_ROUTES = {
  superadmin: "/admin",
  citizen: "/citizen",
  wardchairperson: "/wardchairperson",
  wardsecretary: "/wardsecretary",
  datavalidationofficer: "/validation",
};

const QUICK_SERVICE_META = [
  {
    icon: "👶",
    to: "/BirthRegistration",
    accent: "bg-amber-50 text-amber-700 border-amber-100",
    titleKey: "birthCertTitle",
    defaultTitle: "जन्म दर्ता प्रमाणपत्र",
    enTitle: "Birth Certificate",
    descKey: "birthCertDesc",
    defaultDesc: "जन्म दर्ता प्रमाणपत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
    enDesc: "View, submit, or manage birth certificate records.",
  },
  {
    icon: "🕊️",
    to: "/Deathregistration",
    accent: "bg-blue-50 text-blue-900 border-blue-100",
    titleKey: "deathCertTitle",
    defaultTitle: "मृत्यु दर्ता प्रमाणपत्र",
    enTitle: "Death Certificate",
    descKey: "deathCertDesc",
    defaultDesc: "मृत्यु दर्ता प्रमाणपत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
    enDesc: "View, submit, or manage death certificate records.",
  },
  {
    icon: "🧳",
    to: "/MigrationRegistration",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    titleKey: "migrationCertTitle",
    defaultTitle: "बसाइँसराई प्रमाणपत्र",
    enTitle: "Migration Certificate",
    descKey: "migrationCertDesc",
    defaultDesc: "बसाइँसराई प्रमाणपत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
    enDesc: "View, submit, or manage migration certificate records.",
  },
  {
    icon: "📄",
    to: "/RecommendationLetter",
    accent: "bg-rose-50 text-rose-700 border-rose-100",
    titleKey: "recommendationLetterTitle",
    defaultTitle: "सिफारिस पत्र",
    enTitle: "Recommendation Letter",
    descKey: "recommendationLetterDesc",
    defaultDesc: "विभिन्न सिफारिस र प्रमाण-पत्रका लागि आवेदन दिनुहोस्।",
    enDesc: "View, submit, or manage recommendation letter records.",
  },
  {
    icon: "📢",
    to: "/FileComplaint",
    accent: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    titleKey: "complaintTitle",
    defaultTitle: "गुनासो दर्ता",
    enTitle: "Complaint",
    descKey: "complaintDesc",
    defaultDesc: "गुनासो दर्ता गर्नुहोस् र स्थिति हेर्नुहोस्।",
    enDesc: "View, submit, or manage complaint records.",
  },
  {
    icon: "📣",
    to: "/NoticeBoard",
    accent: "bg-lime-50 text-lime-700 border-lime-100",
    titleKey: "wardNoticesTitle",
    defaultTitle: "वडा सूचनाहरू",
    enTitle: "Ward Notices",
    descKey: "wardNoticesDesc",
    defaultDesc: "वडा सम्बन्धी सूचना र जानकारीहरू।",
    enDesc: "View, submit, or manage ward notices records.",
  },
];

const FEATURE_META = [
  { icon: "🛡️", accent: "bg-emerald-50 text-emerald-700", titleKey: "feature1Title", defaultTitle: "पारदर्शिता", enTitle: "Transparency", descKey: "feature1Desc", defaultDesc: "सम्पूर्ण सेवाहरू पारदर्शी र जिम्मेवार तवरले प्रदान गरिन्छ।", enDesc: "Services provided with full transparency." },
  { icon: "⚡", accent: "bg-amber-50 text-amber-700", titleKey: "feature2Title", defaultTitle: "छरितो सेवा", enTitle: "Swift Service", descKey: "feature2Desc", defaultDesc: "प्रविधिको प्रयोगद्वारा छिटो, सजिलो र प्रभावकारी सेवा।", enDesc: "Fast and technology-driven service delivery." },
  { icon: "🌐", accent: "bg-blue-50 text-blue-900", titleKey: "feature3Title", defaultTitle: "सहज पहुँच", enTitle: "Easy Access", descKey: "feature3Desc", defaultDesc: "जहाँबाट पनि, जुनसुकै बेला सेवामा सहज पहुँच।", enDesc: "Accessible anywhere at any time." },
  { icon: "🔒", accent: "bg-fuchsia-50 text-fuchsia-700", titleKey: "feature4Title", defaultTitle: "सुरक्षित प्रणाली", enTitle: "Secure System", descKey: "feature4Desc", defaultDesc: "तपाईंको डाटा सुरक्षित राख्न आधुनिक प्रविधिको प्रयोग।", enDesc: "Data protected using modern security standards." },
];

const QUICK_CATEGORY_META = [
  { icon: "👤", to: "/services", labelKey: "catCitizen", defaultLabel: "नागरिक", enLabel: "Citizen" },
  { icon: "🏢", to: "/services", labelKey: "catBusiness", defaultLabel: "संस्था / व्यवसाय", enLabel: "Business" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const { isLogin, userRole, logout } = useContext(LoginContext);
  const dashboardRoute = ROLE_ROUTES[userRole] || "/";

  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [userData, setUserData] = useState(null);

  const { language, t } = useLanguage();
  const isNepali = language === "np" || language === "ne";

  useEffect(() => {
    // User details saved by AuthPage on successful login.
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUserData(JSON.parse(savedUser));
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
    }

    let isMounted = true;

    // The previous version called /api/notices/published, which doesn't
    // exist on this backend — it always threw and always fell back to a
    // hardcoded dummy notice, so the homepage looked functional while
    // showing invented data. Real published notices come from
    // /v1/notice/{ward_id}/all, which needs a ward id: use the logged-in
    // user's ward when available, otherwise the first ward in the system
    // so anonymous visitors still see something real.
    const fetchPublishedNotices = async () => {
      try {
        setLoadingNotices(true);

        let wardId = null;
        try {
          const savedUser = JSON.parse(localStorage.getItem("user") || "null");
          wardId = savedUser?.user_ward_id || null;
        } catch {
          wardId = null;
        }

        if (!wardId) {
          const wardsRes = await wardApi.getAll();
          const wardList = wardsRes?.data?.ward_list ?? wardsRes?.data ?? [];
          wardId = wardList[0]?.ward_id || null;
        }

        if (!wardId) {
          if (isMounted) setNotices([]);
          return;
        }

        const res = await noticeApi.getAllForWard(wardId, {
          notice_status: "PUBLISHED",
        });
        const list = res?.data?.notice_list ?? res?.data ?? [];
        if (isMounted) setNotices(Array.isArray(list) ? list.slice(0, 4) : []);
      } catch (error) {
        console.error("Failed to load notices:", error);
        // Show the genuine empty state rather than fabricated notices —
        // a citizen seeing invented notices is worse than seeing none.
        if (isMounted) setNotices([]);
      } finally {
        if (isMounted) setLoadingNotices(false);
      }
    };

    fetchPublishedNotices();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <section className="relative bg-gradient-to-r from-sky-50 via-blue-50/40 to-slate-100 border-b border-slate-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 py-10 lg:py-14 relative flex flex-col lg:flex-row items-center gap-8">

          <div className="flex-1 max-w-xl z-10">
            {/* Registered user's address banner */}
            {userData && (userData.user_municipality || userData.user_name) && (
              <div className="mb-4 inline-flex items-center gap-2 bg-blue-900/10 border border-blue-200 text-blue-950 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
                <span>📍</span>
                <span>
                  {userData.user_name ? `${userData.user_name} | ` : ""}
                  {userData.user_municipality || "वडा कार्यालय"}
                  {userData.user_ward_number ? `, वडा नं. ${userData.user_ward_number}` : ""}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {t?.heroTitleLine1 || (isNepali ? "डिजिटल वडा," : "Digital Ward,")}{" "}
              <span className="text-red-600 block sm:inline mt-1 sm:mt-0">
                {t?.heroTitleLine2 || (isNepali ? "समृद्ध समाज" : "Prosperous Society")}
              </span>
            </h1>

            <p className="mt-4 text-slate-600 text-sm md:text-base leading-relaxed">
              {t?.heroSubtitle ||
                (isNepali
                  ? "प्रविधिको प्रयोगबाट पारदर्शी, छिटोछरितो र गुणस्तरीय सेवा प्रदान गर्दै जनताको विश्वास जित्दै अघि बढ्दै।"
                  : "Delivering transparent, swift, and quality public services powered by modern technology.")}
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 flex max-w-md bg-white rounded-lg p-1.5 shadow-md border border-slate-200/80"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t?.searchPlaceholder || (isNepali ? "सेवा खोज्नुहोस्..." : "Search service...")}
                className="flex-1 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
              />
              <button
                type="submit"
                className="bg-blue-950 hover:bg-blue-900 text-white rounded-md px-5 py-2 text-sm font-medium flex items-center justify-center transition-colors shadow-sm"
                aria-label="Search"
              >
                <span aria-hidden="true">🔍</span>
              </button>
            </form>

            {isLogin && (
              <NavLink
                to={dashboardRoute}
                className="mt-4 inline-flex items-center gap-2 bg-white text-blue-950 hover:bg-blue-50 font-semibold text-sm px-5 py-2.5 rounded-md transition-colors shadow-sm border border-slate-200"
              >
                {isNepali ? "मेरो ड्यासबोर्ड" : "Go to My Dashboard"} →
              </NavLink>
            )}

            <div className="mt-6 flex flex-wrap gap-2.5 items-center">
              {QUICK_CATEGORY_META.map((cat) => (
                <NavLink
                  key={cat.labelKey}
                  to={cat.to}
                  className="bg-white/90 hover:bg-white border border-slate-200/90 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:text-blue-950 hover:border-blue-300 flex items-center gap-1.5"
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{t?.[cat.labelKey] || (isNepali ? cat.defaultLabel : cat.enLabel)}</span>
                  <span className="text-slate-400 font-normal ml-0.5" aria-hidden="true">›</span>
                </NavLink>
              ))}

              {isLogin ? (
                <button
                  onClick={logout}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-full px-4 py-1.5 text-xs font-bold text-red-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🚪</span>
                  <span>{isNepali ? "लगआउट" : "Logout"}</span>
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className="bg-white/90 hover:bg-white border border-slate-200/90 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:text-blue-950 hover:border-blue-300 flex items-center gap-1.5"
                >
                  <span>👷</span>
                  <span>{isNepali ? "कर्मचारी लगइन" : "Staff Login"}</span>
                </NavLink>
              )}
            </div>
          </div>

          <div className="flex-1 relative w-full flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl h-64 sm:h-80 lg:h-[360px] bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl text-white shadow-xl overflow-hidden border border-slate-200/50">
              <img
                src={wardImage}
                alt="Ward Office"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-blue-950/20 pointer-events-none rounded-2xl"></div>
            </div>
          </div>

        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 pt-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-600" aria-hidden="true">🎯</span>{" "}
                {t?.quickServicesTitle || (isNepali ? "छिटो पहुँच सेवाहरू" : "Quick Access Services")}
              </h2>
              <NavLink
                to="/services"
                className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                {t?.viewAllServices || (isNepali ? "सबै सेवाहरू हेर्नुहोस्" : "View All Services")}{" "}
                <span aria-hidden="true">→</span>
              </NavLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {QUICK_SERVICE_META.map((s) => (
                <NavLink
                  key={s.titleKey}
                  to={s.to}
                  className="group border border-slate-200/80 rounded-xl p-4 hover:border-blue-600 hover:shadow-md transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl mb-3 shadow-sm ${s.accent}`}>
                      <span aria-hidden="true">{s.icon}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-950 transition-colors mb-1">
                      {t?.[s.titleKey] || (isNepali ? s.defaultTitle : s.enTitle)}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t?.[s.descKey] || (isNepali ? s.defaultDesc : s.enDesc)}
                    </p>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-blue-600" aria-hidden="true">📢</span>{" "}
                  {t?.noticesTitle || (isNepali ? "सूचना तथा समाचार" : "Notices & News")}
                </h2>
                <NavLink
                  to="/NoticeBoard"
                  className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  {t?.viewAllNotices || (isNepali ? "सबै हेर्नुहोस्" : "View All")}{" "}
                  <span aria-hidden="true">→</span>
                </NavLink>
              </div>

              {loadingNotices ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  {isNepali ? "सूचनाहरू लोड हुँदैछ..." : "Loading notices..."}
                </div>
              ) : notices.length === 0 ? (
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">
                    📭
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {t?.noNoticesTitle || (isNepali ? "कुनै सूचना प्रकाशित गरिएको छैन" : "No notices published yet")}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notices.map((n, idx) => {
                    const created = n.created_at ? new Date(n.created_at) : null;
                    return (
                      <li
                        key={n.notice_id || idx}
                        className="group py-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50/80 rounded-lg px-2 transition-colors"
                      >
                        <div className="bg-blue-50 text-blue-900 border border-blue-100 rounded-lg px-2.5 py-1.5 text-center shrink-0 min-w-[48px]">
                          <p className="text-sm font-extrabold leading-none text-blue-950">
                            {created ? created.getDate() : "—"}
                          </p>
                          <p className="text-[10px] font-medium text-blue-700 mt-0.5">
                            {created
                              ? created.toLocaleString(isNepali ? "ne-NP" : "en-US", { month: "short" })
                              : ""}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 group-hover:text-blue-900 transition-colors leading-snug line-clamp-2">
                            {n.notice_title}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {created ? created.toLocaleDateString() : ""}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

        </div>
      </section>

      <section className="bg-white border-t border-slate-200/80 mt-12">
        <div className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_META.map((f) => (
            <div key={f.titleKey} className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm ${f.accent}`}>
                <span aria-hidden="true">{f.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {t?.[f.titleKey] || (isNepali ? f.defaultTitle : f.enTitle)}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t?.[f.descKey] || (isNepali ? f.defaultDesc : f.enDesc)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-slate-400 py-6">
        © {new Date().getFullYear()}{" "}
        {t?.footerRights || (isNepali ? "सबै अधिकार सुरक्षित। e-वडा प्रणाली" : "All rights reserved. e-Ward System")}
      </p>
    </div>
  );
}