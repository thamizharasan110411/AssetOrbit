const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SESSION_KEY = 'assetorbit-session';

function readToken() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    return session.token;
  } catch {
    return null;
  }
}

export function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const text = query.toString();
  return text ? `?${text}` : '';
}

async function request(path, options = {}) {
  const token = readToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed.');
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }

  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' })
};

export { API_BASE, SESSION_KEY };
