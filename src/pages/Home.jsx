import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { LoginContext } from "../components/context/LoginContext";
import logo from "../assets/nepal-sarkar.png";

// ---------------------------------------------------------------------------
// Same tokens as Header.jsx / AuthPage.jsx — navy (blue-900) primary,
// rounded-md, slate neutrals. Move to a shared tokens.js when you get a
// chance so all three files import one source instead of matching by hand.
// ---------------------------------------------------------------------------
const tokens = {
  card: "bg-white border border-slate-200 rounded-md shadow-sm",
  sectionHeading:
    "text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3",
  buttonPrimary:
    "inline-flex items-center justify-center bg-blue-900 hover:bg-blue-950 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors",
  buttonSecondary:
    "inline-flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-medium px-5 py-2.5 rounded-md transition-colors",
};

// Role -> destination for the "Go to my dashboard" shortcut, kept in one
// place so it can't silently drift from the list in Header.jsx.
const ROLE_ROUTES = {
  superadmin: "/admin",
  citizen: "/citizen",
  wardchairperson: "/wardchairperson",
  wardsecretary: "/wardsecretary",
  datavalidationofficer: "/validation",
};

// Public-facing quick links to the services citizens most commonly need.
const SERVICES = [
  {
    title: "सिफारिस आवेदन (Recommendation Letter)",
    desc: "नागरिकता, बसोबास, आम्दानी लगायतका सिफारिसका लागि अनलाइन आवेदन दिनुहोस्।",
    to: "/citizen",
  },
  {
    title: "सूचना तथा जानकारी (Notices)",
    desc: "वडा कार्यालयबाट जारी भएका पछिल्ला सूचना, समाचार र सार्वजनिक जानकारीहरू हेर्नुहोस्।",
    to: "/notice-management",
  },
  {
    title: "आवेदन स्थिति (Application Status)",
    desc: "पेश गरिएको आवेदनको प्रक्रिया अवस्था र स्वीकृति स्थिति ट्र्याक गर्नुहोस्।",
    to: "/citizen",
  },
  {
    title: "complain",
    desc: "पेश गरिएको आवेदनको प्रक्रिया अवस्था र स्वीकृति स्थिति ट्र्याक गर्नुहोस्।",
    to: "/complaint",
  },
  {
    title: "complain-file",
    desc: "पेश गरिएको आवेदनको प्रक्रिया अवस्था र स्वीकृति स्थिति ट्र्याक गर्नुहोस्।",
    to: "/complaint-file",
  },
];

function Home() {
  const { isLogin, userRole } = useContext(LoginContext);
  const dashboardRoute = ROLE_ROUTES[userRole] || "/";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* -------------------------------------------------------------- */}
      {/* Hero                                                            */}
      {/* -------------------------------------------------------------- */}
      <section className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="w-30 h-30 mx-auto mb-4 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-lg font-semibold">
            <img
              src={logo}
              alt="Government of Nepal"
              className="w-30 h-30 rounded-full justify-center"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            वडा व्यवस्थापन प्रणालीमा स्वागत छ
          </h1>
          <p className="mt-1 text-blue-100">
            Welcome to the Ward Management System
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-blue-100">
            नागरिक सेवाहरू अनलाइन माध्यमबाट सजिलै र छिटो प्राप्त गर्नुहोस् —
            सिफारिस आवेदन, सूचना अवलोकन र आवेदन स्थिति एकै ठाउँबाट।
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {isLogin ? (
              <NavLink to={dashboardRoute} className={tokens.buttonPrimary}>
                मेरो ड्यासबोर्ड (Go to My Dashboard)
              </NavLink>
            ) : (
              <>
                <NavLink to="/login" className={tokens.buttonPrimary}>
                  लगइन गर्नुहोस् (Sign In)
                </NavLink>
                <NavLink
                  to="/login"
                  className="inline-flex items-center justify-center bg-white/10 border border-white/40 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
                >
                  दर्ता गर्नुहोस् (Register)
                </NavLink>
              </>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Services                                                        */}
      {/* -------------------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className={tokens.sectionHeading}>सेवाहरू (Services)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICES.map((service) => (
            <NavLink
              key={service.title}
              to={service.to}
              className={`${tokens.card} p-5 flex flex-col hover:border-blue-900 transition-colors`}
            >
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">
                {service.desc}
              </p>
              <span className="mt-4 text-sm font-medium text-blue-900">
                हेर्नुहोस् (View) →
              </span>
            </NavLink>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Office info strip                                               */}
      {/* -------------------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div
          className={`${tokens.card} p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center`}
        >
          <div>
            <p className="text-xs text-slate-500">
              कार्यालय समय (Office Hours)
            </p>
            <p className="text-sm font-medium text-slate-800 mt-1">
              आइतबार–शुक्रबार, बिहान १०–बेलुका ५
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">सम्पर्क नम्बर (Contact)</p>
            <p className="text-sm font-medium text-slate-800 mt-1">
              ०१-XXXXXXX
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">इमेल (Email)</p>
            <p className="text-sm font-medium text-slate-800 mt-1">
              info@ward.gov.np
            </p>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-slate-400 pb-8">
        © {new Date().getFullYear()} वडा कार्यालय — Ward Office. सबै अधिकार
        सुरक्षित। (All rights reserved.)
      </p>
    </div>
  );
}

export default Home;
