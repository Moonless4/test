/**
 * Checkout — WooCommerce creates the order, not the browser.
 *
 * The Store API's checkout endpoint validates the basket server-side (stock, coupons,
 * shipping, totals) and returns the order it created, which then appears in
 * WordPress → WooCommerce → Orders. The app posts the shopper's details and nothing else:
 * it never sends a total, because a total the client could type is a total it could change.
 */
import { mutate } from '../lib/woo/client';

export type Address = {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email?: string;
};

export type CheckoutInput = {
  billing_address: Address;
  shipping_address: Address;
  customer_note?: string;
  payment_method?: string;
  create_account?: boolean;
  customer_password?: string;
};

export type CheckoutResult = {
  order_id: number;
  status: string;
  order_key: string;
  /** Where the chosen gateway wants the shopper to go next, when it wants anything. */
  redirect_url?: string;
  payment_result?: {
    payment_status: string;
    payment_details?: { key: string; value: string }[];
    redirect_url?: string;
  };
};

export const placeOrder = (input: CheckoutInput, signal?: AbortSignal): Promise<CheckoutResult> =>
  mutate<CheckoutResult>('/store/checkout', 'POST', input, signal);

/**
 * Shipping and tax are quoted by the store, so the details are pushed into the cart first
 * and the totals that come back are the ones the order will carry.
 */
export const submitCustomerDetails = (
  input: Pick<CheckoutInput, 'billing_address' | 'shipping_address'>,
  signal?: AbortSignal,
): Promise<unknown> =>
  mutate('/store/cart/update-customer', 'POST', {
    billing_address: input.billing_address,
    shipping_address: input.shipping_address,
  }, signal);
