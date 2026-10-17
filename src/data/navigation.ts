export interface NavItem {
  label: string;
  href: string;
  /** منوی کشویی این آیتم (فعلاً فقط «سایر خدمات») */
  menu?: 'more';
}

/** آیتم‌های ناوبری اصلی — مشترک بین هدر دسکتاپ و منوی موبایل */
export const NAV_ITEMS: NavItem[] = [
  { label: 'پرواز', href: '/flights' },
  { label: 'هتل', href: '/hotels' },
  { label: 'قطار', href: '/trains' },
  { label: 'تور', href: '/tours' },
  { label: 'سایر خدمات', href: '/services', menu: 'more' },
];
