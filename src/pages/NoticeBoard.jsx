import React, { useEffect, useState } from "react";
import logo from "../assets/nepal-sarkar.png";
import { useLanguage } from "../context/LanguageContext";
import { wardApi, noticeApi } from "../api/endpoints";
import { notify } from "../utils/notify";

// Backend NoticeType enum. Only the types actually in use are offered as
// filters — the rest still display correctly if a notice uses them.
const FILTERS = [
  { key: "ALL", ne: "सबै", en: "All" },
  { key: "PUBLIC", ne: "सार्वजनिक", en: "Public" },
  { key: "TAX", ne: "कर", en: "Tax" },
  { key: "MEETING", ne: "बैठक", en: "Meeting" },
  { key: "HEALTH", ne: "स्वास्थ्य", en: "Health" },
  { key: "EVENT", ne: "कार्यक्रम", en: "Event" },
];

const TYPE_LABELS_NE = {
  PUBLIC: "सार्वजनिक",
  TENDER: "टेन्डर",
  VACANCY: "रिक्त पद",
  TAX: "कर",
  MEETING: "बैठक",
  HEALTH: "स्वास्थ्य",
  EDUCATION: "शिक्षा",
  DISASTER: "विपद्",
  EVENT: "कार्यक्रम",
  OTHER: "अन्य",
};

function extractList(payload) {
  const data = payload?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  return Object.values(data).find((v) => Array.isArray(v)) || [];
}

function NoticeBoard() {
  const languageContext = useLanguage() || {};

  const language = languageContext.language || "ne";
  const t = languageContext.t || {};
  const isNepali = language === "ne";

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");

        let wardId = null;

        try {
          const savedUser = JSON.parse(
            localStorage.getItem("user") || "null"
          );

          wardId = savedUser?.user_ward_id || null;
        } catch {
          wardId = null;
        }

        if (!wardId) {
          const wardsRes = await wardApi.getAll();

          const wardList =
            wardsRes?.data?.ward_list ?? wardsRes?.data ?? [];

          wardId = wardList[0]?.ward_id || null;
        }

        if (!wardId) {
          if (!cancelled) {
            setNotices([]);
          }

          return;
        }

        const res = await noticeApi.getAllForWard(wardId, {
          notice_status: "PUBLISHED",
        });

        if (!cancelled) {
          setNotices(extractList(res));
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        setLoadError(
          isNepali
            ? "सूचनाहरू लोड गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।"
            : "Could not load notices. Please try again."
        );

        notify.loadFailed("notices", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleNotices =
    activeFilter === "ALL"
      ? notices
      : notices.filter((n) => n.notice_type === activeFilter);

  const typeLabel = (type) =>
    isNepali ? TYPE_LABELS_NE[type] || type : type;

  const formatDate = (iso) => {
    if (!iso) {
      return "—";
    }

    const d = new Date(iso);

    return Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString();
  };

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
            <p className="text-sm uppercase tracking-wider text-purple-100">
              {t.govOfNepal ||
                (isNepali ? "नेपाल सरकार" : "Government of Nepal")}
            </p>

            <h1 className="text-4xl font-bold">
              {t.noticeBoardTitle ||
                (isNepali
                  ? "ई-वडा सूचना पाटी"
                  : "E-Ward Notice Board")}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="text-sm font-semibold text-slate-700">
            {t.filterNotices ||
              (isNepali
                ? "सूचना फिल्टर गर्नुहोस्"
                : "Filter Notices")}
          </div>

          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${
                  activeFilter === f.key
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {isNepali ? f.ne : f.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500 text-center py-8">
                {isNepali
                  ? "सूचनाहरू लोड हुँदैछ…"
                  : "Loading notices…"}
              </p>
            ) : loadError ? (
              <div className="text-center py-8 px-4 border border-dashed border-red-200 bg-red-50/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl mb-3 mx-auto">
                  ⚠️
                </div>

                <p className="text-sm text-red-700">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 text-xs font-semibold text-red-700 underline cursor-pointer"
                >
                  {isNepali ? "पुनः प्रयास" : "Retry"}
                </button>
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white border border-dashed border-slate-300 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3 mx-auto">
                  📭
                </div>

                <p className="text-sm text-slate-600">
                  {isNepali
                    ? "हाल कुनै सूचना प्रकाशित गरिएको छैन।"
                    : "No notices published yet."}
                </p>
              </div>
            ) : visibleNotices.length === 0 ? (
              <div className="text-center py-8 px-4 bg-white border border-dashed border-slate-300 rounded-xl">
                <p className="text-sm text-slate-600">
                  {isNepali
                    ? "यो श्रेणीमा कुनै सूचना छैन।"
                    : "No notices in this category."}
                </p>

                <button
                  type="button"
                  onClick={() => setActiveFilter("ALL")}
                  className="mt-2 text-xs font-semibold text-purple-700 underline cursor-pointer"
                >
                  {isNepali ? "सबै हेर्नुहोस्" : "Show all"}
                </button>
              </div>
            ) : (
              visibleNotices.map((notice) => (
                <div
                  key={notice.notice_id}
                  onClick={() => setSelectedNotice(notice)}
                  className="cursor-pointer bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm hover:border-purple-500 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                      {typeLabel(notice.notice_type)}
                    </span>

                    <span className="text-xs text-slate-400">
                      {formatDate(notice.created_at)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    {notice.notice_title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {notice.notice_description}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200/80 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              {t.recentNoticesTitle ||
                (isNepali
                  ? "हालका सूचनाहरू"
                  : "Recent Notices")}
            </h2>

            {notices.length === 0 ? (
              <p className="text-sm text-slate-400">
                {isNepali ? "केही छैन।" : "Nothing yet."}
              </p>
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 5).map((notice) => (
                  <div
                    key={notice.notice_id}
                    onClick={() => setSelectedNotice(notice)}
                    className="bg-purple-900 hover:bg-purple-800 transition-colors text-white p-3.5 rounded-lg text-xs font-medium cursor-pointer shadow-sm"
                  >
                    {notice.notice_title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notice Details Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-[700px] max-w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative">
            <h2 className="text-2xl font-bold text-purple-900 mb-3">
              {selectedNotice.notice_title}
            </h2>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p>
                <strong className="text-slate-800">
                  {t.noticeCategoryLabel ||
                    (isNepali ? "श्रेणी:" : "Category:")}
                </strong>{" "}
                {typeLabel(selectedNotice.notice_type)}
              </p>

              <p>
                <strong className="text-slate-800">
                  {t.noticePublishedLabel ||
                    (isNepali
                      ? "प्रकाशित मिति:"
                      : "Published:")}
                </strong>{" "}
                {formatDate(selectedNotice.created_at)}
              </p>
            </div>

            <hr className="my-4 border-slate-100" />

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {selectedNotice.notice_description}
            </p>

            {/* Attachment */}
            {selectedNotice.notice_attachment_path && (
              <a
                href={selectedNotice.notice_attachment_path}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2 font-medium"
              >
                📎{" "}
                {isNepali
                  ? "संलग्न कागजात"
                  : "Attachment"}
              </a>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                {t.close ||
                  (isNepali
                    ? "बन्द गर्नुहोस्"
                    : "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticeBoard;