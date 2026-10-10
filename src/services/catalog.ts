/**
 * Catalog structure — categories, attributes and the filter model built from them.
 *
 * The filter groups are derived from whatever the store has: add an attribute in
 * WooCommerce and it appears here on the next load, rename it and the label follows, remove
 * it and the group is gone. No option list is written down in the frontend.
 */
import { get, getList } from '../lib/woo/client';
import { toCategory } from '../lib/woo/map';
import type { WooAttribute, WooCategory, WooTerm } from '../lib/woo/types';
import type { Category } from '../lib/types';

export const listCategories = async (
  { parent, hideEmpty = true, perPage = 100 }: { parent?: number; hideEmpty?: boolean; perPage?: number } = {},
  signal?: AbortSignal,
): Promise<Category[]> => {
  const { items } = await getList<WooCategory>(
    '/store/products/categories',
    { parent, hide_empty: hideEmpty, per_page: perPage },
    signal,
  );
  return items.map(toCategory);
};

/** Only the top level of the category tree — the children of any category are `parent`. */
export const listRootCategories = (signal?: AbortSignal): Promise<Category[]> =>
  listCategories({ parent: 0 }, signal);

export const listAttributes = (signal?: AbortSignal): Promise<WooAttribute[]> =>
  get<WooAttribute[]>('/store/products/attributes', { per_page: 100 }, signal);

export const listAttributeTerms = (attributeId: number, signal?: AbortSignal): Promise<WooTerm[]> =>
  get<WooTerm[]>(`/store/products/attributes/${attributeId}/terms`, { per_page: 100 }, signal);

/* ------------------------------------------------------------------ *
 * Filter model
 * ------------------------------------------------------------------ */

export type FilterOption = {
  label: string;
  /** The term slug (or literal) the option stands for. */
  value: string;
  /** The attribute taxonomy this option belongs to, for a product-attribute group. */
  taxonomy?: string;
};

export type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
};

/**
 * Built from the store, not from a list in the code: the category tree, sale and stock
 * flags, then one group per WooCommerce attribute that actually has terms.
 */
export const buildFilterGroups = async (signal?: AbortSignal): Promise<FilterGroup[]> => {
  const [categories, attributes] = await Promise.all([
    listCategories({}, signal),
    listAttributes(signal),
  ]);

  const groups: FilterGroup[] = [
    {
      id: 'category',
      label: 'دسته‌بندی',
      options: categories.map((category) => ({ label: category.title, value: category.id })),
    },
    {
      id: 'sale',
      label: 'پیشنهاد ویژه',
      options: [{ label: 'فقط تخفیف‌دارها', value: 'true' }],
    },
    {
      id: 'stock',
      label: 'موجودی',
      options: [{ label: 'فقط کالاهای موجود', value: 'instock' }],
    },
  ];

  const attributeGroups = await Promise.all(
    attributes.map(async (attribute) => {
      const terms = await listAttributeTerms(attribute.id, signal);
      if (terms.length === 0) return null;
      const group: FilterGroup = {
        id: `attribute-${attribute.id}`,
        label: attribute.name,
        options: terms.map((term) => ({
          label: term.name,
          value: term.slug,
          taxonomy: attribute.taxonomy ?? undefined,
        })),
      };
      return group;
    }),
  );

  return [...groups, ...attributeGroups.filter((group): group is FilterGroup => group !== null)];
};
