// Every project shown in the site. `featured` marks the project introduced in
// the homepage hero; the rest fill the projects grid.
export const projects = [
  {
    slug: 'برج-آریا',
    title: 'برج آریا',
    image: '/img/Dubai_Marina_Skyline.webp',
    status: 'در حال ساخت',
    statusColor: '#ffb22c',
    featured: true,
    heroText: '۲۲ طبقه مسکونی در جردن؛ ۳۴٬۰۰۰ متر زیربنا، از فونداسیون تا تحویل کلید.',
    specs: [
      ['تعداد طبقات', '۲۲ طبقه'],
      ['تعداد واحد‌ها', '۹۶ واحد'],
    ],
  },
  {
    slug: 'مجتمع-الوند',
    title: 'مجتمع مسکونی الوند',
    image: '/img/services/lux-gallery-1.jpg',
    status: 'آماده تحویل',
    statusColor: '#40ce51',
    specs: [
      ['تعداد طبقات', '۱۲ طبقه'],
      ['تعداد واحد‌ها', '۴۸ واحد'],
    ],
  },
  {
    slug: 'ویلای-لواسان',
    title: 'ویلای لواسان',
    image: '/img/services/lux-hero.jpg',
    status: 'آماده تحویل',
    statusColor: '#40ce51',
    specs: [
      ['مساحت زمین', '۱٬۸۰۰ متر'],
      ['زیربنا', '۹۴۰ متر'],
    ],
  },
  {
    slug: 'خانه-عودلاجان',
    title: 'خانهٔ عودلاجان',
    image: '/img/services/reno-restored.jpg',
    status: 'آماده تحویل',
    statusColor: '#40ce51',
    specs: [
      ['مساحت', '۴۲۰ متر'],
      ['سال مرمت', '۱۴۰۱'],
    ],
  },
  {
    slug: 'ساختمان-ونک',
    title: 'ساختمان اداری ونک',
    image: '/img/services/lux-facade.jpg',
    status: 'آماده تحویل',
    statusColor: '#40ce51',
    specs: [
      ['تعداد طبقات', '۱۴ طبقه'],
      ['زیربنا', '۱۸٬۵۰۰ متر'],
    ],
  },
  {
    slug: 'باغ-ویلای-شمال',
    title: 'مجتمع باغ‌ویلای شمال',
    image: '/img/Building-Types-Hero.webp',
    status: 'در حال طراحی',
    statusColor: '#3a7bd5',
    specs: [
      ['تعداد واحد‌ها', '۲۴ ویلایی'],
      ['مساحت سایت', '۱۲ هکتار'],
    ],
  },
  {
    slug: 'آپارتمان-الهیه',
    title: 'آپارتمان الهیه',
    image: '/img/services/interior-hero.jpg',
    status: 'تحویل ۱۴۰۲',
    statusColor: '#40ce51',
    specs: [
      ['مساحت', '۲۱۰ متر'],
      ['تعداد اتاق', '۳ اتاق'],
    ],
  },
  {
    slug: 'برج-نیاوران',
    title: 'برج نیاوران',
    image: '/img/NA1442_shutterstock_355734689.webp',
    status: 'در حال ساخت',
    statusColor: '#ffb22c',
    specs: [
      ['تعداد طبقات', '۱۸ طبقه'],
      ['تعداد واحد‌ها', '۳۶ واحد'],
    ],
  },
  {
    slug: 'خانه-کاشان',
    title: 'خانهٔ حیاط‌دار کاشان',
    image: '/img/services/reno-courtyard.jpg',
    status: 'آماده تحویل',
    statusColor: '#40ce51',
    specs: [
      ['مساحت', '۶۸۰ متر'],
      ['سال احیا', '۱۴۰۲'],
    ],
  },
  {
    slug: 'مجتمع-سعادت',
    title: 'مجتمع تجاری سعادت‌آباد',
    image: '/img/hero-bg-1.png',
    status: 'در حال طراحی',
    statusColor: '#3a7bd5',
    specs: [
      ['تعداد طبقات', '۹ طبقه'],
      ['واحد تجاری', '۱۲۰ واحد'],
    ],
  },
];

export const projectUrl = (project) => `/project/${project.slug}`;

export const findProject = (slug) => projects.find((project) => project.slug === slug);

export const featuredProject = projects.find((project) => project.featured) || projects[0];
