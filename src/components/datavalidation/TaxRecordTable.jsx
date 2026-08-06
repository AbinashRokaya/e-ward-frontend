function TaxRecordTable({ records, columns, onEdit }) {
  if (!records.length) {
    return (
      <p className="text-sm text-slate-400 py-6 text-center">
        No records yet — use "+ Add Record" or "Import Excel" above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            {columns.map((col) => (
              <th key={col.key} className="py-2 pr-4 font-medium">
                {col.label}
              </th>
            ))}
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr
              key={r.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              {columns.map((col) => (
                <td key={col.key} className="py-2 pr-4 text-slate-700">
                  {col.render ? col.render(r) : (r[col.key] ?? "—")}
                </td>
              ))}
              <td className="py-2 pr-4">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === "DISPUTED"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="py-2 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(r)}
                  className="text-emerald-600 hover:text-emerald-800 text-xs font-medium cursor-pointer"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TaxRecordTable;
