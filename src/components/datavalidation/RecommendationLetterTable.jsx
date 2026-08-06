import React from "react";

function RecommendationLetterTable({
  recommendation,
  onEdit,
  onDeleteRequest,
}) {
  if (!recommendation.length)
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        कुनै सिफारिस निवेदन भेटिएन।
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-amber-50 text-amber-800 text-left">
            {[
              "#",
              "Letter Id",
              "Ward Id",
              "Applicant Name",
              "Letter Type",
              "Register Status",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-semibold whitespace-nowrap border-b border-amber-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recommendation.map((r, i) => (
            <tr
              key={i}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800">
                {r.letter_id}
              </td>
              <td className="px-3 py-2">{r.register_ward_id}</td>
              <td className="px-3 py-2">
                {r.applicant_full_name_np || r.applicant_full_name_en || "—"}
              </td>
              <td className="px-3 py-2">
                {r.letter_type === "OTHER"
                  ? r.letter_type_other || "अन्य"
                  : r.letter_type}
              </td>
              <td className="px-3 py-2">{r.register_status}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <button
                  onClick={() => onEdit(r)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors mr-3"
                >
                  View
                </button>
                {/* <button
                  onClick={() => onDeleteRequest(r)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                >
                  Remove
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecommendationLetterTable;
