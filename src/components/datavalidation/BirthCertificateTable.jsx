import React from "react";

function BirthCertificateTable({ birth, onEdit, onDeleteRequest }) {
  if (!birth.length)
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        कुनै जन्म दर्ता भेटिएन।
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-50 text-blue-800 text-left">
            {[
              "#",
              "Registration Id",
              "Registration Ward Id",
              "Register Submitted By",
              "Register Status",

              "",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-semibold whitespace-nowrap border-b border-blue-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {birth.map((b, i) => (
            <tr
              key={i}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800">
                {b.registration_id}
              </td>
              <td className="px-3 py-2">{b.register_ward_id}</td>
              <td className="px-3 py-2">{b.register_submitted_by}</td>
              <td className="px-3 py-2">{b.register_status}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <button
                  onClick={() => onEdit(b)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors mr-3"
                >
                  View
                </button>
                {/* <button
                  onClick={() => onDeleteRequest(b)}
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

export default BirthCertificateTable;
