import { homeSections } from '../content/home.js';

const sectionWith = (widget) =>
  homeSections.find((section) => section.html.includes(`elementor-widget-luxina_${widget}`))?.html ?? '';

const projectsSection = sectionWith('projects');
const productsSection = sectionWith('products');
const blogSection = sectionWith('blog');
const faqSection = sectionWith('faq');
const teamSection = homeSections[7]?.html ?? '';

const homeContent = homeSections.map((section) => section.html).join('');

const heading = (title, subtitle, icon = 'luxina-icon-home-5-line') => `
<div class="elementor-widget elementor-widget-luxina_heading">
  <div class="elementor-widget-container">
    <div class="luxina_heading_wrap">
      <i class="luxinaicon ${icon} luxina_heading_icon" aria-hidden="true"></i>
      <div class="luxina_heading_title_inner">
        <div class="luxina_heading_title">${title}</div>
        <span class="luxina_heading_subtitle">${subtitle}</span>
      </div>
    </div>
  </div>
</div>`;

const section = (inner, className = '') => `
<div class="elementor-element e-flex e-con-boxed e-con e-parent ${className}">
  <div class="e-con-inner">${inner}</div>
</div>`;

const form = (fields, submit = 'ارسال') => `
<div class="luxina_contact_form-wrap">
  <form class="wpcf7-form rb-form">
    ${fields}
    <button type="submit" class="button button-start rounded button-primary rb-form-submit">
      <span class="button-text">${submit}</span>
    </button>
    <p class="rb-form-note" hidden>درخواست شما ثبت شد؛ به‌زودی با شما تماس می‌گیریم.</p>
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

const contactPage = () =>
  section(
    heading('تماس با ما', 'Contact us', 'luxina-icon-question-answer-fill') +
      form(
        twoFieldRow('نام و نام خانوادگی', 'شماره تماس') +
          messageRow('متن پیام شما'),
      ),
  );

const consultationPage = () =>
  section(
    heading('درخواست مشاوره', 'Consultation request', 'luxina-icon-customer-service-2-line') +
      form(
        twoFieldRow('نام و نام خانوادگی', 'شماره تماس') +
          messageRow('درباره پروژه‌تان بنویسید'),
        'ثبت درخواست',
      ),
  );

const cooperationPage = () =>
  section(
    heading('فرصت همکاری', 'Cooperation', 'luxina-icon-team-fill') +
      form(twoFieldRow('نام و نام خانوادگی', 'شماره تماس') + messageRow('زمینه همکاری'), 'ارسال'),
  ) + teamSection;

const loginPage = () => `
<div class="elementor-element e-flex e-con-boxed e-con e-parent">
  <div class="e-con-inner rb-narrow">
    <div class="luxina_contact_form_title">ورود به حساب</div>
    <div class="luxina_contact_form_subtitle">Login</div>
    <div class="luxina_contact_form-wrap">
      <form class="wpcf7-form rb-form">
        <div class="luxina-cf7-first-row"><p>
          <input class="form-control" type="text" name="email" placeholder="ایمیل یا شماره موبایل" required>
          <input class="form-control" type="password" name="password" placeholder="رمز عبور" required>
        </p></div>
        <button type="submit" class="button button-start rounded button-primary rb-form-submit">
          <span class="button-text">ورود</span>
        </button>
        <p class="rb-form-note" hidden>فرم ورود آماده اتصال به سرویس احراز هویت است.</p>
      </form>
    </div>
  </div>
</div>`;

const cartPage = () =>
  section(
    heading('سبد خرید', 'Cart', 'luxina-icon-shopping-bag-3-line') +
      `<p class="rb-empty">سبد خرید شما در حال حاضر خالی است.</p>
       <a href="/shop" class="button button-start rounded button-primary"><span class="button-text">مشاهده محصولات</span></a>`,
  );

const notFoundPage = () =>
  section(
    heading('صفحه پیدا نشد', 'Page not found', 'luxina-icon-error-warning-fill') +
      `<p class="rb-empty">صفحه‌ای که به دنبال آن هستید وجود ندارد.</p>
       <a href="/" class="button button-start rounded button-primary"><span class="button-text">بازگشت به خانه</span></a>`,
  );

const detailShell = ({ image, title, badge, badgeColor, specs, description, cart }) => `
<div class="elementor-element e-flex e-con-boxed e-con e-parent">
  <div class="e-con-inner">
    <div class="rb-detail">
      <figure class="rb-detail-media"><img src="${image}" alt="${title}"></figure>
      <div class="rb-detail-body">
        ${badge ? `<span class="rb-detail-badge" style="background:${badgeColor || 'var(--primary-100)'}">${badge}</span>` : ''}
        <h1 class="rb-detail-title">${title}</h1>
        ${specs ? `<div class="rb-detail-specs">${specs}</div>` : ''}
        ${description ? `<p class="rb-detail-text">${description}</p>` : ''}
        <div class="rb-detail-actions">
          <a href="/consultation" class="button button-start rounded button-primary"><span class="button-text">درخواست مشاوره</span></a>
          ${cart ? `<button type="button" class="button button-start rounded button-gray rb-add-to-cart"><span class="button-text">افزودن به سبد خرید</span></button>` : ''}
        </div>
      </div>
    </div>
  </div>
</div>`;

const parse = (html) => new DOMParser().parseFromString(html, 'text/html');

function projectPage(slug) {
  const doc = parse(projectsSection);
  const link = Array.from(doc.querySelectorAll('a.luxina_project_inner')).find((anchor) =>
    decodeURIComponent(anchor.getAttribute('href') || '').includes(slug),
  );
  if (!link) return notFoundPage();

  const image = link.querySelector('img')?.getAttribute('src') || '';
  const title = link.querySelector('.luxina_project_name')?.textContent.trim() || '';
  const badge = link.querySelector('.luxina_project_status');
  const specs = Array.from(link.querySelectorAll('.luxina_project_detail-wrap'))
    .map(
      (wrap) => `<div class="rb-detail-spec">
        <span class="rb-detail-spec-title">${wrap.querySelector('.luxina_project_detail-title')?.textContent.trim() ?? ''}</span>
        <span class="rb-detail-spec-value">${wrap.querySelector('.luxina_project_detail-description')?.textContent.trim() ?? ''}</span>
      </div>`,
    )
    .join('');

  return detailShell({
    image,
    title,
    badge: badge?.textContent.trim(),
    badgeColor: badge?.getAttribute('style')?.replace('background:', ''),
    specs,
    description: '',
  });
}

function productPage(slug) {
  const doc = parse(productsSection);
  const card = Array.from(doc.querySelectorAll('.product')).find((item) =>
    decodeURIComponent(item.querySelector('a')?.getAttribute('href') || '').includes(slug),
  );
  if (!card) return notFoundPage();

  const image = card.querySelector('img')?.getAttribute('src') || '';
  const title = card.querySelector('.woocommerce-loop-product__title')?.textContent.trim() || '';
  const category = card.querySelector('.product-cart-category')?.textContent.trim() || '';
  const price = card.querySelector('.price')?.textContent.replace(/\s+/g, ' ').trim() || '';

  return detailShell({
    image,
    title,
    badge: category,
    specs: price
      ? `<div class="rb-detail-spec"><span class="rb-detail-spec-title">قیمت</span><span class="rb-detail-spec-value">${price}</span></div>`
      : '',
    cart: true,
  });
}

export function getContent(pathname) {
  const route = decodeURIComponent(pathname);
  if (route === '/' || route === '') return homeContent;
  if (route === '/projects') return projectsSection;
  if (route === '/shop') return productsSection;
  if (route === '/blog') return blogSection;
  if (route === '/about') return teamSection + faqSection;
  if (route === '/contact') return contactPage();
  if (route === '/consultation') return consultationPage();
  if (route === '/cooperation') return cooperationPage();
  if (route === '/cart') return cartPage();
  if (route === '/login') return loginPage();
  if (route === '/404') return notFoundPage();
  if (route.startsWith('/project/')) return projectPage(route.replace('/project/', '').replace(/\/$/, ''));
  if (route.startsWith('/product/')) return productPage(route.replace('/product/', '').replace(/\/$/, ''));
  return notFoundPage();
}
