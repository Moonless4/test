/**
 * Payment layer for the checkout.
 *
 * This is the seam between the store and a payment service provider (PSP). It keeps the
 * payment record a checkout produces, the lifecycle of that record, and the gateway the
 * shopper is handed off to.
 *
 * Two gateways ship here:
 *   sandboxGateway  — an in-app stand-in for the bank page. It moves no money and is the
 *                     default, so the preview and a fresh clone stay testable.
 *   zarinpalGateway — the real thing: it asks `server/index.mjs` for a payment, and that
 *                     server verifies the transaction with Zarinpal (REST v4) before the
 *                     shopper comes back.
 * `VITE_PAYMENT_GATEWAY` picks between them (`sandbox` when unset), so a host runs
 * `zarinpal` while the sandbox preview keeps the stand-in.
 *
 * Zarinpal verifies on the server and returns the shopper to
 * `/checkout?payment=…&order=…&ref=…`; only inline gateways verify in the browser, which
 * is why `verify` is optional. The merchant id is a credential and stays on the server.
 */

export type PaymentMethod = 'online' | 'wallet' | 'installment' | 'cod';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'canceled';

export type PaymentLine = { name: string; qty: number; price: number };

export type PaymentCustomer = {
  name: string;
  mobile: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  note?: string;
};

export type PaymentOrder = {
  /** Order number the shopper sees, e.g. ST-482913. */
  id: string;
  /** What the gateway charges, in Toman: basket due plus shipping. */
  amount: number;
  method: PaymentMethod;
  methodTitle: string;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  /** The bank's tracking code, once the payment is confirmed. */
  refId?: string;
  /** Coins this order credited, kept so the confirmation survives a page reload. */
  coinsEarned?: number;
  customer: PaymentCustomer;
  shipping: { id: string; title: string; cost: number };
  lines: PaymentLine[];
};

export type VerifyInput = { outcome: 'success' | 'failed' | 'canceled' };

export type VerifyResult = {
  ok: boolean;
  status: PaymentStatus;
  refId?: string;
  error?: string;
};

export type PaymentGateway = {
  id: string;
  title: string;
  /** Where the shopper is sent to authorise the payment. */
  handoff: (order: PaymentOrder) => Promise<string>;
  /** Only inline gateways confirm in the browser; a real PSP does it on its server. */
  verify?: (order: PaymentOrder, input: VerifyInput) => Promise<VerifyResult>;
};

/** Order status as it shows up in the account panel. */
export const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'در حال پردازش',
  failed: 'پرداخت ناموفق',
  canceled: 'لغو شده',
};

const sandboxRef = () => `SBX-${Math.floor(100000000 + Math.random() * 899999999)}`;

export const sandboxGateway: PaymentGateway = {
  id: 'sandbox',
  title: 'درگاه آزمایشی',
  // No external host: the stand-in bank page is a route of this app.
  handoff: async (order) => `/payment/${order.id}`,
  verify: async (_order, input) => {
    if (input.outcome === 'canceled') {
      return { ok: false, status: 'canceled', error: 'پرداخت لغو شد.' };
    }
    if (input.outcome === 'failed') {
      return { ok: false, status: 'failed', error: 'پرداخت در درگاه ناموفق بود.' };
    }
    return { ok: true, status: 'paid', refId: sandboxRef() };
  },
};

const PAYMENT_API = '/api/payment';

export const zarinpalGateway: PaymentGateway = {
  id: 'zarinpal',
  title: 'زرین‌پال',
  handoff: async (order) => {
    const response = await fetch(`${PAYMENT_API}/request`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        description: `سفارش ${order.id} — فروشگاه مدورا`,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      redirectUrl?: string;
      error?: string;
    };
    if (!response.ok || !data.redirectUrl) {
      throw new Error(data.error ?? 'اتصال به درگاه پرداخت ممکن نشد.');
    }
    return data.redirectUrl;
  },
};

const configuredGateway = (import.meta.env.VITE_PAYMENT_GATEWAY ?? 'sandbox').toLowerCase();

/** The gateway checkout uses. Set `VITE_PAYMENT_GATEWAY=zarinpal` to take real money. */
export const activeGateway: PaymentGateway =
  configuredGateway === 'zarinpal' ? zarinpalGateway : sandboxGateway;

const PAYMENTS_KEY = 'styleon.payments';

export const newOrderId = () => `ST-${Math.floor(100000 + Math.random() * 899999)}`;

export const readPayments = (): PaymentOrder[] => {
  try {
    const raw = window.localStorage.getItem(PAYMENTS_KEY);
    return raw ? (JSON.parse(raw) as PaymentOrder[]) : [];
  } catch {
    return [];
  }
};

export const readPayment = (id: string): PaymentOrder | null =>
  readPayments().find((order) => order.id === id) ?? null;

/** Upserts one payment record, newest first. */
export const savePayment = (order: PaymentOrder): void => {
  try {
    const rest = readPayments().filter((item) => item.id !== order.id);
    window.localStorage.setItem(PAYMENTS_KEY, JSON.stringify([order, ...rest]));
  } catch {
    /* storage unavailable — the payment simply stays in memory */
  }
};
