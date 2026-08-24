import { apiFetch, apiFetchForm } from "./http";

// ---------------------------------------------------------------------------
// One export per backend router group, matching /docs exactly.
// Endpoints marked (multipart) take File objects; those whose params are
// JSON-shaped (child, parents, address, applicant, ...) expect the CALLER
// to JSON.stringify them before passing in, since the shape depends on the
// form building them.
// ---------------------------------------------------------------------------

export const usersApi = {
  getAll: () => apiFetch("/v1/users/"),
  create: (payload) => apiFetch("/v1/users/", { method: "POST", body: payload }),
  login: (user_phone_number, password) =>
    apiFetch("/v1/users/login", {
      method: "POST",
      body: { user_phone_number, password },
    }),
  requestOtp: (otp_phone_number) =>
    apiFetch("/v1/users/otp", { method: "POST", body: { otp_phone_number } }),
  verifyOtp: (otp_phone_number, otp_code) =>
    apiFetch("/v1/users/otp/verify", {
      method: "POST",
      body: { otp_phone_number, otp_code },
    }),
  verifyCitizenAtWard: (user_id, user_phone_number, user_status) =>
    apiFetch("/v1/users/verif/Citizen", {
      method: "POST",
      body: { user_id, user_phone_number, user_status },
    }),
};

export const adminApi = {
  getAllWards: () => apiFetch("/v1/admin/ward"),
  createWard: (fields) => apiFetchForm("/v1/admin/ward", fields), // multipart
  updateWard: (wardId, fields) =>
    apiFetchForm(`/v1/admin/ward/${wardId}`, fields, { method: "PUT" }),
  deleteWard: (wardId) =>
    apiFetch(`/v1/admin/ward/${wardId}`, { method: "DELETE" }),

  assignOfficer: (payload) =>
    apiFetch("/v1/admin/user/", { method: "POST", body: payload }),
  getAllOfficers: ({ ward_number, municipality, role } = {}) =>
    apiFetch("/v1/admin/user/", { params: { ward_number, municipality, role } }),
  getOfficer: (userId) => apiFetch(`/v1/admin/user/${userId}`),
  updateOfficer: (userId, payload) =>
    apiFetch(`/v1/admin/user/${userId}`, { method: "PUT", body: payload }),
  deleteOfficer: (userId) =>
    apiFetch(`/v1/admin/user/${userId}`, { method: "DELETE" }),
  getOfficersList: () => apiFetch("/v1/admin/users/officers"),
};

export const wardApi = {
  getAll: () => apiFetch("/v1/ward/all"),
  uploadImages: (wardId, fields) =>
    apiFetchForm(`/v1/ward/${wardId}/upload-images`, fields), // multipart
};

export const birthApi = {
  create: (fields) => apiFetchForm("/v1/birth-registration/", fields), // multipart
  getAll: ({ status, ward_id } = {}) =>
    apiFetch("/v1/birth-registration/", { params: { status, ward_id } }),
  getMyAddress: () => apiFetch("/v1/birth-registration/my-address"),
  get: (id) => apiFetch(`/v1/birth-registration/${id}`),
  update: (id, payload) =>
    apiFetch(`/v1/birth-registration/${id}`, { method: "PUT", body: payload }),
  remove: (id) =>
    apiFetch(`/v1/birth-registration/${id}`, { method: "DELETE" }),
  updateParent: (id, parentId, payload) =>
    apiFetch(`/v1/birth-registration/${id}/parents/${parentId}`, {
      method: "PUT",
      body: payload,
    }),
  updateNominee: (id, nomineeId, payload) =>
    apiFetch(`/v1/birth-registration/${id}/nominees/${nomineeId}`, {
      method: "PUT",
      body: payload,
    }),
  approve: (id) =>
    apiFetch(`/v1/birth-registration/${id}/approve`, { method: "POST" }),
  reject: (id, reject_text) =>
    apiFetch(`/v1/birth-registration/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),
  uploadDocuments: (id, fields) =>
    apiFetchForm(`/v1/birth-registration/${id}/upload-documents`, fields),
  issueCertificate: (id) =>
    apiFetch(`/v1/birth-registration/${id}/issue-certificate`, {
      method: "POST",
    }),
  downloadCertificate: (id) =>
    apiFetch(`/v1/birth-registration/${id}/certificate/download`),
  verifyCertificate: (certId) =>
    apiFetch(`/v1/birth-registration/certificate/verify/${certId}`),
};

export const deathApi = {
  create: (fields) => apiFetchForm("/v1/death-registration/", fields), // multipart
  getAll: ({ status, ward_id } = {}) =>
    apiFetch("/v1/death-registration/", { params: { status, ward_id } }),
  getAllWard: () => apiFetch("/v1/death-registration/all"),
  getMyAddress: () => apiFetch("/v1/death-registration/my-address"),
  getAllForChairperson: () =>
    apiFetch("/v1/death-registration/ward-chairperson/all"),
  get: (id) => apiFetch(`/v1/death-registration/${id}`),
  update: (id, payload) =>
    apiFetch(`/v1/death-registration/${id}`, { method: "PUT", body: payload }),
  remove: (id) =>
    apiFetch(`/v1/death-registration/${id}`, { method: "DELETE" }),
  updateInformant: (id, payload) =>
    apiFetch(`/v1/death-registration/${id}/informant`, {
      method: "PUT",
      body: payload,
    }),
  approve: (id) =>
    apiFetch(`/v1/death-registration/${id}/approve`, { method: "POST" }),
  reject: (id, reject_text) =>
    apiFetch(`/v1/death-registration/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),
  uploadDocuments: (id, fields) =>
    apiFetchForm(`/v1/death-registration/${id}/upload-documents`, fields),
  issueCertificate: (id) =>
    apiFetch(`/v1/death-registration/${id}/issue-certificate`, {
      method: "POST",
    }),
  downloadCertificate: (id) =>
    apiFetch(`/v1/death-registration/${id}/certificate/download`),
  verifyCertificate: (certId) =>
    apiFetch(`/v1/death-registration/certificate/verify/${certId}`),
};

export const migrationApi = {
  create: (fields) => apiFetchForm("/v1/migration-registration/", fields), // multipart
  getAll: ({ status, ward_id } = {}) =>
    apiFetch("/v1/migration-registration/", { params: { status, ward_id } }),
  getAllWard: () => apiFetch("/v1/migration-registration/all"),
  get: (id) => apiFetch(`/v1/migration-registration/${id}`),
  update: (id, payload) =>
    apiFetch(`/v1/migration-registration/${id}`, {
      method: "PUT",
      body: payload,
    }),
  remove: (id) =>
    apiFetch(`/v1/migration-registration/${id}`, { method: "DELETE" }),
  updateAddress: (id, addressId, payload) =>
    apiFetch(`/v1/migration-registration/${id}/addresses/${addressId}`, {
      method: "PUT",
      body: payload,
    }),
  updateFamilyMember: (id, memberId, payload) =>
    apiFetch(`/v1/migration-registration/${id}/family-members/${memberId}`, {
      method: "PUT",
      body: payload,
    }),
  approve: (id) =>
    apiFetch(`/v1/migration-registration/${id}/approve`, { method: "POST" }),
  reject: (id, reject_text) =>
    apiFetch(`/v1/migration-registration/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),
  uploadDocuments: (id, fields) =>
    apiFetchForm(`/v1/migration-registration/${id}/upload-documents`, fields),
  issueCertificate: (id) =>
    apiFetch(`/v1/migration-registration/${id}/issue-certificate`, {
      method: "POST",
    }),
  downloadCertificate: (id) =>
    apiFetch(`/v1/migration-registration/${id}/certificate/download`),
  verifyCertificate: (certId) =>
    apiFetch(`/v1/migration-registration/certificate/verify/${certId}`),
};

export const recommendationApi = {
  getMyAddress: () => apiFetch("/v1/recommendation-letter/my-address"),
  create: (payload) =>
    apiFetch("/v1/recommendation-letter/", { method: "POST", body: payload }),
  getMine: () => apiFetch("/v1/recommendation-letter/"),
  getAllWard: () => apiFetch("/v1/recommendation-letter/all"),
  getAllForChairperson: () => apiFetch("/v1/recommendation-letter/ward/all"),
  getAllForOfficer: () => apiFetch("/v1/recommendation-letter/officer/all"),
  get: (id) => apiFetch(`/v1/recommendation-letter/${id}`),
  update: (id, payload) =>
    apiFetch(`/v1/recommendation-letter/${id}`, {
      method: "PUT",
      body: payload,
    }),
  approve: (id) =>
    apiFetch(`/v1/recommendation-letter/${id}/approve`, { method: "POST" }),
  reject: (id, reject_text) =>
    apiFetch(`/v1/recommendation-letter/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),
  issueCertificate: (id) =>
    apiFetch(`/v1/recommendation-letter/${id}/issue-certificate`, {
      method: "POST",
    }),
  downloadCertificate: (id) =>
    apiFetch(`/v1/recommendation-letter/${id}/certificate/download`),
  verifyCertificate: (certId) =>
    apiFetch(`/v1/recommendation-letter/certificate/verify/${certId}`),
};

export const complaintApi = {
  create: (payload) => apiFetch("/v1/complaint/", { method: "POST", body: payload }),
  getMine: () => apiFetch("/v1/complaint/"),
  getAllWard: () => apiFetch("/v1/complaint/all"),
  getAllForOfficer: () => apiFetch("/v1/complaint/officer/all"),
  get: (id) => apiFetch(`/v1/complaint/${id}`),
  update: (id, payload) =>
    apiFetch(`/v1/complaint/${id}`, { method: "PUT", body: payload }),
  approve: (id) => apiFetch(`/v1/complaint/${id}/approve`, { method: "POST" }),
  reject: (id, reject_text) =>
    apiFetch(`/v1/complaint/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),
  uploadDocuments: (id, fields) =>
    apiFetchForm(`/v1/complaint/${id}/upload-documents`, fields),
  getWardStats: (wardId) => apiFetch(`/v1/complaint/ward/${wardId}/stats`),
};

export const noticeApi = {
  // fields: notice_title, notice_description, notice_type, status?, attachment?
  create: (fields) => apiFetchForm("/v1/notice/create", fields),
  getMyWardNotices: (filters = {}) =>
    apiFetch("/v1/notice/ward-secretary/all", { params: filters }),
  getAllForOfficer: (filters = {}) =>
    apiFetch("/v1/notice/officer/all", { params: filters }),
  getAllForWard: (wardId, filters = {}) =>
    apiFetch(`/v1/notice/${wardId}/all`, { params: filters }),
  update: (noticeId, fields) =>
    apiFetchForm(`/v1/notice/${noticeId}`, fields, { method: "PATCH" }),
};
// notice_type: PUBLIC TENDER VACANCY TAX MEETING HEALTH EDUCATION DISASTER EVENT OTHER
// notice_status: DRAFT PUBLISHED EXPIRED ARCHIVED

export const citizenApi = {
  getAllBirth: () => apiFetch("/v1/citizen/birth/all"),
  getBirth: (id) => apiFetch(`/v1/citizen/birth/${id}`),
};

export const wardSecretaryApi = {
  getAllBirth: () => apiFetch("/v1/ward-secretary/all"),
  approveBirth: (id) =>
    apiFetch(`/v1/ward-secretary/${id}/approve`, { method: "POST" }),
  rejectBirth: (id, reject_text) =>
    apiFetch(`/v1/ward-secretary/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllDeath: () => apiFetch("/v1/ward-secretary/death/all"),
  approveDeath: (id) =>
    apiFetch(`/v1/ward-secretary/death/${id}/approve`, { method: "POST" }),
  rejectDeath: (id, reject_text) =>
    apiFetch(`/v1/ward-secretary/death/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllMigration: () => apiFetch("/v1/ward-secretary/migration/all"),
  approveMigration: (id) =>
    apiFetch(`/v1/ward-secretary/migration/${id}/approve`, { method: "POST" }),
  rejectMigration: (id, reject_text) =>
    apiFetch(`/v1/ward-secretary/migration/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllRecommendation: () => apiFetch("/v1/ward-secretary/recommendation/all"),
  approveRecommendation: (id) =>
    apiFetch(`/v1/ward-secretary/recommendation/${id}/approve`, {
      method: "POST",
    }),
  rejectRecommendation: (id, reject_text) =>
    apiFetch(`/v1/ward-secretary/recommendation/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllComplaints: () => apiFetch("/v1/ward-secretary/complaint/all"),
  // resolution_note: 10–1000 chars (required). resolution_image: File (optional).
  resolveComplaint: (id, resolution_note, resolution_image) =>
    apiFetchForm(`/v1/ward-secretary/complaint/${id}/resolve`, {
      resolution_note,
      resolution_image,
    }),
  // Backend blocks this for ordinary categories — those must use resolveComplaint.
  forwardComplaintToChairperson: (id) =>
    apiFetch(`/v1/ward-secretary/complaint/${id}/approve`, { method: "POST" }),
  rejectComplaint: (id, reject_text) =>
    apiFetch(`/v1/ward-secretary/complaint/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),
};

export const wardChairpersonApi = {
  getAllBirth: () => apiFetch("/v1/ward-chairperson/all"),
  approveBirth: (id) =>
    apiFetch(`/v1/ward-chairperson/${id}/approve`, { method: "POST" }),
  rejectBirth: (id, reject_text) =>
    apiFetch(`/v1/ward-chairperson/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllDeath: () => apiFetch("/v1/ward-chairperson/death/all"),
  approveDeath: (id) =>
    apiFetch(`/v1/ward-chairperson/death/${id}/approve`, { method: "POST" }),
  rejectDeath: (id, reject_text) =>
    apiFetch(`/v1/ward-chairperson/death/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllMigration: () => apiFetch("/v1/ward-chairperson/migration/all"),
  approveMigration: (id) =>
    apiFetch(`/v1/ward-chairperson/migration/${id}/approve`, { method: "POST" }),
  rejectMigration: (id, reject_text) =>
    apiFetch(`/v1/ward-chairperson/migration/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllRecommendation: () =>
    apiFetch("/v1/ward-chairperson/recommendation/all"),
  approveRecommendation: (id) =>
    apiFetch(`/v1/ward-chairperson/recommendation/${id}/approve`, {
      method: "POST",
    }),
  rejectRecommendation: (id, reject_text) =>
    apiFetch(`/v1/ward-chairperson/recommendation/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllComplaints: () => apiFetch("/v1/ward-chairperson/complaint/all"),
  // The docs also list /v1/ward-chairperson/ward-chairperson/all returning
  // the same thing — kept here in case they differ once tested live.
  getAllComplaintsAlt: () =>
    apiFetch("/v1/ward-chairperson/ward-chairperson/all"),
  approveComplaint: (id, resolution_note, resolution_image) =>
    apiFetchForm(`/v1/ward-chairperson/complaint/${id}/approve`, {
      resolution_note,
      resolution_image,
    }),
  rejectComplaint: (id, reject_text) =>
    apiFetch(`/v1/ward-chairperson/complaint/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),
};

export const dataValidationApi = {
  getAllBirth: () => apiFetch("/v1/data-validation/all"),
  approveBirth: (id) =>
    apiFetch(`/v1/data-validation/${id}/approve`, { method: "POST" }),
  rejectBirth: (id, reject_text) =>
    apiFetch(`/v1/data-validation/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllDeath: () => apiFetch("/v1/data-validation/death/all"),
  approveDeath: (id) =>
    apiFetch(`/v1/data-validation/death/${id}/approve`, { method: "POST" }),
  rejectDeath: (id, reject_text) =>
    apiFetch(`/v1/data-validation/death/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllMigration: () => apiFetch("/v1/data-validation/migration/all"),
  approveMigration: (id) =>
    apiFetch(`/v1/data-validation/migration/${id}/approve`, { method: "POST" }),
  rejectMigration: (id, reject_text) =>
    apiFetch(`/v1/data-validation/migration/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),

  getAllComplaints: () => apiFetch("/v1/data-validation/complaint/all"),
  approveComplaint: (id) =>
    apiFetch(`/v1/data-validation/complaint/${id}/approve`, { method: "POST" }),
  rejectComplaint: (id, reject_text) =>
    apiFetch(`/v1/data-validation/complaint/${id}/reject`, {
      method: "POST",
      body: { reject_text },
    }),
};

// module: birth | death | migration | recommendation | complaint
export const analyticsApi = {
  moduleSummary: (module, { year } = {}) =>
    apiFetch(`/v1/analytics/${module}/summary`, { params: { year } }),
  vitalSnapshot: ({ year } = {}) =>
    apiFetch("/v1/analytics/vital-snapshot", { params: { year } }),
  deathCauses: () => apiFetch("/v1/analytics/death/causes"),
  migrationReasons: () => apiFetch("/v1/analytics/migration/reasons"),
  complaintBreakdown: () => apiFetch("/v1/analytics/complaint/breakdown"),
};

export const analyticsAdminApi = {
  moduleSummary: (module, { year, ward_id } = {}) =>
    apiFetch(`/v1/analytics/admin/${module}/summary`, {
      params: { year, ward_id },
    }),
  wardsLeaderboard: () => apiFetch("/v1/analytics/admin/wards/leaderboard"),
  vitalSnapshot: ({ year, ward_id } = {}) =>
    apiFetch("/v1/analytics/admin/vital-snapshot", { params: { year, ward_id } }),
  deathCauses: ({ ward_id } = {}) =>
    apiFetch("/v1/analytics/admin/death/causes", { params: { ward_id } }),
  migrationReasons: ({ ward_id } = {}) =>
    apiFetch("/v1/analytics/admin/migration/reasons", { params: { ward_id } }),
  complaintBreakdown: ({ ward_id } = {}) =>
    apiFetch("/v1/analytics/admin/complaint/breakdown", { params: { ward_id } }),
};

export const taxApi = {
  getMyRates: () => apiFetch("/v1/tax/rates/mine"),
  createMyRate: (payload) =>
    apiFetch("/v1/tax/rates/mine", { method: "POST", body: payload }),
  updateMyRate: (rateId, payload) =>
    apiFetch(`/v1/tax/rates/mine/${rateId}`, { method: "PUT", body: payload }),
  recalculateWardAssessments: () =>
    apiFetch("/v1/tax/assessments/recalculate", { method: "POST" }),

  getWardRates: (wardId) => apiFetch(`/v1/tax/wards/${wardId}/rates`),
  createWardRate: (wardId, payload) =>
    apiFetch(`/v1/tax/wards/${wardId}/rates`, { method: "POST", body: payload }),
  updateWardRate: (wardId, rateId, payload) =>
    apiFetch(`/v1/tax/wards/${wardId}/rates/${rateId}`, {
      method: "PUT",
      body: payload,
    }),

  listProperties: (params) => apiFetch("/v1/tax/properties", { params }),
  createProperty: (payload) =>
    apiFetch("/v1/tax/properties", { method: "POST", body: payload }),
  updateProperty: (id, payload) =>
    apiFetch(`/v1/tax/properties/${id}`, { method: "PUT", body: payload }),

  listBusinessCategories: () => apiFetch("/v1/tax/business-categories"),
  listBusinesses: (params) => apiFetch("/v1/tax/businesses", { params }),
  createBusiness: (payload) =>
    apiFetch("/v1/tax/businesses", { method: "POST", body: payload }),
  updateBusiness: (id, payload) =>
    apiFetch(`/v1/tax/businesses/${id}`, { method: "PUT", body: payload }),

  uploadSurveyExcel: (file) => apiFetchForm("/v1/tax/imports", { file }),
  getImportBatch: (batchId) => apiFetch(`/v1/tax/imports/${batchId}`),
  editImportRow: (rowId, payload) =>
    apiFetch(`/v1/tax/imports/rows/${rowId}`, { method: "PUT", body: payload }),
  approveAllMatchedRows: (batchId) =>
    apiFetch(`/v1/tax/imports/${batchId}/approve-all`, { method: "POST" }),
  commitImportBatch: (batchId) =>
    apiFetch(`/v1/tax/imports/${batchId}/commit`, { method: "POST" }),

  generatePropertyTax: (propertyId, payload) =>
    apiFetch(`/v1/tax/assessments/property/${propertyId}`, {
      method: "POST",
      body: payload,
    }),
  getMyAssessments: () => apiFetch("/v1/tax/assessments/my"),
  listWardAssessments: (params) =>
    apiFetch("/v1/tax/assessments/ward", { params }),

  recordPayment: (payload) =>
    apiFetch("/v1/tax/payments", { method: "POST", body: payload }),
  initiateKhaltiPayment: (payload) =>
    apiFetch("/v1/tax/payments/khalti/initiate", {
      method: "POST",
      body: payload,
    }),
  verifyKhaltiPayment: (params) =>
    apiFetch("/v1/tax/payments/khalti/verify", { params }),
  getPaymentReceipt: (paymentId) =>
    apiFetch(`/v1/tax/payments/${paymentId}/receipt`),
  verifyReceipt: (paymentId) => apiFetch(`/v1/tax/receipts/verify/${paymentId}`),

  raiseDispute: (assessmentId, payload) =>
    apiFetch(`/v1/tax/assessments/${assessmentId}/dispute`, {
      method: "POST",
      body: payload,
    }),
  resolveDispute: (disputeId, payload) =>
    apiFetch(`/v1/tax/disputes/${disputeId}/resolve`, {
      method: "PUT",
      body: payload,
    }),
};