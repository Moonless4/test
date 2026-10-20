// Project detail page. Card data (title, image, status) comes from the projects
// grid captured from the reference page; the rest of the content lives in
// `content/project-details.js`.
import { featuredProjects } from '../content/projects.js';
import { findProjectDetails } from '../content/project-details.js';
import { findService } from '../content/services.js';
import { heading, parse, section, sectionWith } from './blocks.js';

const projectsSection = sectionWith('projects');

const slugOf = (href) =>
  decodeURIComponent(href || '')
    .replace('/project/', '')
    .replace(/\/$/, '');

const cardProjects = () => {
  const doc = parse(projectsSection);
  return Array.from(doc.querySelectorAll('a.luxina_project_inner')).map((anchor) => {
    const href = anchor.getAttribute('href') || '';
    const status = anchor.querySelector('.luxina_project_status');
    return {
      href,
      slug: slugOf(href),
      title: anchor.querySelector('.luxina_project_name')?.textContent.trim() || '',
      image: anchor.querySelector('img')?.getAttribute('src') || '',
      status: status?.textContent.trim() || '',
      statusColor: status?.getAttribute('style')?.replace('background:', '') || '',
    };
  });
};

const featuredToCard = (project) => ({
  href: `/project/${project.slug}/`,
  slug: project.slug,
  title: project.title,
  image: project.image,
  status: project.status,
  statusColor: project.statusColor,
});

const allProjects = () => [...cardProjects(), ...featuredProjects.map(featuredToCard)];

const breadcrumb = (title) => `
<nav class="rb-breadcrumb" aria-label="مسیر صفحه">
  <a href="/">خانه</a>
  <i class="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true"></i>
  <a href="/projects">پروژه‌ها</a>
  <i class="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true"></i>
  <span aria-current="page">${title}</span>
</nav>`;

const statusBadge = (project) =>
  project.status
    ? `<span class="rb-detail-badge rb-project-status" style="background:${project.statusColor || 'var(--primary-100)'}">${project.status}</span>`
    : '';

const heroMeta = (details) => {
  const picks = ['تعداد طبقات', 'واحدها', 'زیربنا', 'سال شروع'];
  const rows = details.facts.filter(([title]) => picks.includes(title));
  if (!rows.length) return '';
  return `<div class="rb-project-meta">${rows
    .map(
      ([title, value]) => `<div class="rb-project-meta-item">
        <span class="rb-project-meta-title">${title}</span>
        <span class="rb-project-meta-value">${value}</span>
      </div>`,
    )
    .join('')}</div>`;
};

const hero = (project, details) => `
<div class="rb-project-hero">
  <figure class="rb-project-hero-media">
    <img src="${project.image}" alt="${project.title}" width="900" height="640">
    ${statusBadge(project)}
  </figure>
  <div class="rb-project-hero-body">
    <span class="rb-project-eyebrow">
      <i class="luxinaicon luxina-icon-map-pin-2-fill" aria-hidden="true"></i>
      ${details ? `${details.category} · ${details.location}` : 'پروژهٔ لوکسینا'}
    </span>
    <h1 class="rb-project-title">${project.title}</h1>
    <p class="rb-project-lead">${details?.lead || ''}</p>
    ${details ? heroMeta(details) : ''}
    <div class="rb-detail-actions">
      <a href="/consultation" class="button button-start rounded button-primary"><span class="button-text">درخواست مشاوره</span></a>
      <a href="/contact" class="button button-start rounded button-gray"><span class="button-text">تماس با ما</span></a>
    </div>
  </div>
</div>`;

const progressBlock = (progress) => {
  if (typeof progress !== 'number' || progress >= 100) return '';
  return `<div class="rb-project-progress">
    <div class="rb-project-progress-head">
      <span>پیشرفت اجرا</span>
      <span class="rb-project-progress-value">${progress}٪</span>
    </div>
    <div class="rb-project-progress-bar" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
      <span style="width:${progress}%"></span>
    </div>
  </div>`;
};

const overview = (project, details) => {
  if (!details) return '';
  return section(
    heading('معرفی پروژه', 'Project overview', 'luxina-icon-building-line') +
      `<div class="rb-project-overview">
        <div class="rb-project-main">
          ${details.body.map((paragraph) => `<p class="rb-detail-text">${paragraph}</p>`).join('')}
          <div class="rb-project-highlights-wrap">
            <span class="rb-project-subtitle">ویژگی‌های شاخص پروژه</span>
            <ul class="rb-project-highlights">
              ${details.highlights.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        </div>
        <aside class="rb-project-facts">
          <span class="rb-project-facts-title">مشخصات پروژه</span>
          <ul class="rb-project-facts-list">
            ${details.facts
              .map(
                ([title, value]) => `<li>
                  <span class="rb-project-facts-label">${title}</span>
                  <span class="rb-project-facts-value">${value}</span>
                </li>`,
              )
              .join('')}
          </ul>
          ${progressBlock(details.progress)}
          <a href="/consultation" class="button button-start rounded button-primary rb-project-facts-button">
            <span class="button-text">درخواست بازدید</span>
          </a>
        </aside>
      </div>`,
  );
};

const gallery = (project, details) => {
  if (!details?.gallery?.length) return '';
  return section(
    heading('گالری تصاویر', 'Gallery', 'luxina-icon-grid-fill') +
      `<div class="rb-gallery">
        ${details.gallery
          .map(
            (image, index) => `<button type="button" class="rb-gallery-item" data-full="${image}" aria-label="بزرگ‌نمایش تصویر ${index + 1}">
              <img src="${image}" alt="${project.title} — تصویر ${index + 1}" loading="lazy">
            </button>`,
          )
          .join('')}
      </div>
      <div class="rb-lightbox" hidden>
        <button type="button" class="rb-lightbox-close" aria-label="بستن تصویر">
          <i class="luxinaicon luxina-icon-close" aria-hidden="true"></i>
        </button>
        <img alt="${project.title}">
      </div>`,
  );
};

const relatedServices = (details) => {
  const items = (details?.services || []).map(findService).filter(Boolean);
  if (!items.length) return '';
  return section(
    heading('خدمات مرتبط', 'Related services', 'luxina-icon-pencil-ruler-2-fill') +
      `<div class="rb-project-services">
        ${items
          .map(
            (service) => `<a class="rb-service-chip" href="/services/${service.slug}">
              <i class="luxinaicon ${service.icon}" aria-hidden="true"></i>
              <span class="rb-service-chip-body">
                <span class="rb-service-chip-title">${service.title}</span>
                <span class="rb-service-chip-subtitle">${service.subtitle}</span>
              </span>
              <i class="luxinaicon luxina-icon-arrow-left-line rb-service-chip-arrow" aria-hidden="true"></i>
            </a>`,
          )
          .join('')}
      </div>`,
  );
};

const otherProjects = (slug) => {
  const items = allProjects().filter((project) => project.slug !== slug);
  if (!items.length) return '';
  return section(
    heading('پروژه‌های دیگر', 'More projects', 'luxina-icon-building-line') +
      `<div class="rb-related">${items
        .map(
          (project) => `<a class="rb-related-card" href="${project.href}">
            <img src="${project.image}" alt="${project.title}" loading="lazy">
            <span class="rb-related-card-body">
              <span class="rb-related-card-title">${project.title}</span>
              ${project.status ? `<span class="rb-related-card-cat">${project.status}</span>` : ''}
            </span>
          </a>`,
        )
        .join('')}</div>`,
  );
};

const ctaBand = () => section(
  `<div class="rb-project-cta">
    <div class="rb-project-cta-text">
      <span class="rb-project-cta-title">پروژهٔ مشابهی در ذهن دارید؟</span>
      <p>تیم لوکسینا از مرحلهٔ ایده و طراحی تا تحویل کلید همراه شماست.</p>
    </div>
    <div class="rb-detail-actions">
      <a href="/consultation" class="button button-start rounded button-tertiary"><span class="button-text">درخواست مشاوره</span></a>
      <a href="/projects" class="button button-start rounded button-gray"><span class="button-text">همه پروژه‌ها</span></a>
    </div>
  </div>`,
);

export function projectPage(slug) {
  const project = allProjects().find((item) => item.slug === slug);
  const details = findProjectDetails(slug);

  if (!project) return null;

  return (
    section(breadcrumb(project.title) + hero(project, details)) +
    overview(project, details) +
    gallery(project, details) +
    relatedServices(details) +
    otherProjects(slug) +
    ctaBand()
  );
}
