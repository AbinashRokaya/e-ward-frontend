import API_URL from "../api/api";

// API_URL is likely "http://host:port/v1" or similar — strip the /v1 to get the server root
const SERVER_ROOT = API_URL.replace(/\/v1.*$/, "");

export function wardImageUrl(path) {
  if (!path) return null;
  return `${SERVER_ROOT}/static/${path}`;
}
