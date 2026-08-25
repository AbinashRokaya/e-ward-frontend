import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";

// ── URL builder ──────────────────────────────────────────────────────────
// receipt.pdf_path / receipt.qr_path may be either:
//   1. A full Cloudinary secure_url — https://res.cloudinary.com/... —
//      what tax_receipt_service.py stores for every receipt issued after
//      the Cloudinary migration.
//   2. A legacy path relative to the backend's static/ mount, from before
//      that migration.
//
// FIX: this file previously built the receipt URL by unconditionally
// prefixing pdf_path with `${API_URL}/static/` — fine for case 2, but for
// case 1 it produced `https://<backend>/static/https://res.cloudinary.com/...`,
// which doesn't match any FastAPI route. That falls through to the
// backend's default 404 handler, returning the raw body
// {"detail":"Not Found"} — which is what the receipt <iframe> below was
// loading and Chrome was rendering with its native JSON viewer.
//
// Same fix as buildStaticUrl() in RecommendationPreview.jsx: use a full
// URL as-is, only prefix a genuinely relative legacy path.
function buildStaticUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/static/${path}`;
}

const STATUS_STYLES = {
  ASSESSED: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  DISPUTED: "bg-yellow-100 text-yellow-800",
};

export default function MyTaxDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  // Shown in the modal header while we're still waiting on the PDF for a
  // payment that just completed — distinct from "no receipt yet" states
  // elsewhere, since here the citizen is actively waiting on this screen.
  const [receiptLoading, setReceiptLoading] = useState(false);

  useEffect(() => {
    fetchAssessments();

    // The backend's /v1/tax/payments/khalti/verify redirect lands back
    // here with ?tax_payment=success|failed|verify_failed|not_found and,
    // on success, &payment_id=<uuid> for the payment that just completed.
    //
    // FIX: previously this only showed a toast on success and left the
    // citizen to scroll down and click "View Receipt" themselves once the
    // row updated. That's the opposite of how birth certificates work —
    // there, the PDF is handed back the moment it's issued. Now, if a
    // payment_id came back, we fetch that specific receipt and open the
    // same modal immediately, right after the payment result banner.
    const params = new URLSearchParams(window.location.search);
    const result = params.get("tax_payment");
    const paymentId = params.get("payment_id");

    if (result === "success") {
      toast.success("Payment successful — your assessment is now marked paid.");
      if (paymentId) {
        openReceiptForPayment(paymentId);
      }
    } else if (result === "failed") {
      toast.error(
        `Payment was not completed (${params.get("reason") || "unknown reason"}).`,
      );
    } else if (result === "verify_failed" || result === "not_found") {
      toast.error(
        "Could not confirm payment status — please check back or contact your ward office.",
      );
    }
    if (result) {
      params.delete("tax_payment");
      params.delete("reason");
      params.delete("payment_id");
      const cleanUrl =
        window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", cleanUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAssessments() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/tax/assessments/my`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.detail || "Failed to load tax assessments");
      setAssessments(json.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetches the just-completed payment's receipt and opens it right away.
  // The backend's GET /payments/{id}/receipt route also retries generation
  // on-demand if pdf_path is somehow still missing, so this stays reliable
  // even if PDF rendering was briefly slow.
  async function openReceiptForPayment(paymentId, attempt = 1) {
    setReceiptLoading(true);
    setViewingReceipt({}); // opens the modal immediately with a loading state
    try {
      const res = await fetch(
        `${API_URL}/v1/tax/payments/${paymentId}/receipt`,
        {
          credentials: "include",
        },
      );
      const json = await res.json();
      if (!res.ok) {
        // "Receipt not issued yet" — give it one short retry in case PDF
        // generation is still finishing, rather than failing outright.
        if (attempt < 3) {
          setTimeout(() => openReceiptForPayment(paymentId, attempt + 1), 1500);
          return;
        }
        throw new Error(json.detail || "Failed to load receipt");
      }
      setViewingReceipt(json.data);
      fetchAssessments(); // refresh so the list also reflects PAID + receipt_no
    } catch (e) {
      setViewingReceipt(null);
      toast.error(e.message);
    } finally {
      setReceiptLoading(false);
    }
  }

  async function handlePay(assessment) {
    setPayingId(assessment.id);
    try {
      const res = await fetch(`${API_URL}/v1/tax/payments/khalti/initiate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: assessment.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed to start payment");
      // Full-page redirect to Khalti's hosted checkout — this is not an
      // API call to poll, it's a real navigation away from the app.
      // Khalti sends the browser back to our backend's verify endpoint
      // when done, which then redirects here with ?tax_payment=...
      window.location.href = json.data.payment_url;
    } catch (e) {
      toast.error(e.message);
      setPayingId(null);
    }
  }

  async function submitDispute() {
    if (!disputeReason.trim()) return;
    try {
      const res = await fetch(
        `${API_URL}/v1/tax/assessments/${disputeTarget.id}/dispute`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: disputeReason }),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed to submit dispute");
      setDisputeTarget(null);
      setDisputeReason("");
      fetchAssessments();
    } catch (e) {
      toast.error(e.message);
    }
  }

  const totalDue = assessments
    .filter((a) => a.status !== "PAID")
    .reduce((sum, a) => sum + a.total_due, 0);

  // Built once from whatever's currently open in the modal — the single
  // place that has to know about the Cloudinary-vs-legacy distinction,
  // instead of every usage site (download link, iframe) building its own
  // string inline.
  const receiptPdfUrl = viewingReceipt
    ? buildStaticUrl(viewingReceipt.pdf_path)
    : null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Tax</h1>
      <p className="text-gray-500 mb-6">
        These figures are set by your ward's survey record. If something looks
        wrong, raise a dispute below.
      </p>

      {totalDue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <span className="text-sm text-red-700">Total outstanding</span>
          <div className="text-2xl font-bold text-red-800">
            Rs. {totalDue.toLocaleString()}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : assessments.length === 0 ? (
        <div className="text-gray-500">No tax assessments on file yet.</div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {a.tax_type.replace("_", " ")}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[a.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  FY {a.fiscal_year} · Due{" "}
                  {new Date(a.due_date).toLocaleDateString()}
                </div>
                {a.penalty_amount > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    Includes Rs. {a.penalty_amount.toLocaleString()} late
                    penalty
                  </div>
                )}
                {a.status === "PAID" && a.receipt?.receipt_no && (
                  <div className="text-xs text-gray-400 mt-1">
                    Receipt {a.receipt.receipt_no}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  Rs. {a.total_due.toLocaleString()}
                </div>

                {a.status === "PAID" && (
                  <div className="mt-2">
                    {a.receipt?.pdf_path ? (
                      <button
                        onClick={() => setViewingReceipt(a.receipt)}
                        className="inline-flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700"
                      >
                        🧾 View Receipt
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Receipt is being generated…
                      </span>
                    )}
                  </div>
                )}

                {a.status !== "PAID" && a.status !== "DISPUTED" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handlePay(a)}
                      disabled={payingId === a.id}
                      className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {payingId === a.id
                        ? "Redirecting to Khalti..."
                        : "Pay with Khalti"}
                    </button>
                    <button
                      onClick={() => setDisputeTarget(a)}
                      className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50"
                    >
                      Dispute
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {disputeTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="font-semibold text-lg mb-2">
              Dispute this assessment
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Tell us what's wrong (e.g. wrong area, wrong property type) — an
              officer will review the survey record.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm mb-4"
              rows={4}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Describe the issue..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDisputeTarget(null)}
                className="px-3 py-1.5 text-sm text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={submitDispute}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt modal — opens automatically right after a Khalti payment
          completes (via openReceiptForPayment above), or manually when the
          citizen clicks "View Receipt" on an older paid assessment. */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-md shadow-lg max-w-3xl w-full h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <div>
                <div className="font-semibold text-gray-900">Tax Receipt</div>
                <div className="text-xs text-gray-500">
                  {receiptLoading
                    ? "Generating your receipt…"
                    : viewingReceipt.receipt_no}
                </div>
              </div>
              <div className="flex gap-3">
                {receiptPdfUrl && (
                  <a
                    href={receiptPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    ⬇ Download PDF
                  </a>
                )}
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            {receiptPdfUrl ? (
              <iframe
                src={receiptPdfUrl}
                title="Tax Receipt"
                className="flex-1 w-full"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
                {receiptLoading
                  ? "Payment confirmed — preparing your receipt PDF…"
                  : "Receipt not available yet."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
