import React from "react";

function MigrationCertificateTable({ migration, onEdit, onDeleteRequest }) {
  if (!migration.length)
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        कुनै बसाईसराई दर्ता भेटिएन।
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-violet-50 text-violet-800 text-left">
            {[
              "#",
              "Migration Id",
              "Registration Ward Id",
              "Register Submitted By",
              "Register Status",

              "",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-semibold whitespace-nowrap border-b border-violet-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {migration.map((m, i) => (
            <tr
              key={i}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800">
                {m.migration_id}
              </td>
              <td className="px-3 py-2">{m.register_ward_id}</td>
              <td className="px-3 py-2">{m.register_submitted_by}</td>
              <td className="px-3 py-2">{m.register_status}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <button
                  onClick={() => onEdit(m)}
                  className="text-violet-600 hover:text-violet-800 text-xs font-medium transition-colors mr-3"
                >
                  View
                </button>
                {/* <button
                  onClick={() => onDeleteRequest(m)}
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

export default MigrationCertificateTable;
