/**
 * Cart — the real WooCommerce cart, not a copy of it.
 *
 * The Store API owns the cart and identifies it with a session token the transport layer
 * keeps (`src/lib/woo/client.ts`); this module only ever asks the store to change it and
 * hands back what the store says the cart now is. There is no local cart state to drift
 * out of sync, and an anonymous shopper gets a server-side cart like anyone else.
 */
import { get, mutate } from '../lib/woo/client';
import { toman } from '../lib/woo/map';
import type { WooCart } from '../lib/woo/types';

export const getCart = (signal?: AbortSignal): Promise<WooCart> =>
  get<WooCart>('/store/cart', undefined, signal);

export type AddItemInput = {
  id: number;
  quantity: number;
  /** The chosen attributes of a variable product, exactly as WooCommerce names them. */
  variation?: { attribute: string; value: string }[];
};

export const addItem = (item: AddItemInput, signal?: AbortSignal): Promise<WooCart> =>
  mutate<WooCart>('/store/cart/add-item', 'POST', item, signal);

export const removeItem = (key: string, signal?: AbortSignal): Promise<WooCart> =>
  mutate<WooCart>('/store/cart/remove-item', 'POST', { key }, signal);

export const updateItem = (key: string, quantity: number, signal?: AbortSignal): Promise<WooCart> =>
  mutate<WooCart>('/store/cart/update-item', 'POST', { key, quantity }, signal);

export const applyCoupon = (code: string, signal?: AbortSignal): Promise<WooCart> =>
  mutate<WooCart>('/store/cart/apply-coupon', 'POST', { code }, signal);

export const removeCoupon = (code: string, signal?: AbortSignal): Promise<WooCart> =>
  mutate<WooCart>('/store/cart/remove-coupon', 'POST', { code }, signal);

export const selectShippingRate = (
  packageId: number,
  rateId: string,
  signal?: AbortSignal,
): Promise<WooCart> =>
  mutate<WooCart>('/store/cart/select-shipping-rate', 'POST', { package_id: packageId, rate_id: rateId }, signal);

/** Billing/shipping details the store needs before it can quote shipping and tax. */
export const updateCustomer = (
  customer: Record<string, string>,
  signal?: AbortSignal,
): Promise<WooCart> => mutate<WooCart>('/store/cart/update-customer', 'POST', customer, signal);

export const clearCart = (signal?: AbortSignal): Promise<WooCart> =>
  mutate<WooCart>('/store/cart/items', 'DELETE', undefined, signal);

export type CartTotals = {
  items: number;
  discount: number;
  shipping: number;
  total: number;
  count: number;
};

/**
 * The store's money, in Toman, in one place. Every amount the cart UI shows comes from
 * here — the app never adds prices up itself, so it cannot disagree with the order
 * WooCommerce will create.
 */
export const cartTotals = (cart: WooCart | null | undefined): CartTotals => ({
  items: toman(cart?.totals, cart?.totals?.total_items),
  discount: toman(cart?.totals, cart?.totals?.total_discount),
  shipping: toman(cart?.totals, cart?.totals?.total_shipping),
  total: toman(cart?.totals, cart?.totals?.total_price),
  count: cart?.items_count ?? 0,
});
