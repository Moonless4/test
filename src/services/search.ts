/**
 * Search — the API's own product search.
 *
 * Relevance is what a shopper means by "search", so it is not the caller's to change; the API
 * orders results itself and refuses a term shorter than two characters, which is the same
 * threshold the suggestion box uses.
 */
import { listProducts, listProductsPage, type ProductQuery } from './products';

export type SearchQuery = Omit<ProductQuery, 'sort'>;

/** Shortest query worth asking the store about. */
export const MIN_QUERY = 2;

export const searchProducts = (query: SearchQuery, signal?: AbortSignal) =>
  listProducts(query, signal);

export const searchProductsPage = (query: SearchQuery, signal?: AbortSignal) =>
  listProductsPage(query, signal);

/**
 * The few products the search box drops down. One character matches half the catalogue, so the
 * box stays quiet until the shopper has typed something worth asking for.
 */
export const suggestProducts = (term: string, count = 6, signal?: AbortSignal) => {
  const search = term.trim();
  if (search.length < MIN_QUERY) return Promise.resolve([]);
  return listProducts({ search, perPage: count }, signal);
};
