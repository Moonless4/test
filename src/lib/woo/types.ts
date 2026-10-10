/**
 * Raw shapes as WooCommerce and WordPress send them, for the subset the storefront reads.
 *
 * These mirror the wire format on purpose — the app's own models live in `src/lib/types.ts`
 * and are produced from these by `src/lib/woo/map.ts`. Nothing outside `src/lib/woo` and
 * `src/services` should import from here.
 */

/* ----------------------------- Store API ----------------------------- */

export type WooPrices = {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_minor_unit: number;
  currency_symbol?: string;
  currency_prefix?: string;
  currency_suffix?: string;
};

export type WooImage = {
  id: number;
  src: string;
  thumbnail?: string;
  alt: string;
};

export type WooTerm = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

export type WooAttribute = {
  id: number;
  name: string;
  taxonomy: string | null;
  has_variations: boolean;
  terms: WooTerm[];
};

export type WooVariation = {
  id: number;
  attributes: { name: string; value: string }[];
  is_in_stock?: boolean;
  prices?: WooPrices;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  sku: string;
  type: string;
  featured?: boolean;
  short_description: string;
  description: string;
  prices: WooPrices;
  on_sale: boolean;
  is_in_stock: boolean;
  low_stock_remaining: number | null;
  average_rating: string;
  review_count: number;
  images: WooImage[];
  categories: WooTerm[];
  tags: WooTerm[];
  attributes: WooAttribute[];
  variations: WooVariation[];
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image: WooImage | null;
};

export type WooReview = {
  id: number;
  reviewer: string;
  review: string;
  rating: number;
  date_created: string;
  verified: boolean;
  avatar_urls?: Record<string, string>;
};

export type WooCartItem = {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  permalink: string;
  images: WooImage[];
  variation: { attribute: string; value: string }[];
  prices: WooPrices & { line_total: string; line_subtotal: string };
};

export type WooCartTotals = WooPrices & {
  total_items: string;
  total_shipping: string;
  total_discount: string;
  total_price: string;
};

export type WooCart = {
  items: WooCartItem[];
  items_count: number;
  needs_shipping: boolean;
  coupons: { code: string; totals: WooPrices & { total_discount: string } }[];
  totals: WooCartTotals;
  errors: { code: string; message: string }[];
};

export type WooOrder = {
  id: number;
  status: string;
  order_key: string;
  date_created: string;
  total: string;
  currency_code: string;
  customer_note: string;
  billing_address: Record<string, string>;
  shipping_address: Record<string, string>;
  items: { key: string; name: string; quantity: number; totals: WooPrices & { line_total: string } }[];
  totals: WooCartTotals;
};

export type WooCartError = { code: string; message: string };

/* ------------------------- WordPress REST API ------------------------ */

export type WpRendered = { rendered: string; protected?: boolean };

export type WpPost = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  status: string;
  title: WpRendered;
  excerpt: WpRendered;
  content: WpRendered;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string; alt_text: string }[];
    author?: { id: number; name: string }[];
    'wp:term'?: WpTerm[][];
  };
};

export type WpTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
};

export type WpMedia = {
  id: number;
  source_url: string;
  alt_text: string;
  media_details?: { width: number; height: number };
};

export type WpMenuItem = {
  id: number;
  title: WpRendered;
  url: string;
  menu_order: number;
  parent: number;
  type: string;
  object: string;
  object_id: number;
};

export type WpMenu = {
  id: number;
  name: string;
  slug: string;
  locations: string[];
};
