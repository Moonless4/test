/**
 * Search — the storefront's own search, run against WooCommerce.
 *
 * Keyword, category, attribute, price and sale filtering are the same product query the
 * shop uses; search only decides the ordering and what a suggestion asks for.
 */
import { listProducts, listProductsPage, type ProductQuery } from './products';

export type SearchQuery = Omit<ProductQuery, 'orderby'>;

/** Relevance is what a shopper means by "search", so it is not the caller's to change. */
export const searchProducts = (query: SearchQuery, signal?: AbortSignal) =>
  listProducts({ ...query, orderby: 'relevance' }, signal);

export const searchProductsPage = (query: SearchQuery, signal?: AbortSignal) =>
  listProductsPage({ ...query, orderby: 'relevance' }, signal);

/**
 * The few products the search box drops down. One character matches half the catalog, so
 * the box stays quiet until the shopper has typed something worth asking for.
 */
export const suggestProducts = (term: string, count = 5, signal?: AbortSignal) => {
  const search = term.trim();
  if (search.length < 2) return Promise.resolve([]);
  return listProducts({ search, perPage: count, orderby: 'popularity' }, signal);
};
