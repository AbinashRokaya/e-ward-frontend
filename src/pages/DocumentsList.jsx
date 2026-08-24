import React, { useEffect, useState } from "react";
import API_URL from "../api/api";

// There is no single "all my applications" endpoint on the backend — each
// module exposes its own citizen-scoped list. Fetch all five in parallel and
// merge. A module that fails (or has no records) contributes nothing rather
// than breaking the page.
const SOURCES = [
  {
    path: "/v1/citizen/birth/all",
    label: "जन्म दर्ता (Birth Registration)",
    idKey: "register_id",
    statusKey: "register_status",
  },
  {
    path: "/v1/death-registration/",
    label: "मृत्यु दर्ता (Death Registration)",
    idKey: "register_id",
    statusKey: "register_status",
  },
  {
    path: "/v1/migration-registration/",
    label: "बसाइँसराइ दर्ता (Migration Registration)",
    idKey: "migration_id",
    statusKey: "migration_status",
  },
  {
    path: "/v1/recommendation-letter/",
    label: "सिफारिस पत्र (Recommendation Letter)",
    idKey: "letter_id",
    statusKey: "letter_status",
  },
  {
    path: "/v1/complaint/",
    label: "गुनासो (Complaint)",
    idKey: "complaint_id",
    statusKey: "complaint_status",
  },
];

// Response envelopes differ slightly per module — some return data as an
// array, others wrap it in a named list key. Pull whichever shape came back.
function extractList(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return firstArray || [];
}

function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      SOURCES.map((source) =>
        fetch(`${API_URL}${source.path}`, {
          method: "GET",
          credentials: "include",
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((payload) =>
            extractList(payload).map((record) => ({
              id: record[source.idKey],
              service_type: source.label,
              status: record[source.statusKey],
              created_at: record.created_at,
            })),
          )
          .catch((err) => {
            console.error(`Failed to load ${source.path}:`, err);
            return [];
          }),
      ),
    )
      .then((groups) => {
        if (cancelled) return;
        const merged = groups.flat().sort((a, b) => {
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setDocuments(merged);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching documents:", err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
              key={doc.id || index}
              className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-colors"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {doc.service_type}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  आवेदन मिति:{" "}
                  {doc.created_at
                    ? new Date(doc.created_at).toLocaleDateString()
                    : "भर्खरै"}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                {doc.status?.replace(/_/g, " ") || "Pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentsList;