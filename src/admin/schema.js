// The dashboard is generated from this table: each entry says where its data
// lives in the saved document and which fields the form shows. Field paths are
// relative to the entry's `path`, so `details.lead` edits a project's detail
// page copy from the same form as its card.
//
// Field types: text | textarea | url | image | number | switch | lines | pairs | json

const contactFields = [
  { path: 'phone', label: 'تلفن', type: 'text' },
  { path: 'phoneHref', label: 'لینک تلفن', type: 'text', hint: 'tel:+982112345678' },
  { path: 'email', label: 'ایمیل', type: 'text' },
  { path: 'address', label: 'آدرس', type: 'textarea' },
  { path: 'hours', label: 'ساعات کاری', type: 'text' },
];

const projectFields = [
  { path: 'title', label: 'نام پروژه', type: 'text' },
  { path: 'slug', label: 'نشانی صفحه (slug)', type: 'text', hint: 'مثال: برج-آریا' },
  { path: 'image', label: 'تصویر اصلی', type: 'image' },
  { path: 'status', label: 'وضعیت', type: 'text' },
  { path: 'statusColor', label: 'رنگ وضعیت', type: 'text', hint: '#40ce51' },
  { path: 'featured', label: 'پروژهٔ شاخص (هیرو)', type: 'switch' },
  { path: 'heroText', label: 'توضیح کوتاه', type: 'textarea' },
  { path: 'specs', label: 'مشخصات روی کارت', type: 'pairs' },
  { path: 'details.category', label: 'دسته', type: 'text' },
  { path: 'details.location', label: 'موقعیت', type: 'text' },
  { path: 'details.progress', label: 'پیشرفت اجرا (٪)', type: 'number' },
  { path: 'details.lead', label: 'خلاصهٔ صفحهٔ پروژه', type: 'textarea' },
  { path: 'details.body', label: 'معرفی پروژه (هر خط یک پاراگراف)', type: 'lines' },
  { path: 'details.highlights', label: 'ویژگی‌های شاخص', type: 'lines' },
  { path: 'details.facts', label: 'مشخصات کامل', type: 'pairs' },
  { path: 'details.gallery', label: 'گالری تصاویر', type: 'lines' },
  { path: 'details.services', label: 'خدمات مرتبط (slug)', type: 'lines' },
];

export const SECTIONS = [
  {
    id: 'hero',
    label: 'هیرو سکشن',
    path: 'settings.hero',
    kind: 'object',
    fields: [
      { path: 'badge1', label: 'برچسب اول', type: 'text' },
      { path: 'badge2', label: 'برچسب دوم', type: 'text' },
      { path: 'title', label: 'عنوان اصلی', type: 'text' },
      { path: 'text', label: 'متن زیر عنوان', type: 'textarea' },
      { path: 'authorName', label: 'نام معمار', type: 'text' },
      { path: 'authorRole', label: 'عنوان معمار', type: 'text' },
      { path: 'authorImage', label: 'تصویر معمار', type: 'image' },
      { path: 'image', label: 'تصویر هیرو', type: 'image' },
      { path: 'ctaLabel', label: 'متن دکمه', type: 'text' },
      { path: 'ctaHref', label: 'لینک دکمه', type: 'text' },
    ],
  },
  {
    id: 'home-services',
    label: 'خدمات صفحهٔ اصلی',
    path: 'settings.homeServices',
    kind: 'list',
    itemLabel: 'title',
    itemFields: [
      { path: 'title', label: 'عنوان', type: 'text' },
      { path: 'subtitle', label: 'زیرعنوان', type: 'text' },
      { path: 'image', label: 'تصویر', type: 'image' },
      { path: 'icon', label: 'کلاس آیکن', type: 'text' },
      { path: 'slug', label: 'لینک', type: 'text' },
    ],
  },
  {
    id: 'projects',
    label: 'پروژه‌ها',
    path: 'projects',
    kind: 'collection',
    itemLabel: 'title',
    itemFields: projectFields,
  },
  {
    id: 'services',
    label: 'خدمات سایت',
    path: 'services',
    kind: 'collection',
    itemLabel: 'title',
    itemFields: [
      { path: 'title', label: 'عنوان', type: 'text' },
      { path: 'slug', label: 'نشانی صفحه (slug)', type: 'text' },
      { path: 'subtitle', label: 'زیرعنوان انگلیسی', type: 'text' },
      { path: 'icon', label: 'کلاس آیکن', type: 'text' },
      { path: 'intro', label: 'معرفی', type: 'textarea' },
      { path: 'body', label: 'متن (هر خط یک پاراگراف)', type: 'lines' },
      { path: 'points', label: 'نکته‌ها', type: 'lines' },
    ],
  },
  {
    id: 'articles',
    label: 'مقالات',
    path: 'articles',
    kind: 'collection',
    itemLabel: 'title',
    itemFields: [
      { path: 'title', label: 'عنوان', type: 'text' },
      { path: 'slug', label: 'نشانی صفحه (slug)', type: 'text' },
      { path: 'cardTitle', label: 'عنوان کارت', type: 'text' },
      { path: 'category', label: 'دسته', type: 'text' },
      { path: 'image', label: 'تصویر', type: 'image' },
      { path: 'imageAlt', label: 'توضیح تصویر', type: 'text' },
      { path: 'dateLabel', label: 'تاریخ نمایشی', type: 'text' },
      { path: 'isoDate', label: 'تاریخ استاندارد', type: 'text', hint: '2026-09-03' },
      { path: 'readingTime', label: 'زمان مطالعه', type: 'text' },
      { path: 'excerpt', label: 'خلاصه', type: 'textarea' },
      { path: 'related', label: 'مقالات مرتبط (slug)', type: 'lines' },
      { path: 'body', label: 'متن مقاله (JSON بلوک‌ها)', type: 'json' },
      { path: 'seo', label: 'SEO (JSON)', type: 'json' },
    ],
  },
  {
    id: 'about',
    label: 'درباره ما',
    path: 'settings.about',
    kind: 'object',
    fields: [
      { path: 'intro', label: 'جملهٔ معرفی', type: 'textarea' },
      { path: 'body', label: 'متن صفحه (هر خط یک پاراگراف)', type: 'lines' },
      { path: 'stats', label: 'آمار', type: 'list', itemFields: [{ path: 'value', label: 'عدد', type: 'text' }, { path: 'label', label: 'عنوان', type: 'text' }] },
    ],
  },
  {
    id: 'team',
    label: 'تیم ما',
    path: 'settings.team',
    kind: 'object',
    fields: [
      { path: 'intro', label: 'متن معرفی', type: 'textarea' },
      { path: 'image', label: 'تصویر تیم', type: 'image' },
      {
        path: 'members',
        label: 'اعضای تیم',
        type: 'list',
        itemFields: [
          { path: 'name', label: 'نام', type: 'text' },
          { path: 'role', label: 'سمت', type: 'text' },
          { path: 'image', label: 'تصویر', type: 'image' },
        ],
      },
    ],
  },
  {
    id: 'faqs',
    label: 'پرسش‌های متداول',
    path: 'settings.faqs',
    kind: 'list',
    itemLabel: 'question',
    itemFields: [
      { path: 'question', label: 'پرسش', type: 'text' },
      { path: 'answer', label: 'پاسخ', type: 'textarea' },
    ],
  },
  {
    id: 'clients',
    label: 'افتخارات همکاری',
    path: 'settings.clients',
    kind: 'list',
    itemFields: [
      { path: 'src', label: 'تصویر لوگو', type: 'image' },
      { path: 'square', label: 'کلاس نمایش مربع', type: 'text' },
    ],
  },
  {
    id: 'contact',
    label: 'آدرس و راه‌های ارتباطی',
    path: 'settings.contact',
    kind: 'object',
    fields: contactFields,
  },
  {
    id: 'socials',
    label: 'شبکه‌های اجتماعی',
    path: 'settings.socials',
    kind: 'list',
    itemLabel: 'label',
    itemFields: [
      { path: 'label', label: 'نام', type: 'text' },
      { path: 'handle', label: 'آیدی نمایشی', type: 'text' },
      { path: 'href', label: 'لینک', type: 'text' },
      { path: 'icon', label: 'کلاس آیکن', type: 'text' },
    ],
  },
  {
    id: 'header',
    label: 'هدر و منو',
    path: 'settings.header',
    kind: 'object',
    fields: [
      { path: 'ctaLabel', label: 'متن دکمهٔ مشاوره', type: 'text' },
      { path: 'ctaPhone', label: 'شمارهٔ دکمه', type: 'text' },
      { path: 'ctaHref', label: 'لینک دکمه', type: 'text' },
      {
        path: 'menu',
        label: 'منوی اصلی',
        type: 'list',
        hint: 'تعداد آیتم‌های منو ثابت است؛ نام و لینک قابل ویرایش است.',
        itemFields: [
          { path: 'label', label: 'نام', type: 'text' },
          { path: 'href', label: 'لینک', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'footer',
    label: 'فوتر',
    path: 'settings.footer',
    kind: 'object',
    fields: [
      { path: 'about', label: 'متن دربارهٔ آراتان', type: 'textarea' },
      {
        path: 'licenses',
        label: 'مجوزها',
        type: 'list',
        itemFields: [
          { path: 'image', label: 'تصویر مجوز', type: 'image' },
          { path: 'label', label: 'نام', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'service-pages',
    label: 'صفحات خدمات (پیشرفته)',
    path: 'servicePages',
    kind: 'json',
    hint: 'ساختار کامل چهار صفحهٔ خدمات؛ فقط با دانش JSON ویرایش کنید.',
  },
];
