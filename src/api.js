const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const session = {
  get: () => JSON.parse(localStorage.getItem('session') || 'null'),
  set: (s) => localStorage.setItem('session', JSON.stringify(s)),
  clear: () => localStorage.removeItem('session'),
};

export async function api(path, method = 'GET', body) {
  const s = session.get();
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(s ? { Authorization: 'Bearer ' + s.token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && s) { session.clear(); window.location.href = '/'; }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error((data && data.message) || 'Something went wrong. Please try again.');
  return data;
}
