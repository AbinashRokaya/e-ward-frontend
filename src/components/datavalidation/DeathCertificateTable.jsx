import React from "react";

function DeathCertificateTable({ death, onEdit, onDeleteRequest }) {
  if (!death.length)
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        कुनै मृत्यु दर्ता भेटिएन।
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-red-50 text-red-800 text-left">
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
                className="px-3 py-2 font-semibold whitespace-nowrap border-b border-red-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {death.map((d, i) => (
            <tr
              key={i}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800">
                {d.registration_id}
              </td>
              <td className="px-3 py-2">{d.register_ward_id}</td>
              <td className="px-3 py-2">{d.register_submitted_by}</td>
              <td className="px-3 py-2">{d.register_status}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <button
                  onClick={() => onEdit(d)}
                  className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors mr-3"
                >
                  View
                </button>
                {/* <button
                  onClick={() => onDeleteRequest(d)}
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

export default DeathCertificateTable;
