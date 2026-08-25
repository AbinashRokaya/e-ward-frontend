import * as yup from "yup";
import { BSToAD } from "bikram-sambat-js";

// ---------------------------------------------------------------------------
// Validation for the migration registration form. Field names match the
// form's nested shape (applicant / addresses[] / migration_detail /
// family_members[]) and the backend's UpdateApplicantRequest /
// UpdateMigrationAddressRequest / UpdateFamilyMemberRequest schemas.
//
// The three addresses are PERMANENT, CURRENT and NEW. Permanent and current
// are frequently the same place, so only CURRENT vs NEW is checked for being
// distinct — that's the move the certificate actually records.
// ---------------------------------------------------------------------------

const phoneRegex = /^(98|97|96)\d{8}$/;
const citizenshipRegex = /^[0-9/\s-]+$/;
const bsDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const MAX_PHOTO_COUNT = 10;

// Converts a BS date string to a JS Date, or null when it can't be parsed.
// The library throws on out-of-range dates, so a failure here should read as
// "enter a valid date" rather than crashing the submit handler.
function bsToDate(bsString) {
  if (!bsString || !bsDateRegex.test(bsString)) return null;
  try {
    const d = new Date(BSToAD(bsString));
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

const applicantSchema = yup.object().shape({
  applicant_full_name_np: yup
    .string()
    .trim()
    .required("Applicant's name in Nepali is required"),
  applicant_full_name_en: yup
    .string()
    .trim()
    .required("Applicant's name in English is required"),

  applicant_gender: yup
    .string()
    .oneOf(["MALE", "FEMALE", "OTHER"], "Select a valid gender")
    .required("Applicant's gender is required"),

  applicant_dob_bs: yup
    .string()
    .trim()
    .matches(bsDateRegex, {
      message: "Date of birth (BS) must be in YYYY-MM-DD format",
      excludeEmptyString: true,
    })
    .nullable(),

  applicant_dob_ad: yup
    .date()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Enter a valid date of birth")
    .max(new Date(), "Date of birth cannot be in the future")
    .nullable(),

  applicant_citizenship_no: yup
    .string()
    .trim()
    .matches(citizenshipRegex, {
      message: "Citizenship number may only contain digits, / and -",
      excludeEmptyString: true,
    })
    .required("Applicant's citizenship number is required"),

  applicant_nationality: yup.string().trim().nullable(),
  applicant_occupation: yup.string().trim().nullable(),

  applicant_contact_no: yup
    .string()
    .trim()
    .matches(phoneRegex, {
      message: "Enter a valid 10-digit Nepali mobile number",
      excludeEmptyString: true,
    })
    .required("Applicant's contact number is required"),
});

const addressSchema = yup.object().shape({
  address_type: yup
    .string()
    .oneOf(["PERMANENT", "CURRENT", "NEW"], "Invalid address type")
    .required(),
  province: yup.string().trim().required("Province is required for all three addresses"),
  district: yup.string().trim().required("District is required for all three addresses"),
  municipality: yup
    .string()
    .trim()
    .required("Municipality is required for all three addresses"),
  ward_number: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Ward number must be a digit")
    .integer("Ward number cannot contain decimals")
    .positive("Ward number must be greater than 0")
    .required("Ward number is required for all three addresses"),
  tole: yup.string().trim().nullable(),
});

const migrationDetailSchema = yup.object().shape({
  migration_date_bs: yup
    .string()
    .trim()
    .matches(bsDateRegex, "Migration date (BS) must be in YYYY-MM-DD format")
    .required("Migration date is required"),

  migration_date_ad: yup
    .date()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Enter a valid migration date")
    .nullable(),

  migration_reason: yup.string().trim().required("Reason for migration is required"),

  // Only meaningful when the reason is "other" — the cross-field check below
  // enforces that pairing rather than demanding it unconditionally.
  migration_reason_other: yup.string().trim().nullable(),
});

// Family members are optional overall — a single person may migrate alone.
// But the form starts with one blank row, so a row that has ANY data filled
// in must be complete; entirely blank rows are ignored at submit time.
const familyMemberSchema = yup.object().shape({
  member_name_np: yup.string().trim().nullable(),
  member_name_en: yup.string().trim().nullable(),
  member_relationship: yup.string().trim().nullable(),
  member_gender: yup.string().trim().nullable(),
  member_dob_bs: yup
    .string()
    .trim()
    .matches(bsDateRegex, {
      message: "Family member's date of birth (BS) must be in YYYY-MM-DD format",
      excludeEmptyString: true,
    })
    .nullable(),
  member_dob_ad: yup
    .date()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Enter a valid date of birth for the family member")
    .max(new Date(), "Family member's date of birth cannot be in the future")
    .nullable(),
  member_citizenship_no: yup
    .string()
    .trim()
    .matches(citizenshipRegex, {
      message: "Family member's citizenship number may only contain digits, / and -",
      excludeEmptyString: true,
    })
    .nullable(),
  member_remarks: yup.string().trim().nullable(),
});

export const migrationRegistrationSchema = yup.object().shape({
  applicant: applicantSchema.required(),
  addresses: yup
    .array()
    .of(addressSchema)
    .length(3, "All three addresses (permanent, current, new) are required"),
  migration_detail: migrationDetailSchema.required(),
  family_members: yup.array().of(familyMemberSchema),
  enclosure_photo_count: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Photo count must be a number")
    .integer("Photo count cannot contain decimals")
    .min(0, "Photo count cannot be negative")
    .max(MAX_PHOTO_COUNT, `Photo count cannot exceed ${MAX_PHOTO_COUNT}`)
    .nullable(),
  enclosure_other: yup.string().trim().nullable(),
});

// True when a family-member row has been partially filled in — used to tell
// "blank placeholder row" apart from "row the user started and left broken".
export function isFamilyMemberStarted(m) {
  return Boolean(
    m?.member_name_np?.trim() ||
      m?.member_name_en?.trim() ||
      m?.member_relationship?.trim() ||
      m?.member_gender ||
      m?.member_dob_bs ||
      m?.member_dob_ad ||
      m?.member_citizenship_no?.trim(),
  );
}

function addressOf(formData, type) {
  return (formData?.addresses || []).find((a) => a.address_type === type) || {};
}

function sameAddress(a, b) {
  return (
    a.province &&
    a.province === b.province &&
    a.district === b.district &&
    a.municipality === b.municipality &&
    String(a.ward_number) === String(b.ward_number)
  );
}

function crossFieldErrors(formData) {
  const errors = [];
  const detail = formData?.migration_detail || {};

  // Migration date can't be in the future.
  const migrationDate = bsToDate(detail.migration_date_bs);
  if (detail.migration_date_bs && !migrationDate) {
    errors.push("Migration date is not a valid Bikram Sambat date.");
  }
  if (migrationDate && migrationDate > new Date()) {
    errors.push("Migration date cannot be in the future.");
  }

  // "Other" reason needs an explanation, otherwise the record says nothing.
  const reason = (detail.migration_reason || "").toUpperCase();
  if (reason === "OTHER" && !detail.migration_reason_other?.trim()) {
    errors.push("Please describe the reason when selecting 'Other'.");
  }

  // The certificate records a move — the destination must differ from where
  // the applicant is leaving. Permanent vs current isn't checked, since
  // those are legitimately the same for most people.
  const current = addressOf(formData, "CURRENT");
  const next = addressOf(formData, "NEW");
  if (sameAddress(current, next)) {
    errors.push(
      "The new address is the same as the current address — a migration certificate records a move between different wards.",
    );
  }

  // A row the person started filling in but left incomplete would be saved
  // as a nameless family member, so require the basics on started rows only.
  (formData?.family_members || []).forEach((m, i) => {
    if (!isFamilyMemberStarted(m)) return;
    if (!m.member_name_np?.trim() && !m.member_name_en?.trim()) {
      errors.push(`Family member ${i + 1}: name is required.`);
    }
    if (!m.member_relationship?.trim()) {
      errors.push(`Family member ${i + 1}: relationship is required.`);
    }
  });

  return errors;
}

export function validateMigrationRegistration(formData) {
  const errors = [];

  try {
    migrationRegistrationSchema.validateSync(formData, { abortEarly: false });
  } catch (err) {
    if (err.inner && err.inner.length > 0) {
      errors.push(...new Set(err.inner.map((e) => e.message)));
    } else {
      errors.push(err.message);
    }
  }

  errors.push(...crossFieldErrors(formData));
  return [...new Set(errors)];
}

// Non-blocking — worth a second look, never a reason to refuse a real
// application.
export function migrationRegistrationWarnings(formData) {
  const warnings = [];

  // The enclosure checkboxes are a declaration of what's attached, so a tick
  // with no matching upload will come back from the ward office as a query.
  if (formData?.enclosure_citizenship_copy === false) {
    warnings.push(
      "You haven't ticked 'citizenship copy' as an enclosure — most migration applications require one.",
    );
  }

  const started = (formData?.family_members || []).filter(isFamilyMemberStarted);
  if (started.length > 0 && Number(formData?.enclosure_photo_count) < 2) {
    warnings.push(
      "You've listed family members but fewer than 2 photos — check how many the ward office requires.",
    );
  }

  return warnings;
}