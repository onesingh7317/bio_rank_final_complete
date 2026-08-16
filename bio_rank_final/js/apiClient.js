/* ============================================================
   apiClient.js — thin fetch() wrapper for talking to the Bio Rank
   backend (server/). Used by admin.js.

   ASSUMPTIONS FLAGGED (per Stage 8 instructions):
   - Backend base URL defaults to http://localhost:5000/api. Override by
     setting `window.BIO_RANK_API_BASE_URL` before this script loads
     (e.g. in index.html) once you have a real deployed backend URL.
   - Token storage: localStorage, under a key SEPARATE from the
     student-facing `State` object's `bioready_v1` blob (State is a
     purely local, backend-less object per data.js — deliberately not
     touching its shape). Key: `bioready_admin_token`. localStorage was
     chosen over sessionStorage so an admin doesn't have to re-login
     every time they close the tab, matching the JWT's 7-day expiry from
     Stage 2.
   - On a 401 response (expired/invalid token), the client clears the
     stored token and redirects to the admin login screen automatically,
     rather than surfacing a raw error the calling screen has to handle
     itself every time.
   ============================================================ */
const ApiClient = (() => {
  const BASE_URL = window.BIO_RANK_API_BASE_URL || 'http://localhost:5000/api';
  const TOKEN_KEY = 'bioready_admin_token';

  class ApiError extends Error {
    constructor(message, status, data) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function request(path, { method = 'GET', body, isFormData = false } = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

    let res;
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
      });
    } catch (err) {
      // Network-level failure (server down, CORS, offline) — distinct
      // from an HTTP error response, since there's no res/data to read.
      throw new ApiError('Could not reach the server. Is the backend running?', 0, null);
    }

    let data = null;
    try {
      data = await res.json();
    } catch {
      // No JSON body (e.g. some error pages) — leave data null, fall
      // through to status-based handling below.
    }

    if (res.status === 401) {
      clearToken();
      // Real redirect, not just a thrown error the caller might forget
      // to handle — every admin screen loses its session the same way.
      if (window.App) {
        App.navigate('admin-login');
        App.showToast?.('Session expired — please log in again.');
      }
      throw new ApiError((data && data.error) || 'Session expired.', 401, data);
    }

    if (!res.ok) {
      const message =
        (data && data.error) ||
        (data && data.errors && data.errors.join(' ')) ||
        `Request failed (${res.status}).`;
      throw new ApiError(message, res.status, data);
    }

    return data;
  }

  return {
    getToken,
    setToken,
    clearToken,
    ApiError,
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    del: (path) => request(path, { method: 'DELETE' }),
    upload: (path, formData) => request(path, { method: 'POST', body: formData, isFormData: true }),
  };
})();

window.ApiClient = ApiClient;
