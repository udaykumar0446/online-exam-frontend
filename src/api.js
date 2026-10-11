const BASE = (import.meta.env.VITE_API_URL || 'https://online-exam-backend-ll6f.onrender.com/api').replace(/\/$/, '');

export const session = {
  get: () => JSON.parse(localStorage.getItem('session') || 'null'),
  set: (s) => localStorage.setItem('session', JSON.stringify(s)),
  clear: () => localStorage.removeItem('session'),
};

export async function api(path, method = 'GET', body) {
  const s = session.get();

  const res = await fetch(BASE + (path.startsWith('/') ? path : '/' + path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(s ? { Authorization: 'Bearer ' + s.token } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && s) {
    session.clear();
    window.location.href = '/';
    throw new Error('Your session has expired. Please log in again.');
  }

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }

  return data;
}
