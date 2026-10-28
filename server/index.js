// The site's content API and the admin panel's backend, on Node's built-in
// http module — no dependencies, so the `node:22` image runs it as-is.
//
//   GET  /api/content              the whole public content document
//   POST /api/login                { username, password } → starts 2FA
//   POST /api/2fa/setup/start      first login: secret + otpauth URI for the QR
//   POST /api/2fa/setup/verify     { code } → enables 2FA, returns backup codes once
//   POST /api/2fa/setup/complete   { saved: true } → session, setup finished
//   POST /api/2fa/verify           { code } → TOTP or backup code → session
//   POST /api/2fa/cancel           drops the half-authenticated cookie
//   POST /api/logout               clears both cookies
//   GET  /api/session              { authenticated }
//   GET  /api/admin/content        the same document, behind the session
//   PUT  /api/admin/content        merges the posted top-level keys and saves
//   GET  /api/admin/2fa            { enabled, backupCodesLeft } (no secret, no codes)
//   POST /api/admin/2fa/backup-codes   { password, code } → new codes, once
//   POST /api/admin/2fa/reset          { password, code } → 2FA off, setup next login
//
// The password alone never creates a session: a login first yields a signed,
// short-lived "pending" cookie carrying the step it is allowed to perform.
//
// The Vite dev server proxies `/api` here, so the browser stays on one origin
// and the httpOnly cookies are normal same-site cookies.
import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { patchSecurity, patchSite, readSecret, readSecurity, readSite } from './store.js';
import {
  createBackupCodes,
  formatSecret,
  generateSecret,
  hashBackupCode,
  matchesHash,
  normalizeBackupCode,
  otpauthUri,
  verifyTotp,
} from './twofactor.js';

const PORT = Number(process.env.PORT || 4000);
const PANEL_USER = process.env.PANEL_USER || 'admin';
const PANEL_PASSWORD = process.env.PANEL_PASSWORD || '1234';
const COOKIE_NAME = 'aratan_admin';
const PENDING_COOKIE = 'aratan_2fa';
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;
const PENDING_TTL = 1000 * 60 * 10;
const ATTEMPT_WINDOW = 1000 * 60 * 10;
const MAX_ATTEMPTS = 6;
const MAX_BODY = 8 * 1024 * 1024;

const RATE_ERROR = 'تلاش‌های ناموفق بیش از حد. چند دقیقه دیگر دوباره تلاش کنید.';

function send(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('invalid json'));
      }
    });
    req.on('error', reject);
  });
}

function parseCookies(header = '') {
  return header.split(';').reduce((cookies, part) => {
    const index = part.indexOf('=');
    if (index > 0) cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    return cookies;
  }, {});
}

function cookie(name, value, ttl) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(
    0,
    Math.ceil(ttl / 1000),
  )}`;
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

async function createToken(payload) {
  const secret = await readSecret();
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body, secret)}`;
}

async function readToken(token) {
  if (!token || !token.includes('.')) return null;
  const index = token.indexOf('.');
  const body = token.slice(0, index);
  const signature = token.slice(index + 1);
  const secret = await readSecret();
  const expected = Buffer.from(sign(body, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

const createSession = () => createToken({ user: PANEL_USER, exp: Date.now() + SESSION_TTL });
const createPending = (purpose) => createToken({ purpose, exp: Date.now() + PENDING_TTL });

function sameValue(a = '', b = '') {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Failed second-factor attempts are counted in memory per client and scope.
// Six misses in ten minutes lock that scope until the window rolls over; the
// 300ms delay on every miss also keeps online guessing slow.
const attempts = new Map();

const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'local';

const attemptKey = (req, scope) => `${scope}:${clientIp(req)}`;

function retryAfter(key) {
  const entry = attempts.get(key);
  if (!entry) return 0;
  if (Date.now() - entry.startedAt > ATTEMPT_WINDOW) {
    attempts.delete(key);
    return 0;
  }
  return entry.count >= MAX_ATTEMPTS ? Math.ceil((ATTEMPT_WINDOW - (Date.now() - entry.startedAt)) / 1000) : 0;
}

function recordFailure(key) {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.startedAt > ATTEMPT_WINDOW) {
    attempts.set(key, { count: 1, startedAt: Date.now() });
    return;
  }
  entry.count += 1;
}

// A TOTP code or an unused single-use backup code. Using a backup code burns
// it immediately, before the response is written.
async function checkSecondFactor(code, security) {
  const value = String(code || '').trim();
  if (/^\d{6}$/.test(value)) return verifyTotp(security.secret, value);
  const normalized = normalizeBackupCode(value);
  if (!normalized) return false;
  const hash = hashBackupCode(normalized, await readSecret());
  const list = Array.isArray(security.backupCodes) ? security.backupCodes : [];
  for (let index = 0; index < list.length; index += 1) {
    const entry = list[index];
    if (!entry || entry.usedAt) continue;
    if (matchesHash(hash, entry.hash)) {
      const next = list.slice();
      next[index] = { ...entry, usedAt: new Date().toISOString() };
      await patchSecurity({ backupCodes: next });
      return true;
    }
  }
  return false;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const route = `${req.method} ${url.pathname}`;
  const pending = await readToken(parseCookies(req.headers.cookie)[PENDING_COOKIE]);

  try {
    if (route === 'GET /api/health') {
      return send(res, 200, { ok: true });
    }

    if (route === 'GET /api/content') {
      return send(res, 200, await readSite());
    }

    if (route === 'POST /api/login') {
      const body = await readBody(req);
      const ok = sameValue(body.username, PANEL_USER) && sameValue(body.password, PANEL_PASSWORD);
      if (!ok) {
        await delay(300);
        return send(res, 401, { error: 'نام کاربری یا رمز عبور درست نیست.' });
      }
      const security = await readSecurity();
      const purpose = security.enabled ? 'login' : 'setup';
      const token = await createPending(purpose);
      return send(
        res,
        200,
        { twoFactor: security.enabled ? 'required' : 'setup' },
        { 'Set-Cookie': [cookie(PENDING_COOKIE, token, PENDING_TTL), cookie(COOKIE_NAME, '', 0)] },
      );
    }

    if (route === 'POST /api/2fa/cancel') {
      return send(res, 200, { ok: true }, { 'Set-Cookie': [cookie(PENDING_COOKIE, '', 0)] });
    }

    if (route === 'POST /api/logout') {
      return send(
        res,
        200,
        { authenticated: false },
        { 'Set-Cookie': [cookie(COOKIE_NAME, '', 0), cookie(PENDING_COOKIE, '', 0)] },
      );
    }

    if (route === 'POST /api/2fa/setup/start') {
      if (!pending || pending.purpose !== 'setup') {
        return send(res, 401, { error: 'ابتدا با نام کاربری و رمز عبور وارد شوید.' });
      }
      const security = await readSecurity();
      if (security.enabled) {
        return send(res, 409, { error: 'ورود دومرحله‌ای از قبل فعال است.' });
      }
      let secret = security.pending?.secret;
      if (!secret) {
        secret = generateSecret();
        await patchSecurity({ pending: { secret, createdAt: new Date().toISOString() } });
      }
      return send(res, 200, {
        secret,
        formatted: formatSecret(secret),
        otpauth: otpauthUri(secret, PANEL_USER),
        account: PANEL_USER,
        issuer: 'ARATAN',
      });
    }

    if (route === 'POST /api/2fa/setup/verify') {
      if (!pending || pending.purpose !== 'setup') {
        return send(res, 401, { error: 'ابتدا با نام کاربری و رمز عبور وارد شوید.' });
      }
      const security = await readSecurity();
      if (security.enabled) {
        return send(res, 409, { error: 'ورود دومرحله‌ای از قبل فعال است.' });
      }
      const secret = security.pending?.secret;
      if (!secret) {
        return send(res, 400, { error: 'ابتدا راه‌اندازی را آغاز کنید.' });
      }
      const key = attemptKey(req, 'setup');
      const wait = retryAfter(key);
      if (wait) return send(res, 429, { error: RATE_ERROR, retryAfter: wait });
      const body = await readBody(req);
      if (!verifyTotp(secret, body.code)) {
        recordFailure(key);
        await delay(300);
        return send(res, 401, { error: 'کد واردشده درست نیست.' });
      }
      attempts.delete(key);
      const codes = createBackupCodes(10);
      const backupKey = await readSecret();
      await patchSecurity({
        enabled: true,
        secret,
        backupCodes: codes.map((code) => ({ hash: hashBackupCode(code, backupKey), usedAt: null })),
        pending: null,
        enabledAt: new Date().toISOString(),
      });
      // The only response that ever carries the backup codes.
      return send(res, 200, { backupCodes: codes });
    }

    if (route === 'POST /api/2fa/setup/complete') {
      if (!pending || pending.purpose !== 'setup') {
        return send(res, 401, { error: 'ابتدا با نام کاربری و رمز عبور وارد شوید.' });
      }
      const body = await readBody(req);
      const security = await readSecurity();
      if (!security.enabled) {
        return send(res, 400, { error: 'ابتدا کد تأیید برنامهٔ احراز هویت را وارد کنید.' });
      }
      if (body.saved !== true) {
        return send(res, 400, { error: 'ذخیرهٔ کدهای پشتیبان را تأیید کنید.' });
      }
      const token = await createSession();
      return send(
        res,
        200,
        { authenticated: true },
        { 'Set-Cookie': [cookie(COOKIE_NAME, token, SESSION_TTL), cookie(PENDING_COOKIE, '', 0)] },
      );
    }

    if (route === 'POST /api/2fa/verify') {
      if (!pending || pending.purpose !== 'login') {
        return send(res, 401, { error: 'ابتدا با نام کاربری و رمز عبور وارد شوید.' });
      }
      const security = await readSecurity();
      if (!security.enabled) {
        return send(res, 409, { error: 'ورود دومرحله‌ای فعال نیست.' });
      }
      const key = attemptKey(req, 'login');
      const wait = retryAfter(key);
      if (wait) return send(res, 429, { error: RATE_ERROR, retryAfter: wait });
      const body = await readBody(req);
      if (!(await checkSecondFactor(body.code, security))) {
        recordFailure(key);
        await delay(300);
        return send(res, 401, { error: 'کد واردشده درست نیست.' });
      }
      attempts.delete(key);
      const token = await createSession();
      return send(
        res,
        200,
        { authenticated: true },
        { 'Set-Cookie': [cookie(COOKIE_NAME, token, SESSION_TTL), cookie(PENDING_COOKIE, '', 0)] },
      );
    }

    const session = await readToken(parseCookies(req.headers.cookie)[COOKIE_NAME]);

    if (route === 'GET /api/session') {
      return send(res, 200, { authenticated: Boolean(session), user: session?.user ?? null });
    }

    if (url.pathname.startsWith('/api/admin/')) {
      if (!session) return send(res, 401, { error: 'برای ادامه وارد شوید.' });

      if (route === 'GET /api/admin/content') {
        return send(res, 200, await readSite());
      }

      if (route === 'PUT /api/admin/content') {
        const body = await readBody(req);
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return send(res, 400, { error: 'دادهٔ نامعتبر.' });
        }
        return send(res, 200, await patchSite(body));
      }

      if (route === 'GET /api/admin/2fa') {
        const security = await readSecurity();
        return send(res, 200, {
          enabled: Boolean(security.enabled),
          backupCodesLeft: (security.backupCodes || []).filter((entry) => entry && !entry.usedAt).length,
          enabledAt: security.enabledAt || null,
        });
      }

      // Both security operations re-authenticate with the password plus a
      // current TOTP or backup code, so a stolen session cookie cannot reset
      // or re-seed the second factor.
      if (route === 'POST /api/admin/2fa/backup-codes' || route === 'POST /api/admin/2fa/reset') {
        const key = attemptKey(req, 'reauth');
        const wait = retryAfter(key);
        if (wait) return send(res, 429, { error: RATE_ERROR, retryAfter: wait });
        const body = await readBody(req);
        if (!sameValue(body.password, PANEL_PASSWORD)) {
          recordFailure(key);
          await delay(300);
          return send(res, 401, { error: 'رمز عبور درست نیست.' });
        }
        const security = await readSecurity();
        if (!security.enabled) {
          return send(res, 409, { error: 'ورود دومرحله‌ای فعال نیست.' });
        }
        if (!(await checkSecondFactor(body.code, security))) {
          recordFailure(key);
          await delay(300);
          return send(res, 401, { error: 'کد تأیید درست نیست.' });
        }
        attempts.delete(key);

        if (route === 'POST /api/admin/2fa/reset') {
          await patchSecurity({ enabled: false, secret: null, backupCodes: [], pending: null, enabledAt: null });
          return send(res, 200, { enabled: false });
        }

        const codes = createBackupCodes(10);
        const backupKey = await readSecret();
        await patchSecurity({
          backupCodes: codes.map((code) => ({ hash: hashBackupCode(code, backupKey), usedAt: null })),
        });
        return send(res, 200, { backupCodes: codes });
      }
    }

    return send(res, 404, { error: 'not found' });
  } catch (error) {
    return send(res, 400, { error: error.message || 'request failed' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`content api on :${PORT}`);
});
