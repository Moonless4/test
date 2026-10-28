// Server-side admin auth client. The browser only ever holds an HttpOnly session
// cookie set by the API; no password, TOTP secret or backup code is stored here.

const request = async (path, { method = 'GET', body } = {}) => {
  try {
    const response = await fetch(`/api/admin${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    return { status: response.status, ...data };
  } catch {
    return { status: 0, ok: false, error: 'ارتباط با سرور برقرار نشد.' };
  }
};

export const fetchSession = () => request('/session');

export const signIn = ({ username, password }) =>
  request('/login', { method: 'POST', body: { username, password } });

export const startTwoFactorSetup = () => request('/2fa/setup', { method: 'POST' });

export const confirmTwoFactorSetup = ({ code }) =>
  request('/2fa/setup/confirm', { method: 'POST', body: { code } });

export const verifyTotp = ({ code }) => request('/2fa/verify', { method: 'POST', body: { code } });

export const verifyBackupCode = ({ code }) =>
  request('/backup/verify', { method: 'POST', body: { code } });

export const signOutAdmin = () => request('/logout', { method: 'POST' });

export const reauthenticate = (payload) => request('/reauth', { method: 'POST', body: payload });

export const changeCredentials = (payload) =>
  request('/credentials', { method: 'POST', body: payload });

export const regenerateBackupCodes = (payload) =>
  request('/backup/regenerate', { method: 'POST', body: payload });
