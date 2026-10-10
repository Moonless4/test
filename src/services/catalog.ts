/**
 * Catalog structure — the categories the store actually has.
 *
 * Nothing here is written down in the frontend: add, rename or deactivate a category in the admin
 * panel and every surface (header, drawer, home tiles, shop heading, breadcrumb) follows on the
 * next load. `Category.id` is the category's **slug**, which is both what the routes carry and
 * what `GET /products?category=` expects.
 */
import { get } from '../lib/api/client';
import { toCategory } from '../lib/api/map';
import type { ApiCategory } from '../lib/api/types';
import type { Category } from '../lib/types';

export const listCategories = async (signal?: AbortSignal): Promise<Category[]> => {
  const categories = await get<ApiCategory[]>('/categories', undefined, signal);
  return categories.map(toCategory);
};

/** The API returns the active categories flat, so the root list is the list. */
export const listRootCategories = (signal?: AbortSignal): Promise<Category[]> =>
  listCategories(signal);

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
};

/**
 * The groups the catalogue can actually be filtered by server-side: its categories, its sale flag
 * and its stock. Size, colour and brand are attributes of an individual product rather than a
 * filterable taxonomy in this API, so they are not offered here — the filter rail must only show
 * filters that really narrow the result set.
 */
export const buildFilterGroups = async (signal?: AbortSignal): Promise<FilterGroup[]> => {
  const categories = await listCategories(signal);

  return [
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
  ];
};
