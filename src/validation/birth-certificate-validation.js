import * as yup from "yup";

// Reusable regex patterns
const phoneRegex = /^(98|97|96)\d{8}$/; // Standard Nepali mobile number validation
const citizenshipRegex = /^[0-9\/\s\-]+$/; // Validates numbers, slashes, dashes, or spaces

export const birthRegistrationSchema = yup.object().shape({
  // --- Child's Basic Information ---
  firstName: yup.string().trim().required("First name is required"),
  middleName: yup.string().trim(), // Optional field
  lastName: yup.string().trim().required("Last name is required"),
  gender: yup.string().required("Gender selection is required"),
  dob: yup
    .date()
    .typeError("Please enter a valid date")
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required"),
  birthType: yup
    .string()
    .required("Birth type is required (e.g., Single, Twins)"),
  birthPlace: yup
    .string()
    .trim()
    .required("Birth place is required (e.g., Hospital, Home)"),

  // --- Father's Information ---
  fatherFirstName: yup
    .string()
    .trim()
    .required("Father's first name is required"),
  fatherMiddleName: yup.string().trim(),
  fatherLastName: yup
    .string()
    .trim()
    .required("Father's last name is required"),
  fatherOccupation: yup
    .string()
    .trim()
    .required("Father's occupation is required"),
  fatherNationality: yup
    .string()
    .trim()
    .required("Father's nationality is required"),
  fatherPhone: yup
    .string()
    .matches(phoneRegex, "Enter a valid 10-digit mobile number")
    .required("Father's phone number is required"),
  fatherAddress: yup.string().trim().required("Father's address is required"),
  fatherCitizenshipNo: yup
    .string()
    .trim()
    .matches(citizenshipRegex, "Enter a valid citizenship number format")
    .required("Father's citizenship number is required"),

  // --- Mother's Information ---
  motherFirstName: yup
    .string()
    .trim()
    .required("Mother's first name is required"),
  motherMiddleName: yup.string().trim(),
  motherLastName: yup
    .string()
    .trim()
    .required("Mother's last name is required"),
  motherOccupation: yup
    .string()
    .trim()
    .required("Mother's occupation is required"),
  motherNationality: yup
    .string()
    .trim()
    .required("Mother's nationality is required"),
  motherPhone: yup
    .string()
    .matches(phoneRegex, "Enter a valid 10-digit mobile number")
    .required("Mother's phone number is required"),
  motherAddress: yup.string().trim().required("Mother's address is required"),
  motherCitizenshipNo: yup
    .string()
    .trim()
    .matches(citizenshipRegex, "Enter a valid citizenship number format")
    .required("Mother's citizenship number is required"),

  // --- Address Information ---
  province: yup.string().required("Province is required"),
  district: yup.string().required("District is required"),
  municipality: yup
    .string()
    .required("Municipality/Rural Municipality is required"),
  wardNo: yup
    .number()
    .typeError("Ward number must be a digit")
    .integer("Ward number cannot contain decimals")
    .positive("Ward number must be greater than 0")
    .required("Ward number is required"),
  tole: yup.string().trim().required("Tole/Village name is required"),

  // --- Informant Information ---
  informantName: yup
    .string()
    .trim()
    .required("Informant's full name is required"),
  relationship: yup
    .string()
    .trim()
    .required("Relationship to the child is required"),
  informantPhone: yup
    .string()
    .matches(phoneRegex, "Enter a valid 10-digit mobile number")
    .required("Informant's phone number is required"),
  informantCitizenship: yup
    .string()
    .trim()
    .matches(citizenshipRegex, "Enter a valid citizenship number format")
    .required("Informant's citizenship number is required"),
});
