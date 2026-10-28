// Editable site chrome and page copy: everything the admin panel can change
// that is not a project, service or article. `hydrateSite` replaces these
// defaults with the saved document before the app renders (see main.jsx), so a
// component that imports `site` always reads what the owner saved.

export const siteDefaults = {
  general: {
    studioName: 'آراتان',
    tagline: 'استودیوی معماری، طراحی داخلی و ساخت',
    logo: '/img/aratan-logo.png',
    logoLight: '/img/aratan-logo-light.png',
  },
  seo: {
    title: 'آراتان | استودیوی معماری و طراحی داخلی',
    description:
      'آراتان؛ استودیوی معماری، طراحی داخلی و ساخت. از نقشه تا تحویل کلید، با یک تیم و یک استاندارد اجرایی.',
    keywords: ['معماری', 'طراحی داخلی', 'ساخت لوکس', 'بازسازی', 'استودیوی معماری'],
    ogImage: '/img/Group-4-1-1.png',
  },
  // Homepage bands in display order. `enabled` hides a band without deleting
  // its content; the panel reorders this array.
  homeSections: [
    { id: 'hero', label: 'هیرو', enabled: true },
    { id: 'services', label: 'خدمات', enabled: true },
    { id: 'projects', label: 'پروژه‌ها', enabled: true },
    { id: 'timeline', label: 'تایم‌لاین', enabled: true },
    { id: 'promo', label: 'معرفی استودیو', enabled: true },
    { id: 'clients', label: 'همکاران', enabled: true },
    { id: 'team', label: 'تیم', enabled: true },
    { id: 'blog', label: 'مقالات', enabled: true },
    { id: 'faq', label: 'پرسش‌ها', enabled: true },
  ],
  // Band headings across the homepage and the shared team / FAQ blocks.
  homeHeadings: {
    servicesTitle: 'خدمات',
    servicesSubtitle: 'Services',
    projectsTitle: 'پـروژه هـــــا',
    projectsSubtitle: 'Projects',
    projectsCta: 'مشاهدهٔ همهٔ پروژه‌ها',
    timelineTitle: 'تایم لاین پــروژه',
    timelineSubtitle: 'Project timeline',
    clientsTitle: 'افتخارات همکاری',
    clientsSubtitle: 'Partnership honors',
    teamTitle: 'تیــــــــــم مــــــــــا',
    teamSubtitle: 'Our Team',
    teamCta: 'فرصت‌های همکاری',
    blogTitle: 'وبلاگ',
    blogSubtitle: 'Weblog',
    blogCta: 'همهٔ مقالات',
    faqTitle: 'پرسش‌های متداول',
    faqSubtitle: 'Questions & answers',
  },
  timeline: {
    steps: [
      { lead: 'مشاوره', rest: 'و شناخت نیاز', image: '/img/timeline-image1.png' },
      { lead: 'طراحی', rest: 'کانسپت و پلان', image: '/img/timeline-image2.png' },
      { lead: 'برآورد', rest: 'زمان و هزینه', image: '/img/timeline-image3.png' },
      { lead: 'اجرا', rest: 'با نظارت مستمر', image: '/img/timeline-image4.png' },
      { lead: 'تحویل', rest: 'کلید و مستندات', image: '/img/timeline-image5.png' },
    ],
  },
  promo: {
    catalogTitle: 'کاتـالـــوگ پـــروژه هـــا',
    catalogSubtitle: 'Projects catalogue',
    catalogImage: '/img/catalog-image.png',
    catalogPrimaryLabel: 'مشاهده',
    catalogPrimaryHref: '/projects',
    catalogSecondaryLabel: 'دانلود',
    catalogSecondaryHref: 'https://mihanmdf.ir/wp-content/uploads/2023/12/Pooya_catalog_mihanmdf.pdf',
    consultTitle: 'درخواست مشاوره',
    consultSubtitle: 'Consultation request',
    consultImage: '/img/consult-image.png',
    consultPrimaryLabel: 'شروع مشاوره',
    consultPrimaryHref: '/consultation',
    consultSecondaryLabel: 'تماس با ما',
    consultSecondaryHref: '/contact',
  },
  faqBlock: {
    image: '/img/faq-img.png',
  },
  pages: {
    about: {
      title: 'درباره ما',
      subtitle: 'About us',
      icon: 'luxina-icon-building-line',
      ctaPrimaryLabel: 'دریافت مشاوره',
      ctaPrimaryHref: '/consultation',
      ctaSecondaryLabel: 'مشاهدهٔ پروژه‌ها',
      ctaSecondaryHref: '/projects',
      seoTitle: 'دربارهٔ آراتان | استودیوی معماری و طراحی داخلی',
      seoDescription:
        'آراتان یک استودیوی معماری و طراحی داخلی است؛ تیمی از معماران، مهندسان و مدیران اجرا با یک استاندارد مشترک.',
    },
    contact: {
      title: 'تماس با ما',
      subtitle: 'Contact us',
      icon: 'luxina-icon-question-answer-fill',
      formMessagePlaceholder: 'دربارهٔ پروژه یا فضای خود بنویسید',
      submitLabel: 'ارسال پیام',
      formNote: 'پیام شما ثبت شد. در اولین فرصت کاری پاسخ می‌دهیم.',
      seoTitle: 'تماس با آراتان',
      seoDescription: 'نشانی، تلفن، ایمیل و فرم تماس استودیوی معماری آراتان.',
    },
    projects: {
      title: 'پـروژه هـــــا',
      subtitle: 'Projects',
      icon: 'luxina-iconpencil-ruler-2-fill',
      intro: '',
      seoTitle: 'پروژه‌های آراتان',
      seoDescription: 'پروژه‌های مسکونی، تجاری و بازسازی استودیوی آراتان.',
    },
    blog: {
      title: 'وبلاگ',
      subtitle: 'Weblog',
      icon: 'luxina-iconbook-fill',
      intro: '',
      seoTitle: 'مقالات معماری و طراحی داخلی | آراتان',
      seoDescription: 'یادداشت‌ها و مقالات استودیوی آراتان دربارهٔ معماری، طراحی داخلی و اجرا.',
    },
    consultation: {
      title: 'درخواست مشاوره',
      subtitle: 'Consultation request',
      icon: 'luxina-icon-customer-service-2-line',
      messagePlaceholder: 'دربارهٔ پروژه، متراژ و زمان‌بندی مورد نظرتان بنویسید',
      submitLabel: 'ثبت درخواست',
      formNote: 'درخواست شما ثبت شد؛ برای هماهنگی جلسه تماس می‌گیریم.',
      seoTitle: 'درخواست مشاوره | آراتان',
      seoDescription: 'برای شروع پروژه، درخواست مشاورهٔ معماری و طراحی داخلی ثبت کنید.',
    },
    cooperation: {
      title: 'فرصت همکاری',
      subtitle: 'Cooperation',
      icon: 'luxina-icon-team-fill',
      messagePlaceholder: 'تجربه و زمینهٔ همکاری خود را بنویسید',
      submitLabel: 'ارسال درخواست',
      formNote: 'درخواست همکاری ثبت شد؛ در صورت تطابق با فرصت‌های موجود تماس می‌گیریم.',
      seoTitle: 'فرصت همکاری | آراتان',
      seoDescription: 'همکاری با استودیوی معماری آراتان در پروژه‌های طراحی و اجرا.',
    },
  },
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
      {
        label: 'خانه',
        href: '/',
        enabled: true,
        icon: 'luxina-icon-home-5',
        children: [],
      },
      {
        label: 'پروژه‌ها',
        href: '/projects',
        enabled: true,
        icon: 'luxina-icon-pencil-ruler-2',
        children: [
          { label: 'برج آریا', href: '/project/برج-آریا', enabled: true },
          { label: 'مجتمع مسکونی الوند', href: '/project/مجتمع-الوند', enabled: true },
          { label: 'ویلای لواسان', href: '/project/ویلای-لواسان', enabled: true },
          { label: 'خانهٔ عودلاجان', href: '/project/خانه-عودلاجان', enabled: true },
          { label: 'ساختمان اداری ونک', href: '/project/ساختمان-ونک', enabled: true },
          { label: 'مجتمع باغ‌ویلای شمال', href: '/project/باغ-ویلای-شمال', enabled: true },
          { label: 'آپارتمان الهیه', href: '/project/آپارتمان-الهیه', enabled: true },
          { label: 'برج نیاوران', href: '/project/برج-نیاوران', enabled: true },
          { label: 'خانهٔ حیاط‌دار کاشان', href: '/project/خانه-کاشان', enabled: true },
          { label: 'مجتمع تجاری سعادت‌آباد', href: '/project/مجتمع-سعادت', enabled: true },
        ],
      },
      {
        label: 'مقالات',
        href: '/blog',
        enabled: true,
        icon: 'luxina-icon-book',
        children: [
          { label: 'بازطراحی خانهٔ قدیمی', href: '/blog/redesigning-old-house', enabled: true },
          { label: 'طراحی داخلی خوب از کجا شروع می‌شود؟', href: '/blog/interior-design-starts-here', enabled: true },
          { label: 'چرا بعضی فضاها لوکس به نظر می‌رسند؟', href: '/blog/luxury-in-design', enabled: true },
          { label: 'قبل از شروع طراحی خانه', href: '/blog/before-you-start-designing', enabled: true },
        ],
      },
      {
        label: 'دیگر صفحات',
        href: '#',
        enabled: true,
        icon: 'luxina-icon-building',
        children: [
          { label: 'تماس با ما', href: '/contact', enabled: true },
          { label: 'درباره ما', href: '/about', enabled: true },
          { label: 'فرصت همکاری', href: '/cooperation', enabled: true },
          { label: 'درخواست مشاوره', href: '/consultation', enabled: true },
        ],
      },
    ],
  },
  footer: {
    about:
      'آراتان؛ استودیوی معماری و طراحی داخلی. از نقشه تا کلید، یک تیم مسئول کیفیت کار است و تصمیم‌ها روی یک مدل مشترک گرفته می‌شود.',
    quickTitle: 'دسترسی سریع',
    quickSubtitle: 'Quick access',
    servicesTitle: 'خدمات',
    servicesSubtitle: 'Services',
    contactTitle: 'دیگر راه‌های ارتباطی',
    contactSubtitle: 'Other contact Methods',
    licensesTitle: 'مجوزها',
    licensesSubtitle: 'Licenses',
    socialTitle: 'شبکه های اجتماعی',
    socialSubtitle: 'Social media',
    quickLinks: [
      { label: 'خانه', href: '/' },
      { label: 'پروژه‌ها', href: '/projects' },
      { label: 'مقالات', href: '/blog' },
      { label: 'تماس با ما', href: '/contact' },
      { label: 'درباره ما', href: '/about' },
    ],
    serviceLinks: [
      { label: 'طراحی نقشه', href: '/services/architecture-plans' },
      { label: 'ساخت و اجرای لوکس', href: '/services/luxury-construction' },
      { label: 'بازسازی خانه‌های قدیمی', href: '/services/old-house-renovation' },
      { label: 'طراحی داخلی', href: '/services/interior-design' },
    ],
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

// A saved document from an earlier version may lack the newer keys. Merge it
// over the defaults so a new field appears with its default value while every
// saved value still wins; arrays of objects merge item by item (that is how the
// header menu keeps its submenus after the schema grew).
function mergeDefaults(base, saved) {
  if (Array.isArray(base)) {
    if (!Array.isArray(saved)) return base;
    if (saved.length === base.length && base.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
      return saved.map((item, index) => mergeDefaults(base[index], item));
    }
    return saved;
  }
  if (base && typeof base === 'object') {
    if (!saved || typeof saved !== 'object') return base;
    const merged = { ...base };
    Object.keys(saved).forEach((key) => {
      merged[key] = key in base ? mergeDefaults(base[key], saved[key]) : saved[key];
    });
    return merged;
  }
  return saved === undefined ? base : saved;
}

export function hydrateSite(next) {
  if (!next || typeof next !== 'object') return;
  site = mergeDefaults(siteDefaults, next);
}
