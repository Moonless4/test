/**
 * The catalogue, as hooks. A component asks for what it needs and gets data, a loading flag, an
 * error and a retry — it never calls `fetch`, builds a query string or sees a Laravel shape.
 * Query objects are compared by value, so an inline literal in a component is fine.
 */
import { useAsync, type AsyncState } from './useAsync';
import {
  getProduct,
  getProductFacets,
  listDeals,
  listFeatured,
  listNewArrivals,
  listProducts,
  listProductsPage,
  listRelated,
  type ProductQuery,
} from '../services/products';
import { listCategories } from '../services/catalog';
import { suggestProducts } from '../services/search';
import type { FilterOptions } from '../lib/filters';
import type { Category, Product } from '../lib/types';

/** A stable dependency for an inline query object. */
const asKey = (value: unknown) => JSON.stringify(value);

export const useProducts = (query: ProductQuery = {}): AsyncState<Product[]> =>
  useAsync((signal) => listProducts(query, signal), [asKey(query)]);

export const useProductsPage = (
  query: ProductQuery = {},
): AsyncState<{ products: Product[]; total: number; totalPages: number }> =>
  useAsync((signal) => listProductsPage(query, signal), [asKey(query)]);

export const useProduct = (idOrSlug: string): AsyncState<Product> =>
  useAsync((signal) => getProduct(idOrSlug, signal), [idOrSlug]);

export const useRelatedProducts = (
  product: Product | undefined,
  count = 6,
): AsyncState<Product[]> =>
  useAsync(
    (signal) => (product ? listRelated(product, count, signal) : Promise.resolve<Product[]>([])),
    [product?.id, count],
  );

export const useNewArrivals = (count = 8): AsyncState<Product[]> =>
  useAsync((signal) => listNewArrivals(count, signal), [count]);

export const useFeaturedProducts = (count = 8): AsyncState<Product[]> =>
  useAsync((signal) => listFeatured(count, signal), [count]);

/** `minDiscount` is the flash-sale threshold; leave it out to use the service default. */
export const useDeals = (minDiscount?: number, count = 12): AsyncState<Product[]> =>
  useAsync((signal) => listDeals({ minDiscount, count }, signal), [minDiscount, count]);

export const useCategories = (): AsyncState<Category[]> =>
  useAsync((signal) => listCategories(signal), []);

/** The filter rail's option lists, the same ones on every screen. */
export const useProductFacets = (): AsyncState<FilterOptions> =>
  useAsync((signal) => getProductFacets(signal), []);

/** The few products the search box drops down while the shopper types. */
export const useProductSuggestions = (term: string, count = 6): AsyncState<Product[]> =>
  useAsync((signal) => suggestProducts(term, count, signal), [term.trim(), count]);

/**
 * Products by the ids a browser-side list holds (the wishlist). An id the catalogue no longer has
 * is skipped rather than failing the whole page — a saved product can be retired.
 */
export const useProductsByIds = (ids: string[]): AsyncState<Product[]> =>
  useAsync(
    async (signal) => {
      if (ids.length === 0) return [];
      const found = await Promise.all(
        ids.map((id) => getProduct(id, signal).catch(() => null)),
      );
      return found.filter((product): product is Product => product !== null);
    },
    [ids.join(',')],
  );
