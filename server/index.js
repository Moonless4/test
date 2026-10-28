// Admin authentication API. All authentication and authorization decisions are
// made here, never in the browser: password, TOTP and one-time backup code, an
// HttpOnly session cookie, server-side lockout and re-authentication.

import http from 'node:http';
import crypto from 'node:crypto';
import QRCode from 'qrcode';

import {
  createBackupCodes,
  formatSecret,
  hashBackupCode,
  hashPassword,
  normalizeBackupCode,
  otpauthUrl,
  passwordProblem,
  verifyPassword,
  verifyTotp,
  generateTotpSecret,
} from './security.js';
import {
  backupCodesRemaining,
  clearChallenge,
  clearFailures,
  consumeReauth,
  createChallenge,
  createSession,
  destroyAllSessions,
  destroySession,
  getChallenge,
  getSession,
  grantReauth,
  lockRemaining,
  provisionAdmin,
  readAdmin,
  registerFailure,
  updateChallenge,
  writeAdmin,
} from './store.js';

const PORT = Number(process.env.PORT || 4000);
const ISSUER = 'Atrin Admin';
const SESSION_COOKIE = 'atrin_admin_session';
const CHALLENGE_COOKIE = 'atrin_admin_challenge';
const BODY_LIMIT = 16 * 1024;
const LOCKED_MESSAGE = 'تلاش‌های ناموفق زیاد بود؛ لطفاً بعداً دوباره تلاش کنید.';
const INVALID_MESSAGE = 'نام کاربری یا رمز عبور درست نیست.';

/* ---------------- helpers ---------------- */

const parseCookies = (header = '') => {
  const out = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return out;
};

const isSecureRequest = (req) =>
  Boolean(req.socket.encrypted) ||
  String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';

const cookie = (name, value, { maxAge, req, path = '/' }) => {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, 'HttpOnly', 'SameSite=Strict'];
  if (isSecureRequest(req)) parts.push('Secure');
  parts.push(`Max-Age=${Math.floor(maxAge / 1000)}`);
  return parts.join('; ');
};

const clearCookie = (name, req, path = '/') => cookie(name, '', { maxAge: 0, req, path });

const send = (res, status, payload, cookies = []) => {
  const body = JSON.stringify(payload);
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
  if (cookies.length) headers['Set-Cookie'] = cookies;
  res.writeHead(status, headers);
  res.end(body);
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        reject(new Error('too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        resolve(parsed && typeof parsed === 'object' ? parsed : {});
      } catch {
        reject(new Error('bad_json'));
      }
    });
    req.on('error', reject);
  });

const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.socket.remoteAddress ||
  'unknown';

// CSRF hardening on top of SameSite=Strict: a browser-sent Origin must belong to
// this deployment. Sandbox previews expose the app on a different host than the
// one the internal proxy forwards, so those suffixes are allowed explicitly.
const previewSuffixes = () =>
  [process.env.BASE44_PUBLIC_HOST_SUFFIX, process.env.BASE44_SANDBOX_HOST_DOMAIN].filter(Boolean);

const sameOrigin = (req) => {
  const origin = req.headers.origin;
  if (!origin) return true;
  let hostname;
  try {
    hostname = new URL(origin).host;
  } catch {
    return false;
  }
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  if (hostname === host) return true;
  return previewSuffixes().some((suffix) => hostname.endsWith(`-${suffix}`) || hostname.endsWith(`.${suffix}`));
};

const safeEqual = (a, b) => {
  const left = crypto.createHash('sha256').update(String(a ?? '')).digest();
  const right = crypto.createHash('sha256').update(String(b ?? '')).digest();
  return crypto.timingSafeEqual(left, right);
};

const sessionToken = (req) => parseCookies(req.headers.cookie)[SESSION_COOKIE] || '';
const challengeToken = (req) => parseCookies(req.headers.cookie)[CHALLENGE_COOKIE] || '';

const lockedResponse = (res, remaining) =>
  send(res, 429, {
    ok: false,
    error: LOCKED_MESSAGE,
    locked: true,
    retryAfter: Math.ceil(remaining / 1000),
  });

// Cheap per-IP throttle so a script cannot hammer the auth endpoints at all.
const ipAttempts = new Map();
const throttled = (ip) => {
  const now = Date.now();
  const entry = ipAttempts.get(ip) || { count: 0, since: now };
  if (now - entry.since > 10 * 60 * 1000) {
    entry.count = 0;
    entry.since = now;
  }
  entry.count += 1;
  ipAttempts.set(ip, entry);
  return entry.count > 40;
};

const fail = (res, ip, extra = {}) => {
  const remaining = registerFailure(ip);
  if (remaining > 0) return lockedResponse(res, remaining);
  return send(res, 401, { ok: false, error: INVALID_MESSAGE, ...extra });
};

/* ---------------- route handlers ---------------- */

const login = async (req, res) => {
  const ip = clientIp(req);
  const remaining = lockRemaining();
  if (remaining > 0) return lockedResponse(res, remaining);
  if (throttled(ip)) return lockedResponse(res, 60 * 1000);

  const body = await readJson(req);
  const record = readAdmin();
  const usernameOk = record ? safeEqual(String(body.username || '').trim(), record.username) : false;
  const passwordOk = record ? verifyPassword(body.password, record.password) : false;

  if (!record || !usernameOk || !passwordOk) {
    // Identical answer for unknown user and wrong password; no field hints.
    return fail(res, ip);
  }

  const enrolled = Boolean(record.totp?.enrolledAt && record.totp?.secret);
  const stage = enrolled ? 'totp' : 'enroll';
  const token = createChallenge(stage, record.username);
  const setCookie = cookie(CHALLENGE_COOKIE, token, {
    maxAge: 5 * 60 * 1000,
    req,
    path: '/api/admin',
  });
  return send(res, 200, { ok: true, next: stage }, [setCookie]);
};

const setupStart = async (req, res) => {
  const challenge = getChallenge(challengeToken(req));
  if (!challenge || challenge.stage !== 'enroll') {
    return send(res, 401, { ok: false, error: 'نشست ورود منقضی شده است؛ دوباره وارد شوید.' });
  }
  const secret = generateTotpSecret();
  challenge.secret = secret;
  const url = otpauthUrl(ISSUER, challenge.username, secret);
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 240, errorCorrectionLevel: 'M' });
  return send(res, 200, { ok: true, secret, formatted: formatSecret(secret), otpauth: url, qr });
};

const setupConfirm = async (req, res) => {
  const token = challengeToken(req);
  const challenge = getChallenge(token);
  if (!challenge || challenge.stage !== 'enroll' || !challenge.secret) {
    return send(res, 401, { ok: false, error: 'نشست راه‌اندازی منقضی شده است؛ دوباره وارد شوید.' });
  }
  const ip = clientIp(req);
  if (lockRemaining() > 0) return lockedResponse(res, lockRemaining());

  const body = await readJson(req);
  const step = verifyTotp(challenge.secret, body.code, 0);
  if (step === null) return fail(res, ip, { error: 'کد تأیید درست نیست یا منقضی شده است.' });

  const record = readAdmin();
  const { codes, entries } = createBackupCodes(record.backupKey);
  writeAdmin({
    ...record,
    totp: { secret: challenge.secret, lastStep: step, enrolledAt: new Date().toISOString() },
    backupCodes: entries,
    updatedAt: new Date().toISOString(),
  });
  updateChallenge(token, 'backup');
  challenge.secret = null;
  // Plaintext codes are returned exactly once and never stored or logged again.
  return send(res, 200, { ok: true, next: 'backup', backupCodes: codes });
};

const verifySecondFactor = async (req, res) => {
  const challenge = getChallenge(challengeToken(req));
  if (!challenge || challenge.stage !== 'totp') {
    return send(res, 401, { ok: false, error: 'نشست ورود منقضی شده است؛ دوباره وارد شوید.' });
  }
  const remaining = lockRemaining();
  if (remaining > 0) return lockedResponse(res, remaining);

  const body = await readJson(req);
  const record = readAdmin();
  const step = verifyTotp(record?.totp?.secret, body.code, record?.totp?.lastStep || 0);
  if (step === null) {
    return fail(res, clientIp(req), { error: 'کد دو مرحله‌ای درست نیست یا قبلاً استفاده شده است.' });
  }
  writeAdmin({
    ...record,
    totp: { ...record.totp, lastStep: step },
    updatedAt: new Date().toISOString(),
  });
  updateChallenge(challengeToken(req), 'backup');
  return send(res, 200, { ok: true, next: 'backup' });
};

const verifyBackup = async (req, res) => {
  const token = challengeToken(req);
  const challenge = getChallenge(token);
  if (!challenge || challenge.stage !== 'backup') {
    return send(res, 401, { ok: false, error: 'نشست ورود منقضی شده است؛ دوباره وارد شوید.' });
  }
  const remaining = lockRemaining();
  if (remaining > 0) return lockedResponse(res, remaining);

  const body = await readJson(req);
  const record = readAdmin();
  const clean = normalizeBackupCode(body.code);
  if (clean.length !== 8) {
    return fail(res, clientIp(req), { error: 'کد پشتیبان باید ۸ کاراکتر باشد.' });
  }
  const hash = hashBackupCode(clean, record.backupKey);
  const codes = record.backupCodes || [];
  const index = codes.findIndex((entry) => !entry.usedAt && entry.hash === hash);
  if (index === -1) {
    return fail(res, clientIp(req), { error: 'کد پشتیبان درست نیست یا قبلاً استفاده شده است.' });
  }

  const backupCodes = codes.map((entry, position) =>
    position === index ? { ...entry, usedAt: new Date().toISOString() } : entry
  );
  const updated = writeAdmin({ ...record, backupCodes, updatedAt: new Date().toISOString() });

  // Complete flow: rotate into a brand-new session and drop the login challenge.
  const session = createSession(updated.sessionVersion);
  clearChallenge(token);
  clearFailures();
  return send(
    res,
    200,
    {
      ok: true,
      authenticated: true,
      username: updated.username,
      backupCodesRemaining: backupCodesRemaining(updated),
    },
    [
      cookie(CHALLENGE_COOKIE, '', { maxAge: 0, req, path: '/api/admin' }),
      cookie(SESSION_COOKIE, session, { maxAge: 30 * 60 * 1000, req }),
    ]
  );
};

const sessionInfo = (req, res) => {
  const session = getSession(sessionToken(req));
  if (!session) {
    return send(res, 401, { authenticated: false }, [clearCookie(SESSION_COOKIE, req)]);
  }
  const record = readAdmin();
  return send(res, 200, {
    authenticated: true,
    username: record.username,
    twoFactorEnabled: Boolean(record.totp?.enrolledAt),
    backupCodesRemaining: backupCodesRemaining(record),
  });
};

const logout = (req, res) => {
  destroySession(sessionToken(req));
  return send(res, 200, { ok: true }, [clearCookie(SESSION_COOKIE, req)]);
};

const reauth = async (req, res) => {
  const token = sessionToken(req);
  const session = getSession(token);
  if (!session) return send(res, 401, { ok: false, error: 'برای ادامه دوباره وارد شوید.' });

  const ip = clientIp(req);
  const remaining = lockRemaining();
  if (remaining > 0) return lockedResponse(res, remaining);
  if (throttled(ip)) return lockedResponse(res, 60 * 1000);

  const body = await readJson(req);
  const record = readAdmin();
  const usernameOk = safeEqual(String(body.username || '').trim(), record.username);
  const passwordOk = verifyPassword(body.password, record.password);
  if (!usernameOk || !passwordOk) return fail(res, ip);

  const step = verifyTotp(record.totp?.secret, body.totp, record.totp?.lastStep || 0);
  if (step === null) return fail(res, ip);
  if (step > (record.totp?.lastStep || 0)) {
    writeAdmin({ ...record, totp: { ...record.totp, lastStep: step } });
  }

  const clean = normalizeBackupCode(body.backupCode);
  const codes = record.backupCodes || [];
  const index = codes.findIndex(
    (entry) => !entry.usedAt && entry.hash === hashBackupCode(clean, record.backupKey)
  );
  if (clean.length !== 8 || index === -1) {
    return fail(res, ip, { error: 'کد پشتیبان درست نیست یا قبلاً استفاده شده است.' });
  }

  const backupCodes = codes.map((entry, position) =>
    position === index ? { ...entry, usedAt: new Date().toISOString() } : entry
  );
  writeAdmin({ ...readAdmin(), backupCodes });
  clearFailures();
  const granted = grantReauth(token);
  return send(res, 200, { ok: true, ...granted });
};

const requireSession = (req, res) => {
  const token = sessionToken(req);
  const session = getSession(token);
  if (!session) {
    send(res, 401, { ok: false, error: 'برای این عملیات باید دوباره وارد شوید.' }, [
      clearCookie(SESSION_COOKIE, req),
    ]);
    return null;
  }
  return { token, session };
};

const changeCredentials = async (req, res) => {
  const auth = requireSession(req, res);
  if (!auth) return;
  const body = await readJson(req);
  const reauthToken = req.headers['x-reauth-token'] || body.reauthToken;

  const record = readAdmin();
  const username = String(body.username || '').trim();
  if (username.length < 4) return send(res, 400, { ok: false, error: 'نام کاربری باید حداقل ۴ کاراکتر باشد.' });
  const problem = passwordProblem(body.password);
  if (problem) return send(res, 400, { ok: false, error: problem });
  if (body.password !== body.confirm) {
    return send(res, 400, { ok: false, error: 'تکرار رمز عبور مطابقت ندارد.' });
  }
  // Validate first, then spend the single-use re-authentication token.
  if (!consumeReauth(auth.token, reauthToken)) {
    return send(res, 403, { ok: false, error: 'احراز هویت مجدد لازم است.', reauthRequired: true });
  }

  writeAdmin({
    ...record,
    username,
    password: hashPassword(body.password),
    sessionVersion: (record.sessionVersion || 1) + 1,
    updatedAt: new Date().toISOString(),
  });
  // Password change ends every existing session, including this one.
  destroyAllSessions();
  return send(res, 200, { ok: true, relogin: true }, [clearCookie(SESSION_COOKIE, req)]);
};

const regenerateBackupCodes = async (req, res) => {
  const auth = requireSession(req, res);
  if (!auth) return;
  const body = await readJson(req);
  const reauthToken = req.headers['x-reauth-token'] || body.reauthToken;
  if (!consumeReauth(auth.token, reauthToken)) {
    return send(res, 403, { ok: false, error: 'احراز هویت مجدد لازم است.', reauthRequired: true });
  }
  const record = readAdmin();
  const { codes, entries } = createBackupCodes(record.backupKey);
  writeAdmin({ ...record, backupCodes: entries, updatedAt: new Date().toISOString() });
  return send(res, 200, { ok: true, backupCodes: codes });
};

/* ---------------- server ---------------- */

const ROUTES = {
  'POST /api/admin/login': login,
  'POST /api/admin/2fa/setup': setupStart,
  'POST /api/admin/2fa/setup/confirm': setupConfirm,
  'POST /api/admin/2fa/verify': verifySecondFactor,
  'POST /api/admin/backup/verify': verifyBackup,
  'POST /api/admin/reauth': reauth,
  'POST /api/admin/credentials': changeCredentials,
  'POST /api/admin/backup/regenerate': regenerateBackupCodes,
  'POST /api/admin/logout': logout,
  'GET /api/admin/session': sessionInfo,
};

provisionAdmin();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const key = `${req.method} ${url.pathname}`;

  if (url.pathname === '/api/health') {
    return send(res, 200, { ok: true });
  }

  if (req.method !== 'GET' && !sameOrigin(req)) {
    return send(res, 403, { ok: false, error: 'درخواست رد شد.' });
  }

  const handler = ROUTES[key];
  if (!handler) {
    // No endpoint ever creates an administrator account.
    return send(res, 404, { ok: false, error: 'not found' });
  }

  try {
    return await handler(req, res);
  } catch (error) {
    if (error?.message === 'too_large') return send(res, 413, { ok: false, error: 'درخواست بزرگ است.' });
    if (error?.message === 'bad_json') return send(res, 400, { ok: false, error: 'درخواست نامعتبر است.' });
    console.error('[auth] request failed', error?.message);
    return send(res, 500, { ok: false, error: 'خطای سرور.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[auth] admin API listening on ${PORT}`);
});
