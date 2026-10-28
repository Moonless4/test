const SESSION_KEY = 'atrin-admin-session-v1';

export function isAdminSignedIn() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function signInAdmin(settings, username, password) {
  const user = (username || '').trim();
  const ok = user === settings.adminUsername && password === settings.adminPassword;
  if (ok) {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* session storage can be unavailable */
    }
  }
  return ok;
}

export function signOutAdmin() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
