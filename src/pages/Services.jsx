import React from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const SERVICES_DATA = [
  {
    icon: "👶",
    to: "/BirthRegistration",
    accent: "bg-amber-50 text-amber-700 border-amber-100",
    titleNp: "जन्म दर्ता प्रमाणपत्र",
    titleEn: "Birth Certificate",
    descNp: "जन्म दर्ता प्रमाणपत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
    descEn: "View, submit, or manage birth certificate records.",
  },
  {
    icon: "🕊️",
    to: "/Deathregistration",
    accent: "bg-blue-50 text-blue-900 border-blue-100",
    titleNp: "मृत्यु दर्ता प्रमाणपत्र",
    titleEn: "Death Certificate",
    descNp: "मृत्यु दर्ता प्रमाणपत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
    descEn: "View, submit, or manage death certificate records.",
  },
  {
    icon: "🧳",
    to: "/MigrationRegistration",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    titleNp: "बसाइँसराई प्रमाणपत्र",
    titleEn: "Migration Certificate",
    descNp: "बसाइँसराई प्रमाणपत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
    descEn: "View, submit, or manage migration certificate records.",
  },
  {
    icon: "📄",
    to: "/RecommendationLetter",
    accent: "bg-rose-50 text-rose-700 border-rose-100",
    titleNp: "सिफारिस पत्र",
    titleEn: "Recommendation Letter",
    descNp: "विभिन्न सिफारिस र प्रमाण-पत्रका लागि आवेदन दिनुहोस्।",
    descEn: "View, submit, or manage recommendation letter records.",
  },
  {
    icon: "📢",
    to: "/FileComplaint",
    accent: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    titleNp: "गुनासो दर्ता",
    titleEn: "Complaint",
    descNp: "गुनासो दर्ता गर्नुहोस् र स्थिति हेर्नुहोस्।",
    descEn: "View, submit, or manage complaint records.",
  },
  {
    icon: "📣",
    to: "/NoticeBoard",
    accent: "bg-lime-50 text-lime-700 border-lime-100",
    titleNp: "वडा सूचनाहरू",
    titleEn: "Ward Notices",
    descNp: "वडा सम्बन्धी सूचना र जानकारीहरू।",
    descEn: "View, submit, or manage ward notices records.",
  },
  {
    icon: "💰",
    to: "/services",
    accent: "bg-indigo-50 text-indigo-700 border-indigo-100",
    titleNp: "मेरो कर",
    titleEn: "My Tax",
    descNp: "मेरो कर रेकर्डहरू हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
    descEn: "View, submit, or manage my tax records.",
  },
];

export default function Services() {
  const { language } = useLanguage();
  const isNepali = language === "np" || language === "ne";

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10">
      <div className="max-w-7xl mx-auto px-5">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {isNepali ? "वडा प्रमाणपत्र तथा सेवाहरू" : "Ward Certificate Services"}
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            {isNepali
              ? "रेकर्डहरू हेर्न, पेश गर्न वा व्यवस्थापन गर्न प्रमाणपत्रको प्रकार छान्नुहोस्।"
              : "Choose a certificate type to view, submit, or manage records."}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {SERVICES_DATA.map((s, idx) => (
            <NavLink
              key={idx}
              to={s.to}
              className="group border border-slate-200/80 rounded-2xl p-6 hover:border-blue-600 hover:shadow-md transition-all bg-white flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl mb-4 shadow-sm ${s.accent}`}>
                  <span aria-hidden="true">{s.icon}</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-950 transition-colors mb-1.5">
                  {isNepali ? s.titleNp : s.titleEn}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isNepali ? s.descNp : s.descEn}
                </p>
              </div>
            </NavLink>
          ))}
        </div>

      </div>
    </div>
  );
}