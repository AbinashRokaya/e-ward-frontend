import API_URL from "../api/api";

// API_URL is likely "http://host:port/v1" or similar — strip the /v1 to get the server root
const SERVER_ROOT = API_URL.replace(/\/v1.*$/, "");

export function wardImageUrl(path) {
  if (!path) return null;

  // ward_logo_path / chairperson_signature_path / chairperson_stamp_path now
  // store a full Cloudinary URL after the Cloudinary migration — use it
  // as-is. Only pre-migration records still hold a bare relative path like
  // "wards/<ward_id>/logo_abcd1234.png", which needs the /static prefix.
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${SERVER_ROOT}/static/${path}`;
}
