import React from "react";

function CitizenTable({ citizen, onEdit, onDeleteRequest }) {
  if (!citizen.length)
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        कुनै नागरिक भेटिएन।
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-50 text-blue-800 text-left">
            {[
              "#",
              "Id",
              "Name",
              "Phone Number",
              "Citizenship Number",
              "Provience",
              "District",
              "Municipality",
              "Ward No",
              "Role",
              "Ward Id",
              "Status",

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
          {citizen.map((c, i) => (
            <tr
              key={i}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800">
                {c.user_id}
              </td>
              <td className="px-3 py-2">{c.user_name}</td>
              <td className="px-3 py-2">{c.user_phone_number}</td>
              <td className="px-3 py-2">{c.user_citizenship_number}</td>
              <td className="px-3 py-2">{c.user_provience}</td>
              <td className="px-3 py-2">{c.user_district}</td>
              <td className="px-3 py-2">{c.user_municipality}</td>
              <td className="px-3 py-2">{c.user_ward_number}</td>
              <td className="px-3 py-2">{c.user_role}</td>
              <td className="px-3 py-2">{c.ward_id}</td>
              <td className="px-3 py-2">{c.user_status}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <button
                  onClick={() => onEdit(c)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteRequest(c)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CitizenTable;
