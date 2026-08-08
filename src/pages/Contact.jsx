import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function Contact() {
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

  // Address dynamic formatting
  const localBody = userData?.localBodyName || "वडा कार्यालय";
  const wardNo = userData?.ward ? `वडा नं. ${userData.ward}` : "वडा नं. १";
  const tole = userData?.tole || "मुख्य बजार";
  const userPhone = userData?.mobileNumber || "०१-४XXXXXX / ९८XXXXXXXX";
  const officialEmail = userData?.ward
    ? `ward${userData.ward}@${localBody.toLowerCase().replace(/\s+/g, "")}.gov.np`
    : "info@ward.gov.np";

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans">
      <div className="max-w-5xl mx-auto px-5">
        
        {/* Title Banner */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isNepali ? "सम्पर्क विवरण (Contact Us)" : "Contact Details"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isNepali
              ? "तपाईंको वडा कार्यालयसँग प्रत्यक्ष सम्पर्क गर्नुहोस्"
              : "Direct contact information for your registered ward office"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dynamic Address Information Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide block mb-1">
                {isNepali ? "वडा कार्यालयको नाम" : "Ward Office Name"}
              </span>
              <h2 className="text-xl font-bold text-slate-800">
                {localBody}, {wardNo} कार्यालय
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {tole}, {localBody}
              </p>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-900">📍</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-700">{isNepali ? "ठेगाना (Address)" : "Office Location"}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {tole}, {wardNo}, {localBody}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-900">📞</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-700">{isNepali ? "फोन / मोवाइल" : "Phone / Mobile"}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{userPhone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-900">✉️</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-700">{isNepali ? "ईमेल (Official Email)" : "Official Email"}</h3>
                  <p className="text-sm text-slate-600 mt-0.5 font-mono">{officialEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-900">⏰</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-700">{isNepali ? "कार्यालय समय" : "Office Hours"}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {isNepali ? "आइतबार – बिहीबार: बिहान १०:०० देखि साँझ ५:०० सम्म" : "Sun – Thu: 10:00 AM – 5:00 PM"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isNepali ? "शुक्रबार: बिहान १०:०० देखि दिउँसो ३:०० सम्म" : "Friday: 10:00 AM – 3:00 PM"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4">
              {isNepali ? "वडा कार्यालयलाई सन्देश पठाउनुहोस्" : "Send an Inquiry"}
            </h2>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isNepali ? "पूरा नाम" : "Full Name"}
                </label>
                <input
                  type="text"
                  defaultValue={userData?.fullName || ""}
                  placeholder="Ram Bahadur"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isNepali ? "सम्पर्क नम्बर" : "Contact Mobile"}
                </label>
                <input
                  type="text"
                  defaultValue={userData?.mobileNumber || ""}
                  placeholder="98XXXXXXXX"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isNepali ? "विषय / सन्देश" : "Subject / Message"}
                </label>
                <textarea
                  rows="4"
                  placeholder={
                    isNepali
                      ? `${localBody} ${wardNo} सम्बन्धी जिज्ञासा वा सोधपुछ...`
                      : `Your query for ${localBody} Ward No. ${userData?.ward || "1"}...`
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-900 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-950 hover:bg-blue-900 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {isNepali ? "सन्देश पठाउनुहोस्" : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}