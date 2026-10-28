// Editable site chrome and page copy: everything the admin panel can change
// that is not a project, service or article. `hydrateSite` replaces these
// defaults with the saved document before the app renders (see main.jsx), so a
// component that imports `site` always reads what the owner saved.

export const siteDefaults = {
  hero: {
    badge1: 'پروژهٔ شاخص',
    badge2: 'مسکونی',
    title: 'برج آریا',
    authorName: 'آرش مهدوی',
    authorRole: 'معمار و مجری',
    authorImage: '/img/hero-architect.jpg',
    text: '۲۲ طبقه مسکونی در جردن؛ ۳۴٬۰۰۰ متر زیربنا، از فونداسیون تا تحویل کلید.',
    image: '/img/Group-4-1-1.png',
    ctaLabel: 'مشاهدهٔ پروژه',
    ctaHref: '/project/برج-آریا',
  },
  homeServices: [
    {
      title: 'طراحی نقشه و پروتوتایپ',
      subtitle: 'از تحلیل سایت تا نقشه‌های اجرایی',
      icon: 'luxina-iconbrush-fill',
      image: '/img/service-image1.png',
      slug: 'architecture-plans',
    },
    {
      title: 'ساخت و اجرای پروژه‌های لوکس',
      subtitle: 'یک تیم، از کانسپت تا تحویل کلید',
      icon: 'luxina-iconbuilding-3-fill',
      image: '/img/service-image2.png',
      slug: 'luxury-construction',
    },
    {
      title: 'بازسازی خانه های قدیمی',
      subtitle: 'هویت بنا می‌ماند، عملکرد به‌روز می‌شود',
      icon: 'luxina-iconbuilding-fill',
      image: '/img/service-image4.png',
      slug: 'old-house-renovation',
    },
    {
      title: 'طراحی داخلی و دکوراسیون',
      subtitle: 'چیدمان، متریال و نور در یک روایت',
      icon: 'luxina-iconpencil-ruler-2-fill',
      image: '/img/service-image2.png',
      slug: 'interior-design',
    },
  ],
  team: {
    intro: 'معماران، مهندسان و مدیران اجرایی؛ یک تیم با یک زبان مشترک.',
    image: '/img/team.png',
    members: [
      { name: 'آرش مهدوی', role: 'معمار ارشد', image: '/img/hero-architect.jpg' },
      { name: 'مهسا رحیمی', role: 'مدیر طراحی داخلی', image: '/img/faq-img.png' },
      { name: 'بابک نیک‌نام', role: 'مدیر اجرا', image: '/img/team.png' },
    ],
  },
  about: {
    intro:
      'آراتان یک استودیوی معماری و طراحی داخلی است؛ در طراحی داخلی، طراحی نقشه، بازسازی خانه‌های قدیمی و ساخت پروژه‌های مسکونی و تجاری.',
    body: [
      'کار از شناخت سبک زندگی کارفرما شروع می‌شود و با برنامهٔ شفاف، انتخاب متریال و نظارت مستمر تا تحویل کلید ادامه پیدا می‌کند. معمار، مهندس سازه و مدیر اجرا در یک تیم کار می‌کنند و تصمیم‌ها روی یک مدل مشترک گرفته می‌شود. معیار ما ساده است: فضایی که سال‌ها بعد هم درست به نظر برسد و درست کار کند.',
    ],
    stats: [
      { value: '۱۵+', label: 'سال تجربهٔ اجرایی' },
      { value: '۱۲۰+', label: 'پروژهٔ تحویل‌شده' },
      { value: '۹۵٪', label: 'رضایت کارفرمایان' },
    ],
  },
  contact: {
    phone: '021-123 4567',
    phoneHref: 'tel:+982112345678',
    email: 'info@aratan.ir',
    address: 'تهران، سعادت‌آباد، بلوار دریا، پلاک ۲۴، طبقه ۳',
    hours: 'شنبه تا پنجشنبه، ۹ تا ۱۸',
  },
  socials: [
    { label: 'تلگرام', handle: '@aratan.studio', href: 'https://t.me/aratan.studio', icon: 'luxina-icon-telegram-2-fill' },
    {
      label: 'اینستاگرام',
      handle: '@aratan.studio',
      href: 'https://instagram.com/aratan.studio',
      icon: 'luxina-icon-instagram-fill',
    },
  ],
  header: {
    ctaLabel: 'درخواست مشاوره',
    ctaPhone: '021-123 4567',
    ctaHref: '/consultation',
    menu: [
      { label: 'خانه', href: '/' },
      { label: 'پروژه‌ها', href: '/projects' },
      { label: 'مقالات', href: '/blog' },
      { label: 'دیگر صفحات', href: '#' },
    ],
  },
  footer: {
    about:
      'آراتان؛ استودیوی معماری و طراحی داخلی. از نقشه تا کلید، یک تیم مسئول کیفیت کار است و تصمیم‌ها روی یک مدل مشترک گرفته می‌شود.',
    licenses: [
      { image: '/img/org-1.png', label: 'مجوز ۱' },
      { image: '/img/org-2.png', label: 'مجوز ۲' },
      { image: '/img/org-3.png', label: 'مجوز ۳' },
    ],
  },
  clients: [
    { src: '/img/customer-1.png', square: 'hide-desktop hide-tablet hide-mobile' },
    { src: '/img/customer-2.png', square: '' },
    { src: '/img/customer-3.png', square: 'hide-mobile' },
    { src: '/img/customer-4.png', square: '' },
    { src: '/img/customer-5.png', square: 'hide-desktop hide-tablet hide-mobile' },
    { src: '/img/customer-6.png', square: 'hide-desktop' },
    { src: '/img/customer-7-1.png', square: 'hide-desktop hide-mobile' },
    { src: '/img/customer-8.png', square: 'hide-desktop' },
    { src: '/img/customer-9.png', square: 'hide-desktop hide-tablet hide-mobile' },
  ],
  faqs: [
    {
      question: 'آراتان چه پروژه‌هایی را می‌پذیرد؟',
      answer:
        'از طراحی داخلی یک آپارتمان تا ساخت ویلای لوکس، بازسازی خانهٔ قدیمی و تدوین نقشه‌های اجرایی. مقیاس پروژه تعیین‌کننده نیست؛ سطح دقت در اجرا تعیین‌کننده است.',
    },
    {
      question: 'پیش از شروع، مشاوره و برآورد هزینه انجام می‌شود؟',
      answer:
        'بله. در جلسهٔ اول نیاز، متراژ و بازهٔ بودجه را مرور می‌کنیم و پیش از قرارداد، برآورد شفاف زمان و هزینه را دریافت می‌کنید؛ بنابراین تصمیم بعدی روی اطلاعات روشن گرفته می‌شود.',
    },
    {
      question: 'طرح بر اساس سلیقهٔ من شکل می‌گیرد؟',
      answer:
        'طرح از سبک زندگی شما شروع می‌شود، نه از یک قالب آماده. معمار ما مسیر حرکت روزانه، نور و اولویت‌های شما را می‌بیند و طرح تا تأیید نهایی در اختیار شماست.',
    },
  ],
};

export let site = siteDefaults;

export function hydrateSite(next) {
  if (!next || typeof next !== 'object') return;
  site = { ...siteDefaults, ...next };
}
