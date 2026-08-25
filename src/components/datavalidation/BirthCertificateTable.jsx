import React from "react";

function getRejectReason(birth) {
  return (
    birth?.reject?.reject_text ||
    birth?.reject_text ||
    birth?.rejection_reason ||
    birth?.reject_reason ||
    birth?.rejection?.reject_text ||
    birth?.rejection?.reason ||
    ""
  );
}

function BirthCertificateTable({
  birth,
  onEdit,
  onDeleteRequest,
}) {
  if (!birth.length) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        कुनै जन्म दर्ता भेटिएन।
      </p>
    );
  }

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
              "Rejection Reason",
              "",
            ].map((h, index) => (
              <th
                key={`${h}-${index}`}
                className="px-3 py-2 font-semibold whitespace-nowrap border-b border-blue-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {birth.map((b, i) => {
            const rejectReason = getRejectReason(b);

            const status = String(
              b?.register_status || "",
            ).toUpperCase();

            const isRejected =
              status === "REJECTED" ||
              status === "REJECT";

            return (
              <tr
                key={
                  b?.registration_id ||
                  b?.register_id ||
                  i
                }
                className="hover:bg-gray-50 transition-colors border-b border-gray-100"
              >

                <td className="px-3 py-2 text-gray-400">
                  {i + 1}
                </td>

                <td className="px-3 py-2 font-medium text-gray-800">
                  {b.registration_id || "—"}
                </td>

                <td className="px-3 py-2">
                  {b.register_ward_id || "—"}
                </td>

                <td className="px-3 py-2">
                  {b.register_submitted_by || "—"}
                </td>

                {/* Status */}
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      isRejected
                        ? "bg-red-50 text-red-700 border-red-200"
                        : status === "APPROVED"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {b.register_status || "—"}
                  </span>
                </td>

                {/* Rejection Reason */}
                <td className="px-3 py-2 max-w-xs">
                  {rejectReason ? (
                    <div
                      className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-2 py-1"
                      title={rejectReason}
                    >
                      {rejectReason}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">
                      —
                    </span>
                  )}
                </td>

                {/* Action */}
                <td className="px-3 py-2 whitespace-nowrap">

                  <button
                    type="button"
                    onClick={() => onEdit(b)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors mr-3"
                  >
                    View
                  </button>

                  {/*
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(b)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                  >
                    Remove
                  </button>
                  */}

                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default BirthCertificateTable;