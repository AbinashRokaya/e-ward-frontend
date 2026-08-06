import React from "react";

function WardTable({ officers, onEdit, onDeleteRequest, wards }) {
  if (!wards.length)
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        कुनै वडा भेटिएन। माथि थप्नुहोस्।
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-50 text-blue-800 text-left">
            {[
              "#",
              "Ward Name",
              "No.",
              "Municipality",
              "District",
              "Province",
              "Contact",
              "Email",
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
          {wards.map((w, i) => (
            <tr
              key={w.ward_id}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800">
                {w.ward_name}
              </td>
              <td className="px-3 py-2">{w.ward_no}</td>
              <td className="px-3 py-2">{w.ward_municipality}</td>
              <td className="px-3 py-2">{w.ward_district}</td>
              <td className="px-3 py-2">{w.ward_province}</td>
              <td className="px-3 py-2">{w.ward_contact_number}</td>
              <td className="px-3 py-2 text-blue-600 truncate max-w-[140px]">
                {w.ward_email}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <button
                  onClick={() => onEdit(w)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteRequest(w)}
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

export default WardTable;
