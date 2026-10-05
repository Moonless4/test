import type { ServiceItem, ValueItem } from '@/types'

export const company = {
  name: 'املاک افق',
  tagline: 'خانه‌ها و سرمایه‌گذاری‌های استثنایی',
  phone: '۰۹۱۲۳۴۵۶۷۸۹',
  phoneHref: 'tel:+989123456789',
  email: 'info@ofogh.ir',
  address: {
    line1: 'خیابان فرشته، نبش کوچه بوعلی، پلاک ۱۴',
    line2: 'تهران، کدپستی ۱۹۶۸۷',
  },
  hours: 'شنبه تا پنجشنبه، ۹:۰۰ تا ۱۸:۰۰',
  socials: [
    { label: 'اینستاگرام', network: 'instagram', href: 'https://instagram.com' },
    { label: 'لینکدین', network: 'linkedin', href: 'https://linkedin.com' },
    { label: 'فیسبوک', network: 'facebook', href: 'https://facebook.com' },
  ],
}

export const navLinks = [
  { label: 'خانه', to: '/' },
  { label: 'املاک', to: '/properties' },
  { label: 'درباره ما', to: '/about' },
  { label: 'خدمات', to: '/services' },
  { label: 'تیم ما', to: '/team' },
  { label: 'تماس', to: '/contact' },
]

export const services: ServiceItem[] = [
  {
    title: 'فروش خانه‌های لوکس',
    description:
      'نمایندگی محرمانه برای خانه‌های شاخص معماری؛ از بازدیدهای خصوصی تا امضای قرارداد.',
  },
  {
    title: 'سرمایه‌گذاری ملکی',
    description:
      'راهبرد خرید مبتنی بر بازدهی، برای خریدارانی که پرتفویی از املاک ممتاز می‌سازند.',
  },
  {
    title: 'بازاریابی املاک',
    description:
      'عکاسی ادیتوریال، فیلم و کمپین‌های هدفمند که هر خانه را در برابر خریدار درست قرار می‌دهد.',
  },
  {
    title: 'مشاورهٔ املاک',
    description:
      'تحلیل بازار، راهنمایی در ارزیابی و پشتیبانی مذاکره برای معاملات پیچیده.',
  },
  {
    title: 'ارزیابی ملک',
    description:
      'کارشناسی دقیق بر پایهٔ معاملات مشابه، کیفیت ساخت و ارزش بلندمدت موقعیت.',
  },
  {
    title: 'خدمات جابه‌جایی',
    description:
      'پشتیبانی کامل برای مشتریان داخلی و خارجی؛ از انتخاب اولیه تا استقرار نهایی.',
  },
]

export const values: ValueItem[] = [
  {
    title: 'گزینشی، نه فهرستی',
    description:
      'پرتفویی آگاهانه کوچک را نمایندگی می‌کنیم تا هر خانه توجهی را بگیرد که معماری‌اش سزاوار آن است.',
  },
  {
    title: 'محرمانه، به‌صورت پیش‌فرض',
    description:
      'معرفی‌های خارج از فهرست عمومی، مذاکرهٔ محرمانه و حفظ رازداری در همهٔ مراحل.',
  },
  {
    title: 'هوش سرمایه‌گذاری',
    description:
      'بیست سال دادهٔ معاملات و شناخت محلی، پشت هر توصیه‌ای که ارائه می‌دهیم.',
  },
  {
    title: 'یک تیم، تا پایان کار',
    description:
      'مشاوره، بازاریابی، هماهنگی حقوقی و جابه‌جایی، همه بر عهدهٔ یک مشاور پاسخگو.',
  },
]

export const stats = [
  { value: '۱٬۴۰۰ میلیارد', label: 'ارزش معاملات (تومان)' },
  { value: '+۶۲۰', label: 'خانهٔ واگذارشده' },
  { value: '۲۰', label: 'سال تجربه' },
  { value: '٪۹۶', label: 'مشتریان تکراری' },
]

export const heroImageId = 'photo-1600585154340-be6161a56a0c'
export const aboutImageIds = {
  main: 'photo-1600566753190-17f0baa2a6c3',
  secondary: 'photo-1600585154526-990dced4db0d',
}
export const servicesImageId = 'photo-1600573472550-8090b5e0745e'
