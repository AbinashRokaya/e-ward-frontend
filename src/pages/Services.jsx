import React from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const SERVICES_DATA = [
  {
    icon: "👶",
    to: "/BirthRegistration",
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
    titleKey: "wardNoticesTitle",
    defaultTitle: "वडा सूचनाहरू",
    enTitle: "Ward Notices",
    descKey: "wardNoticesDesc",
    defaultDesc: "वडा सम्बन्धी सूचना र जानकारीहरू।",
    enDesc: "View, submit, or manage ward notices records.",
  },
  {
    icon: "💰",
    to: "/TaxRegistration",
    titleKey: "taxTitle",
    defaultTitle: "कर तिर्नुहोस्",
    enTitle: "My Tax",
    descKey: "taxDesc",
    defaultDesc: "आफ्नो कर विवरण हेर्नुहोस् र भुक्तानी गर्नुहोस्।",
    enDesc: "View, submit, or manage my tax records.",
  },
];

function Services() {
  const { language, t } = useLanguage();
  const isNepali = language === "np" || language === "ne";

  return (
    <div className="min-h-[80vh] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t?.wardServicesTitle || (isNepali ? "वडा प्रमाण-पत्र सेवाहरू" : "Ward Certificate Services")}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {t?.wardServicesSubtitle || (isNepali ? "रेकर्डहरू हेर्न, पेश गर्न वा व्यवस्थापन गर्न प्रमाणपत्र प्रकार छनौट गर्नुहोस्।" : "Choose a certificate type to view, submit, or manage records.")}
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES_DATA.map((service, index) => (
          <NavLink
            key={index}
            to={service.to}
            className="group bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                <span aria-hidden="true">{service.icon}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                {t?.[service.titleKey] || (isNepali ? service.defaultTitle : service.enTitle)}
              </h2>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                {t?.[service.descKey] || (isNepali ? service.defaultDesc : service.enDesc)}
              </p>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default Services;