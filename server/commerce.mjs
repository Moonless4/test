/**
 * Commerce proxy — the secure boundary between this storefront and the owner's
 * WordPress + WooCommerce site.
 *
 * The browser never calls WordPress directly and never holds a WooCommerce credential.
 * Every storefront read, cart mutation and checkout goes through this same-origin layer,
 * which is the only process that knows where the store is and how to authenticate to it:
 *
 *   GET     /api/commerce/store/*     WooCommerce Store API   (wc/store/v1)
 *   GET     /api/commerce/content/*   WordPress REST API      (wp/v2, read only)
 *   GET     /api/commerce/admin/*     WooCommerce REST API    (wc/v3, read only)
 *   GET     /api/commerce/health
 *
 * The Store API carries the storefront: products, categories, attributes, reviews, the cart
 * and checkout all live there, it is public by design, and it is the only surface the cart
 * token and its nonce are exchanged on. `admin` serves the few reads the Store API cannot
 * (exact stock, customer records) and is the only namespace that uses the consumer
 * key/secret — always server-side, never echoed into a response. `content` serves blog
 * posts, media and menus; WordPress application-password credentials are attached to it
 * when they are configured, so a site that keeps menus private still answers.
 *
 * Every read is cached briefly in memory (`WOO_CACHE_TTL_MS`) so one page render does not
 * turn into a burst of upstream calls. Anything session-bound — the cart, checkout, an
 * order, a request carrying a token or cookie — is never cached.
 *
 * Wiring: `WOO_STORE_URL` (the WordPress site root, no trailing slash) plus optional
 * `WOO_CONSUMER_KEY` / `WOO_CONSUMER_SECRET` and `WP_APP_USER` / `WP_APP_PASSWORD`, all
 * delivered through the platform env file. Without the URL every route answers 503 with a
 * Persian message, which is what the storefront renders as its "backend not connected"
 * state instead of failing.
 */
import { Buffer } from 'node:buffer';

const STORE_URL = (process.env.WOO_STORE_URL ?? '').trim().replace(/\/+$/, '');
const CONSUMER_KEY = (process.env.WOO_CONSUMER_KEY ?? '').trim();
const CONSUMER_SECRET = (process.env.WOO_CONSUMER_SECRET ?? '').trim();
const APP_USER = (process.env.WP_APP_USER ?? '').trim();
const APP_PASSWORD = (process.env.WP_APP_PASSWORD ?? '').trim();

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const TIMEOUT_MS = asNumber(process.env.WOO_TIMEOUT_MS, 12_000);
const CACHE_TTL_MS = asNumber(process.env.WOO_CACHE_TTL_MS, 45_000);
const MAX_BODY_BYTES = 64 * 1024;
const CACHE_MAX_ENTRIES = 200;
const RATE_LIMIT = { windowMs: 60_000, max: 240 };

const API_PREFIX = '/api/commerce/';
const REST_ROOT = `${STORE_URL}/wp-json`;

/**
 * The three WordPress namespaces the storefront may reach, and nothing else: the proxy
 * cannot be talked into fetching an arbitrary path on the site. `auth` names the credential
 * that namespace carries — `none` for the public Store API, `app` for WordPress application
 * passwords (attached only when configured), `consumer` for the WooCommerce key pair.
 */
const NAMESPACES = {
  store: {
    path: 'wc/store/v1',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    auth: 'none',
  },
  content: { path: 'wp/v2', methods: ['GET'], auth: 'app' },
  admin: { path: 'wc/v3', methods: ['GET'], auth: 'consumer' },
};

/* ------------------------------------------------------------------ *
 * Response shape and limits
 * ------------------------------------------------------------------ */

const baseHeaders = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY',
  'content-security-policy':
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  'permissions-policy': 'geolocation=(), microphone=(), camera=()',
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const headersFor = (req) => {
  const headers = { ...baseHeaders };
  if (req.headers['x-forwarded-proto'] === 'https') {
    headers['strict-transport-security'] = 'max-age=31536000; includeSubDomains';
  }
  return headers;
};

const sendJson = (req, res, status, body, extra = {}) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    ...headersFor(req),
    'cache-control': 'no-store',
    ...extra,
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
};

/** Passes an upstream body through unchanged, with our own defensive headers. */
const sendRaw = (req, res, status, text, extra = {}) => {
  const payload = Buffer.from(text ?? '', 'utf8');
  res.writeHead(status, {
    ...headersFor(req),
    'cache-control': 'no-store',
    ...extra,
    'content-type': 'application/json; charset=utf-8',
    'content-length': payload.length,
  });
  res.end(payload);
};

const clientKey = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const hops = forwarded.split(',');
    return hops[hops.length - 1].trim();
  }
  return req.socket.remoteAddress ?? 'unknown';
};

const prune = (map, isStale, now) => {
  for (const [key, value] of map) if (isStale(value, now)) map.delete(key);
};

/** Fixed-window limiter; returns retry-after seconds when the caller is over budget. */
const rateLimited = (req, scope) => {
  const now = Date.now();
  if (hits.size > 5000) prune(hits, (entry) => now >= entry.resetAt, now);

  const key = `${scope}:${clientKey(req)}`;
  const entry = hits.get(key);
  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return 0;
  }
  entry.count += 1;
  if (entry.count <= RATE_LIMIT.max) return 0;
  return Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
};

/** A state-changing call carrying a foreign Origin is cross-site, and never ours. */
const isCrossSite = (req) => {
  const origin = req.headers.origin;
  if (!origin) return false;
  const allowed = [
    process.env.SITE_URL,
    process.env.PREVIEW_ORIGIN,
  ]
    .filter(Boolean)
    .map((value) => value.replace(/\/+$/, ''));
  // No allowlist configured: the dev-server proxy already pins the origin to this app.
  if (allowed.length === 0) return false;
  return !allowed.includes(origin.replace(/\/+$/, ''));
};

const readBody = async (req, limit) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'بدنه‌ی درخواست بیش از حد بزرگ است.');
    chunks.push(chunk);
  }
  return size ? Buffer.concat(chunks) : undefined;
};

/**
 * WordPress sets its session cookie for *its* domain; the browser is on ours, and a
 * cookie carrying the store's Domain is rejected. Everything else (HttpOnly, Secure,
 * SameSite, Path, expiry) is left exactly as the store sent it.
 */
const stripCookieDomain = (cookie) => cookie.replace(/;\s*domain=[^;]*/gi, '');

/** A cart, a checkout or an order is per-shopper: never served from cache. */
const isSessionBound = (pathname, headers) =>
  /(^|\/)(cart|checkout|order)(\/|$)/.test(pathname) ||
  Boolean(
    headers['cart-token'] ||
      headers['x-wc-store-api-nonce'] ||
      headers.authorization ||
      headers.cookie,
  );

const messageFor = (status) => {
  if (status === 404) return 'موردی با این نشانی در فروشگاه پیدا نشد.';
  if (status === 401 || status === 403) return 'دسترسی به این بخش از فروشگاه مجاز نیست.';
  if (status === 429) return 'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.';
  return 'درخواست به فروشگاه پذیرفته نشد.';
};

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

/** url -> { expires, status, text, meta } for cacheable GETs. */
const cache = new Map();
/** rate-limit bucket: key -> { count, resetAt }. */
const hits = new Map();

const metaFrom = (upstream) => {
  const meta = {};
  for (const name of [
    'x-wp-total',
    'x-wp-totalpages',
    'cart-token',
    'x-wc-store-api-nonce',
  ]) {
    const value = upstream.headers.get(name);
    if (value) meta[name] = value;
  }
  const cookies = typeof upstream.headers.getSetCookie === 'function'
    ? upstream.headers.getSetCookie()
    : [];
  if (cookies.length) meta['set-cookie'] = cookies.map(stripCookieDomain);
  return meta;
};

/**
 * Handles any `/api/commerce/*` request. Returns true when the route belongs to this
 * module, so the caller can fall through to its own 404 otherwise.
 */
export const handleCommerce = async (req, res, url) => {
  if (!url.pathname.startsWith(API_PREFIX)) return false;

  try {
    if (url.pathname === `${API_PREFIX}health`) {
      return sendJson(req, res, 200, {
        ok: true,
        configured: Boolean(STORE_URL),
        admin: Boolean(STORE_URL && CONSUMER_KEY && CONSUMER_SECRET),
        content: Boolean(STORE_URL),
      }), true;
    }

    const rest = url.pathname.slice(API_PREFIX.length);
    const slash = rest.indexOf('/');
    const namespace = NAMESPACES[slash === -1 ? rest : rest.slice(0, slash)];
    const resource = slash === -1 ? '' : rest.slice(slash + 1);

    if (!namespace || !resource) {
      return sendJson(req, res, 404, { error: 'نشانی مورد نظر پیدا نشد.' }), true;
    }

    if (!STORE_URL) {
      return sendJson(req, res, 503, {
        error: 'فروشگاه ووکامرس روی سرور تنظیم نشده است.',
      }), true;
    }

    const method = req.method ?? 'GET';
    if (!namespace.methods.includes(method)) {
      return sendJson(req, res, 405, { error: 'این عملیات مجاز نیست.' }), true;
    }

    if (namespace.auth === 'consumer' && !(CONSUMER_KEY && CONSUMER_SECRET)) {
      return sendJson(req, res, 503, {
        error: 'کلیدهای ووکامرس روی سرور تنظیم نشده‌اند.',
      }), true;
    }

    if (method !== 'GET' && isCrossSite(req)) {
      return sendJson(req, res, 403, { error: 'درخواست از مبدأ نامعتبر رد شد.' }), true;
    }

    const retryAfter = rateLimited(req, 'commerce');
    if (retryAfter) {
      return sendJson(
        req,
        res,
        429,
        { error: 'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.', retryAfter },
        { 'retry-after': String(retryAfter) },
      ), true;
    }

    const target = `${REST_ROOT}/${namespace.path}/${resource}${url.search}`;
    const header = { accept: 'application/json', 'accept-language': 'fa-IR,fa;q=0.9,en;q=0.8' };

    if (namespace.auth === 'consumer') {
      header.authorization =
        `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')}`;
    } else if (namespace.auth === 'app' && APP_USER && APP_PASSWORD) {
      header.authorization =
        `Basic ${Buffer.from(`${APP_USER}:${APP_PASSWORD}`).toString('base64')}`;
    }

    // The cart travels as a cookie plus a token/nonce pair; both round-trip untouched.
    if (req.headers.cookie) header.cookie = req.headers.cookie;
    for (const name of ['cart-token', 'x-wc-store-api-nonce']) {
      const value = req.headers[name];
      if (typeof value === 'string' && value) header[name] = value;
    }

    let body;
    if (method !== 'GET') {
      body = await readBody(req, MAX_BODY_BYTES);
      header['content-type'] = 'application/json';
    }

    const cacheable =
      method === 'GET' && !isSessionBound(url.pathname, req.headers);
    const cacheKey = `${target}`;

    if (cacheable) {
      const hit = cache.get(cacheKey);
      if (hit && hit.expires > Date.now()) {
        return sendRaw(req, res, hit.status, hit.text, {
          ...hit.meta,
          'cache-control': `private, max-age=${Math.ceil(CACHE_TTL_MS / 1000)}`,
          'x-commerce-cache': 'hit',
        }), true;
      }
    }

    let upstream;
    try {
      upstream = await fetch(target, {
        method,
        headers: header,
        body,
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
      console.error(
        `[commerce] ${namespace.path}/${resource} ${timedOut ? 'timed out' : 'failed'}:`,
        error?.message ?? error,
      );
      return sendJson(req, res, timedOut ? 504 : 502, {
        error: 'ارتباط با فروشگاه برقرار نشد؛ دوباره تلاش کنید.',
      }), true;
    }

    const text = await upstream.text();
    const meta = metaFrom(upstream);

    // A broken store answers with something we must not hand to the browser verbatim:
    // it can carry a stack trace, a path or a token.
    if (upstream.status >= 500) {
      console.error(
        `[commerce] ${namespace.path}/${resource} upstream ${upstream.status}:`,
        text.slice(0, 300),
      );
      return sendJson(req, res, 502, {
        error: 'فروشگاه پاسخ معتبری نداد؛ کمی بعد دوباره تلاش کنید.',
      }), true;
    }

    if (upstream.status >= 400) {
      let code;
      try {
        code = JSON.parse(text)?.code;
      } catch {
        code = undefined;
      }
      return sendJson(req, res, upstream.status, {
        error: messageFor(upstream.status),
        ...(typeof code === 'string' ? { code } : {}),
      }), true;
    }

    if (cacheable) {
      if (cache.size >= CACHE_MAX_ENTRIES) {
        prune(cache, (entry) => entry.expires <= Date.now(), Date.now());
      }
      cache.set(cacheKey, {
        expires: Date.now() + CACHE_TTL_MS,
        status: upstream.status,
        text,
        meta,
      });
    }

    return sendRaw(req, res, upstream.status, text, {
      ...meta,
      ...(cacheable
        ? {
            'cache-control': `private, max-age=${Math.ceil(CACHE_TTL_MS / 1000)}`,
            'x-commerce-cache': 'miss',
          }
        : {}),
    }), true;
  } catch (error) {
    if (error instanceof HttpError) {
      return sendJson(req, res, error.status, { error: error.message }), true;
    }
    console.error('[commerce] unhandled error', error);
    return sendJson(req, res, 500, { error: 'خطای غیرمنتظره در لایه‌ی فروشگاه.' }), true;
  }
};
