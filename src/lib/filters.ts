import type { Product } from './types';

/** Every filter the catalog sidebar can apply. */
export type Filters = {
  sizes: string[];
  colors: string[];
  brands: string[];
  onlyDiscount: boolean;
  minRating: number;
  maxPrice: number;
};

export const PRICE_CEILING = 5000000;

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

/** Keeps the products the given filters allow. */
export function applyFilters(list: Product[], filters: Filters): Product[] {
  let next = list;

  if (filters.onlyDiscount) next = next.filter((p) => p.discount > 0);
  if (filters.sizes.length) next = next.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
  if (filters.colors.length)
    next = next.filter((p) => p.colors.some((c) => filters.colors.includes(c.name)));
  if (filters.brands.length) next = next.filter((p) => filters.brands.includes(p.brand));
  if (filters.minRating) next = next.filter((p) => p.rating >= filters.minRating);
  if (filters.maxPrice < PRICE_CEILING) next = next.filter((p) => p.price <= filters.maxPrice);

  return next;
}

/** A sorted copy of the list, by one of the catalog sort options. */
export function sortProducts(list: Product[], sort: string): Product[] {
  const next = [...list];

  switch (sort) {
    case 'price-asc':
      return next.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return next.sort((a, b) => b.price - a.price);
    case 'popular':
      return next.sort((a, b) => b.reviewCount - a.reviewCount);
    case 'discount':
      return next.sort((a, b) => b.discount - a.discount);
    default:
      return next.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }
}
