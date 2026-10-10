/**
 * The catalog, as hooks. A component asks for what it needs and gets data, a loading flag,
 * an error and a retry — it never calls `fetch`, builds a query string or sees a WordPress
 * shape. Query objects are compared by value, so an inline literal in a component is fine.
 */
import { useAsync, type AsyncState } from './useAsync';
import { storeStatus, type StoreStatus } from '../lib/woo/client';
import {
  getProduct,
  listDeals,
  listFeatured,
  listNewArrivals,
  listProducts,
  listProductsPage,
  listRelated,
  listReviews,
  type ProductQuery,
} from '../services/products';
import { buildFilterGroups, listRootCategories } from '../services/catalog';
import { getPost, listPosts, type PostQuery } from '../services/content';
import type { BlogPost, Category, Product, ProductReview } from '../lib/types';

/** A stable dependency for an inline query object. */
const asKey = (value: unknown) => JSON.stringify(value);

/** Whether a store is wired behind the app at all, so a screen can explain itself. */
export const useStoreStatus = (): AsyncState<StoreStatus> => useAsync(() => storeStatus(), []);

export const useProducts = (query: ProductQuery = {}): AsyncState<Product[]> =>
  useAsync((signal) => listProducts(query, signal), [asKey(query)]);

export const useProductsPage = (
  query: ProductQuery = {},
): AsyncState<{ products: Product[]; total: number; totalPages: number }> =>
  useAsync((signal) => listProductsPage(query, signal), [asKey(query)]);

export const useProduct = (idOrSlug: string): AsyncState<Product> =>
  useAsync((signal) => getProduct(idOrSlug, signal), [idOrSlug]);

export const useProductReviews = (productId: string): AsyncState<ProductReview[]> =>
  useAsync((signal) => listReviews(productId, {}, signal), [productId]);

export const useRelatedProducts = (
  product: Product | undefined,
  count = 6,
): AsyncState<Product[]> =>
  useAsync(
    (signal) => (product ? listRelated(product, count, signal) : Promise.resolve<Product[]>([])),
    [product?.id, product?.category, count],
  );

export const useNewArrivals = (count = 8): AsyncState<Product[]> =>
  useAsync((signal) => listNewArrivals(count, signal), [count]);

export const useFeaturedProducts = (count = 8): AsyncState<Product[]> =>
  useAsync((signal) => listFeatured(count, signal), [count]);

/** `minDiscount` is the flash-sale threshold; leave it out to use the service default. */
export const useDeals = (minDiscount?: number, count = 12): AsyncState<Product[]> =>
  useAsync((signal) => listDeals({ minDiscount, count }, signal), [minDiscount, count]);

export const useCategories = (): AsyncState<Category[]> =>
  useAsync((signal) => listRootCategories(signal), []);

/** The filter rail: groups derived from the store's own categories and attributes. */
export const useFilterGroups = (): AsyncState<Awaited<ReturnType<typeof buildFilterGroups>>> =>
  useAsync((signal) => buildFilterGroups(signal), []);

export const usePosts = (
  query: PostQuery = {},
): AsyncState<{ posts: BlogPost[]; total: number; totalPages: number }> =>
  useAsync((signal) => listPosts(query, signal), [asKey(query)]);

export const usePost = (idOrSlug: string): AsyncState<BlogPost> =>
  useAsync((signal) => getPost(idOrSlug, signal), [idOrSlug]);
