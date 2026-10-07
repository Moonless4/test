/**
 * Payment layer for the checkout.
 *
 * This is the seam between the store and a payment service provider (PSP). It keeps
 * three things: the payment record a checkout produces, the lifecycle of that record,
 * and the gateway the shopper is handed off to.
 *
 * The app ships with `sandboxGateway`, an in-app stand-in for the bank page that moves
 * no money. That is deliberate: every Iranian PSP (زرین‌پال، آی‌دی‌پی، زیبال، …) needs a
 * server to request the transaction and to verify it with the merchant credentials, and
 * this repo has no server yet. Nothing here changes when one is added:
 *
 *   handoff  → POST /payment/request   { orderId, amount, callbackUrl } → { authority, redirectUrl }
 *   verify   → POST /payment/verify    { authority }                   → { ok, refId }
 *
 * Implement `PaymentGateway` against those two routes and point `activeGateway` at it.
 * The merchant key stays on the server — never ship it to the browser.
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
  /** What the gateway charges: basket due plus shipping. */
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
  handoff: (order: PaymentOrder) => string;
  /** Confirms that handoff. A real gateway calls its server here. */
  verify: (order: PaymentOrder, input: VerifyInput) => VerifyResult;
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
  handoff: (order) => `/payment/${order.id}`,
  verify: (_order, input) => {
    if (input.outcome === 'canceled') {
      return { ok: false, status: 'canceled', error: 'پرداخت لغو شد.' };
    }
    if (input.outcome === 'failed') {
      return { ok: false, status: 'failed', error: 'پرداخت در درگاه ناموفق بود.' };
    }
    return { ok: true, status: 'paid', refId: sandboxRef() };
  },
};

/** The gateway checkout uses. Swap the value once a real PSP is wired. */
export const activeGateway: PaymentGateway = sandboxGateway;

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
