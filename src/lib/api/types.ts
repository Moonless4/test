/**
 * The wire shapes of the Laravel API (`/api/v1`), for the subset the storefront reads.
 *
 * These mirror `backend/app/Http/Resources/*` field for field. Nothing outside `src/lib/api`
 * and `src/services` may import from here: a component sees the app's own `Product` /
 * `Category` / `BlogPost`, never a Laravel resource.
 *
 * Two conventions worth remembering:
 *  - Money is an integer in **Toman**, never a string and never Rial.
 *  - A resource read is wrapped in `{ "data": … }`; a paginated list carries `links` and `meta`.
 */

export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  position: number | null;
  image?: ApiMedia | null;
  products_count?: number;
  children?: ApiCategory[];
};

export type ApiMedia = {
  id: number;
  url: string | null;
  mime_type: string;
  width: number | null;
  height: number | null;
  is_public: boolean;
};

export type ApiProductImage = {
  id: number;
  alt: string | null;
  position: number;
  url: string | null;
  width: number | null;
  height: number | null;
};

/** `GET /products` — a card's worth of a product. */
export type ApiProductSummary = {
  id: number;
  name: string;
  slug: string;
  /** The rail's «برند» group reads this; null when the catalogue has no brand for the product. */
  brand: string | null;
  price: number;
  compare_at_price: number | null;
  discount_percent: number;
  /** The rail's «امتیاز» group reads this; null when nobody has scored the product. */
  rating: number | null;
  currency: string;
  is_in_stock: boolean;
  is_featured: boolean;
  /** Option lists the filter rail builds its size and colour choices from. */
  attributes: Record<string, string[]> | null;
  category?: ApiCategory | null;
  images?: ApiProductImage[];
};

/** `GET /products/{id|slug}` — the same product with its body and attributes. */
export type ApiProduct = ApiProductSummary & {
  sku: string | null;
  short_description: string | null;
  description: string | null;
  stock_quantity: number | null;
  attributes: Record<string, string[]> | null;
  published_at: string | null;
};

/**
 * `GET /products/filters` — the option lists the filter rail offers, taken from the whole
 * published catalogue rather than from one page of it.
 */
export type ApiProductFacets = {
  sizes: string[];
  colors: string[];
  brands: string[];
};

export type ApiPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  tags: string[] | null;
  cover: ApiMedia | null;
  published_at: string | null;
};

export type ApiFaq = {
  id: number;
  group: string;
  question: string;
  answer: string;
  position: number;
};

export type ApiSetting = {
  key: string;
  /** `type` is what turns the stored string back into a number or a boolean. */
  value: string | number | boolean;
  type: 'string' | 'int' | 'float' | 'bool';
  group: string;
};

/**
 * The admin panel's mount point, served on its own (`GET /content/admin-path`) so that `admin.path`
 * can be an internal setting while the storefront's router still learns the address before it
 * renders.
 */
export type ApiAdminPath = {
  path: string;
};

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string | null;
  email_verified: boolean;
  roles?: string[];
  created_at: string | null;
};

export type ApiCartItem = {
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  is_available: boolean;
  stock_quantity: number | null;
  product?: ApiProductSummary | null;
};

export type ApiCartTotals = {
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  items_count: number;
  currency: string;
  coupon_code: string | null;
};

export type ApiCart = {
  id: number;
  items: ApiCartItem[];
  totals: ApiCartTotals;
};

export type ApiOrderItem = {
  product_id: number | null;
  name: string;
  sku: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  attributes: Record<string, string> | null;
};

export type ApiOrder = {
  number: string;
  status: string;
  payment_status: string;
  currency: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  items_count: number;
  customer: { name: string; email: string | null; phone: string | null };
  shipping: {
    province: string | null;
    city: string | null;
    postal_code: string | null;
    line1: string | null;
    line2: string | null;
  };
  note: string | null;
  items?: ApiOrderItem[];
  placed_at: string | null;
  paid_at: string | null;
  /** Only the checkout response carries it, and only once. */
  access_token?: string;
};

export type ApiAddress = {
  id: number;
  label: string | null;
  receiver_first_name: string;
  receiver_last_name: string;
  phone: string;
  province: string | null;
  city: string;
  postal_code: string;
  line1: string;
  line2: string | null;
  is_default: boolean;
};

export type ApiWishlistItem = {
  id: number;
  product?: ApiProductSummary | null;
};

/** Laravel's paginator, reduced to what the storefront uses. */
export type ApiPaginated<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

/* ---------------------------------------------------------------------------------------------
 | Administration (`/api/v1/admin`)
 |
 | The shapes the panel reads and writes. Each mirrors an `Admin*Resource` in
 | `backend/app/Http/Resources/`: the public resource plus the fields only an operator sees
 | (`status`, `is_active`, `is_public`, `is_featured`) and the `id` the admin routes bind on — a
 | public payload deliberately keeps the internal id out of reach, the panel cannot address a row
 | without it.
 |
 | Same conventions as above: money is an integer in Toman, and a resource body is wrapped in
 | `{ "data": … }`.
 -------------------------------------------------------------------------------------------- */

export type ApiAdminUser = ApiUser & {
  permissions?: string[];
  last_login_at?: string | null;
};

export type ApiAdminProduct = ApiProduct & {
  category_id: number | null;
  is_active: boolean;
  is_featured: boolean;
  low_stock_threshold: number | null;
  is_low_on_stock: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type ApiAdminCategory = ApiCategory & {
  parent_id: number | null;
  image_media_id: number | null;
  is_active: boolean;
  active_products_count?: number;
};

export type ApiAdminCoupon = {
  id: number;
  code: string;
  /** `value` means percent or Toman depending on this, exactly as the column does. */
  type: 'percent' | 'fixed';
  value: number;
  min_subtotal: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

export type ApiPayment = {
  id: number;
  gateway: string;
  status: string;
  amount: number;
  currency: string;
  reference_id: string | null;
  card_mask: string | null;
  paid_at: string | null;
};

export type ApiOrderHistoryEntry = {
  from: string | null;
  to: string;
  note: string | null;
  at: string | null;
};

export type ApiAdminOrder = ApiOrder & {
  id: number;
  payments?: ApiPayment[];
  history?: ApiOrderHistoryEntry[];
};

/** Editorial state of a page or a post: a draft is visible in the panel and nowhere else. */
export type ContentStatus = 'draft' | 'published';

export type ApiAdminPage = {
  id: number;
  slug: string;
  title: string;
  body: string;
  meta: Record<string, string> | null;
  status: ContentStatus;
  published_at: string | null;
};

export type ApiAdminPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  tags: string[] | null;
  cover: ApiMedia | null;
  status: ContentStatus;
  published_at: string | null;
};

export type ApiAdminFaq = ApiFaq & { is_active: boolean };

export type ApiAdminSetting = {
  id: number;
  key: string;
  /** `type` is what turns the stored string back into a number, a boolean or a JSON document. */
  value: string | number | boolean | null;
  type: 'string' | 'int' | 'float' | 'bool' | 'json';
  group: string;
  is_public: boolean;
};

export type ApiAdminMedia = ApiMedia & {
  size_bytes: number | null;
  /** The stored filename, shown to operators as a label. */
  alt_source: string | null;
};
