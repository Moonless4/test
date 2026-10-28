// Local admin authentication. There is no server, so protection is layered
// entirely in the browser: the password (and username) are stored only as a
// salted PBKDF2-SHA256 hash, a Google Authenticator (TOTP) code is required,
// failed attempts are throttled, and the session is a short-lived token.

import { generateSecret, matchTotpStep, otpauthUrl } from './totp.js';

const AUTH_KEY = 'atrin-admin-auth-v2';
const SESSION_KEY = 'atrin-admin-session-v2';
const LEGACY_CONTENT_KEY = 'atrin-site-v1';

const ITERATIONS = 150000;
const SESSION_TTL = 45 * 60 * 1000;
const MAX_FAILS = 5;
const LOCK_MS = 2 * 60 * 1000;

const encoder = new TextEncoder();

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

const randomSalt = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64(bytes);
};

const hashValue = async (value, salt) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(value), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromBase64(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return toBase64(new Uint8Array(bits));
};

const readRecord = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.hash ? parsed : null;
  } catch {
    return null;
  }
};

const writeRecord = (record) => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(record));
  } catch {
    /* storage can be unavailable */
  }
};

/* Plaintext credentials from the old content tree must never stay in storage */
const stripLegacyCredentials = () => {
  try {
    const raw = localStorage.getItem(LEGACY_CONTENT_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed?.settings) return;
    delete parsed.settings.adminUsername;
    delete parsed.settings.adminPassword;
    localStorage.setItem(LEGACY_CONTENT_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore malformed content */
  }
};

export const isCryptoAvailable = () =>
  typeof crypto !== 'undefined' && Boolean(crypto.subtle) && Boolean(crypto.getRandomValues);

export const hasAdminAccount = () => Boolean(readRecord());

export const getSecurityState = () => {
  const record = readRecord();
  if (!record) return { configured: false, twoFactorEnabled: false, lockedUntil: 0 };
  return {
    configured: true,
    twoFactorEnabled: Boolean(record.twoFactor?.enabled),
    lockedUntil: record.lockUntil || 0,
    username: record.username,
  };
};

const beginSession = () => {
  const token = toBase64(crypto.getRandomValues(new Uint8Array(18)));
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, exp: Date.now() + SESSION_TTL }));
  } catch {
    /* session storage can be unavailable */
  }
  return token;
};

export const isAdminSignedIn = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/* Panel navigation keeps the session alive; the tab closing still ends it */
export const touchSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...parsed, exp: Date.now() + SESSION_TTL }));
  } catch {
    /* ignore */
  }
};

export const signOutAdmin = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

const registerFailure = (record) => {
  const fails = (record?.fails || 0) + 1;
  const next = {
    ...(record || {}),
    fails,
    lockUntil: fails >= MAX_FAILS ? Date.now() + LOCK_MS : record?.lockUntil || 0,
  };
  if (record) writeRecord(next);
  return next;
};

const lockMessage = (record) => {
  const remaining = Math.ceil(((record?.lockUntil || 0) - Date.now()) / 1000);
  if (remaining > 0) {
    return `تلاش‌های ناموفق زیاد بود؛ ${remaining} ثانیه دیگر دوباره تلاش کنید.`;
  }
  return '';
};

export const createAdminAccount = async ({ username, password, confirm }) => {
  if (!isCryptoAvailable()) return { ok: false, error: 'مرورگر شما از رمزنگاری امن پشتیبانی نمی‌کند.' };
  if (hasAdminAccount()) return { ok: false, error: 'حساب مدیر قبلاً ساخته شده است.' };
  const user = (username || '').trim();
  if (user.length < 4) return { ok: false, error: 'نام کاربری باید حداقل ۴ کاراکتر باشد.' };
  if ((password || '').length < 8) return { ok: false, error: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' };
  if (password !== confirm) return { ok: false, error: 'تکرار رمز عبور مطابقت ندارد.' };

  const salt = randomSalt();
  writeRecord({
    username: user,
    salt,
    hash: await hashValue(user.toLowerCase(), salt),
    passHash: await hashValue(password, salt),
    twoFactor: null,
    fails: 0,
    lockUntil: 0,
    createdAt: new Date().toISOString(),
  });
  stripLegacyCredentials();
  return { ok: true };
};

export const verifyPassword = async ({ username, password, honeypot }) => {
  if (!isCryptoAvailable()) return { ok: false, error: 'مرورگر شما از رمزنگاری امن پشتیبانی نمی‌کند.' };
  const record = readRecord();
  if (!record) return { ok: false, error: 'حساب مدیر هنوز ساخته نشده است.' };

  const locked = lockMessage(record);
  if (locked) return { ok: false, error: locked };

  // Bots fill the hidden field; treat it as a normal wrong attempt (no hint).
  const bait = String(honeypot || '').trim().length > 0;

  const [userHash, passHash] = await Promise.all([
    hashValue((username || '').trim().toLowerCase(), record.salt),
    hashValue(password || '', record.salt),
  ]);

  const ok = !bait && userHash === record.hash && passHash === record.passHash;

  if (!ok) {
    const next = registerFailure(record);
    const message = lockMessage(next);
    return {
      ok: false,
      error: message || 'نام کاربری یا رمز عبور درست نیست.',
    };
  }

  writeRecord({ ...record, fails: 0, lockUntil: 0 });
  return { ok: true, twoFactorEnabled: Boolean(record.twoFactor?.enabled) };
};

const startEnrollment = (record) => {
  const secret = generateSecret();
  return {
    secret,
    url: otpauthUrl('Atrin Admin', record.username, secret),
  };
};

export const startTwoFactorSetup = () => {
  const record = readRecord();
  if (!record) return { ok: false, error: 'حساب مدیر یافت نشد.' };
  return { ok: true, ...startEnrollment(record) };
};

export const confirmTwoFactorSetup = async ({ secret, code }) => {
  const record = readRecord();
  if (!record) return { ok: false, error: 'حساب مدیر یافت نشد.' };
  const step = await matchTotpStep(secret, code);
  if (step === null) return { ok: false, error: 'کد تأیید درست نیست یا منقضی شده است.' };
  writeRecord({
    ...record,
    twoFactor: { enabled: true, secret, lastStep: step },
    fails: 0,
    lockUntil: 0,
  });
  beginSession();
  return { ok: true };
};

export const verifyTwoFactor = async (code) => {
  const record = readRecord();
  if (!record?.twoFactor?.enabled) return { ok: false, error: 'ورود دو مرحله‌ای فعال نیست.' };
  const locked = lockMessage(record);
  if (locked) return { ok: false, error: locked };
  const step = await matchTotpStep(record.twoFactor.secret, code);
  if (step === null) {
    const next = registerFailure(record);
    const message = lockMessage(next);
    return { ok: false, error: message || 'کد دو مرحله‌ای درست نیست.' };
  }
  if (record.twoFactor.lastStep && step <= record.twoFactor.lastStep) {
    return { ok: false, error: 'این کد قبلاً استفاده شده است؛ کد جدید را وارد کنید.' };
  }
  writeRecord({
    ...record,
    twoFactor: { ...record.twoFactor, lastStep: step },
    fails: 0,
    lockUntil: 0,
  });
  beginSession();
  return { ok: true };
};

export const disableTwoFactor = async (password) => {
  const record = readRecord();
  if (!record) return { ok: false, error: 'حساب مدیر یافت نشد.' };
  if ((await hashValue(password || '', record.salt)) !== record.passHash) {
    return { ok: false, error: 'رمز عبور درست نیست.' };
  }
  writeRecord({ ...record, twoFactor: null });
  return { ok: true };
};

export const updateCredentials = async ({ currentPassword, username, password, confirm }) => {
  const record = readRecord();
  if (!record) return { ok: false, error: 'حساب مدیر یافت نشد.' };
  if ((await hashValue(currentPassword || '', record.salt)) !== record.passHash) {
    return { ok: false, error: 'رمز عبور فعلی درست نیست.' };
  }
  const user = (username || '').trim();
  if (user.length < 4) return { ok: false, error: 'نام کاربری باید حداقل ۴ کاراکتر باشد.' };
  if ((password || '').length < 8) return { ok: false, error: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' };
  if (password !== confirm) return { ok: false, error: 'تکرار رمز عبور مطابقت ندارد.' };

  writeRecord({
    ...record,
    username: user,
    hash: await hashValue(user.toLowerCase(), record.salt),
    passHash: await hashValue(password, record.salt),
  });
  stripLegacyCredentials();
  return { ok: true };
};

export const finishSignIn = () => beginSession();
