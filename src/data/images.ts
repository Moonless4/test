/**
 * تصاویر پروژه (میزبانی‌شده محلی در /public/images).
 * منبع عکس‌ها: ویکی‌مدیا کامنز / ویکی‌پدیا با پروانه‌های آزاد — برای جایگزینی
 * با تصاویر واقعی محصولات کافی است فایل‌ها را در همان مسیرها عوض کنید.
 */
export const IMG: Record<string, string> = {
  // شهرهای ایران
  tehran: '/images/tehran.jpg',
  mashhad: '/images/mashhad.jpg',
  kish: '/images/kish.jpg',
  isfahan: '/images/isfahan.jpg',
  shiraz: '/images/shiraz.jpg',
  tabriz: '/images/tabriz.jpg',
  qeshm: '/images/qeshm.jpg',
  rasht: '/images/rasht.jpg',
  yazd: '/images/yazd.jpg',
  kerman: '/images/kerman.jpg',
  'shahr-e-kord': '/images/shahr-e-kord.jpg',
  'bandar-abbas': '/images/bandar-abbas.jpg',
  // شهرهای جهان
  istanbul: '/images/istanbul.jpg',
  dubai: '/images/dubai.jpg',
  antalya: '/images/antalya.jpg',
  paris: '/images/paris.jpg',
  tbilisi: '/images/tbilisi.jpg',
  moscow: '/images/moscow.jpg',
  'kuala-lumpur': '/images/kuala-lumpur.jpg',
  london: '/images/london.jpg',
  vienna: '/images/vienna.jpg',
  rome: '/images/rome.jpg',
  doha: '/images/doha.jpg',
  baku: '/images/baku.jpg',
  // اقامتگاه‌ها
  'hotel-1': '/images/hotel-1.jpg',
  'hotel-2': '/images/hotel-2.jpg',
  'hotel-3': '/images/hotel-3.jpg',
  'hotel-4': '/images/hotel-4.jpg',
  'hotel-5': '/images/hotel-5.jpg',
  'hotel-6': '/images/hotel-6.jpg',
  'hotel-7': '/images/hotel-7.jpg',
  'hotel-8': '/images/hotel-8.jpg',
  'hotel-9': '/images/hotel-9.jpg',
  'hotel-10': '/images/hotel-10.jpg',
  'hotel-11': '/images/hotel-11.jpg',
  'hotel-12': '/images/hotel-12.jpg',
  'hotel-13': '/images/hotel-13.jpg',
  'hotel-14': '/images/hotel-14.jpg',
  'hotel-15': '/images/hotel-15.jpg',
  'hotel-16': '/images/hotel-16.jpg',
  // محتوای مجله
  'story-1': '/images/story-1.jpg',
  'story-2': '/images/story-2.jpg',
  'story-3': '/images/story-3.jpg',
  'story-4': '/images/story-4.jpg',
  'story-5': '/images/story-5.jpg',
  'story-6': '/images/story-6.jpg',
  'story-7': '/images/story-7.jpg',
  'story-8': '/images/story-8.jpg',
};

export function img(key: string | undefined, fallback = '/images/tehran.jpg'): string {
  if (!key) return fallback;
  return IMG[key] ?? (key.startsWith('/') ? key : fallback);
}
