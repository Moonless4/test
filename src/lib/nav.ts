import type { CategoryId } from './types';

/** `category` marks the links that open a mega menu on hover. */
export type NavLink = { label: string; to: string; category?: CategoryId };

export const NAV_LINKS: NavLink[] = [
  { label: 'خانه', to: '/' },
  { label: 'مردانه', to: '/shop/men', category: 'men' },
  { label: 'زنانه', to: '/shop/women', category: 'women' },
  { label: 'کفش', to: '/shop/shoes', category: 'shoes' },
  { label: 'اکسسوری', to: '/shop/accessories', category: 'accessories' },
  { label: 'جدیدترین‌ها', to: '/shop?sort=newest' },
  { label: 'وبلاگ', to: '/blog' },
];
