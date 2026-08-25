import * as yup from "yup";
import { BSToAD } from "bikram-sambat-js";

// ---------------------------------------------------------------------------
// Validation for the death registration form. Field names match the form's
// nested shape (deceased / death_detail / informant / address) and the
// backend's UpdateDeceasedRequest / UpdateDeathDetailRequest schemas.
//
// DATE HANDLING: this form records death_date_bs and declared_date_bs in
// Bikram Sambat only, while the deceased's DOB is captured in both BS and AD.
// Cross-date checks therefore convert BS -> AD before comparing, using the
// bikram-sambat-js dependency already in the project. Conversion is wrapped
// in try/catch because the library throws on out-of-range or malformed dates,
// and a conversion failure should surface as "enter a valid date" rather than
// crashing the submit handler.
// ---------------------------------------------------------------------------

const phoneRegex = /^(98|97|96)\d{8}$/;
const citizenshipRegex = /^[0-9/\s-]+$/;
const bsDateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Nepal's registration Act gives a 35-day window; past that a late fee
// usually applies. Worth flagging, never worth blocking — late death
// registrations are legal, common, and often unavoidable.
const LATE_REGISTRATION_DAYS = 35;

// Oldest reliably documented human lifespan is ~122 years. Anything beyond
// this is a data-entry error rather than a record worth preserving.
const MAX_AGE_YEARS = 125;

// Returns a JS Date for a BS date string, or null if it can't be converted.
function bsToDate(bsString) {
  if (!bsString || !bsDateRegex.test(bsString)) return null;
  try {
    const ad = BSToAD(bsString);
    const d = new Date(ad);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

const deceasedSchema = yup.object().shape({
  deceased_first_name: yup
    .string()
    .trim()
    .required("Deceased's first name is required"),
  deceased_middle_name: yup.string().trim().nullable(),
  deceased_last_name: yup
    .string()
    .trim()
    .required("Deceased's last name is required"),

  deceased_nepali_first_name: yup.string().trim().nullable(),
  deceased_nepali_middle_name: yup.string().trim().nullable(),
  deceased_nepali_last_name: yup.string().trim().nullable(),

  deceased_gender: yup
    .string()
    .oneOf(["MALE", "FEMALE", "OTHER"], "Select a valid gender")
    .required("Deceased's gender is required"),

  deceased_dob_bs: yup
    .string()
    .trim()
    .matches(bsDateRegex, {
      message: "Date of birth (BS) must be in YYYY-MM-DD format",
      excludeEmptyString: true,
    })
    .nullable(),

  deceased_dob_ad: yup
    .date()
    .transform((value, original) =>
      original === "" || original === null ? undefined : value,
    )
    .typeError("Enter a valid date of birth")
    .max(new Date(), "Date of birth cannot be in the future")
    .nullable(),

  // Age is recorded as three separate parts. Each is optional on its own —
  // for an elderly death the family may know only the year — but none may be
  // negative or nonsensical.
  deceased_age_years: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Age in years must be a number")
    .integer("Age in years cannot contain decimals")
    .min(0, "Age in years cannot be negative")
    .max(MAX_AGE_YEARS, `Age in years cannot exceed ${MAX_AGE_YEARS}`)
    .nullable(),
  deceased_age_months: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Age in months must be a number")
    .integer("Age in months cannot contain decimals")
    .min(0, "Age in months cannot be negative")
    .max(11, "Age in months must be between 0 and 11")
    .nullable(),
  deceased_age_days: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Age in days must be a number")
    .integer("Age in days cannot contain decimals")
    .min(0, "Age in days cannot be negative")
    .max(31, "Age in days must be between 0 and 31")
    .nullable(),

  deceased_marital_status: yup
    .string()
    .required("Deceased's marital status is required"),

  deceased_citizenship_no: yup
    .string()
    .trim()
    .matches(citizenshipRegex, {
      message: "Citizenship number may only contain digits, / and -",
      excludeEmptyString: true,
    })
    .nullable(),

  deceased_occupation: yup.string().trim().nullable(),
  deceased_other_id_no: yup.string().trim().nullable(),
});

const deathDetailSchema = yup.object().shape({
  death_date_bs: yup
    .string()
    .trim()
    .matches(bsDateRegex, "Date of death (BS) must be in YYYY-MM-DD format")
    .required("Date of death is required"),

  death_time_period: yup.string().trim().nullable(),
  death_time: yup.string().trim().nullable(),

  death_place_type: yup.string().required("Place of death is required"),

  // Only meaningful when the place is "other" — the form should be
  // collecting it conditionally, so it stays optional here.
  death_place_other_detail: yup.string().trim().nullable(),

  death_cause: yup.string().trim().required("Cause of death is required"),
  death_type: yup.string().required("Type of death is required"),
  death_type_other_detail: yup.string().trim().nullable(),

  residence_duration_years: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Residence duration (years) must be a number")
    .min(0, "Residence duration cannot be negative")
    .nullable(),
  residence_duration_months: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Residence duration (months) must be a number")
    .min(0, "Residence duration cannot be negative")
    .max(11, "Residence months must be between 0 and 11")
    .nullable(),
  residence_duration_days: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Residence duration (days) must be a number")
    .min(0, "Residence duration cannot be negative")
    .max(31, "Residence days must be between 0 and 31")
    .nullable(),
});

const informantSchema = yup.object().shape({
  informant_name: yup.string().trim().required("Informant's name is required"),
  informant_relationship: yup
    .string()
    .trim()
    .required("Informant's relationship to the deceased is required"),
  informant_contact_no: yup
    .string()
    .trim()
    .matches(phoneRegex, {
      message: "Informant's phone must be a valid 10-digit Nepali mobile number",
      excludeEmptyString: true,
    })
    .nullable(),
  declared_date_bs: yup
    .string()
    .trim()
    .matches(bsDateRegex, {
      message: "Declared date (BS) must be in YYYY-MM-DD format",
      excludeEmptyString: true,
    })
    .nullable(),
});

// The deceased's own address is required; the death-place and informant
// addresses are commonly the same and may be filled from it, so they're
// checked only for internal consistency rather than demanded outright.
const addressSchema = yup.object().shape({
  deceased_province: yup.string().trim().required("Deceased's province is required"),
  deceased_district: yup.string().trim().required("Deceased's district is required"),
  deceased_municipality: yup
    .string()
    .trim()
    .required("Deceased's municipality is required"),
  deceased_ward_number: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Ward number must be a digit")
    .integer("Ward number cannot contain decimals")
    .positive("Ward number must be greater than 0")
    .required("Deceased's ward number is required"),
  deceased_tole: yup.string().trim().nullable(),

  death_place_province: yup.string().trim().nullable(),
  death_place_district: yup.string().trim().nullable(),
  death_place_municipality: yup.string().trim().nullable(),
  death_place_ward_number: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Death place ward number must be a digit")
    .integer("Ward number cannot contain decimals")
    .positive("Ward number must be greater than 0")
    .nullable(),
  death_place_tole: yup.string().trim().nullable(),

  informant_province: yup.string().trim().nullable(),
  informant_district: yup.string().trim().nullable(),
  informant_municipality: yup.string().trim().nullable(),
  informant_ward_number: yup
    .number()
    .transform((v, o) => (o === "" || o === null ? undefined : v))
    .typeError("Informant ward number must be a digit")
    .integer("Ward number cannot contain decimals")
    .positive("Ward number must be greater than 0")
    .nullable(),
  informant_tole: yup.string().trim().nullable(),
});

export const deathRegistrationSchema = yup.object().shape({
  register_ward_id: yup.string().trim().required("Ward selection is required"),
  deceased: deceasedSchema.required(),
  death_detail: deathDetailSchema.required(),
  informant: informantSchema.required(),
  address: addressSchema.required(),
});

// Cross-field checks that span more than one section, so they don't fit
// cleanly inside a single yup schema.
function crossFieldErrors(formData) {
  const errors = [];
  const deceased = formData?.deceased || {};
  const detail = formData?.death_detail || {};
  const informant = formData?.informant || {};

  const deathDate = bsToDate(detail.death_date_bs);
  const declaredDate = bsToDate(informant.declared_date_bs);

  // A malformed BS date passes the regex but fails conversion (e.g. month 13).
  if (detail.death_date_bs && !deathDate) {
    errors.push("Date of death is not a valid Bikram Sambat date.");
  }
  if (informant.declared_date_bs && !declaredDate) {
    errors.push("Declared date is not a valid Bikram Sambat date.");
  }

  if (deathDate && deathDate > new Date()) {
    errors.push("Date of death cannot be in the future.");
  }

  // A death can't precede the person's birth.
  const dobAd = deceased.deceased_dob_ad
    ? new Date(deceased.deceased_dob_ad)
    : bsToDate(deceased.deceased_dob_bs);

  if (deathDate && dobAd && !Number.isNaN(dobAd.getTime()) && deathDate < dobAd) {
    errors.push("Date of death cannot be earlier than the date of birth.");
  }

  // The declaration is made when reporting the death, so it can't predate it.
  if (deathDate && declaredDate && declaredDate < deathDate) {
    errors.push("Declared date cannot be earlier than the date of death.");
  }

  // If both DOB and death date are known, the stated age should roughly
  // agree with them. Allowed to be off by a year since the form records
  // years/months/days separately and rounding differs between BS and AD.
  const statedYears = Number(deceased.deceased_age_years);
  if (
    deathDate &&
    dobAd &&
    !Number.isNaN(dobAd.getTime()) &&
    !Number.isNaN(statedYears) &&
    deceased.deceased_age_years !== "" &&
    deceased.deceased_age_years != null
  ) {
    const computedYears =
      (deathDate - dobAd) / (1000 * 60 * 60 * 24 * 365.25);
    if (Math.abs(computedYears - statedYears) > 1) {
      errors.push(
        `Age at death (${statedYears} years) doesn't match the dates given — that span is about ${Math.floor(
          computedYears,
        )} years.`,
      );
    }
  }

  return errors;
}

export function validateDeathRegistration(formData) {
  const errors = [];

  try {
    deathRegistrationSchema.validateSync(formData, { abortEarly: false });
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

// Non-blocking — flagged for a second look, never a reason to refuse a
// legitimate registration.
export function deathRegistrationWarnings(formData) {
  const warnings = [];
  const detail = formData?.death_detail || {};

  const deathDate = bsToDate(detail.death_date_bs);
  if (deathDate) {
    const daysAgo = (Date.now() - deathDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo > LATE_REGISTRATION_DAYS) {
      warnings.push(
        `This death is being registered more than ${LATE_REGISTRATION_DAYS} days after it occurred — a late registration fee may apply.`,
      );
    }
  }

  // An unnatural death normally needs a police report attached.
  if (detail.death_type && detail.death_type !== "NATURAL") {
    warnings.push(
      "For a non-natural death, a police report is usually required — please attach one if you have it.",
    );
  }

  return warnings;
}