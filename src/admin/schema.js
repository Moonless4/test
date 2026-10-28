// The admin panel is generated from these definitions. Each entry declares
// where its data lives, what the editor shows and how the list is labelled, so
// the panel only ever edits real fields of the saved document.
//
// Field types: text | textarea | richtext | number | switch | select | image |
// url | lines | pairs | list | blocks | menu | order | deep

const f = (path, label, type = 'text', extra = {}) => ({ path, label, type, ...extra });

const seoFields = (prefix = '') => [
  f(`${prefix}seoTitle`, 'عنوان SEO', 'text'),
  f(`${prefix}seoDescription`, 'توضیح متا', 'textarea'),
];

const pageContent = (id) => `settings.pages.${id}`;

export const HOME_LAYOUT_OPTIONS = [
  ['hero', 'هیرو'],
  ['services', 'خدمات'],
  ['projects', 'پروژه‌ها'],
  ['timeline', 'تایم‌لاین'],
  ['promo', 'معرفی استودیو'],
  ['clients', 'همکاران'],
  ['team', 'تیم'],
  ['blog', 'مقالات'],
  ['faq', 'پرسش‌های متداول'],
];

const homeServicesFields = [
  f('title', 'عنوان', 'text'),
  f('subtitle', 'زیرعنوان', 'text'),
  f('image', 'تصویر', 'image'),
  f('icon', 'کلاس آیکن', 'text', { hint: 'luxina-iconbrush-fill' }),
  f('slug', 'لینک خدمت', 'text', { hint: '/services/architecture-plans' }),
];

const projectTabs = [
  {
    id: 'general',
    label: 'عمومی',
    fields: [
      f('title', 'نام پروژه'),
      f('slug', 'نشانی صفحه', 'text', { hint: 'برج-آریا' }),
      f('image', 'تصویر اصلی', 'image'),
      f('status', 'وضعیت اجرا'),
      f('statusColor', 'رنگ وضعیت', 'text', { hint: '#ffb22c' }),
      f('featured', 'پروژهٔ شاخص در هیرو', 'switch'),
      f('visible', 'نمایش در سایت', 'switch', { default: true }),
    ],
  },
  {
    id: 'description',
    label: 'توضیحات',
    fields: [
      f('heroText', 'توضیح کوتاه کارت', 'textarea'),
      f('details.lead', 'خلاصهٔ صفحهٔ پروژه', 'textarea'),
      f('details.body', 'معرفی پروژه (هر خط یک پاراگراف)', 'lines'),
      f('details.highlights', 'ویژگی‌های شاخص', 'lines'),
    ],
  },
  {
    id: 'images',
    label: 'تصاویر',
    fields: [f('details.gallery', 'گالری تصاویر', 'images')],
  },
  {
    id: 'details',
    label: 'مشخصات پروژه',
    fields: [
      f('details.category', 'دسته'),
      f('details.location', 'موقعیت'),
      f('details.progress', 'پیشرفت اجرا (٪)', 'number'),
      f('specs', 'مشخصات روی کارت', 'pairs'),
      f('details.facts', 'مشخصات کامل', 'pairs'),
      f('details.services', 'خدمات مرتبط (نشانی خدمت)', 'lines'),
    ],
  },
  {
    id: 'seo',
    label: 'SEO',
    fields: [
      f('seoTitle', 'عنوان SEO'),
      f('seoDescription', 'توضیح متا', 'textarea'),
      f('socialImage', 'تصویر شبکه‌های اجتماعی', 'image'),
    ],
  },
];

const serviceTabs = [
  {
    id: 'general',
    label: 'عمومی',
    fields: [
      f('title', 'عنوان خدمت'),
      f('slug', 'نشانی صفحه', 'text', { hint: 'architecture-plans' }),
      f('subtitle', 'زیرعنوان انگلیسی'),
      f('icon', 'کلاس آیکن'),
      f('visible', 'نمایش در سایت', 'switch', { default: true }),
    ],
  },
  {
    id: 'content',
    label: 'محتوا',
    fields: [f('intro', 'معرفی', 'textarea'), f('body', 'متن (هر خط یک پاراگراف)', 'lines'), f('points', 'ویژگی‌ها و خدمات', 'lines')],
  },
  {
    id: 'seo',
    label: 'SEO',
    fields: [f('seoTitle', 'عنوان SEO'), f('seoDescription', 'توضیح متا', 'textarea')],
  },
];

const articleTabs = [
  {
    id: 'general',
    label: 'عمومی',
    fields: [
      f('title', 'عنوان مقاله'),
      f('cardTitle', 'عنوان روی کارت'),
      f('slug', 'نشانی صفحه'),
      f('category', 'دسته'),
      f('image', 'تصویر شاخص', 'image'),
      f('imageAlt', 'توضیح تصویر'),
      f('dateLabel', 'تاریخ نمایشی'),
      f('isoDate', 'تاریخ استاندارد', 'text', { hint: '2026-09-03' }),
      f('readingTime', 'زمان مطالعه'),
      f('published', 'منتشر شده', 'switch', { default: true }),
    ],
  },
  {
    id: 'content',
    label: 'متن مقاله',
    fields: [
      f('excerpt', 'خلاصه', 'textarea'),
      f('body', 'متن مقاله', 'blocks'),
      f('related', 'مقالات مرتبط (نشانی)', 'lines'),
    ],
  },
  {
    id: 'seo',
    label: 'SEO',
    fields: [f('seo.title', 'عنوان SEO'), f('seo.description', 'توضیح متا', 'textarea'), f('seo.keywords', 'کلیدواژه‌ها', 'lines')],
  },
];

export const PAGES = [
  {
    id: 'home',
    view: 'page',
    label: 'صفحهٔ اصلی',
    route: '/',
    path: 'settings',
    description: 'هیرو، خدمات، ترتیب بخش‌ها و سئوی صفحهٔ اصلی',
    tabs: [
      {
        id: 'hero',
        label: 'هیرو',
        path: 'settings.hero',
        fields: [
          f('badge1', 'برچسب اول'),
          f('badge2', 'برچسب دوم'),
          f('title', 'عنوان اصلی'),
          f('text', 'متن زیر عنوان', 'textarea'),
          f('authorName', 'نام معمار'),
          f('authorRole', 'عنوان معمار'),
          f('authorImage', 'تصویر معمار', 'image'),
          f('image', 'تصویر هیرو', 'image'),
          f('ctaLabel', 'متن دکمه'),
          f('ctaHref', 'لینک دکمه'),
        ],
      },
      {
        id: 'services',
        label: 'خدمات',
        path: 'settings.homeServices',
        list: true,
        itemLabel: 'title',
        itemFields: homeServicesFields,
      },
      {
        id: 'layout',
        label: 'ترتیب بخش‌ها',
        path: 'settings.homeSections',
        order: true,
      },
      {
        id: 'about',
        label: 'معرفی',
        path: 'settings.about',
        fields: [
          f('intro', 'جملهٔ معرفی', 'textarea'),
          f('body', 'متن معرفی (هر خط یک پاراگراف)', 'lines'),
        ],
      },
      {
        id: 'headings',
        label: 'عناوین بخش‌ها',
        path: 'settings.homeHeadings',
        fields: [
          f('servicesTitle', 'عنوان خدمات'),
          f('servicesSubtitle', 'زیرعنوان خدمات'),
          f('projectsTitle', 'عنوان پروژه‌ها'),
          f('projectsSubtitle', 'زیرعنوان پروژه‌ها'),
          f('projectsCta', 'دکمهٔ پروژه‌ها'),
          f('timelineTitle', 'عنوان تایم‌لاین'),
          f('timelineSubtitle', 'زیرعنوان تایم‌لاین'),
          f('clientsTitle', 'عنوان همکاران'),
          f('clientsSubtitle', 'زیرعنوان همکاران'),
          f('teamTitle', 'عنوان تیم'),
          f('teamSubtitle', 'زیرعنوان تیم'),
          f('teamCta', 'دکمهٔ تیم'),
          f('blogTitle', 'عنوان وبلاگ'),
          f('blogSubtitle', 'زیرعنوان وبلاگ'),
          f('blogCta', 'دکمهٔ وبلاگ'),
          f('faqTitle', 'عنوان پرسش‌ها'),
          f('faqSubtitle', 'زیرعنوان پرسش‌ها'),
        ],
      },
      {
        id: 'timeline',
        label: 'تایم‌لاین',
        path: 'settings.timeline',
        fields: [
          f('steps', 'مراحل', 'list', {
            itemLabel: 'lead',
            itemFields: [
              f('lead', 'عنوان مرحله'),
              f('rest', 'ادامهٔ عنوان'),
              f('image', 'تصویر', 'image'),
            ],
          }),
        ],
      },
      {
        id: 'promo',
        label: 'کارت‌های دعوت',
        path: 'settings.promo',
        fields: [
          f('catalogTitle', 'عنوان کاتالوگ'),
          f('catalogSubtitle', 'زیرعنوان کاتالوگ'),
          f('catalogImage', 'تصویر کاتالوگ', 'image'),
          f('catalogPrimaryLabel', 'دکمهٔ اول کاتالوگ'),
          f('catalogPrimaryHref', 'لینک دکمهٔ اول'),
          f('catalogSecondaryLabel', 'دکمهٔ دوم کاتالوگ'),
          f('catalogSecondaryHref', 'لینک دکمهٔ دوم'),
          f('consultTitle', 'عنوان مشاوره'),
          f('consultSubtitle', 'زیرعنوان مشاوره'),
          f('consultImage', 'تصویر مشاوره', 'image'),
          f('consultPrimaryLabel', 'دکمهٔ اول مشاوره'),
          f('consultPrimaryHref', 'لینک دکمهٔ اول'),
          f('consultSecondaryLabel', 'دکمهٔ دوم مشاوره'),
          f('consultSecondaryHref', 'لینک دکمهٔ دوم'),
        ],
      },
      {
        id: 'faq-block',
        label: 'تصویر پرسش‌ها',
        path: 'settings.faqBlock',
        fields: [f('image', 'تصویر کنار پرسش‌ها', 'image')],
      },
      {
        id: 'seo',
        label: 'SEO',
        path: 'settings.seo',
        fields: [
          f('title', 'عنوان صفحه'),
          f('description', 'توضیح متا', 'textarea'),
          f('keywords', 'کلیدواژه‌ها', 'lines'),
          f('ogImage', 'تصویر اشتراک‌گذاری', 'image'),
        ],
      },
    ],
  },
  {
    id: 'about',
    view: 'page',
    label: 'درباره ما',
    route: '/about',
    path: 'settings',
    description: 'معرفی، تاریخ، آمار و دکمه‌های صفحه',
    tabs: [
      {
        id: 'copy',
        label: 'عنوان صفحه',
        path: pageContent('about'),
        fields: [
          f('title', 'عنوان صفحه'),
          f('subtitle', 'زیرعنوان'),
          f('icon', 'کلاس آیکن'),
          f('ctaPrimaryLabel', 'دکمهٔ اول'),
          f('ctaPrimaryHref', 'لینک دکمهٔ اول'),
          f('ctaSecondaryLabel', 'دکمهٔ دوم'),
          f('ctaSecondaryHref', 'لینک دکمهٔ دوم'),
        ],
      },
      {
        id: 'story',
        label: 'متن و آمار',
        path: 'settings.about',
        fields: [
          f('intro', 'جملهٔ معرفی', 'textarea'),
          f('body', 'متن صفحه (هر خط یک پاراگراف)', 'lines'),
          f('stats', 'آمار', 'list', {
            itemFields: [f('value', 'عدد'), f('label', 'عنوان')],
          }),
        ],
      },
      { id: 'seo', label: 'SEO', path: pageContent('about'), fields: seoFields() },
    ],
  },
  {
    id: 'contact',
    view: 'page',
    label: 'تماس با ما',
    route: '/contact',
    path: 'settings',
    description: 'اطلاعات تماس، شبکه‌های اجتماعی و فرم',
    tabs: [
      {
        id: 'copy',
        label: 'عنوان صفحه',
        path: pageContent('contact'),
        fields: [
          f('title', 'عنوان صفحه'),
          f('subtitle', 'زیرعنوان'),
          f('icon', 'کلاس آیکن'),
          f('formMessagePlaceholder', 'راهنمای پیام'),
          f('submitLabel', 'متن دکمهٔ ارسال'),
          f('formNote', 'پیام پس از ارسال', 'textarea'),
        ],
      },
      {
        id: 'info',
        label: 'اطلاعات تماس',
        path: 'settings.contact',
        fields: [
          f('phone', 'تلفن'),
          f('phoneHref', 'لینک تلفن', 'text', { hint: 'tel:+982112345678' }),
          f('email', 'ایمیل'),
          f('address', 'آدرس', 'textarea'),
          f('hours', 'ساعات کاری'),
        ],
      },
      {
        id: 'socials',
        label: 'شبکه‌های اجتماعی',
        path: 'settings.socials',
        list: true,
        itemLabel: 'label',
        itemFields: [f('label', 'نام'), f('handle', 'آیدی نمایشی'), f('href', 'لینک'), f('icon', 'کلاس آیکن')],
      },
      { id: 'seo', label: 'SEO', path: pageContent('contact'), fields: seoFields() },
    ],
  },
  {
    id: 'page-projects',
    view: 'page',
    label: 'صفحهٔ پروژه‌ها',
    route: '/projects',
    path: 'settings',
    description: 'عنوان، معرفی و سئوی فهرست پروژه‌ها',
    tabs: [
      {
        id: 'copy',
        label: 'محتوا',
        path: pageContent('projects'),
        fields: [f('title', 'عنوان صفحه'), f('subtitle', 'زیرعنوان'), f('icon', 'کلاس آیکن'), f('intro', 'معرفی', 'textarea')],
      },
      { id: 'seo', label: 'SEO', path: pageContent('projects'), fields: seoFields() },
    ],
  },
  {
    id: 'blog',
    view: 'page',
    label: 'صفحهٔ وبلاگ',
    route: '/blog',
    path: 'settings',
    description: 'عنوان، معرفی و سئوی وبلاگ',
    tabs: [
      {
        id: 'copy',
        label: 'محتوا',
        path: pageContent('blog'),
        fields: [f('title', 'عنوان صفحه'), f('subtitle', 'زیرعنوان'), f('icon', 'کلاس آیکن'), f('intro', 'معرفی', 'textarea')],
      },
      { id: 'seo', label: 'SEO', path: pageContent('blog'), fields: seoFields() },
    ],
  },
  {
    id: 'consultation',
    view: 'page',
    label: 'درخواست مشاوره',
    route: '/consultation',
    path: 'settings',
    description: 'عنوان و متن فرم مشاوره',
    tabs: [
      {
        id: 'copy',
        label: 'محتوا',
        path: pageContent('consultation'),
        fields: [
          f('title', 'عنوان صفحه'),
          f('subtitle', 'زیرعنوان'),
          f('icon', 'کلاس آیکن'),
          f('messagePlaceholder', 'راهنمای پیام'),
          f('submitLabel', 'متن دکمه'),
          f('formNote', 'پیام پس از ارسال', 'textarea'),
        ],
      },
      { id: 'seo', label: 'SEO', path: pageContent('consultation'), fields: seoFields() },
    ],
  },
  {
    id: 'cooperation',
    view: 'page',
    label: 'فرصت همکاری',
    route: '/cooperation',
    path: 'settings',
    description: 'عنوان و متن فرم همکاری',
    tabs: [
      {
        id: 'copy',
        label: 'محتوا',
        path: pageContent('cooperation'),
        fields: [
          f('title', 'عنوان صفحه'),
          f('subtitle', 'زیرعنوان'),
          f('icon', 'کلاس آیکن'),
          f('messagePlaceholder', 'راهنمای پیام'),
          f('submitLabel', 'متن دکمه'),
          f('formNote', 'پیام پس از ارسال', 'textarea'),
        ],
      },
      { id: 'seo', label: 'SEO', path: pageContent('cooperation'), fields: seoFields() },
    ],
  },
];

const menuField = f('menu', 'منوی اصلی', 'menu');
const headerEntry = {
  id: 'header',
  view: 'section',
  label: 'هدر و منو',
  path: 'settings.header',
  kind: 'object',
  description: 'دکمهٔ مشاوره و ساختار منو؛ آیتم‌ها و زیرمنوها را آزادانه تغییر دهید.',
  tabs: [
    {
      id: 'cta',
      label: 'دکمهٔ مشاوره',
      path: 'settings.header',
      fields: [f('ctaLabel', 'متن دکمه'), f('ctaPhone', 'شمارهٔ تماس'), f('ctaHref', 'لینک دکمه')],
    },
    { id: 'menu', label: 'منوی اصلی', path: 'settings.header', fields: [menuField] },
  ],
};

const footerEntry = {
  id: 'footer',
  view: 'section',
  label: 'فوتر',
  path: 'settings.footer',
  kind: 'object',
  description: 'معرفی، ستون‌های لینک، عناوین ستون‌ها، مجوزها و شبکه‌های اجتماعی.',
  tabs: [
    {
      id: 'about',
      label: 'معرفی',
      path: 'settings.footer',
      fields: [f('about', 'متن دربارهٔ استودیو', 'textarea')],
    },
    {
      id: 'columns',
      label: 'ستون‌های لینک',
      path: 'settings.footer',
      fields: [
        f('quickTitle', 'عنوان ستون اول'),
        f('quickSubtitle', 'زیرعنوان ستون اول'),
        f('quickLinks', 'لینک‌های ستون اول', 'list', {
          itemLabel: 'label',
          itemFields: [f('label', 'عنوان'), f('href', 'لینک')],
        }),
        f('servicesTitle', 'عنوان ستون دوم'),
        f('servicesSubtitle', 'زیرعنوان ستون دوم'),
        f('serviceLinks', 'لینک‌های ستون دوم', 'list', {
          itemLabel: 'label',
          itemFields: [f('label', 'عنوان'), f('href', 'لینک')],
        }),
      ],
    },
    {
      id: 'headings',
      label: 'عناوین دیگر',
      path: 'settings.footer',
      fields: [
        f('contactTitle', 'عنوان ستون تماس'),
        f('contactSubtitle', 'زیرعنوان ستون تماس'),
        f('licensesTitle', 'عنوان مجوزها'),
        f('licensesSubtitle', 'زیرعنوان مجوزها'),
        f('socialTitle', 'عنوان شبکه‌های اجتماعی'),
        f('socialSubtitle', 'زیرعنوان شبکه‌های اجتماعی'),
        f('licenses', 'مجوزها', 'list', {
          itemLabel: 'label',
          itemFields: [f('image', 'تصویر', 'image'), f('label', 'نام')],
        }),
      ],
    },
  ],
};

export const COLLECTIONS = [
  {
    id: 'projects',
    view: 'collection',
    label: 'پروژه‌ها',
    path: 'projects',
    itemLabel: 'title',
    titleLabel: 'نام پروژه',
    description: 'کارت پروژه، صفحهٔ جزئیات، گالری و سئو',
    addLabel: 'پروژهٔ جدید',
    preview: (item) => (item?.slug ? `/project/${item.slug}` : '/projects'),
    tabs: projectTabs,
  },
  {
    id: 'services',
    view: 'collection',
    label: 'خدمات',
    path: 'services',
    itemLabel: 'title',
    titleLabel: 'عنوان خدمت',
    description: 'خدمات فهرست‌شده در سایت و صفحهٔ هر خدمت',
    addLabel: 'خدمت جدید',
    preview: (item) => (item?.slug ? `/services/${item.slug}` : '/services'),
    tabs: serviceTabs,
  },
  {
    id: 'articles',
    view: 'collection',
    label: 'مقالات',
    path: 'articles',
    itemLabel: 'title',
    titleLabel: 'عنوان مقاله',
    description: 'مقاله، دسته‌بندی، متن بلوکی و سئو',
    addLabel: 'مقالهٔ جدید',
    preview: (item) => (item?.slug ? `/blog/${item.slug}` : '/blog'),
    tabs: articleTabs,
  },
];

export const SECTION_ENTRIES = [
  {
    id: 'hero',
    view: 'section',
    label: 'هیرو',
    path: 'settings.hero',
    kind: 'object',
    tabs: [
      {
        id: 'content',
        label: 'محتوا',
        path: 'settings.hero',
        fields: [
          f('badge1', 'برچسب اول'),
          f('badge2', 'برچسب دوم'),
          f('title', 'عنوان اصلی'),
          f('text', 'متن زیر عنوان', 'textarea'),
          f('ctaLabel', 'متن دکمه'),
          f('ctaHref', 'لینک دکمه'),
          f('image', 'تصویر هیرو', 'image'),
        ],
      },
      {
        id: 'author',
        label: 'معمار',
        path: 'settings.hero',
        fields: [f('authorName', 'نام'), f('authorRole', 'عنوان'), f('authorImage', 'تصویر', 'image')],
      },
    ],
  },
  {
    id: 'home-layout',
    view: 'section',
    label: 'ترتیب بخش‌های صفحهٔ اصلی',
    path: 'settings.homeSections',
    kind: 'order',
    description: 'ترتیب نمایش بخش‌های صفحهٔ اصلی و روشن/خاموش کردن هر بخش.',
  },
  {
    id: 'team',
    view: 'section',
    label: 'تیم',
    path: 'settings.team',
    kind: 'object',
    tabs: [
      {
        id: 'content',
        label: 'معرفی',
        path: 'settings.team',
        fields: [f('intro', 'متن معرفی', 'textarea'), f('image', 'تصویر تیم', 'image')],
      },
      {
        id: 'members',
        label: 'اعضای تیم',
        path: 'settings.team',
        fields: [
          f('members', 'اعضا', 'list', {
            itemLabel: 'name',
            itemFields: [f('name', 'نام'), f('role', 'سمت'), f('image', 'تصویر', 'image')],
          }),
        ],
      },
    ],
  },
  {
    id: 'clients',
    view: 'section',
    label: 'همکاران و مشتریان',
    path: 'settings.clients',
    kind: 'list',
    description: 'لوگوهای نوار همکاران.',
    itemLabel: 'label',
    itemFields: [f('src', 'تصویر لوگو', 'image'), f('label', 'نام (اختیاری)')],
  },
  {
    id: 'achievements',
    view: 'section',
    label: 'دستاوردها و آمار',
    path: 'settings.about.stats',
    kind: 'list',
    description: 'اعداد کلیدی که در صفحهٔ درباره ما نمایش داده می‌شوند.',
    itemLabel: 'label',
    itemFields: [f('value', 'عدد'), f('label', 'عنوان')],
  },
  {
    id: 'faqs',
    view: 'section',
    label: 'پرسش‌های متداول',
    path: 'settings.faqs',
    kind: 'list',
    description: 'پرسش‌های صفحهٔ اصلی و صفحهٔ درباره ما.',
    itemLabel: 'question',
    itemFields: [f('question', 'پرسش'), f('answer', 'پاسخ', 'textarea')],
  },
  {
    id: 'contact-info',
    view: 'section',
    label: 'اطلاعات تماس',
    path: 'settings.contact',
    kind: 'object',
    description: 'تلفن، ایمیل، آدرس و ساعات کاری؛ در هدر، فوتر و صفحهٔ تماس استفاده می‌شود.',
    tabs: [
      {
        id: 'info',
        label: 'اطلاعات',
        path: 'settings.contact',
        fields: [
          f('phone', 'تلفن'),
          f('phoneHref', 'لینک تلفن'),
          f('email', 'ایمیل'),
          f('address', 'آدرس', 'textarea'),
          f('hours', 'ساعات کاری'),
        ],
      },
    ],
  },
  {
    id: 'socials',
    view: 'section',
    label: 'شبکه‌های اجتماعی',
    path: 'settings.socials',
    kind: 'list',
    description: 'لینک‌های فوتر و صفحهٔ تماس.',
    itemLabel: 'label',
    itemFields: [f('label', 'نام'), f('handle', 'آیدی نمایشی'), f('href', 'لینک'), f('icon', 'کلاس آیکن')],
  },
  {
    id: 'general',
    view: 'section',
    label: 'تنظیمات عمومی',
    path: 'settings.general',
    kind: 'object',
    description: 'نام استودیو، شعار و نشان‌ها.',
    tabs: [
      {
        id: 'identity',
        label: 'هویت',
        path: 'settings.general',
        fields: [
          f('studioName', 'نام استودیو'),
          f('tagline', 'شعار'),
          f('logo', 'نشان اصلی', 'image'),
          f('logoLight', 'نشان روشن', 'image'),
        ],
      },
    ],
  },
  {
    id: 'seo',
    view: 'section',
    label: 'SEO سایت',
    path: 'settings.seo',
    kind: 'object',
    description: 'عنوان و توضیح پیش‌فرض همهٔ صفحات.',
    tabs: [
      {
        id: 'seo',
        label: 'تنظیمات SEO',
        path: 'settings.seo',
        fields: [
          f('title', 'عنوان سایت'),
          f('description', 'توضیح پیش‌فرض', 'textarea'),
          f('keywords', 'کلیدواژه‌ها', 'lines'),
          f('ogImage', 'تصویر اشتراک‌گذاری', 'image'),
        ],
      },
    ],
  },
  {
    id: 'service-pages',
    view: 'deep',
    label: 'صفحات تفصیلی خدمات',
    path: 'servicePages',
    kind: 'deep',
    description: 'محتوای چهار صفحهٔ تفصیلی خدمات. هر بخش را می‌توانید باز کنید و متن یا تصویر آن را تغییر دهید.',
  },
  headerEntry,
  footerEntry,
  {
    id: 'licenses',
    view: 'section',
    label: 'مجوزها و گواهی‌ها',
    path: 'settings.footer.licenses',
    kind: 'list',
    description: 'نشان‌های مجوز در فوتر.',
    itemLabel: 'label',
    itemFields: [f('image', 'تصویر', 'image'), f('label', 'نام')],
  },
].sort((a, b) => 0);

export const NAV = [
  { title: 'داشبورد', items: [{ id: 'dashboard', label: 'داشبورد', icon: 'grid' }] },
  {
    title: 'محتوا',
    items: [
      { id: 'pages', label: 'صفحات', icon: 'layers' },
      { id: 'projects', label: 'پروژه‌ها', icon: 'frame' },
      { id: 'services', label: 'خدمات', icon: 'draft' },
      { id: 'articles', label: 'مقالات', icon: 'text' },
    ],
  },
  {
    title: 'بخش‌ها',
    items: [
      { id: 'hero', label: 'هیرو' },
      { id: 'home-layout', label: 'ترتیب صفحهٔ اصلی' },
      { id: 'team', label: 'تیم' },
      { id: 'clients', label: 'همکاران' },
      { id: 'achievements', label: 'دستاوردها' },
      { id: 'faqs', label: 'پرسش‌های متداول' },
    ],
  },
  {
    title: 'سایت',
    items: [
      { id: 'header', label: 'هدر و منو' },
      { id: 'footer', label: 'فوتر' },
      { id: 'contact-info', label: 'اطلاعات تماس' },
      { id: 'socials', label: 'شبکه‌های اجتماعی' },
      { id: 'licenses', label: 'مجوزها' },
      { id: 'media', label: 'کتابخانهٔ رسانه' },
    ],
  },
  {
    title: 'تنظیمات',
    items: [
      { id: 'general', label: 'تنظیمات عمومی' },
      { id: 'seo', label: 'SEO' },
      { id: 'service-pages', label: 'صفحات تفصیلی خدمات' },
      { id: 'security', label: 'امنیت' },
    ],
  },
  { title: 'پیام‌ها', items: [{ id: 'messages', label: 'پیام‌های تماس', badge: 'unread' }] },
];

export const ENTRY_MAP = [...PAGES, ...COLLECTIONS, ...SECTION_ENTRIES].reduce((map, entry) => {
  map[entry.id] = entry;
  return map;
}, {});
