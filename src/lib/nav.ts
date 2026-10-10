import { megaMenu } from './data';
import type { Category } from './types';

/**
 * The main menu's own structure — the links that are not a category.
 *
 * The categories themselves are **not** listed here: they come from the API, so adding or renaming
 * one in the admin panel changes the header with no code change. These two lists only say where
 * the non-category entries sit relative to them.
 */
export type NavLink = { label: string; to: string; category?: string };

/** Sits before the categories. */
export const NAV_HEAD: NavLink[] = [{ label: 'خانه', to: '/' }];

/** Sits after them. */
export const NAV_TAIL: NavLink[] = [
  { label: 'جدیدترین‌ها', to: '/shop?sort=newest' },
  { label: 'وبلاگ', to: '/blog' },
];

/**
 * The shop's categories as menu entries. `category` is only set when the category actually has
 * sub-sections to show, so a category without a mega menu behaves like an ordinary link instead
 * of opening an empty panel.
 */
export const navCategoryLinks = (categories: Category[]): NavLink[] =>
  categories.map((category) => ({
    label: category.title,
    to: `/shop/${category.id}`,
    category: megaMenu[category.id]?.length ? category.id : undefined,
  }));

/** The whole menu, in order: home, the shop's categories, then the extra links. */
export const mainMenu = (categories: Category[]): NavLink[] => [
  ...NAV_HEAD,
  ...navCategoryLinks(categories),
  ...NAV_TAIL,
];
