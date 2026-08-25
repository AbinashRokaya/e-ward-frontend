// Vite only exposes env vars prefixed with VITE_. Values come from
// .env.development during `npm run dev` and .env.production during
// `npm run build`.
const raw = import.meta.env.VITE_API_URL;

// If the var is missing entirely (typo in the env file, or a fresh clone
// where .env.development wasn't copied), every request would silently
// become "undefined/v1/..." and fail with a confusing 404. Fail loudly in
// dev instead, and fall back to the deployed backend so the app still works.
//
// Note: an EMPTY string is deliberate, not missing — that's how the Vite
// dev proxy setup works (relative /v1/... paths). So only `undefined`
// triggers the fallback, never "".
let API_URL;

const FALLBACK_API_URL = "https://web-based-e-ward-management-system.onrender.com";

if (raw === undefined) {
  if (import.meta.env.DEV) {
    console.warn(
      "VITE_API_URL is not set. Check .env.development. " +
        `Falling back to ${FALLBACK_API_URL}`,
    );
  }
  API_URL = FALLBACK_API_URL;
} else {
  // Strip any trailing slash so `${API_URL}/v1/users/` never becomes
  // "//v1/users/" — some servers treat the double slash as a different
  // path and 404, and it breaks cookie scoping on others.
  API_URL = raw.replace(/\/+$/, "");
}

export default API_URL;