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
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.PAYMENT_API_PORT ?? 8000);
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID ?? '';
const SANDBOX = process.env.ZARINPAL_SANDBOX === '1';
const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/+$/, '');
const GATEWAY = SANDBOX ? 'https://sandbox.zarinpal.com' : 'https://payment.zarinpal.com';
const RIAL_PER_TOMAN = 10;

/** orderId -> { amount, authority } while the shopper is away at the bank. */
const pending = new Map();

const sendJson = (res, status, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
};

const readJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
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
const backToCheckout = (res, orderId, outcome, extra = '') => {
  const target =
    `${SITE_URL}/checkout?payment=${outcome}` +
    `&order=${encodeURIComponent(orderId)}${extra}`;
  res.writeHead(302, { location: target });
  res.end();
};

const requestPayment = async (req, res) => {
  if (!MERCHANT_ID) {
    return sendJson(res, 503, {
      error: 'شناسه پذیرنده زرین‌پال روی سرور تنظیم نشده است.',
    });
  }

  const body = await readJsonBody(req);
  if (!body) return sendJson(res, 400, { error: 'بدنه‌ی درخواست معتبر نیست.' });

  const orderId = String(body.orderId ?? '');
  const amount = Number(body.amount ?? 0);
  if (!orderId || !Number.isFinite(amount) || amount <= 0) {
    return sendJson(res, 400, { error: 'شماره سفارش یا مبلغ پرداخت معتبر نیست.' });
  }

  try {
    const data = await postJson(`${GATEWAY}/pg/v4/payment/request.json`, {
      merchant_id: MERCHANT_ID,
      amount: Math.round(amount * RIAL_PER_TOMAN),
      callback_url: `${SITE_URL}/api/payment/callback?orderId=${encodeURIComponent(orderId)}`,
      description: String(body.description ?? `سفارش ${orderId} — فروشگاه مدورا`),
    });

    const authority = data?.data?.authority;
    if (!authority) {
      const code = data?.errors?.code ?? '—';
      return sendJson(res, 502, { error: `درگاه پرداخت درخواست را نپذیرفت (کد ${code}).` });
    }

    pending.set(orderId, { amount, authority });
    return sendJson(res, 200, {
      redirectUrl: `${GATEWAY}/pg/StartPay/${authority}`,
      authority,
    });
  } catch {
    return sendJson(res, 502, { error: 'ارتباط با درگاه پرداخت برقرار نشد.' });
  }
};

const handleCallback = async (res, url) => {
  const orderId = url.searchParams.get('orderId') ?? '';
  const status = url.searchParams.get('Status') ?? '';
  const authority = url.searchParams.get('Authority') ?? '';
  const record = pending.get(orderId);

  // An authority we never asked for is not a payment of ours.
  if (!record || record.authority !== authority) {
    pending.delete(orderId);
    return backToCheckout(res, orderId, 'failed');
  }

  if (status !== 'OK') {
    pending.delete(orderId);
    return backToCheckout(res, orderId, 'canceled');
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
      return backToCheckout(res, orderId, 'paid', `&ref=${encodeURIComponent(String(refId ?? ''))}`);
    }
    return backToCheckout(res, orderId, 'failed');
  } catch {
    return backToCheckout(res, orderId, 'failed');
  }
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const route = `${req.method} ${url.pathname}`;

  try {
    if (route === 'GET /api/payment/health') {
      return sendJson(res, 200, {
        ok: true,
        gateway: 'zarinpal',
        sandbox: SANDBOX,
        merchantConfigured: Boolean(MERCHANT_ID),
        siteUrl: SITE_URL || null,
        pending: pending.size,
      });
    }
    if (route === 'POST /api/payment/request') return await requestPayment(req, res);
    if (route === 'GET /api/payment/callback') return await handleCallback(res, url);
    return sendJson(res, 404, { error: 'نشانی مورد نظر پیدا نشد.' });
  } catch (error) {
    console.error('[payment] unhandled error', error);
    return sendJson(res, 500, { error: 'خطای غیرمنتظره در سرویس پرداخت.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[payment] zarinpal ${SANDBOX ? 'sandbox' : 'live'} listening on :${PORT} ` +
      `(merchant ${MERCHANT_ID ? 'configured' : 'missing'}, site ${SITE_URL || 'unset'})`,
  );
});
