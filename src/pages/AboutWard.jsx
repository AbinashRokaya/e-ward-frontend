import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function AboutWard() {
  const [userData, setUserData] = useState(null);
  const { language } = useLanguage();
  const isNepali = language === "np" || language === "ne";

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUserData(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to parse user data", e);
    }
  }, []);

  // Dynamic values or defaults
  const localBody = userData?.localBodyName || "वडा कार्यालय";
  const wardNo = userData?.ward ? `वडा नं. ${userData.ward}` : "वडा नं. १";
  const tole = userData?.tole || "मुख्य बजार";
  const bodyType = userData?.localBodyType || "स्थानीय तह";

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans">
      <div className="max-w-5xl mx-auto px-5">
        
        {/* Dynamic Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-100 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3">
            <span>📍</span>
            <span>
              {localBody}, {wardNo} ({tole})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isNepali
              ? `हाम्रो वडा परिचय - ${localBody}, ${wardNo}`
              : `About Our Ward - ${localBody}, Ward No. ${userData?.ward || "1"}`}
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {isNepali
              ? `${localBody} अन्तर्गतको ${wardNo} नागरिकहरूलाई सुलभ, डिजिटल र पारदर्शी सेवा प्रदान गर्न प्रतिबद्ध छ।`
              : `${localBody}, Ward No. ${userData?.ward || "1"} is dedicated to delivering accessible, digital, and transparent local governance.`}
          </p>
        </div>

        {/* Dynamic Ward Statistics / Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="text-2xl mb-2 block">🏢</span>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isNepali ? "स्थानीय निकाय (Local Body)" : "Local Body Authority"}
            </h3>
            <p className="text-base font-bold text-slate-800 mt-1">{localBody}</p>
            <p className="text-xs text-slate-500 mt-0.5">{bodyType}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="text-2xl mb-2 block">🚩</span>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isNepali ? "वडा तथा क्षेत्र (Ward & Area)" : "Ward & Location"}
            </h3>
            <p className="text-base font-bold text-slate-800 mt-1">{wardNo}</p>
            <p className="text-xs text-slate-500 mt-0.5">{tole} क्षेत्र</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="text-2xl mb-2 block">💻</span>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isNepali ? "सेवा प्रणाली (Service System)" : "Governance System"}
            </h3>
            <p className="text-base font-bold text-slate-800 mt-1">e-वडा डिजिटल सेवा</p>
            <p className="text-xs text-slate-500 mt-0.5">२४/७ अनलाइन सिफारिस तथा दर्ता</p>
          </div>
        </div>

        {/* Ward Mission Statement */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-3">
            {isNepali ? "हाम्रो लक्ष्य र प्रतिबद्धता" : "Our Vision & Commitment"}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {isNepali
              ? `${localBody} ${wardNo} कार्यालयले ${tole} तथा आसपासका सम्पूर्ण बासिन्दाहरूका लागि जन्म दर्ता, मृत्यु दर्ता, बसाइँसराई, सिफारिस पत्र तथा अन्य सिफारिस सेवाहरू प्रविधिमार्फत छिटो र छरितो रूपमा उपलब्ध गराउँदै आएको छ।`
              : `The Ward No. ${userData?.ward || "1"} office of ${localBody} provides efficient online applications for birth, death, migration registration, recommendation letters, and grievances for residents of ${tole} and surrounding neighborhoods.`}
          </p>
        </div>

      </div>
    </div>
  );
}