/**
 * Orders — read back from WooCommerce, one order at a time.
 *
 * There is deliberately no "list every order" call: the proxy exposes no route that could
 * return another shopper's order. A shopper proves an order is theirs with the order key
 * WooCommerce handed them (and their billing email, which the store itself checks), so an
 * order id alone opens nothing.
 */
import { get } from '../lib/woo/client';
import { toman } from '../lib/woo/map';
import type { WooOrder } from '../lib/woo/types';

export type OrderAccess = {
  /** The `order_key` WooCommerce returned at checkout. */
  key: string;
  /** The email the order was placed with; the store verifies it. */
  billingEmail?: string;
};

export const getOrder = (
  id: number | string,
  { key, billingEmail }: OrderAccess,
  signal?: AbortSignal,
): Promise<WooOrder> =>
  get<WooOrder>(
    `/store/order/${encodeURIComponent(String(id))}`,
    { key, billing_email: billingEmail },
    signal,
  );

export type OrderSummary = {
  id: number;
  status: string;
  dateCreated: string;
  itemCount: number;
  total: number;
};

export const summariseOrder = (order: WooOrder): OrderSummary => ({
  id: order.id,
  status: order.status,
  dateCreated: order.date_created,
  itemCount: order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  total: toman(order.totals, order.totals?.total_price ?? order.total),
});
