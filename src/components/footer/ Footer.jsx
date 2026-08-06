import React from "react";
import { NavLink } from "react-router-dom";

// ---------------------------------------------------------------------------
// Same tokens as Header.jsx / Home.jsx / AuthPage.jsx — navy (blue-900),
// rounded-md, slate neutrals. Move to shared tokens.js so all files import
// one source instead of matching by hand.
// ---------------------------------------------------------------------------
const linkClass = "text-slate-300 hover:text-white transition-colors";

const QUICK_LINKS = [
  { to: "/", label: "गृहपृष्ठ (Home)" },
  { to: "/notice-management", label: "सूचना (Notices)" },
  { to: "/citizen", label: "नागरिक सेवा (Citizen Services)" },
  { to: "/login", label: "लगइन (Sign In)" },
];

function Footer() {
  return (
    <footer className="bg-blue-950 text-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Office identity */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-xs font-semibold shrink-0">
              ने
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">वडा कार्यालय</p>
              <p className="text-xs text-slate-300">Ward Office</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            वडा व्यवस्थापन प्रणाली — नागरिकहरूका लागि अनलाइन सेवा प्रवाह
            प्रणाली।
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            द्रुत लिङ्क (Quick Links)
          </h2>
          <ul className="space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={`text-sm ${linkClass}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            सम्पर्क (Contact)
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>ठेगाना (Address): वडा नं. X, नगरपालिका, जिल्ला</li>
            <li>फोन (Phone): ०१-XXXXXXX</li>
            <li>
              इमेल (Email):{" "}
              <a href="mailto:info@ward.gov.np" className={linkClass}>
                info@ward.gov.np
              </a>
            </li>
            <li>कार्यालय समय (Hours): आइतबार–शुक्रबार, बिहान १०–बेलुका ५</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            © {new Date().getFullYear()} वडा कार्यालय — Ward Office. सबै अधिकार
            सुरक्षित। (All rights reserved.)
          </p>
          <p className="text-xs text-slate-400">
            नेपाल सरकार (Government of Nepal)
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
