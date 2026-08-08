import React, { useState } from "react";
import logo from "../assets/nepal-sarkar.png";
import { useLanguage } from "../context/LanguageContext";

function NoticeBoard() {
  const languageContext = useLanguage() || {};
  const language = languageContext.language || "ne";
  const t = languageContext.t || {};
  const isNepali = language === "ne";

  // Mock data until this is wired to the backend — each notice carries both
  // languages so switching नेपाली/English actually changes the content,
  // not just the page chrome.
  const notices = [
    {
      id: 1,
      title: "Ward 5 Tax Collection Notice",
      titleNp: "वडा ५ कर संकलन सूचना",
      ward: "Ward 5",
      wardNp: "वडा ५",
      category: "Tax",
      categoryNp: "कर",
      date: "2026-06-21",
      content:
        "Tax collection for Ward 5 will begin from July 1. All citizens are requested to bring their citizenship card and previous tax receipts.",
      contentNp:
        "वडा ५ को कर संकलन जुलाई १ बाट सुरु हुनेछ। सबै नागरिकहरूलाई नागरिकता प्रमाणपत्र र अघिल्लो कर रसिद ल्याउन अनुरोध गरिन्छ।",
    },
    {
      id: 2,
      title: "Birth Registration Awareness Program",
      titleNp: "जन्म दर्ता सचेतना कार्यक्रम",
      ward: "Ward 7",
      wardNp: "वडा ७",
      category: "Registration",
      categoryNp: "दर्ता",
      date: "2026-06-20",
      content:
        "A birth registration awareness program will be held at Ward Office 7 on June 30. All parents are encouraged to attend.",
      contentNp:
        "जन्म दर्ता सचेतना कार्यक्रम वडा कार्यालय ७ मा जून ३० मा आयोजना हुनेछ। सबै अभिभावकहरूलाई उपस्थित हुन प्रोत्साहित गरिन्छ।",
    },
  ];

  const [selectedNotice, setSelectedNotice] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    { key: "All", label: t.filterAll || "All" },
    { key: "Tax", label: t.filterTax || "Tax" },
    { key: "Registration", label: t.filterRegistration || "Registration" },
  ];

  const visibleNotices =
    activeFilter === "All"
      ? notices
      : notices.filter((n) => n.category === activeFilter);

  const getTitle = (n) => (isNepali ? n.titleNp : n.title);
  const getWard = (n) => (isNepali ? n.wardNp : n.ward);
  const getCategory = (n) => (isNepali ? n.categoryNp : n.category);
  const getContent = (n) => (isNepali ? n.contentNp : n.content);

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
          <img
            src={logo}
            alt="Government of Nepal"
            className="w-16 h-16 object-contain"
          />
          <div>
            <p className="text-sm uppercase tracking-wider text-blue-100">
              {t.govOfNepal || "Government of Nepal"}
            </p>
            <h1 className="text-4xl font-bold">
              {t.noticeBoardTitle || "E-Ward Notice Board"}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="text-sm font-semibold text-slate-700">
            {t.filterNotices || "Filter Notices"}
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <span
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${
                  activeFilter === f.key
                    ? "bg-purple-50 text-purple-700 border-purple-100"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-4">
            {visibleNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="cursor-pointer bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm hover:border-purple-500 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                    {getCategory(notice)}
                  </span>
                  <span className="text-xs text-slate-400">{notice.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {getTitle(notice)}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  📍 {getWard(notice)}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {getContent(notice)}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200/80 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              {t.recentNoticesTitle || "Recent Notices"}
            </h2>
            <div className="space-y-3">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="bg-purple-900 hover:bg-purple-800 transition-colors text-white p-3.5 rounded-lg text-xs font-medium cursor-pointer shadow-sm"
                >
                  {getTitle(notice)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-[700px] max-w-full rounded-2xl shadow-2xl p-6 relative">
            <h2 className="text-2xl font-bold text-purple-900 mb-3">
              {getTitle(selectedNotice)}
            </h2>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p>
                <strong className="text-slate-800">
                  {t.noticeWardLabel || "Ward:"}
                </strong>{" "}
                {getWard(selectedNotice)}
              </p>
              <p>
                <strong className="text-slate-800">
                  {t.noticeCategoryLabel || "Category:"}
                </strong>{" "}
                {getCategory(selectedNotice)}
              </p>
              <p>
                <strong className="text-slate-800">
                  {t.noticePublishedLabel || "Published:"}
                </strong>{" "}
                {selectedNotice.date}
              </p>
            </div>

            <hr className="my-4 border-slate-100" />

            <p className="text-sm text-slate-700 leading-relaxed">
              {getContent(selectedNotice)}
            </p>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedNotice(null)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                {t.close || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticeBoard;