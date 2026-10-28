import {
  categories,
  footerColumns,
  heroSlides,
  infoPages,
  menuFilters,
  navLinks,
  posts,
  products,
  promoBanners,
} from '../data/content.js';

// Everything the admin panel can edit. The public site renders these values
// through <SiteProvider>, and the admin stores its changes on top of them.
export const defaultContent = {
  identity: {
    prefix: 'رستوران',
    siteName: 'آترین',
    tagline: 'رستوران آترین؛ طعم‌های تازه، دستورهای ویژه و لحظه‌هایی که به یاد می‌مانند.',
    footerAbout:
      'رستوران آترین؛ از سال ۱۳۹۲ با عشق به طعم و مهمان‌نوازی، میزبان لحظه‌های خوب شما هستیم.',
    phone: '۰۲۱-۸۸۷۷۶۶۵۵',
    phoneHref: '+982188776655',
    email: 'info@atrin-restaurant.ir',
    address: 'تهران، خیابان ولیعصر، نبش کوچه آترین، پلاک ۱۲',
    hours: 'هر روز از ۱۲:۰۰ تا ۲۳:۳۰',
    copyright: '© ۱۴۰۴ رستوران آترین. تمامی حقوق محفوظ است.',
  },
  discountCodes: [],
  navLinks,
  megaMenu: {
    eyebrow: 'دسته‌بندی غذاها',
    promo: {
      image: '/assets/megamenu.webp',
      kicker: 'پیشنهاد امروز',
      title: 'استیک گریل دو نفره',
      cta: 'مشاهده منو',
      href: '/menu',
    },
  },
  categories,
  menuFilters,
  products,
  heroSlides,
  promoBanners,
  posts,
  footer: {
    columns: footerColumns.map((column) => ({ ...column })),
    socials: [
      { id: 'instagram', label: 'اینستاگرام', icon: 'instagram', href: '#' },
      { id: 'telegram', label: 'تلگرام', icon: 'telegram', href: '#' },
      { id: 'whatsapp', label: 'واتساپ', icon: 'whatsapp', href: '#' },
      { id: 'youtube', label: 'یوتیوب', icon: 'youtube', href: '#' },
    ],
    badges: [
      { id: 'enamad', icon: 'shield', title: 'نماد اعتماد الکترونیکی', subtitle: 'پرداخت امن و مطمئن' },
      { id: 'union', icon: 'fork', title: 'اتحادیه رستوران‌داران', subtitle: 'عضو رسمی صنف' },
      { id: 'delivery', icon: 'truck', title: 'ارسال تضمینی', subtitle: 'گرم و تازه درِ خانه' },
      { id: 'quality', icon: 'check', title: 'ضمانت کیفیت', subtitle: 'رضایت ۱۰۰٪ مهمانان' },
    ],
    legalLinks: [
      { label: 'پیگیری سفارش', href: '/p/tracking' },
      { label: 'حریم خصوصی', href: '/p/privacy' },
      { label: 'شرایط و ضوابط', href: '/p/terms' },
    ],
  },
  pages: infoPages,
};
