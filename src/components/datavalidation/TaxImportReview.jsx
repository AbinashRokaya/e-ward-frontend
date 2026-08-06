import { useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";

const MATCH_STYLES = {
  MATCHED: "bg-green-100 text-green-800",
  NOT_REGISTERED: "bg-red-100 text-red-800",
  WARD_MISMATCH: "bg-red-100 text-red-800",
  DUPLICATE_IN_BATCH: "bg-orange-100 text-orange-800",
  INVALID_DATA: "bg-red-100 text-red-800",
};

function TaxImportReview() {
  const [taxType, setTaxType] = useState("PROPERTY");
  const [file, setFile] = useState(null);
  const [batch, setBatch] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      // NOTE: no ward_id field — the backend derives it from the logged-in
      // DVO's own ward (current_user.user_ward_id), never from client input.
      formData.append("tax_type", taxType);
      formData.append("file", file);

      const res = await fetch(`${API_URL}/v1/tax/imports`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw json;
      setBatch(json.data);
      toast.success(
        `${json.data.rows.length} rows parsed — review before committing`,
      );
    } catch (err) {
      toast.error(err?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function refreshBatch() {
    const res = await fetch(`${API_URL}/v1/tax/imports/${batch.id}`, {
      credentials: "include",
    });
    const json = await res.json();
    if (res.ok) setBatch(json.data);
  }

  async function updateRow(rowId, patch) {
    try {
      const res = await fetch(`${API_URL}/v1/tax/imports/rows/${rowId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw json;
      refreshBatch();
    } catch (err) {
      toast.error(err?.detail || "Failed to update row");
    }
  }

  async function handleApproveAll() {
    try {
      const res = await fetch(
        `${API_URL}/v1/tax/imports/${batch.id}/approve-all`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const json = await res.json();
      if (!res.ok) throw json;
      setBatch(json.data);
      toast.success(json.message);
    } catch (err) {
      toast.error(err?.detail || "Bulk approve failed");
    }
  }

  async function handleCommit() {
    try {
      const res = await fetch(`${API_URL}/v1/tax/imports/${batch.id}/commit`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw json;
      setBatch(json.data);
      toast.success("Batch committed — approved rows are now live tax records");
    } catch (err) {
      toast.error(err?.detail || "Commit failed");
    }
  }

  const pendingCount =
    batch?.rows.filter((r) => r.status === "PENDING").length ?? 0;
  const matchedPendingCount =
    batch?.rows.filter(
      (r) => r.status === "PENDING" && r.match_status === "MATCHED",
    ).length ?? 0;

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4 space-y-4">
      <p className="text-sm text-slate-500">
        Upload the survey team's Excel sheet for your ward. Rows are matched to
        citizens by phone number — nothing becomes a live tax record until you
        review and commit.
      </p>

      {!batch && (
        <form
          onSubmit={handleUpload}
          className="border border-slate-200 rounded-lg p-4 space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tax type
            </label>
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="PROPERTY">Property</option>
              <option value="BUSINESS">Business</option>
              <option value="HOUSE_RENT">House Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Survey Excel file (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload & parse"}
          </button>
        </form>
      )}

      {batch && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-600">
              {batch.filename} · {batch.rows.length} rows · {pendingCount}{" "}
              awaiting review
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setBatch(null)}
                className="text-sm border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50"
              >
                Upload another file
              </button>
              {matchedPendingCount > 0 && (
                <button
                  onClick={handleApproveAll}
                  className="text-sm bg-emerald-100 text-emerald-800 px-4 py-2 rounded-md hover:bg-emerald-200 font-medium"
                >
                  Approve All Matched ({matchedPendingCount})
                </button>
              )}
              <button
                onClick={handleCommit}
                disabled={pendingCount > 0 || batch.status === "COMMITTED"}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {batch.status === "COMMITTED" ? "Committed" : "Commit batch"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {batch.rows.map((row) => (
              <div
                key={row.id}
                className="border border-slate-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Row {row.row_number}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${MATCH_STYLES[row.match_status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {row.match_status.replace(/_/g, " ")}
                    </span>
                    {row.import_action && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">
                        {row.import_action}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{row.status}</span>
                </div>

                {row.error_message && (
                  <div className="text-xs text-red-600 mb-2">
                    {row.error_message}
                  </div>
                )}

                {row.matched_citizen_name && (
                  <div className="text-sm text-slate-800 font-medium mb-1">
                    👤 {row.matched_citizen_name}
                    <span className="text-xs text-slate-400 font-normal ml-2">
                      (registered name — not from the Excel file)
                    </span>
                  </div>
                )}

                <div className="text-sm text-slate-700 grid grid-cols-3 gap-2 mb-2">
                  {Object.entries(row.raw_data)
                    .slice(0, 6)
                    .map(([k, v]) => (
                      <div key={k}>
                        <span className="text-slate-400">{k}: </span>
                        {String(v ?? "")}
                      </div>
                    ))}
                </div>

                {(row.match_status === "NOT_REGISTERED" ||
                  row.match_status === "WARD_MISMATCH") && (
                  <input
                    type="text"
                    placeholder="Correct phone number"
                    className="border border-slate-300 rounded-md px-2 py-1 text-sm mr-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        updateRow(row.id, { phone_number: e.target.value });
                    }}
                  />
                )}

                {row.status === "PENDING" && row.match_status === "MATCHED" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateRow(row.id, { status: "APPROVED" })}
                      className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-md"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateRow(row.id, { status: "REJECTED" })}
                      className="text-xs border border-slate-300 text-slate-700 px-2.5 py-1 rounded-md"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaxImportReview;
