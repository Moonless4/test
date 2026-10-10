/**
 * Products — every read of the catalogue goes through here, and every surface (home rails, shop,
 * category, search, sale, product detail, related) gets the same `Product` model back.
 *
 * Filtering, search and ordering are the API's own query parameters: the browser never receives
 * the whole catalogue and paging it itself. `per_page` is capped at 48 by the API, so a surface
 * that wants more has to page.
 */
import { get, getPage } from '../lib/api/client';
import { toFilterFacets, toProduct } from '../lib/api/map';
import type { ApiProduct, ApiProductFacets, ApiProductSummary } from '../lib/api/types';
import type { FilterOptions } from '../lib/filters';
import type { Product } from '../lib/types';

/** The orderings `GET /products` accepts. */
export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'name' | 'discount';

export type ProductQuery = {
  page?: number;
  /** 1–48, the API's own ceiling. */
  perPage?: number;
  search?: string;
  /** Category slug, exactly as `/categories` publishes it. */
  category?: string;
  discounted?: boolean;
  featured?: boolean;
  /** Toman. */
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
};

const params = (query: ProductQuery) => ({
  page: query.page,
  per_page: query.perPage,
  q: query.search,
  category: query.category,
  discounted: query.discounted,
  featured: query.featured,
  min_price: query.minPrice,
  max_price: query.maxPrice,
  sort: query.sort,
});

/** One page of products, with the API's own pagination totals. */
export const listProductsPage = async (query: ProductQuery = {}, signal?: AbortSignal) => {
  const page = await getPage<ApiProductSummary>('/products', params(query), signal);
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

/**
 * The filter rail's own options: the sizes, colours and brands the published catalogue carries.
 *
 * It is deliberately not a product list and takes no query: the rail is built once for the whole
 * catalogue, so it looks the same on `/shop`, in a category and in a search result instead of
 * shrinking to whatever that one query happened to return.
 */
export const getProductFacets = async (signal?: AbortSignal): Promise<FilterOptions> =>
  toFilterFacets(await get<ApiProductFacets>('/products/filters', undefined, signal));

/** Accepts either the numeric id or the slug — the slug is what the routes carry. */
export const getProduct = async (
  idOrSlug: string | number,
  signal?: AbortSignal,
): Promise<Product> =>
  toProduct(
    await get<ApiProduct>(`/products/${encodeURIComponent(String(idOrSlug))}`, undefined, signal),
  );

/**
 * Same category, never the product itself. The API decides what "related" means, so the rail
 * follows the catalogue instead of re-implementing the rule in the browser. May be empty.
 */
export const listRelated = async (
  product: Product,
  count = 6,
  signal?: AbortSignal,
): Promise<Product[]> => {
  const related = await get<ApiProductSummary[]>(
    `/products/${encodeURIComponent(product.id)}/related`,
    undefined,
    signal,
  );
  return related.filter((item) => item.slug !== product.id).slice(0, count).map(toProduct);
};

export const listNewArrivals = (count = 8, signal?: AbortSignal): Promise<Product[]> =>
  listProducts({ sort: 'newest', perPage: count }, signal);

export const listFeatured = (count = 8, signal?: AbortSignal): Promise<Product[]> =>
  listProducts({ featured: true, perPage: count }, signal);

/**
 * The «تخفیف شگفت‌انگیز» rail only carries deals at least this deep. The threshold is a
 * parameter, never baked into the section, and the discount itself is the API's own
 * `discount_percent` — computed from the two prices, never stored as a second number.
 */
export const DEFAULT_MIN_DISCOUNT = 20;

const DEAL_PAGE_SIZE = 48;

export const listDeals = async (
  { minDiscount = DEFAULT_MIN_DISCOUNT, count = 12 }: { minDiscount?: number; count?: number } = {},
  signal?: AbortSignal,
): Promise<Product[]> => {
  const candidates = await listProducts(
    { discounted: true, sort: 'discount', perPage: DEAL_PAGE_SIZE },
    signal,
  );
  return candidates.filter((product) => product.discount >= minDiscount).slice(0, count);
};
