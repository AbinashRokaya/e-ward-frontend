import * as yup from "yup";

// ---------------------------------------------------------------------------
// Validation for the birth registration form.
//
// IMPORTANT: the previous version of this file used flat field names
// (firstName, fatherPhone, wardNo) that never matched the actual form shape,
// which is nested — formData.child, formData.parents[], formData.address,
// formData.nominees[]. It was imported by BirthRegistration.jsx but never
// called, so in practice nothing was validated and invalid data went straight
// to the backend as a raw 422. The names below match the real payload the
// form submits (and the backend's UpdateChildRequest / UpdateParentRequest /
// UpdateNomineeRequest schemas).
// ---------------------------------------------------------------------------

const phoneRegex = /^(98|97|96)\d{8}$/; // Nepali mobile numbers
const citizenshipRegex = /^[0-9/\s-]+$/; // digits, slashes, dashes, spaces

// Newborns above 5kg are uncommon but real — the heaviest recorded births
// exceed 10kg. A hard cap at 5 would block a legitimate registration and
// leave a family unable to file, so the blocking limit sits at 8kg (enough
// to catch a "50" typed for "5.0") and 5kg only triggers a soft warning.
export const WEIGHT_HARD_MAX = 8;
export const WEIGHT_SOFT_MAX = 5;

// Nepal's Birth, Death and Other Personal Events (Registration) Act gives a
// 35-day window; past that a late fee usually applies. Worth flagging, not
// worth blocking — late registrations are legal and common.
const LATE_REGISTRATION_DAYS = 35;

// --- Child ----------------------------------------------------------------
const childSchema = yup.object().shape({
  child_first_name: yup.string().trim().required("Child's first name is required"),
  child_middle_name: yup.string().trim().nullable(),
  child_last_name: yup.string().trim().required("Child's last name is required"),

  child_nepali_first_name: yup.string().trim().nullable(),
  child_nepali_middle_name: yup.string().trim().nullable(),
  child_nepali_last_name: yup.string().trim().nullable(),

  child_gender: yup
    .string()
    .oneOf(["MALE", "FEMALE", "OTHER"], "Select a valid gender")
    .required("Child's gender is required"),

  child_dob_ad: yup
    .date()
    .typeError("Enter a valid date of birth")
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Child's date of birth is required"),

  child_dob_bs: yup.string().trim().nullable(),
  child_time_of_birth: yup.string().trim().nullable(),

  child_birth_place: yup
    .string()
    .oneOf(["HOME", "HOSPITAL", "OTHER"], "Select a valid birth place")
    .required("Birth place is required"),

  child_birth_kind: yup
    .string()
    .oneOf(
      ["SINGLE", "TWIN", "TRIPLET_OR_MORE"],
      "Select a valid type of birth",
    )
    .required("Type of birth is required"),

  // Optional — many registrations, especially home births, have no recorded
  // weight. Only validated when a value is actually present.
  child_weight_kg: yup
    .number()
    .transform((value, original) =>
      original === "" || original === null ? undefined : value,
    )
    .typeError("Birth weight must be a number")
    .positive("Birth weight must be greater than 0")
    .max(
      WEIGHT_HARD_MAX,
      `Birth weight looks like a typo — enter it in kilograms (max ${WEIGHT_HARD_MAX}kg)`,
    )
    .nullable(),
});

// --- Parent (one entry in the parents array) ------------------------------
// parent_type tells us whether this is the father or mother, so the message
// can name them instead of saying "parent 1".
const parentSchema = yup.object().shape({
  parent_type: yup
    .string()
    .oneOf(["FATHER", "MOTHER"], "Parent type must be FATHER or MOTHER")
    .required("Parent type is required"),

  parent_first_name: yup
    .string()
    .trim()
    .required("Parent's first name is required"),
  parent_middle_name: yup.string().trim().nullable(),
  parent_last_name: yup
    .string()
    .trim()
    .required("Parent's last name is required"),

  parent_nepali_first_name: yup.string().trim().nullable(),
  parent_nepali_middle_name: yup.string().trim().nullable(),
  parent_nepali_last_name: yup.string().trim().nullable(),

  parent_citizenship_no: yup
    .string()
    .trim()
    .matches(citizenshipRegex, {
      message: "Citizenship number may only contain digits, / and -",
      excludeEmptyString: true,
    })
    .nullable(),

  parent_nid_no: yup.string().trim().nullable(),
  parent_occupation: yup.string().trim().nullable(),
  parent_nationality: yup.string().trim().nullable(),

  parent_contact_no: yup
    .string()
    .trim()
    .matches(phoneRegex, {
      message: "Enter a valid 10-digit Nepali mobile number",
      excludeEmptyString: true,
    })
    .nullable(),
});

// --- Address --------------------------------------------------------------
const addressSchema = yup.object().shape({
  child_province: yup.string().trim().required("Province is required"),
  child_district: yup.string().trim().required("District is required"),
  child_municipality: yup.string().trim().required("Municipality is required"),
  child_ward_number: yup
    .number()
    .transform((value, original) =>
      original === "" || original === null ? undefined : value,
    )
    .typeError("Ward number must be a digit")
    .integer("Ward number cannot contain decimals")
    .positive("Ward number must be greater than 0")
    .required("Ward number is required"),
  child_tole: yup.string().trim().nullable(),
});

// --- Nominee / informant --------------------------------------------------
const nomineeSchema = yup.object().shape({
  nominee_first_name: yup
    .string()
    .trim()
    .required("Informant's first name is required"),
  nominee_middle_name: yup.string().trim().nullable(),
  nominee_last_name: yup
    .string()
    .trim()
    .required("Informant's last name is required"),

  nominee_nepali_first_name: yup.string().trim().nullable(),
  nominee_nepali_middle_name: yup.string().trim().nullable(),
  nominee_nepali_last_name: yup.string().trim().nullable(),

  nominee_relationship: yup
    .string()
    .trim()
    .required("Informant's relationship to the child is required"),

  nominee_citizenship_no: yup
    .string()
    .trim()
    .matches(citizenshipRegex, {
      message: "Informant's citizenship number may only contain digits, / and -",
      excludeEmptyString: true,
    })
    .nullable(),

  nominee_address: yup.string().trim().nullable(),

  nominee_contact_no: yup
    .string()
    .trim()
    .matches(phoneRegex, {
      message: "Informant's phone must be a valid 10-digit Nepali mobile number",
      excludeEmptyString: true,
    })
    .nullable(),

  nominee_witness_order: yup.number().nullable(),
});

// --- Full form ------------------------------------------------------------
export const birthRegistrationSchema = yup.object().shape({
  register_ward_id: yup.string().trim().required("Ward selection is required"),
  child: childSchema.required("Child details are required"),
  address: addressSchema.required("Address details are required"),
  parents: yup
    .array()
    .of(parentSchema)
    .min(1, "At least one parent's details are required"),
  // Nominees are optional overall, but each one present must be complete.
  nominees: yup.array().of(nomineeSchema),
});

// ---------------------------------------------------------------------------
// Helper used by the form: returns a plain array of readable problems rather
// than throwing, so the page can toast the first one and let the person fix
// issues one at a time.
// ---------------------------------------------------------------------------
export function validateBirthRegistration(formData) {
  try {
    birthRegistrationSchema.validateSync(formData, { abortEarly: false });
    return [];
  } catch (err) {
    if (err.inner && err.inner.length > 0) {
      // Deduplicate — the same message can surface from several array items.
      return [...new Set(err.inner.map((e) => e.message))];
    }
    return [err.message];
  }
}

// ---------------------------------------------------------------------------
// Non-blocking checks. Each has legitimate cases, so these warn rather than
// stop the submission — refusing them outright would leave real families
// unable to register a real birth.
// ---------------------------------------------------------------------------
export function birthRegistrationWarnings(formData) {
  const warnings = [];
  const child = formData?.child || {};

  const weight = Number(child.child_weight_kg);
  if (
    child.child_weight_kg !== "" &&
    child.child_weight_kg != null &&
    !Number.isNaN(weight) &&
    weight > WEIGHT_SOFT_MAX &&
    weight <= WEIGHT_HARD_MAX
  ) {
    warnings.push(
      `Birth weight of ${weight}kg is unusually high — please confirm it's correct.`,
    );
  }

  if (child.child_dob_ad) {
    const dob = new Date(child.child_dob_ad);
    if (!Number.isNaN(dob.getTime())) {
      const daysAgo = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo > LATE_REGISTRATION_DAYS) {
        warnings.push(
          `This birth is being registered more than ${LATE_REGISTRATION_DAYS} days after the date of birth — a late registration fee may apply.`,
        );
      }
    }
  }

  return warnings;
}