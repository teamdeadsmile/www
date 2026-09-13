const BASE_URL = import.meta.env.VITE_API_URL || 'https://testeapideadsmilenova.vercel.app/api';
let csrfToken = null;
let csrfPromise = null;

class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function parseResponse(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function getCsrfToken({ force = false } = {}) {
  if (csrfToken && !force) return csrfToken;
  if (csrfPromise && !force) return csrfPromise;

  csrfPromise = fetch(`${BASE_URL}/csrf`, { credentials: 'include' })
    .then(async (res) => {
      const payload = await parseResponse(res);
      if (!res.ok || !payload?.data?.token) {
        throw new ApiError('Unable to initialize request security.', res.status, 'CSRF_INIT_FAILED');
      }
      csrfToken = payload.data.token;
      return csrfToken;
    })
    .catch((err) => {
      csrfToken = null;
      if (err instanceof ApiError) throw err;
      throw new ApiError('Unable to reach the server. Check your connection.', 0, 'NETWORK_ERROR');
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
}

async function request(path, { method = 'GET', body, params, retryCsrf = true } = {}) {
  let url = `${BASE_URL}${path}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (query) url += `?${query}`;
  }

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    headers['X-CSRF-Token'] = await getCsrfToken();
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection.', 0, 'NETWORK_ERROR');
  }

  const payload = await parseResponse(res);

  if (!res.ok) {
    const code = payload?.error?.code || 'UNKNOWN_ERROR';
    if (res.status === 403 && code === 'CSRF_VALIDATION_FAILED' && retryCsrf) {
      await getCsrfToken({ force: true });
      return request(path, { method, body, params, retryCsrf: false });
    }

    throw new ApiError(payload?.error?.message || 'Something went wrong.', res.status, code);
  }

  return payload?.data;
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path, body) => request(path, { method: 'DELETE', body }),
};

export { ApiError };
