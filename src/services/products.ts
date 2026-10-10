/**
 * Products — every read of the catalog goes through here, and every page (home rails, shop,
 * category, search, sale, product detail, related) gets the same `Product` model back.
 *
 * Nothing in this module knows what a route looks like or how a card renders.
 */
import { get, getList } from '../lib/woo/client';
import { toProduct, toProductReview } from '../lib/woo/map';
import type { WooProduct, WooReview, WooVariation } from '../lib/woo/types';
import type { Product, ProductReview } from '../lib/types';

export type ProductQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  /** Category slug as WordPress knows it. */
  category?: string;
  tag?: string;
  onSale?: boolean;
  featured?: boolean;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  /** Minor units, the same unit the store's own price strings use. */
  minPrice?: number;
  maxPrice?: number;
  /** Attribute taxonomy, e.g. `pa_size`, paired with `attributeTerm`. */
  attribute?: string;
  attributeTerm?: string;
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title' | 'menu_order' | 'relevance';
  order?: 'asc' | 'desc';
};

const params = (query: ProductQuery) => ({
  page: query.page,
  per_page: query.perPage,
  search: query.search,
  category: query.category,
  tag: query.tag,
  on_sale: query.onSale,
  featured: query.featured,
  stock_status: query.stockStatus,
  min_price: query.minPrice,
  max_price: query.maxPrice,
  attribute: query.attribute,
  attribute_term: query.attributeTerm,
  orderby: query.orderby,
  order: query.order,
});

/** One page of products, with the store's own pagination totals. */
export const listProductsPage = async (query: ProductQuery = {}, signal?: AbortSignal) => {
  const page = await getList<WooProduct>('/store/products', params(query), signal);
  return {
    products: page.items.map(toProduct),
    total: page.total,
    totalPages: page.totalPages,
  };
};

export const listProducts = async (
  query: ProductQuery = {},
  signal?: AbortSignal,
): Promise<Product[]> => (await listProductsPage(query, signal)).products;

/** Accepts either the numeric WooCommerce id or the slug. */
export const getProduct = async (
  idOrSlug: string | number,
  signal?: AbortSignal,
): Promise<Product> =>
  toProduct(
    await get<WooProduct>(`/store/products/${encodeURIComponent(String(idOrSlug))}`, undefined, signal),
  );

/** The size/colour combinations the store publishes for a variable product. */
export const listVariations = async (
  productId: string | number,
  signal?: AbortSignal,
): Promise<WooVariation[]> =>
  get<WooVariation[]>(
    `/store/products/${encodeURIComponent(String(productId))}/variations`,
    { per_page: 100 },
    signal,
  );

export const listReviews = async (
  productId: string | number,
  { page = 1, perPage = 20 }: { page?: number; perPage?: number } = {},
  signal?: AbortSignal,
): Promise<ProductReview[]> => {
  const { items } = await getList<WooReview>(
    '/store/products/reviews',
    { product_id: productId, page, per_page: perPage },
    signal,
  );
  return items.map(toProductReview);
};

/** Same category, never the product itself. May be empty. */
export const listRelated = async (
  product: Product,
  count = 6,
  signal?: AbortSignal,
): Promise<Product[]> => {
  if (!product.category) return [];
  const siblings = await listProducts({ category: product.category, perPage: count + 1 }, signal);
  return siblings.filter((item) => item.id !== product.id).slice(0, count);
};

export const listNewArrivals = (count = 8, signal?: AbortSignal): Promise<Product[]> =>
  listProducts({ orderby: 'date', order: 'desc', perPage: count }, signal);

export const listFeatured = (count = 8, signal?: AbortSignal): Promise<Product[]> =>
  listProducts({ featured: true, perPage: count }, signal);

/**
 * The «تخفیف شگفت‌انگیز» rail only carries deals at least this deep. The threshold is a
 * parameter, never baked into the section: a caller — or, once the store exposes a setting,
 * WordPress itself — decides it. The discount is computed from the two prices the store
 * publishes, `(regular - sale) / regular × 100`.
 */
export const DEFAULT_MIN_DISCOUNT = 20;

export const listDeals = async (
  { minDiscount = DEFAULT_MIN_DISCOUNT, count = 12 }: { minDiscount?: number; count?: number } = {},
  signal?: AbortSignal,
): Promise<Product[]> => {
  const candidates = await listProducts(
    { onSale: true, perPage: 100, orderby: 'popularity' },
    signal,
  );
  return candidates
    .filter((product) => product.originalPrice > 0 && product.discount >= minDiscount)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, count);
};
