import React, { useEffect, useState } from "react";
import API_URL from "../api/api";

function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/v1/users/applications`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        });
      })
      .then((data) => {
        setDocuments(data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching documents:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto my-12 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm font-sans">
      <h1 className="text-2xl font-extrabold text-blue-950 mb-1">
        मेरो कागजातहरू (My Documents)
      </h1>
      <p className="text-slate-500 text-xs mb-6">
        तपाईंले आवेदन दिनुभएको सबै प्रमाणपत्र तथा कागजातहरूको सूची।
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">तपाईंका आवेदनहरू लोड हुँदैछ...</p>
      ) : documents.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl">
          <p className="text-sm text-slate-500">
            तपाईंले हालसम्म कुनै पनि कागजातको लागि आवेदन दिनुभएको छैन।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-colors"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {doc.service_type || "जन्मदर्ता / सिफारिस प्रमाणपत्र"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  आवेदन मिति: {doc.created_at || "भर्खरै"}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                {doc.status || "Pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentsList;