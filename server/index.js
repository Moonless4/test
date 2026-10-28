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
//   GET  /api/admin/2fa            { enabled, permanent, backupCodesLeft }
//   POST /api/admin/2fa/backup-codes   { password, code } → new codes, once
//   POST /api/messages             public contact / consultation / cooperation form
//   GET  /api/admin/messages       the inbox (session)
//   GET  /api/admin/media          uploaded images (session); POST uploads one
//   GET  /api/media/<file>         the uploaded image itself (public)
//
// The password is stored only as a salted scrypt hash (`server/password.js`,
// `/data/admin-credentials.json`). 2FA is permanent once configured: there is
// no endpoint that turns it off.
//
// The password alone never creates a session: a login first yields a signed,
// short-lived "pending" cookie carrying the step it is allowed to perform.
//
// The Vite dev server proxies `/api` here, so the browser stays on one origin
// and the httpOnly cookies are normal same-site cookies.
import { createServer } from 'node:http';
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  MEDIA_DIR,
  ensureMediaDir,
  patchSecurity,
  patchSite,
  readCredentials,
  readMedia,
  readMessages,
  readSecret,
  readSecurity,
  readSite,
  writeCredentials,
  writeMedia,
  writeMessages,
} from './store.js';
import { hashPassword, verifyPassword } from './password.js';
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
const MAX_BODY = 12 * 1024 * 1024;
const MAX_MESSAGE_ATTEMPTS = 8;

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

// The password is never written as text: the credential record only holds a
// salted scrypt hash. It is rebuilt from the environment credentials when they
// change (and only then), so the login itself stays exactly the same.
async function ensureCredentials() {
  const record = await readCredentials();
  if (record && record.username === PANEL_USER && record.password?.hash) {
    if (await verifyPassword(PANEL_PASSWORD, record.password)) return record;
  }
  return writeCredentials({
    username: PANEL_USER,
    password: await hashPassword(PANEL_PASSWORD),
    updatedAt: new Date().toISOString(),
  });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Failed second-factor attempts are counted in memory per client and scope.
// Six misses in ten minutes lock that scope until the window rolls over; the
// 300ms delay on every miss also keeps online guessing slow.
const attempts = new Map();

const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'local';

const attemptKey = (req, scope) => `${scope}:${clientIp(req)}`;

function retryAfter(key, max = MAX_ATTEMPTS) {
  const entry = attempts.get(key);
  if (!entry) return 0;
  if (Date.now() - entry.startedAt > ATTEMPT_WINDOW) {
    attempts.delete(key);
    return 0;
  }
  return entry.count >= max ? Math.ceil((ATTEMPT_WINDOW - (Date.now() - entry.startedAt)) / 1000) : 0;
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

    // Uploaded media is public: the site shows these images. Only the uploaded
    // file names are addressable, and every one of them was written by an
    // authenticated admin.
    if (req.method === 'GET' && url.pathname.startsWith('/api/media/')) {
      const file = decodeURIComponent(url.pathname.slice('/api/media/'.length));
      if (!/^[a-z0-9][a-z0-9.-]*\.(png|jpe?g|webp|gif|avif)$/i.test(file)) {
        return send(res, 404, { error: 'not found' });
      }
      try {
        const bytes = await readFile(path.join(MEDIA_DIR, file));
        const type =
          /\.png$/i.test(file) ? 'image/png'
          : /\.webp$/i.test(file) ? 'image/webp'
          : /\.gif$/i.test(file) ? 'image/gif'
          : /\.avif$/i.test(file) ? 'image/avif'
          : 'image/jpeg';
        res.writeHead(200, {
          'Content-Type': type,
          'Cache-Control': 'public, max-age=31536000, immutable',
        });
        return res.end(bytes);
      } catch {
        return send(res, 404, { error: 'not found' });
      }
    }

    // Contact / consultation / cooperation forms. The message is validated and
    // stored in the admin inbox; there is no client-visible read endpoint.
    if (route === 'POST /api/messages') {
      const key = attemptKey(req, 'messages');
      if (retryAfter(key, MAX_MESSAGE_ATTEMPTS)) return send(res, 429, { error: RATE_ERROR });
      const body = await readBody(req);
      const name = String(body.name || '').trim().slice(0, 120);
      const phone = String(body.phone || '').trim().slice(0, 60);
      const text = String(body.message || '').trim().slice(0, 4000);
      const type = ['contact', 'consultation', 'cooperation'].includes(body.type) ? body.type : 'contact';
      if (name.length < 3 || phone.replace(/\D/g, '').length < 8) {
        return send(res, 400, { error: 'نام و شمارهٔ تماس را کامل وارد کنید.' });
      }
      const list = await readMessages();
      await writeMessages([
        {
          id: randomUUID(),
          name,
          phone,
          message: text,
          type,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...list,
      ].slice(0, 2000));
      recordFailure(key);
      return send(res, 200, { ok: true });
    }

    if (route === 'POST /api/login') {
      const body = await readBody(req);
      const record = await ensureCredentials();
      const userOk = sameValue(body.username, record.username);
      const passwordOk = await verifyPassword(body.password, record.password);
      if (!userOk || !passwordOk) {
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

      if (route === 'GET /api/admin/messages') {
        const list = await readMessages();
        return send(res, 200, {
          messages: list,
          unread: list.filter((entry) => !entry.read).length,
        });
      }

      if (route === 'POST /api/admin/messages/read') {
        const body = await readBody(req);
        const list = await readMessages();
        await writeMessages(
          list.map((entry) => (entry.id === body.id ? { ...entry, read: Boolean(body.read) } : entry)),
        );
        return send(res, 200, { ok: true });
      }

      if (route === 'POST /api/admin/messages/delete') {
        const body = await readBody(req);
        const list = await readMessages();
        await writeMessages(list.filter((entry) => entry.id !== body.id));
        return send(res, 200, { ok: true });
      }

      if (route === 'GET /api/admin/media') {
        return send(res, 200, { media: await readMedia() });
      }

      if (route === 'POST /api/admin/media') {
        const body = await readBody(req);
        const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif|avif));base64,(.+)$/s.exec(String(body.dataUrl || ''));
        if (!match) return send(res, 400, { error: 'فرمت تصویر پشتیبانی نمی‌شود.' });
        const bytes = Buffer.from(match[2], 'base64');
        if (!bytes.length || bytes.length > 8 * 1024 * 1024) {
          return send(res, 400, { error: 'حجم تصویر باید کمتر از ۸ مگابایت باشد.' });
        }
        const ext = match[1] === 'image/jpeg' || match[1] === 'image/jpg' ? 'jpg' : match[1].split('/')[1];
        const file = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}.${ext}`;
        await ensureMediaDir();
        await writeFile(path.join(MEDIA_DIR, file), bytes);
        const entry = {
          id: randomUUID(),
          file,
          url: `/api/media/${file}`,
          name: String(body.name || 'تصویر').slice(0, 160),
          mime: match[1],
          size: bytes.length,
          width: Number(body.width) || null,
          height: Number(body.height) || null,
          createdAt: new Date().toISOString(),
        };
        const list = await readMedia();
        await writeMedia([entry, ...list]);
        return send(res, 201, { item: entry, media: [entry, ...list] });
      }

      if (route === 'POST /api/admin/media/delete') {
        const body = await readBody(req);
        const list = await readMedia();
        const entry = list.find((item) => item.id === body.id);
        if (entry) {
          await rm(path.join(MEDIA_DIR, entry.file), { force: true }).catch(() => {});
          await writeMedia(list.filter((item) => item.id !== entry.id));
        }
        return send(res, 200, { ok: true });
      }

      if (route === 'GET /api/admin/2fa') {
        const security = await readSecurity();
        return send(res, 200, {
          enabled: Boolean(security.enabled),
          permanent: true,
          backupCodesLeft: (security.backupCodes || []).filter((entry) => entry && !entry.usedAt).length,
          enabledAt: security.enabledAt || null,
        });
      }

      // Regenerating backup codes re-authenticates with the password plus a
      // current TOTP or code, so a stolen session cookie cannot re-seed the
      // factor. There is deliberately no endpoint that turns 2FA off: once it
      // is configured it stays required for every administrator login.
      if (route === 'POST /api/admin/2fa/backup-codes') {
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
