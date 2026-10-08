/**
 * Central API client.
 * All fetch calls go through here so we never duplicate headers/credentials.
 *
 * VITE_API_URL defaults to '' (empty string) so that Vite's proxy handles /api
 * during development. In production set it to the API's origin if needed.
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function request(method, path, body = null) {
  const opts = {
    method,
    credentials: 'include',          // send session cookie with every request
    headers: {},
  };

  if (body !== null) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}/api${path}`, opts);
  } catch (networkErr) {
    // Network failure (offline, server down, etc.)
    const err = new Error('Network error — check your connection');
    err.type = 'network';
    throw err;
  }

  if (res.status === 401) {
    // Session expired or not logged in — signal app to show login
    window.dispatchEvent(new Event('auth:expired'));
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: res.statusText }));
    const err = new Error(data.detail || 'Request failed');
    err.status = res.status;
    throw err;
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
};

export { API_BASE };
