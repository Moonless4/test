import type { ProductSort } from '../services/products';
import type { Product } from './types';

/**
 * The filters the catalogue sidebar offers.
 *
 * The groups are the ones the rail has always had, and every one of them narrows the result set for
 * real: price and the sale flag are query parameters of `GET /products`, while size, colour, brand
 * and score are attributes of each product and are matched against the list the API returned.
 *
 * The option lists come from the catalogue itself (`GET /products/filters`), not from the page on
 * screen — the rail must be the same rail on `/shop`, in a category and in a search result.
 */
export type Filters = {
  sizes: string[];
  colors: string[];
  brands: string[];
  onlyDiscount: boolean;
  minRating: number;
  maxPrice: number;
};

/** The option lists the rail shows, as the catalogue publishes them. */
export type FilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string }[];
  brands: string[];
};

/** What the rail renders before the catalogue's own options arrive. */
export const EMPTY_OPTIONS: FilterOptions = { sizes: [], colors: [], brands: [] };

/** The slider's own ceiling: at this value the filter is not applied at all — it means "no limit". */
export const PRICE_CEILING = 5000000;
export const PRICE_FLOOR = 200000;

/** The score floors the «امتیاز» group offers. */
export const RATING_OPTIONS = [4.5, 4, 3.5, 3];

export const emptyFilters: Filters = {
  sizes: [],
  colors: [],
  brands: [],
  onlyDiscount: false,
  minRating: 0,
  maxPrice: PRICE_CEILING,
};

export const isFiltersDirty = (filters: Filters): boolean =>
  filters.sizes.length > 0 ||
  filters.colors.length > 0 ||
  filters.brands.length > 0 ||
  filters.onlyDiscount ||
  filters.minRating > 0 ||
  filters.maxPrice < PRICE_CEILING;

/**
 * The four filters the API cannot express — size, colour, brand and score are attributes of a
 * product, so they are matched here against the products the list returned. Price, discount and
 * the search term are the API's own and never reach this.
 */
export const narrowProducts = (products: Product[], filters: Filters): Product[] =>
  products.filter(
    (product) =>
      (filters.sizes.length === 0 || product.sizes.some((s) => filters.sizes.includes(s))) &&
      (filters.colors.length === 0 ||
        product.colors.some((c) => filters.colors.includes(c.name))) &&
      (filters.brands.length === 0 || filters.brands.includes(product.brand)) &&
      (filters.minRating === 0 || product.rating >= filters.minRating),
  );

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
