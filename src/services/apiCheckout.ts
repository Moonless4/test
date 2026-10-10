/**
 * The Laravel API's side of a checkout the browser ran itself.
 *
 * The basket, the coupon, the coins and the gateway all live in the browser (`src/lib/payment.ts`),
 * so once a purchase is finished the order is handed to the API as well. That is what puts it on
 * the shop's orders screen — and in the shopper's account from any device — instead of only in the
 * tab that placed it.
 *
 * The API re-prices every line from its own catalogue, so this module sends products and quantities
 * and nothing that could change what the shopper owes.
 */
import { mutate } from '../lib/api/client';
import type { PaymentOrder } from '../lib/payment';

export type RecordOrderInput = {
  /** The number the shopper was shown (`ST-…`); the API keeps it when it is still free. */
  number: string;
  items: Array<{ slug: string; quantity: number; attributes?: Record<string, string> }>;
  customer: {
    name: string;
    phone: string;
    email?: string;
    province: string;
    city: string;
    postal_code: string;
    line1: string;
    note?: string;
  };
  shipping: { title: string; cost: number };
  /** The coupon and coin savings the checkout screen applied, in Toman. */
  discountTotal: number;
  payment: {
    /** The method the shopper chose: `online`, `wallet`, `installment` or `cod`. */
    method: string;
    /** What the shop's own checkout observed. */
    status: 'paid' | 'pending' | 'failed' | 'cancelled';
    /** The bank's tracking code, when there is one. */
    reference?: string;
    paidAt?: string;
  };
};

export type RecordedOrder = { number: string };

/** Throws `ApiError` like every other call; a checkout treats a failure as non-fatal. */
export const recordOrder = async (
  input: RecordOrderInput,
  signal?: AbortSignal,
): Promise<RecordedOrder> => {
  const payload = await mutate<{ order: RecordedOrder }>(
    '/checkout/record',
    'POST',
    {
      number: input.number,
      items: input.items,
      customer: input.customer,
      shipping: input.shipping,
      discount_total: input.discountTotal,
      payment: {
        method: input.payment.method,
        status: input.payment.status,
        reference: input.payment.reference,
        paid_at: input.payment.paidAt,
      },
    },
    signal,
  );

  return payload.order;
};

/** The basket's lines as the API wants them: the catalogue's own id, plus what was picked. */
const itemsOf = (order: PaymentOrder) =>
  order.lines
    .filter((line) => line.slug)
    .map((line) => {
      const attributes: Record<string, string> = {};
      if (line.size) attributes.size = line.size;
      if (line.color) attributes.color = line.color;

      return { slug: line.slug as string, quantity: line.qty, attributes };
    });

/**
 * Hands a finished order to the shop's backend, so the shop's own panel and the shopper's account
 * list it — and not only the browser that placed it.
 *
 * Fire-and-forget on purpose: the shopper has already paid, and a backend that cannot be reached
 * must never turn a completed purchase into an error on screen. The browser's own ledger keeps the
 * order either way.
 */
export const recordFinishedOrder = (
  order: PaymentOrder,
  outcome: 'paid' | 'pending',
  email?: string,
): void => {
  const items = itemsOf(order);

  // An order saved before its lines carried product ids cannot be re-priced by the API, and sending
  // it would record the wrong money — so it stays in the browser's ledger alone.
  if (items.length === 0) return;

  const itemsSubtotal = order.lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  void recordOrder({
    number: order.id,
    items,
    customer: {
      name: order.customer.name,
      phone: order.customer.mobile,
      email,
      province: order.customer.province,
      city: order.customer.city,
      postal_code: order.customer.postalCode,
      line1: order.customer.address,
      note: order.customer.note,
    },
    shipping: { title: order.shipping.title, cost: order.shipping.cost },
    // What the coupon and the coins took off, derived from what the shopper was charged: the API
    // prices the items itself and is told only the part it cannot see.
    discountTotal: Math.max(0, itemsSubtotal - (order.amount - order.shipping.cost)),
    payment: {
      method: order.method,
      status: outcome,
      reference: order.refId,
      paidAt: outcome === 'paid' ? (order.paidAt ?? new Date().toISOString()) : undefined,
    },
  }).catch(() => {
    /* the panel's copy can wait for the next order; the shopper's ledger already has this one */
  });
};
