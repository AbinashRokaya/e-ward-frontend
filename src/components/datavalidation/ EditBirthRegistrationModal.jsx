import React, { useState } from "react";
import logo from "../../assets/nepal-sarkar.png";
import Preview from "../Preview";
import API_URL from "../../api/api";
import { notify } from "../../utils/notify";
import { useLanguage } from "../../context/LanguageContext";

function EditBirthRegistrationModal({ birth, onClose, onSaved }) {
  const { language } = useLanguage() || {};
  const isNepali = language !== "en";

  const [formData, setFormData] = useState({ ...birth });
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Get rejection reason
  // -------------------------------------------------------------------------

  const getRejectReason = (data) => {
    if (!data) return "";

    return (
      data?.reject?.reject_text ||
      data?.reject_text ||
      data?.rejection_reason ||
      data?.reject_reason ||
      data?.rejection?.reject_text ||
      data?.rejection?.reason ||
      ""
    );
  };

  const existingRejectReason = getRejectReason(formData);

  const [rejectText, setRejectText] = useState(existingRejectReason);

  // -------------------------------------------------------------------------
  // Get verifier information
  // -------------------------------------------------------------------------
  // Backend field names can differ. We check several possible names.
  //
  // Validation Officer
  // Secretary
  // Chairman
  // -------------------------------------------------------------------------

  const getVerifier = (...values) => {
    for (const value of values) {
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return null;
  };

  const validationOfficer = getVerifier(
    formData?.validation_officer_name,
    formData?.validation_officer,
    formData?.validated_by,
    formData?.verified_by_validation_officer,
    formData?.validation_verified_by,
    formData?.operator_name,
    formData?.approved_by,
  );

  const secretary = getVerifier(
    formData?.secretary_name,
    formData?.ward_secretary_name,
    formData?.secretary,
    formData?.verified_by_secretary,
    formData?.secretary_verified_by,
    formData?.forwarded_by_secretary,
  );

  const chairman = getVerifier(
    formData?.chairman_name,
    formData?.ward_chairman_name,
    formData?.chairman,
    formData?.verified_by_chairman,
    formData?.chairman_verified_by,
    formData?.approved_by_chairman,
  );

  // -------------------------------------------------------------------------
  // Status
  // -------------------------------------------------------------------------

  const status = String(
    formData?.register_status ||
      formData?.registration_status ||
      "",
  ).toUpperCase();

  const isRejected =
    status === "REJECTED" ||
    status === "REJECT";

  // -------------------------------------------------------------------------
  // Determine current approval stage
  // -------------------------------------------------------------------------

  const getStageIndex = () => {
    switch (status) {
      case "SUBMITTED":
      case "PENDING":
      case "PENDING_VALIDATION":
        return 0;

      case "APPROVED":
      case "VALIDATED":
      case "VALIDATION_APPROVED":
      case "VERIFIED_BY_VALIDATION_OFFICER":
        return 1;

      case "VERIFIED":
      case "SECRETARY_VERIFIED":
      case "VERIFIED_BY_SECRETARY":
        return 2;

      case "FORWARDED_TO_CHAIRPERSON":
      case "CHAIRPERSON_VERIFIED":
      case "VERIFIED_BY_CHAIRMAN":
        return 3;

      case "CERTIFICATE_ISSUED":
      case "COMPLETED":
      case "FINAL_APPROVED":
        return 4;

      default:
        return -1;
    }
  };

  const currentStage = getStageIndex();

  // -------------------------------------------------------------------------
  // Reject reason change
  // -------------------------------------------------------------------------

  const handleRejectChange = (value) => {
    setRejectText(value);

    setFormData((prev) => ({
      ...prev,
      reject: {
        ...(prev.reject || {}),
        reject_text: value,
      },
    }));
  };

  // -------------------------------------------------------------------------
  // Approve / Verify by Data Validation Officer
  // -------------------------------------------------------------------------

  const handleApproved = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/v1/birth-registration/${formData.registration_id}/approve`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw data || new Error("Approval failed");
      }

      notify.success(
        isNepali
          ? "जन्म दर्ता डाटा प्रमाणीकरण अधिकृतद्वारा प्रमाणित गरियो।"
          : "Birth registration verified by Data Validation Officer.",
      );

      if (onSaved) {
        onSaved(data?.data || data);
      }

      onClose();
    } catch (error) {
      console.error("Approve failed:", error);

      notify.apiError(
        error,
        isNepali
          ? "जन्म दर्ता प्रमाणित गर्न असफल भयो।"
          : "Failed to verify birth registration.",
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Reject
  // -------------------------------------------------------------------------

  const handleRejected = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!rejectText.trim()) {
      notify.error(
        isNepali
          ? "कृपया अस्वीकृतिको कारण लेख्नुहोस्।"
          : "Please provide a reason for rejection.",
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/v1/birth-registration/${formData.registration_id}/reject`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reject_text: rejectText.trim(),
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw data || new Error("Rejection failed");
      }

      notify.success(
        isNepali
          ? "जन्म दर्ता अस्वीकृत गरियो।"
          : "Birth registration rejected successfully!",
      );

      if (onSaved) {
        onSaved(data?.data || data);
      }

      onClose();
    } catch (error) {
      console.error("Reject failed:", error);

      notify.apiError(
        error,
        isNepali
          ? "जन्म दर्ता अस्वीकृत गर्न असफल भयो।"
          : "Failed to reject birth registration.",
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Approval Stage Component
  // -------------------------------------------------------------------------

  const ApprovalStage = ({
    number,
    titleNe,
    titleEn,
    person,
    stageIndex,
    icon,
  }) => {
    const completed = currentStage >= stageIndex;
    const current = currentStage === stageIndex;

    return (
      <div className="flex items-start gap-3">
        {/* Number / icon */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold border ${
            completed
              ? "bg-blue-900 text-white border-blue-900"
              : "bg-white text-slate-400 border-slate-300"
          }`}
        >
          {completed ? "✓" : number}
        </div>

        <div className="flex-1">
          <div
            className={`rounded-lg border p-3 ${
              current
                ? "border-blue-300 bg-blue-50"
                : completed
                  ? "border-blue-100 bg-slate-50"
                  : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span>{icon}</span>

                <p
                  className={`text-sm font-semibold ${
                    completed
                      ? "text-blue-900"
                      : "text-slate-400"
                  }`}
                >
                  {isNepali ? titleNe : titleEn}
                </p>
              </div>

              {completed && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-800 bg-blue-100 px-2 py-1 rounded-full">
                  {isNepali ? "प्रमाणित" : "Verified"}
                </span>
              )}
            </div>

            {completed && person && (
              <p className="text-xs text-slate-600 mt-2">
                <span className="font-semibold">
                  {isNepali ? "प्रमाणित गर्ने:" : "Verified by:"}
                </span>{" "}
                {person}
              </p>
            )}

            {completed && !person && (
              <p className="text-xs text-slate-400 mt-2">
                {isNepali
                  ? "प्रमाणित गर्ने व्यक्तिको विवरण उपलब्ध छैन।"
                  : "Verifier information is not available."}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #print-area,
          #print-area * {
            visibility: visible !important;
          }

          #print-area {
            position: absolute;
            top: 0;
            left: 0;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">

        {/* ================================================================ */}
        {/* HEADER                                                           */}
        {/* ================================================================ */}

        <div className="flex items-center justify-between px-8 py-5 border-b bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Government of Nepal"
              className="w-14 h-14"
            />

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                {isNepali
                  ? "नेपाल सरकार"
                  : "Government of Nepal"}
              </p>

              <h2 className="text-2xl font-bold text-blue-700">
                {isNepali
                  ? "जन्म दर्ता"
                  : "Birth Registration"}
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                {isNepali
                  ? "दर्ता नं.:"
                  : "Registration ID:"}{" "}
                {formData.registration_id || "—"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-3xl text-gray-400 hover:text-red-500 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* ================================================================ */}
        {/* DOCUMENT                                                         */}
        {/* ================================================================ */}

        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="flex justify-center py-10 px-4">
            <div
              className="relative inline-block"
              id="print-area"
            >
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print absolute z-10 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-lg transition-colors text-sm"
                style={{
                  top: -18,
                  right: 0,
                }}
              >
                🖨️{" "}
                {isNepali
                  ? "प्रिन्ट / डाउनलोड"
                  : "Print / Download"}
              </button>

              <div className="bg-white rounded-lg shadow-xl">
                <Preview
                  formData={formData}
                  showRejectSection={true}
                  rejectText={rejectText}
                  onRejectChange={handleRejectChange}
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* VERIFICATION HISTORY                                         */}
          {/* ============================================================ */}

          <div className="max-w-4xl mx-auto px-4 pb-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">

              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-800">
                  {isNepali
                    ? "प्रमाणीकरण प्रक्रिया"
                    : "Verification Process"}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {isNepali
                    ? "आवेदन कुन-कुन अधिकारीबाट प्रमाणित भएको छ हेर्नुहोस्।"
                    : "See which officials have verified this application."}
                </p>
              </div>

              <div className="space-y-3">

                {/* 1. Submitted */}
                <ApprovalStage
                  number="1"
                  icon="📤"
                  titleNe="आवेदन पेश गरियो"
                  titleEn="Application Submitted"
                  stageIndex={0}
                  person={getVerifier(
                    formData?.submitted_by_name,
                    formData?.submitted_by,
                    formData?.register_submitted_by,
                  )}
                />

                {/* 2. Validation Officer */}
                <ApprovalStage
                  number="2"
                  icon="🖥️"
                  titleNe="डाटा प्रमाणीकरण अधिकृतद्वारा प्रमाणित"
                  titleEn="Verified by Data Validation Officer"
                  stageIndex={1}
                  person={validationOfficer}
                />

                {/* 3. Secretary */}
                <ApprovalStage
                  number="3"
                  icon="🖊️"
                  titleNe="वडा सचिवद्वारा प्रमाणित"
                  titleEn="Verified by Ward Secretary"
                  stageIndex={2}
                  person={secretary}
                />

                {/* 4. Chairman */}
                <ApprovalStage
                  number="4"
                  icon="🎖️"
                  titleNe="वडा अध्यक्षद्वारा प्रमाणित"
                  titleEn="Verified by Ward Chairman"
                  stageIndex={3}
                  person={chairman}
                />

                {/* 5. Certificate */}
                <ApprovalStage
                  number="5"
                  icon="✅"
                  titleNe="प्रमाणपत्र जारी गरियो"
                  titleEn="Certificate Issued"
                  stageIndex={4}
                  person={getVerifier(
                    formData?.certificate_issued_by,
                    formData?.issued_by,
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* REJECTION REASON                                                 */}
        {/* ================================================================ */}

        <div className="border-t bg-white px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-gray-700">
              {isNepali
                ? "अस्वीकृतिको कारण"
                : "Rejection Reason"}
            </div>

            {isRejected && existingRejectReason && (
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                {isNepali ? "अस्वीकृत" : "Rejected"}
              </span>
            )}
          </div>

          {/* Previous rejection reason */}
          {existingRejectReason && (
            <div className="mb-3 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-xs font-semibold text-red-700 mb-1">
                {isNepali
                  ? "अघिल्लो अस्वीकृतिको कारण"
                  : "Previous Rejection Reason"}
              </p>

              <p className="text-sm text-red-800 whitespace-pre-wrap">
                {existingRejectReason}
              </p>
            </div>
          )}

          {/* Editable rejection reason */}
          <textarea
            rows={3}
            value={rejectText}
            onChange={(e) =>
              handleRejectChange(e.target.value)
            }
            disabled={loading}
            className="w-full border border-red-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:bg-gray-100"
            placeholder={
              isNepali
                ? "अस्वीकृतिको कारण लेख्नुहोस्..."
                : "Enter rejection reason..."
            }
          />

          <p className="text-[11px] text-gray-400 mt-1">
            {isNepali
              ? "आवेदन अस्वीकृत गर्नु अघि स्पष्ट कारण लेख्नुहोस्।"
              : "Enter a clear reason before rejecting the application."}
          </p>
        </div>

        {/* ================================================================ */}
        {/* FOOTER                                                           */}
        {/* ================================================================ */}

        <div className="border-t bg-white px-8 py-4 flex justify-end gap-4 shrink-0">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            {isNepali ? "रद्द गर्नुहोस्" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleRejected}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {loading
              ? isNepali
                ? "प्रक्रिया हुँदैछ..."
                : "Processing..."
              : isNepali
                ? "अस्वीकार"
                : "Reject"}
          </button>

          <button
            type="button"
            onClick={handleApproved}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading
              ? isNepali
                ? "प्रक्रिया हुँदैछ..."
                : "Processing..."
              : isNepali
                ? "प्रमाणित गर्नुहोस्"
                : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditBirthRegistrationModal;