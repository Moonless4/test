export const brand = {
  name: 'لوکسینا',
  tagline: 'ساخت و انبوه‌سازی خانه‌های لوکس',
  consultationLabel: 'مشاوره',
  phone: '۰۲۱-۱۲۳۴۵۶۷',
} as const;

export type NavItem = {
  label: string;
  icon: 'home' | 'folder' | 'article' | 'pages';
  items?: { label: string; href: string }[];
};

export const navItems: NavItem[] = [
  { label: 'خانه', icon: 'home' },
  {
    label: 'پروژه‌ها',
    icon: 'folder',
    items: [
      { label: 'پروژه‌های مسکونی', href: '#projects-residential' },
      { label: 'پروژه‌های اداری و تجاری', href: '#projects-commercial' },
      { label: 'پروژه‌های در حال اجرا', href: '#projects-ongoing' },
    ],
  },
  {
    label: 'مقالات',
    icon: 'article',
    items: [
      { label: 'اخبار و رویدادها', href: '#articles-news' },
      { label: 'دانش معماری', href: '#articles-knowledge' },
      { label: 'راهنمای دکوراسیون داخلی', href: '#articles-interior' },
    ],
  },
  {
    label: 'دیگر صفحات',
    icon: 'pages',
    items: [
      { label: 'درباره لوکسینا', href: '#about' },
      { label: 'خدمات ما', href: '#services' },
      { label: 'تماس با ما', href: '#contact' },
    ],
  },
];

export const hero = {
  badges: ['ساخت و ساز', 'انبوه‌سازی'],
  title: 'پروژه برج پارس جردن',
  person: {
    name: 'صمد سلیمان زاده',
    role: 'طراح و مجری ساخت',
    initial: 'ص',
  },
  description:
    'برج لوکس اداری تجاری پارس با مساحت ۹۰۵ متر، زیربنای ۱۷۰۰۰ متر، ۲۵ طبقه، ۲۰ طبقه روی زمین و ۵ طبقه زیر زمین',
  cta: 'درباره این پروژه',
  image: {
    src: '/images/hero-architecture.jpg',
    alt: 'نمای معماری پروژه برج پارس جردن',
  },
} as const;
