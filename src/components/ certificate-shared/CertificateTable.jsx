function StatusBadge({ status, issuedStatus }) {
  const normalized = String(status || "").toUpperCase();
  let classes = "bg-slate-100 text-slate-600";
  if (normalized === issuedStatus) classes = "bg-green-100 text-green-700";
  else if (normalized === "REJECTED") classes = "bg-red-100 text-red-700";
  else classes = "bg-amber-100 text-amber-700";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes}`}>
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

function CertificateTable({
  records,
  config,
  onView,
  onEdit,
  onDeleteRequest,
}) {
  if (!records.length) {
    return (
      <div className="text-center text-slate-400 py-12 text-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const status = String(
              record[config.statusField] || "",
            ).toUpperCase();
            const isRejected = status === "REJECTED";
            // Different certificate types use different PK field names
            // (registration_id, migration_id, letter_id, ...) — config.getId
            // already knows which one applies, so use it here too instead
            // of a hardcoded field name that only exists on birth records.
            const recordId = config.getId(record);

            return (
              <tr
                key={recordId}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="py-3 pr-4">{config.getDisplayName(record)}</td>
                <td className="py-3 pr-4">
                  <StatusBadge
                    status={status}
                    issuedStatus={config.issuedStatus}
                  />
                </td>
                <td className="py-3 pr-4 text-right space-x-3">
                  {isRejected ? (
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="text-amber-700 hover:text-amber-900 font-medium cursor-pointer"
                    >
                      Edit & Resubmit
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onView(record)}
                      className="text-blue-900 hover:text-blue-950 font-medium cursor-pointer"
                    >
                      View
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(record)}
                    className="text-slate-400 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CertificateTable;
