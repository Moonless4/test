/**
 * Payment service for the storefront — currently Zarinpal.
 *
 * Every Iranian PSP has to be called and verified from a server: the merchant id is a
 * credential, and the amount in the verify call must match the amount that was requested.
 * This process is that server, and it is dependency-free `node:http` on purpose so it can
 * be lifted onto any host (or replaced by WooCommerce's own gateway) without ceremony.
 *
 *   POST /api/payment/request   { orderId, amount, description }        -> { redirectUrl }
 *   GET  /api/payment/callback  ?Authority=..&Status=OK&orderId=..      -> 302 back to the site
 *   GET  /api/payment/health                                            -> { ok, ... }
 *
 * Amounts travel in Toman (the store's unit, what the shopper saw) and are sent to
 * Zarinpal in Rial. Requests in flight are held in memory: a restart forgets a payment
 * that is still at the bank, and the shopper lands back on the checkout to try again.
 *
 * Hardening notes (see AGENTS.md → "Security"): the service is reachable from the public
 * preview host through the dev server's `/api` proxy, so it enforces a body-size cap, a
 * per-client rate limit, an Origin check on its only state-changing route, bounded
 * in-memory state and security response headers. It never echoes the merchant id or any
 * internal detail back to the caller.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.PAYMENT_API_PORT ?? 8000);
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID ?? '';
const SANDBOX = process.env.ZARINPAL_SANDBOX === '1';
const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/+$/, '');
const GATEWAY = SANDBOX ? 'https://sandbox.zarinpal.com' : 'https://payment.zarinpal.com';
const RIAL_PER_TOMAN = 10;

/* ------------------------------------------------------------------ *
 * Limits — every one of them is far above a real basket, so they only
 * stop abuse. `MAX_AMOUNT_TOMAN` cannot make a tampered amount *safe*:
 * only a server-side price source can (see AGENTS.md → "Security").
 * ------------------------------------------------------------------ */
const MAX_BODY_BYTES = 16 * 1024;
const MAX_AMOUNT_TOMAN = 1_000_000_000;
const MAX_ORDER_ID_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 300;
/** orderId -> { amount, authority } while the shopper is away at the bank. */
const PENDING_TTL_MS = 30 * 60 * 1000;
const MAX_PENDING = 500;
const RATE_LIMIT = { windowMs: 60_000, max: 30 };

const pending = new Map();
/** rate-limit bucket: key -> { count, resetAt }. */
const hits = new Map();

/** Every response leaves with the same defensive headers. */
const baseHeaders = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY',
  'content-security-policy':
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  'permissions-policy': 'geolocation=(), microphone=(), camera=()',
  // Nothing here is cacheable: it is per-order and per-shopper.
  'cache-control': 'no-store',
};

/** A rejection the handlers can throw; the status and message reach the caller. */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Adds HSTS only when the request actually arrived over TLS (the proxy sets this). */
const headersFor = (req) => {
  const headers = { ...baseHeaders };
  if (req.headers['x-forwarded-proto'] === 'https') {
    headers['strict-transport-security'] = 'max-age=31536000; includeSubDomains';
  }
  return headers;
};

const sendJson = (req, res, status, body, extraHeaders = {}) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    ...headersFor(req),
    ...extraHeaders,
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
};

/** The client IP as the dev-server proxy saw it (we take the hop the proxy appended). */
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

/** Fixed-window limiter. Returns retry-after seconds when the caller is over budget. */
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

/** A state-changing request carrying a foreign Origin is treated as cross-site. */
const isCrossSitePost = (req) => {
  const origin = req.headers.origin;
  if (!origin || !SITE_URL) return false;
  return origin.replace(/\/+$/, '') !== SITE_URL;
};

const readJsonBody = async (req) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new HttpError(413, 'بدنه‌ی درخواست بیش از حد بزرگ است.');
    }
    chunks.push(chunk);
  }
  if (size === 0) return {};
  let parsed;
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'بدنه‌ی درخواست معتبر نیست.');
  }
  // Only a plain object is a request body; a JSON scalar or array is rejected outright.
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new HttpError(400, 'بدنه‌ی درخواست معتبر نیست.');
  }
  return parsed;
};

const postJson = async (url, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json().catch(() => ({}));
};

/** Sends the shopper back into the app with the outcome in the query string. */
const backToCheckout = (req, res, orderId, outcome, extra = '') => {
  const target =
    `${SITE_URL}/checkout?payment=${outcome}` +
    `&order=${encodeURIComponent(orderId)}${extra}`;
  res.writeHead(302, { ...headersFor(req), location: target });
  res.end();
};

const requestPayment = async (req, res) => {
  if (!MERCHANT_ID) {
    return sendJson(req, res, 503, {
      error: 'شناسه پذیرنده زرین‌پال روی سرور تنظیم نشده است.',
    });
  }

  const body = await readJsonBody(req);

  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
  if (!orderId || orderId.length > MAX_ORDER_ID_LENGTH || !/^[A-Za-z0-9._-]+$/.test(orderId)) {
    return sendJson(req, res, 400, { error: 'شماره سفارش معتبر نیست.' });
  }

  // A JSON number only: a numeric string would silently coerce, and everything downstream
  // (Rial conversion, the verify call) must agree on the exact amount the shopper saw.
  // Integral Toman only — a fractional amount would round away a Rial somewhere downstream.
  const amount = body.amount;
  if (
    typeof amount !== 'number' ||
    !Number.isInteger(amount) ||
    amount <= 0 ||
    amount > MAX_AMOUNT_TOMAN
  ) {
    return sendJson(req, res, 400, { error: 'مبلغ پرداخت معتبر نیست.' });
  }

  const description =
    typeof body.description === 'string' && body.description.trim()
      ? body.description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
      : `سفارش ${orderId} — فروشگاه مدورا`;

  const now = Date.now();
  prune(pending, (entry) => now - entry.createdAt > PENDING_TTL_MS, now);
  if (pending.size >= MAX_PENDING) {
    return sendJson(req, res, 503, {
      error: 'تعداد پرداخت‌های در جریان زیاد است؛ لطفاً چند دقیقه بعد دوباره تلاش کنید.',
    });
  }

  try {
    const data = await postJson(`${GATEWAY}/pg/v4/payment/request.json`, {
      merchant_id: MERCHANT_ID,
      amount: Math.round(amount * RIAL_PER_TOMAN),
      callback_url: `${SITE_URL}/api/payment/callback?orderId=${encodeURIComponent(orderId)}`,
      description,
    });

    const authority = data?.data?.authority;
    if (!authority) {
      const code = data?.errors?.code ?? '—';
      return sendJson(req, res, 502, {
        error: `درگاه پرداخت درخواست را نپذیرفت (کد ${code}).`,
      });
    }

    pending.set(orderId, { amount, authority, createdAt: now });
    return sendJson(req, res, 200, {
      redirectUrl: `${GATEWAY}/pg/StartPay/${authority}`,
      authority,
    });
  } catch {
    return sendJson(req, res, 502, { error: 'ارتباط با درگاه پرداخت برقرار نشد.' });
  }
};

const handleCallback = async (req, res, url) => {
  const orderId = url.searchParams.get('orderId') ?? '';
  const status = url.searchParams.get('Status') ?? '';
  const authority = url.searchParams.get('Authority') ?? '';
  const record = pending.get(orderId);

  // An authority we never asked for is not a payment of ours.
  if (!record || record.authority !== authority) {
    pending.delete(orderId);
    return backToCheckout(req, res, orderId, 'failed');
  }

  if (status !== 'OK') {
    pending.delete(orderId);
    return backToCheckout(req, res, orderId, 'canceled');
  }

  try {
    const data = await postJson(`${GATEWAY}/pg/v4/payment/verify.json`, {
      merchant_id: MERCHANT_ID,
      amount: Math.round(record.amount * RIAL_PER_TOMAN),
      authority,
    });
    // 100 = verified now, 101 = verified before (a refresh of the callback).
    const code = data?.data?.code;
    const refId = data?.data?.ref_id;
    pending.delete(orderId);
    if (code === 100 || code === 101) {
      return backToCheckout(
        req,
        res,
        orderId,
        'paid',
        `&ref=${encodeURIComponent(String(refId ?? ''))}`,
      );
    }
    return backToCheckout(req, res, orderId, 'failed');
  } catch {
    return backToCheckout(req, res, orderId, 'failed');
  }
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const route = `${req.method} ${url.pathname}`;

  try {
    // The health probe is the only thing the compose healthcheck needs; it stays free of
    // configuration detail, and it is the one route a caller may poll.
    if (route === 'GET /api/payment/health') {
      return sendJson(req, res, 200, { ok: true, gateway: 'zarinpal', sandbox: SANDBOX });
    }

    if (route === 'POST /api/payment/request') {
      if (isCrossSitePost(req)) {
        return sendJson(req, res, 403, { error: 'درخواست از مبدأ نامعتبر رد شد.' });
      }
      const retryAfter = rateLimited(req, 'request');
      if (retryAfter) {
        return sendJson(
          req,
          res,
          429,
          { error: 'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.', retryAfter },
          { 'retry-after': String(retryAfter) },
        );
      }
      return await requestPayment(req, res);
    }

    if (route === 'GET /api/payment/callback') {
      const retryAfter = rateLimited(req, 'callback');
      if (retryAfter) {
        return sendJson(
          req,
          res,
          429,
          { error: 'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.', retryAfter },
          { 'retry-after': String(retryAfter) },
        );
      }
      return await handleCallback(req, res, url);
    }

    // Nothing else exists: answer without hinting at the routes that do.
    return sendJson(req, res, 404, { error: 'نشانی مورد نظر پیدا نشد.' });
  } catch (error) {
    if (error instanceof HttpError) {
      return sendJson(req, res, error.status, { error: error.message });
    }
    // Details stay in the server log; the caller only learns that it failed.
    console.error('[payment] unhandled error', error);
    return sendJson(req, res, 500, { error: 'خطای غیرمنتظره در سرویس پرداخت.' });
  }
});

// A malformed request must not take the process down with it.
server.on('clientError', (_error, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[payment] zarinpal ${SANDBOX ? 'sandbox' : 'live'} listening on :${PORT} ` +
      `(merchant ${MERCHANT_ID ? 'configured' : 'missing'}, site ${SITE_URL || 'unset'})`,
  );
});
