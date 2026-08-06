import React, { useState } from "react";

const OFFICER_ROLES = [
  { value: "wardchairperson", label: "Ward Chairperson", labelNp: "वडाध्यक्ष" },
  { value: "wardsecretary", label: "Ward Secretary", labelNp: "वडा सचिव" },
  {
    value: "datavalidationofficer",
    label: "Data Validation Officer",
    labelNp: "डेटा अधिकृत",
  },
];
const ROLE_COLOR = {
  wardchairperson: "bg-purple-100 text-purple-700",
  wardsecretary: "bg-blue-100 text-blue-700",
  datavalidationofficer: "bg-green-100 text-green-700",
};

function RoleBadge({ role }) {
  const found = OFFICER_ROLES.find((r) => r.value === role);
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[role] ?? "bg-gray-100 text-gray-600"}`}
    >
      {found?.label ?? role}
    </span>
  );
}
function OfficerTable({ officers, onEdit, onDeleteRequest, wards }) {
  const [roleFilter, setRoleFilter] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = officers.filter((o) => {
    const matchRole = !roleFilter || o.user_role === roleFilter;
    const matchWard = !wardFilter || String(o.user_ward_number) === wardFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.user_name.toLowerCase().includes(q) ||
      o.user_municipality.toLowerCase().includes(q);
    return matchRole && matchWard && matchSearch;
  });

  return (
    <div>
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          सबै अधिकृतहरू (All Officers)
        </h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम वा नगरपालिका खोज्नुहोस्…"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            {OFFICER_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
          >
            <option value="">All Wards</option>
            {wards.map((w) => (
              <option key={w.ward_id} value={String(w.ward_no)}>
                Ward {w.ward_no} – {w.ward_municipality}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        {!filtered.length ? (
          <p className="text-gray-400 text-sm text-center py-8">
            कुनै अधिकृत भेटिएन।
          </p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800 text-left">
                {[
                  "#",
                  "Username",
                  "Role",
                  "Ward No.",
                  "Municipality",
                  "District",
                  "Province",
                  "Phone",
                  "Citizenship",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 font-semibold whitespace-nowrap border-b border-indigo-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr
                  key={o.user_id}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {o.user_name}
                  </td>
                  <td className="px-3 py-2">
                    <RoleBadge role={o.user_role} />
                  </td>
                  <td className="px-3 py-2">Ward {o.user_ward_number}</td>
                  <td className="px-3 py-2">{o.user_municipality}</td>
                  <td className="px-3 py-2">{o.user_district}</td>
                  <td className="px-3 py-2">{o.user_province}</td>
                  <td className="px-3 py-2">{o.user_phone_number}</td>
                  <td className="px-3 py-2">{o.user_citizenship_number}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      onClick={() => onEdit(o)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteRequest(o)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OfficerTable;
