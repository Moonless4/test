// The site's content API and the admin panel's backend, on Node's built-in
// http module — no dependencies, so the `node:22` image runs it as-is.
//
//   GET  /api/content         the whole public content document
//   POST /api/login           { username, password } → sets the session cookie
//   POST /api/logout          clears it
//   GET  /api/session         { authenticated }
//   GET  /api/admin/content   the same document, behind the session
//   PUT  /api/admin/content   merges the posted top-level keys and saves
//
// The Vite dev server proxies `/api` here, so the browser stays on one origin
// and the httpOnly session cookie is a normal same-site cookie.
import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { patchSite, readSecret, readSite } from './store.js';

const PORT = Number(process.env.PORT || 4000);
const PANEL_USER = process.env.PANEL_USER || 'admin';
const PANEL_PASSWORD = process.env.PANEL_PASSWORD || '1234';
const COOKIE_NAME = 'aratan_admin';
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;
const MAX_BODY = 8 * 1024 * 1024;

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

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

async function createToken(user) {
  const secret = await readSecret();
  const payload = Buffer.from(JSON.stringify({ user, exp: Date.now() + SESSION_TTL })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

async function readSession(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const secret = await readSecret();
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

function sameValue(a = '', b = '') {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const route = `${req.method} ${url.pathname}`;

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
        await new Promise((resolve) => setTimeout(resolve, 300));
        return send(res, 401, { error: 'نام کاربری یا رمز عبور درست نیست.' });
      }
      const token = await createToken(PANEL_USER);
      return send(
        res,
        200,
        { authenticated: true },
        {
          'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(
            SESSION_TTL / 1000,
          )}`,
        },
      );
    }

    if (route === 'POST /api/logout') {
      return send(res, 200, { authenticated: false }, { 'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` });
    }

    const session = await readSession(parseCookies(req.headers.cookie)[COOKIE_NAME]);

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
    }

    return send(res, 404, { error: 'not found' });
  } catch (error) {
    return send(res, 400, { error: error.message || 'request failed' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`content api on :${PORT}`);
});
