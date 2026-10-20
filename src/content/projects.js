// Projects that are introduced on the homepage but are not part of the
// three-card projects grid captured from the reference page.
export const featuredProjects = [
  {
    slug: 'pars-jordan',
    title: 'برج پارس جردن',
    image: '/img/hero-bg-1.png',
    status: 'در حال ساخت',
    statusColor: '#ffb22c',
    specs: [
      ['مساحت', '۹۰۵ متر'],
      ['زیربنا', '۱۷٬۰۰۰ متر'],
      ['تعداد طبقات', '۲۵ طبقه'],
      ['واحدها', '۲۰ طبقه روی زمین و ۵ طبقه زیرزمین'],
    ],
    description:
      'برج لوکس اداری و تجاری پارس با مساحت ۹۰۵ متر و زیربنای ۱۷٬۰۰۰ متر در ۲۵ طبقه طراحی و اجرا می‌شود؛ ۲۰ طبقه روی زمین و ۵ طبقه زیرزمین برای پارکینگ و فضاهای خدماتی.',
  },
];

export const findFeaturedProject = (slug) =>
  featuredProjects.find((project) => project.slug === slug);
