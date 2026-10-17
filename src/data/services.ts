import type { ServiceItem } from '@/types';

/** سرویس‌های اصلی پلتفرم — هم در تب‌های جستجو و هم در بخش «خدمات سفر» استفاده می‌شود */
export const SERVICES: ServiceItem[] = [
  {
    key: 'flight',
    title: 'بلیط هواپیما',
    description: 'مقایسه قیمت تمام ایرلاین‌های داخلی و خارجی',
    href: '/flights',
    icon: 'plane',
  },
  {
    key: 'hotel',
    title: 'هتل',
    description: 'رزرو هتل‌های ایران و جهان با تخفیف ویژه',
    href: '/hotels',
    icon: 'hotel',
  },
  {
    key: 'train',
    title: 'قطار',
    description: 'بلیط قطارهای سریع‌السیر و لوکس',
    href: '/trains',
    icon: 'train',
  },
  {
    key: 'bus',
    title: 'اتوبوس',
    description: 'بلیط اتوبوس‌های VIP سراسر کشور',
    href: '/buses',
    icon: 'bus',
  },
  {
    key: 'villa',
    title: 'ویلا و اقامتگاه',
    description: 'اقامتگاه‌های بومی، ویلا و آپارتمان',
    href: '/stays',
    icon: 'villa',
  },
  {
    key: 'tour',
    title: 'تور',
    description: 'تورهای داخلی و خارجی با راهنمای فارسی',
    href: '/tours',
    icon: 'compass',
  },
  {
    key: 'visa',
    title: 'ویزا',
    description: 'دریافت ویزای توریستی و تحصیلی',
    href: '/services/visa',
    icon: 'passport',
    badge: 'جدید',
  },
  {
    key: 'insurance',
    title: 'بیمه مسافرتی',
    description: 'صدور آنی بیمه‌نامه در چند دقیقه',
    href: '/services/insurance',
    icon: 'shield',
  },
  {
    key: 'esim',
    title: 'eSIM',
    description: 'اینترنت بین‌المللی با نصب آسان',
    href: '/services/esim',
    icon: 'sim',
  },
  {
    key: 'cip',
    title: 'CIP فرودگاهی',
    description: 'خدمات تشریفات اختصاصی فرودگاه',
    href: '/services/cip',
    icon: 'vip',
  },
  {
    key: 'city-tour',
    title: 'گشت شهری',
    description: 'تورهای یک‌روزه و گشت‌های شهری',
    href: '/services/city-tour',
    icon: 'map',
  },
];

export const SERVICE_TABS: Array<{ key: string; title: string; icon: string; short?: string }> = [
  { key: 'flight', title: 'پرواز', icon: 'plane' },
  { key: 'hotel', title: 'هتل', icon: 'hotel' },
  { key: 'train', title: 'قطار', icon: 'train' },
  { key: 'bus', title: 'اتوبوس', icon: 'bus' },
  { key: 'tour', title: 'تور', icon: 'compass' },
  { key: 'villa', title: 'ویلا و اقامتگاه', short: 'ویلا', icon: 'villa' },
  { key: 'visa', title: 'ویزا', icon: 'passport' },
  { key: 'insurance', title: 'بیمه مسافرتی', short: 'بیمه', icon: 'shield' },
  { key: 'more', title: 'سایر خدمات', short: 'بیشتر', icon: 'grid' },
];

export const MORE_SERVICES: ServiceItem[] = [
  {
    key: 'esim',
    title: 'eSIM بین‌المللی',
    description: 'اینترنت پرسرعت در ۱۹۰ کشور',
    href: '/services/esim',
    icon: 'sim',
  },
  {
    key: 'cip',
    title: 'تشریفات CIP',
    description: 'عبور سریع از فرودگاه',
    href: '/services/cip',
    icon: 'vip',
  },
  {
    key: 'city-tour',
    title: 'گشت شهری',
    description: 'تورهای یک‌روزه با راهنمای محلی',
    href: '/services/city-tour',
    icon: 'map',
  },
  {
    key: 'transfer',
    title: 'ترانسفر فرودگاهی',
    description: 'سرویس اختصاصی درب فرودگاه',
    href: '/services/transfer',
    icon: 'car',
  },
  {
    key: 'car',
    title: 'اجاره خودرو',
    description: 'خودروهای اقتصادی تا لوکس',
    href: '/services/car',
    icon: 'car',
  },
  {
    key: 'money',
    title: 'خرید ارز',
    description: 'تحویل ارز در محل و فرودگاه',
    href: '/services/money',
    icon: 'wallet',
  },
];
