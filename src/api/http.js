import API_URL from "./api";

// Every endpoint in this backend uses cookie auth — the login route sets
// an httpOnly access_token cookie, so credentials:"include" is all that's
// needed. No Authorization header anywhere.

async function parseResponse(res) {
  // Some routes return JSON objects, others a bare string. Try JSON,
  // fall back to text so a valid 200 never throws.
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail = data?.detail || data?.message;
    const err = new Error(
      typeof detail === "string"
        ? detail
        : detail
          ? JSON.stringify(detail)
          : `Request failed with status ${res.status}`,
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// JSON requests.
export async function apiFetch(path, { method = "GET", body, params } = {}) {
  let url = `${API_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    ).toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseResponse(res);
}

// multipart/form-data requests (file uploads).
// Never set Content-Type manually — the browser must add its own boundary.
export async function apiFetchForm(path, fields, { method = "POST" } = {}) {
  const formData = new FormData();
  Object.entries(fields || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  });
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    body: formData,
  });
  return parseResponse(res);
}