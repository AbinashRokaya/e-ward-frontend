import { useState } from "react";
import NoticeCard from "../components/notice/NoticeCard";
import NoticeFilters from "../components/notice/NoticeFilters";
import logo from "../assets/nepal-sarkar.png";

function NoticeBoard() {
  const notices = [
    {
      id: 1,
      title: "Ward 5 Tax Collection Notice",
      ward: "Ward 5",
      category: "Tax",
      date: "2026-06-21",
       content:
      "Tax collection for Ward 5 will begin from July 1. All citizens are requested to bring their citizenship card and previous tax receipts."
    },
    {
      id: 2,
      title: "Birth Registration Awareness Program",
      ward: "Ward 7",
      category: "Registration",
      date: "2026-06-20",
       content:
      "A birth registration awareness program will be held at Ward Office 7 on June 30. All parents are encouraged to attend."
    },
  ];
  const [selectedNotice, setSelectedNotice] = useState(null);

  return (
    <div className="min-h-screen bg-slate-100">

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
        Government of Nepal
      </p>

      <h1 className="text-4xl font-bold">
        E-Ward Notice Board
      </h1>
    </div>

  </div>
</div>
     

      <div className="max-w-7xl mx-auto p-6">

        <NoticeFilters />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          <div className="lg:col-span-2 space-y-6">

       {notices.map((notice) => (
  <div
    key={notice.id}
    onClick={() => setSelectedNotice(notice)}
    className="cursor-pointer"
  >
    <NoticeCard notice={notice} />
  </div>
))}

          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">

            <h2 className="text-2xl font-semibold mb-4">
              Recent Notices
            </h2>

            <div className="space-y-3">

              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-blue-500 text-white p-4 rounded-lg"
                >
                  {notice.title}
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>
      {selectedNotice && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-[700px] max-w-[90%] rounded-xl shadow-xl p-6">

      <h2 className="text-3xl font-bold text-purple-700 mb-4">
        {selectedNotice.title}
      </h2>

      <div className="space-y-2 text-gray-700">
        <p>
          <strong>Ward:</strong> {selectedNotice.ward}
        </p>

        <p>
          <strong>Category:</strong> {selectedNotice.category}
        </p>

        <p>
          <strong>Published:</strong> {selectedNotice.date}
        </p>
      </div>

      <hr className="my-4" />

      <p className="leading-relaxed">
        {selectedNotice.content}
      </p>

      <div className="flex justify-end mt-6">
        <button
          onClick={() => setSelectedNotice(null)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}

    </div>
  );
}

export default NoticeBoard;