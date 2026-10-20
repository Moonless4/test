import { homeSections } from '../content/home.js';
import { articles, articleUrl, findArticle } from '../content/articles.js';
import { findService } from '../content/services.js';
import { heading, section, sectionById, sectionWith } from './blocks.js';
import { projectPage } from './projectPage.js';

const projectsSection = sectionWith('projects');
const blogSection = sectionWith('blog');
const faqSection = sectionWith('faq');
const teamSection = sectionById('b6d9756');

const homeContent = homeSections.map((section) => section.html).join('');

const form = (fields, submit = 'ارسال', { name = 'request', note = 'درخواست شما ثبت شد؛ به‌زودی با شما تماس می‌گیریم.' } = {}) => `
<div class="luxina_contact_form-wrap">
  <form class="wpcf7-form rb-form" data-rb-form="${name}" novalidate>
    ${fields}
    <button type="submit" class="button button-start rounded button-primary rb-form-submit">
      <span class="button-text">${submit}</span>
    </button>
    <p class="rb-form-note" hidden>${note}</p>
  </form>
</div>`;

const twoFieldRow = (a, b) => `
<div class="luxina-cf7-first-row"><p>
  <input class="form-control" name="name" type="text" placeholder="${a}" required>
  <input class="form-control" name="phone" type="text" placeholder="${b}" required>
</p></div>`;

const messageRow = (placeholder) => `
<div class="luxina-cf7-second-row"><p>
  <textarea class="form-control" name="message" placeholder="${placeholder}"></textarea>
</p></div>`;

const contactInfo = `
<div class="rb-contact-info">
  <div class="rb-contact-card">
    <i class="luxinaicon luxina-icon-map-pin-2-fill" aria-hidden="true"></i>
    <span class="rb-contact-label">آدرس</span>
    <span class="rb-contact-value">تهران، خیابان اسکندری، کوچه ۱۶ مهربان</span>
  </div>
  <div class="rb-contact-card">
    <i class="luxinaicon luxina-icon-customer-service-2-line" aria-hidden="true"></i>
    <span class="rb-contact-label">تلفن</span>
    <span class="rb-contact-value" dir="ltr">021-123 4567</span>
  </div>
  <div class="rb-contact-card">
    <i class="luxinaicon luxina-icon-mail-fill" aria-hidden="true"></i>
    <span class="rb-contact-label">ایمیل</span>
    <span class="rb-contact-value" dir="ltr">info@archilux.ir</span>
  </div>
</div>`;

const contactPage = () =>
  section(
    heading('تماس با ما', 'Contact us', 'luxina-icon-question-answer-fill') +
      contactInfo +
      form(twoFieldRow('نام و نام خانوادگی', 'شماره تماس') + messageRow('متن پیام شما'), 'ارسال پیام', {
        name: 'contact',
        note: 'پیام شما ثبت شد؛ کارشناسان ما در اولین فرصت پاسخ می‌دهند.',
      }),
  );

const consultationPage = () =>
  section(
    heading('درخواست مشاوره', 'Consultation request', 'luxina-icon-customer-service-2-line') +
      form(
        twoFieldRow('نام و نام خانوادگی', 'شماره تماس') + messageRow('درباره پروژه‌تان بنویسید'),
        'ثبت درخواست',
        { name: 'consultation', note: 'درخواست مشاورهٔ شما ثبت شد؛ برای هماهنگی جلسه تماس می‌گیریم.' },
      ),
  );

const cooperationPage = () =>
  section(
    heading('فرصت همکاری', 'Cooperation', 'luxina-icon-team-fill') +
      form(twoFieldRow('نام و نام خانوادگی', 'شماره تماس') + messageRow('زمینه همکاری'), 'ارسال درخواست', {
        name: 'cooperation',
        note: 'درخواست همکاری شما ثبت شد؛ در صورت تطابق با فرصت‌های موجود تماس می‌گیریم.',
      }),
  ) + teamSection;

const loginPage = (mode = 'login') => {
  const signup = mode === 'signup';
  return `
<div class="elementor-element e-flex e-con-boxed e-con e-parent">
  <div class="e-con-inner rb-narrow">
    <div class="luxina_contact_form_title">${signup ? 'عضویت در سایت' : 'ورود به حساب'}</div>
    <div class="luxina_contact_form_subtitle">${signup ? 'Create account' : 'Login'}</div>
    <div class="luxina_contact_form-wrap">
      <form class="wpcf7-form rb-form" data-rb-form="${signup ? 'signup' : 'login'}" novalidate>
        <div class="luxina-cf7-first-row"><p>
          ${
            signup
              ? '<input class="form-control" type="text" name="name" placeholder="نام و نام خانوادگی" required>'
              : ''
          }
          <input class="form-control" type="text" name="email" placeholder="ایمیل یا شماره موبایل" required>
          <input class="form-control" type="password" name="password" placeholder="رمز عبور" required>
        </p></div>
        <button type="submit" class="button button-start rounded button-primary rb-form-submit">
          <span class="button-text">${signup ? 'ساخت حساب' : 'ورود'}</span>
        </button>
        <p class="rb-form-note" hidden>${signup ? 'حساب شما ساخته شد؛ خوش آمدید.' : 'خوش آمدید! وارد حساب خود شدید.'}</p>
        <p class="rb-form-switch">
          ${
            signup
              ? 'حساب کاربری دارید؟ <a href="/login">وارد شوید</a>'
              : 'حساب کاربری ندارید؟ <a href="/login?section=signup">ثبت‌نام کنید</a>'
          }
        </p>
      </form>
    </div>
  </div>
</div>`;
};

const notFoundPage = () =>
  section(
    heading('صفحه پیدا نشد', 'Page not found', 'luxina-icon-error-warning-fill') +
      `<p class="rb-empty">صفحه‌ای که به دنبال آن هستید وجود ندارد یا جابه‌جا شده است.</p>
       <div class="rb-detail-actions">
         <a href="/" class="button button-start rounded button-primary"><span class="button-text">بازگشت به خانه</span></a>
         <a href="/projects" class="button button-start rounded button-gray"><span class="button-text">پروژه‌ها</span></a>
         <a href="/blog" class="button button-start rounded button-gray"><span class="button-text">مقالات</span></a>
         <a href="/contact" class="button button-start rounded button-gray"><span class="button-text">تماس با ما</span></a>
       </div>`,
  );

const aboutPage = () =>
  section(
    heading('درباره ما', 'About us', 'luxina-icon-building-line') +
      `<div class="rb-about">
        <p class="rb-service-intro">ما در لوکسینا با افتخار هنر و تخصص خود را در خدمت ساخت و ساز، انبوه‌سازی، بازسازی خانه‌های قدیمی و طراحی خانه‌های لوکس قرار داده‌ایم. هدف ما خلق فضاهایی است که نه تنها نیازهای عملکردی را برآورده کنند، بلکه الهام‌بخش زندگی مدرن و سبک زندگی منحصر به فرد شما باشند.</p>
        <p class="rb-detail-text">تیم ما از معماران، مهندسان سازه و مدیران اجرایی تشکیل شده است که از مرحلهٔ ایده تا تحویل کلید در کنار شما هستند. هر پروژه با شناخت دقیق نیاز کارفرما آغاز می‌شود و با برنامه‌ریزی شفاف، انتخاب متریال مناسب و نظارت مستمر به پایان می‌رسد.</p>
        <div class="rb-about-stats">
          <div class="rb-about-stat"><span class="rb-about-stat-value">۱۵+</span><span class="rb-about-stat-label">سال تجربهٔ اجرایی</span></div>
          <div class="rb-about-stat"><span class="rb-about-stat-value">۱۲۰+</span><span class="rb-about-stat-label">پروژهٔ تحویل‌شده</span></div>
          <div class="rb-about-stat"><span class="rb-about-stat-value">۹۵٪</span><span class="rb-about-stat-label">رضایت کارفرمایان</span></div>
        </div>
        <div class="rb-detail-actions">
          <a href="/consultation" class="button button-start rounded button-primary"><span class="button-text">درخواست مشاوره</span></a>
          <a href="/projects" class="button button-start rounded button-gray"><span class="button-text">مشاهده پروژه‌ها</span></a>
        </div>
      </div>`,
  ) + teamSection + faqSection;

function articlePage(slug) {
  const article = findArticle(slug);
  if (!article) return notFoundPage();

  return section(
    heading('مقالات', 'Weblog', 'luxina-icon-book-line') +
      `<article class="rb-article">
        <figure class="rb-article-media"><img src="${article.image}" alt="${article.title}"></figure>
        <div class="rb-article-meta"><span class="rb-detail-badge">${article.category}</span></div>
        <h1 class="rb-detail-title">${article.title}</h1>
        <div class="rb-article-text">${article.body.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>
        <ul class="rb-article-list">${article.points.map((point) => `<li>${point}</li>`).join('')}</ul>
        <div class="rb-detail-actions">
          <a href="/consultation" class="button button-start rounded button-primary"><span class="button-text">درخواست مشاوره</span></a>
          <a href="/blog" class="button button-start rounded button-gray"><span class="button-text">همه مقالات</span></a>
        </div>
      </article>
      <div class="rb-related">${relatedArticles(article.slug)}</div>`,
  );
}

function servicePage(slug) {
  const service = findService(slug);
  if (!service) return notFoundPage();

  return section(
    heading(service.title, service.subtitle, service.icon) +
      `<div class="rb-service">
        <p class="rb-service-intro">${service.intro}</p>
        <ul class="rb-service-list">${service.points.map((point) => `<li>${point}</li>`).join('')}</ul>
        ${service.body.map((paragraph) => `<p class="rb-detail-text">${paragraph}</p>`).join('')}
        <div class="rb-detail-actions">
          <a href="/consultation" class="button button-start rounded button-primary"><span class="button-text">درخواست مشاوره</span></a>
          <a href="/contact" class="button button-start rounded button-gray"><span class="button-text">تماس با ما</span></a>
        </div>
      </div>`,
  );
}

export function getContent(pathname, search = '') {
  const route = decodeURIComponent(pathname);
  if (route === '/' || route === '') return homeContent;
  if (route === '/projects') return projectsSection;
  if (route === '/blog') return blogSection;
  if (route === '/about') return aboutPage();
  if (route === '/contact') return contactPage();
  if (route === '/consultation') return consultationPage();
  if (route === '/cooperation') return cooperationPage();
  if (route === '/login') {
    const section = new URLSearchParams(search).get('section');
    return loginPage(section === 'signup' ? 'signup' : 'login');
  }
  if (route === '/404') return notFoundPage();
  if (route.startsWith('/blog/')) return articlePage(route.replace('/blog/', '').replace(/\/$/, ''));
  if (route.startsWith('/services/')) return servicePage(route.replace('/services/', '').replace(/\/$/, ''));
  if (route.startsWith('/project/')) {
    return projectPage(route.replace('/project/', '').replace(/\/$/, '')) || notFoundPage();
  }
  return notFoundPage();
}
