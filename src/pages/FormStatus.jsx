import { useLanguage } from "../context/LanguageContext";

export default function FormStatus() {
  const { language, setLanguage } = useLanguage();

  const isNepali = language === "np" || language === "ne";

  const services = [
    {
      key: "birth",
      icon: "👶",
      titleEn: "Birth Certificate",
      titleNp: "जन्म प्रमाणपत्र",
      descEn: "View, submit, or manage birth certificate records.",
      descNp:
        "जन्म प्रमाणपत्र अभिलेखहरू हेर्नुहोस्, पेश गर्नुहोस्, वा व्यवस्थापन गर्नुहोस्।",
      to: "/citizen/birth-certificate",
    },
    {
      key: "death",
      icon: "🕊️",
      titleEn: "Death Certificate",
      titleNp: "मृत्यु प्रमाणपत्र",
      descEn: "View, submit, or manage death certificate records.",
      descNp:
        "मृत्यु प्रमाणपत्र अभिलेखहरू हेर्नुहोस्, पेश गर्नुहोस्, वा व्यवस्थापन गर्नुहोस्।",
      to: "/citizen/death-certificate",
    },
    {
      key: "migration",
      icon: "🧳",
      titleEn: "Migration Certificate",
      titleNp: "बसाईंसराई प्रमाणपत्र",
      descEn: "View, submit, or manage migration certificate records.",
      descNp:
        "बसाईंसराई प्रमाणपत्र अभिलेखहरू हेर्नुहोस्, पेश गर्नुहोस्, वा व्यवस्थापन गर्नुहोस्।",
      to: "/citizen/migration-certificate",
    },
    {
      key: "recommendation",
      icon: "📄",
      titleEn: "Recommendation Letter",
      titleNp: "सिफारिस पत्र",
      descEn: "View, submit, or manage recommendation letter records.",
      descNp:
        "सिफारिस पत्र अभिलेखहरू हेर्नुहोस्, पेश गर्नुहोस्, वा व्यवस्थापन गर्नुहोस्।",
      to: "/citizen/recommendation-letter",
    },
    {
      key: "complaint",
      icon: "📣",
      titleEn: "Complaint",
      titleNp: "गुनासो",
      descEn: "View, submit, or manage complaint records.",
      descNp:
        "गुनासो अभिलेखहरू हेर्नुहोस्, पेश गर्नुहोस्, वा व्यवस्थापन गर्नुहोस्।",
      to: "/citizen/complaint",
    },
    {
      key: "notices",
      icon: "📢",
      titleEn: "Ward Notices",
      titleNp: "वडा सूचना",
      descEn: "View ward notices and announcements.",
      descNp: "वडाका सूचना तथा घोषणाहरू हेर्नुहोस्।",
      to: "/citizen/ward-notices",
    },
    {
      key: "tax",
      icon: "💰",
      titleEn: "My Tax",
      titleNp: "मेरो कर",
      descEn: "View, submit, or manage my tax records.",
      descNp: "कर अभिलेखहरू हेर्नुहोस्, पेश गर्नुहोस्, वा व्यवस्थापन गर्नुहोस्।",
      to: "/citizen/my-tax",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10">
      <div className="max-w-5xl mx-auto px-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900">
              {isNepali
                ? "वडा प्रमाणपत्र सेवाहरू"
                : "Ward Certificate Services"}
            </h1>

            <p className="text-sm text-slate-600 mt-1">
              {isNepali
                ? "हेर्न, पेश गर्न, वा अभिलेख व्यवस्थापन गर्न सेवाको प्रकार छान्नुहोस्।"
                : "Choose a service to view, submit, or manage records."}
            </p>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-200/80 border border-slate-300 rounded-full p-1 shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => setLanguage("np")}
              className={`cursor-pointer px-3 py-1 rounded-full text-xs font-bold transition-all ${
                isNepali
                  ? "bg-blue-900 text-white shadow-sm"
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
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <a
              key={service.key}
              href={service.to}
              className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition-all duration-200"
            >
              {/* Icon */}
              <div className="text-3xl mb-3">{service.icon}</div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-blue-900 transition-colors">
                {isNepali ? service.titleNp : service.titleEn}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed">
                {isNepali ? service.descNp : service.descEn}
              </p>

              {/* View Service */}
              <div className="mt-4 text-xs font-semibold text-blue-800">
                {isNepali ? "सेवा हेर्नुहोस् →" : "View Service →"}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}