// Every project shown in the site. The three card projects come from the
// reference page's projects grid; `pars-jordan` is the project introduced in the
// homepage hero.
export const projects = [
  {
    slug: 'برج-سپهر',
    title: 'برج سپهر',
    image: '/img/Dubai_Marina_Skyline.webp',
    status: 'آماده تحویل',
    statusColor: '#40ce51',
    specs: [
      ['تعداد طبقات', '9 طبقه'],
      ['تعداد واحد‌ها', '20 واحد'],
    ],
  },
  {
    slug: 'مجتمع-اسکایلاین',
    title: 'مجتمع اسکای‌لاین',
    image: '/img/Building-Types-Hero.webp',
    status: 'در حال ساخت',
    statusColor: '#ffb22c',
    specs: [
      ['تعداد طبقات', '7 طبقه'],
      ['تعداد واحد‌ها', '6 واحد'],
    ],
  },
  {
    slug: 'برج-نیکا',
    title: 'برج نیکا',
    image: '/img/NA1442_shutterstock_355734689.webp',
    status: 'در حال ساخت',
    statusColor: '#ffb22c',
    specs: [
      ['تعداد طبقات', '7 طبقه'],
      ['تعداد واحد‌ها', '6 واحد'],
    ],
  },
  {
    slug: 'pars-jordan',
    title: 'برج پارس جردن',
    image: '/img/hero-bg-1.png',
    status: 'در حال ساخت',
    statusColor: '#ffb22c',
    specs: [
      ['مساحت', '۹۰۵ متر'],
      ['تعداد طبقات', '۲۵ طبقه'],
    ],
  },
];

export const projectUrl = (project) => `/project/${project.slug}`;

export const findProject = (slug) => projects.find((project) => project.slug === slug);
