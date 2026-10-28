// The admin panel talks to the content API on the same origin (Vite proxies
// `/api`), so the session cookie is a normal same-site cookie.
async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? { Accept: 'application/json' } : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'درخواست ناموفق بود.');
  return data;
}

export const getSession = () => request('/api/session');
export const login = (username, password) => request('/api/login', { method: 'POST', body: { username, password } });
export const logout = () => request('/api/logout', { method: 'POST' });
export const getContent = () => request('/api/admin/content');
export const saveContent = (patch) => request('/api/admin/content', { method: 'PUT', body: patch });
