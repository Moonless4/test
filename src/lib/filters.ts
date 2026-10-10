import type { ProductSort } from '../services/products';
import type { Product } from './types';

/**
 * The filters the catalogue sidebar offers.
 *
 * Only what the shopper can really narrow the result set with: price, sizes, colours and the sale
 * flag. Brand and rating are gone because this API has no such field — a filter with no data behind
 * it can only hide products for no reason.
 */
export type Filters = {
  sizes: string[];
  colors: string[];
  onlyDiscount: boolean;
  maxPrice: number;
};

/** The slider's own ceiling: at this value the filter is not applied at all — it means "no limit". */
export const PRICE_CEILING = 5000000;
export const PRICE_FLOOR = 200000;

export const emptyFilters: Filters = {
  sizes: [],
  colors: [],
  onlyDiscount: false,
  maxPrice: PRICE_CEILING,
};

export const isFiltersDirty = (filters: Filters): boolean =>
  filters.sizes.length > 0 ||
  filters.colors.length > 0 ||
  filters.onlyDiscount ||
  filters.maxPrice < PRICE_CEILING;

/**
 * The orderings the shop and the search page offer, in the API's own vocabulary — the sort is a
 * query parameter of `GET /products`, not something the browser does to the list it received.
 */
export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'discount', label: 'بیشترین تخفیف' },
  { value: 'name', label: 'الفبایی' },
];

export const DEFAULT_SORT: ProductSort = 'newest';

/** Guards a `?sort=` value from the URL before it is handed to the API. */
export const isSort = (value: string | null): value is ProductSort =>
  SORT_OPTIONS.some((option) => option.value === value);

/**
 * The size and colour options of a set of products, for the sidebar to offer. Derived from what the
 * catalogue actually published, so an option that matches nothing is never shown.
 */
export const optionSets = (products: Product[]) => {
  const sizes = new Set<string>();
  const colors = new Map<string, string>();

  for (const product of products) {
    for (const size of product.sizes) sizes.add(size);
    for (const color of product.colors) colors.set(color.name, color.hex);
  }

  return {
    sizes: [...sizes],
    colors: [...colors].map(([name, hex]) => ({ name, hex })),
  };
};
