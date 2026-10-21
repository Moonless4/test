import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import Button from '../components/Button.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { findProject, projects, projectUrl } from '../content/projects.js';
import { findProjectDetails } from '../content/project-details.js';
import { findService } from '../content/services.js';
import NotFoundPage from './NotFoundPage.jsx';

const HERO_FACTS = ['تعداد طبقات', 'واحدها', 'زیربنا', 'سال شروع'];

function HeroMeta({ details }) {
  const rows = details.facts.filter(([title]) => HERO_FACTS.includes(title));
  if (!rows.length) return null;
  return (
    <div className="rb-project-meta">
      {rows.map(([title, value]) => (
        <div className="rb-project-meta-item" key={title}>
          <span className="rb-project-meta-title">{title}</span>
          <span className="rb-project-meta-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

function Progress({ value }) {
  if (typeof value !== 'number' || value >= 100) return null;
  return (
    <div className="rb-project-progress">
      <div className="rb-project-progress-head">
        <span>پیشرفت اجرا</span>
        <span className="rb-project-progress-value">{value}٪</span>
      </div>
      <div
        className="rb-project-progress-bar"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const { slug } = useParams();
  const [lightbox, setLightbox] = useState(null);
  const project = findProject(slug);
  const details = findProjectDetails(slug);

  if (!project) return <NotFoundPage />;

  const relatedProjects = projects.filter((item) => item.slug !== project.slug);
  const relatedServices = (details?.services || []).map(findService).filter(Boolean);

  return (
    <>
      <PageSection>
        <Breadcrumbs
          items={[
            { href: '/', label: 'خانه' },
            { href: '/projects', label: 'پروژه‌ها' },
            { label: project.title },
          ]}
        />
        <div className="rb-project-hero">
          <div className="rb-project-media-col">
            <figure className="rb-project-hero-media">
              <img src={project.image} alt={project.title} width="900" height="640" />
              {project.status ? (
                <span
                  className="rb-detail-badge rb-project-status"
                  style={{ background: project.statusColor || 'var(--primary-100)' }}
                >
                  {project.status}
                </span>
              ) : null}
            </figure>
            {details?.gallery?.length ? (
              <div className="rb-project-thumbs">
                {details.gallery.map((image, index) => (
                  <button
                    type="button"
                    className="rb-project-thumb"
                    key={image}
                    onClick={() => setLightbox(image)}
                    aria-label={`بزرگ‌نمایش تصویر ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${project.title} — تصویر ${index + 1}`}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="rb-project-hero-body">
            <span className="rb-project-eyebrow">
              <i className="luxinaicon luxina-icon-map-pin-2-fill" aria-hidden="true" />
              {details ? `${details.category} · ${details.location}` : 'پروژهٔ لوکسینا'}
            </span>
            <h1 className="rb-project-title">{project.title}</h1>
            {details?.lead ? <p className="rb-project-lead">{details.lead}</p> : null}
            {details ? <HeroMeta details={details} /> : null}
            <div className="rb-detail-actions">
              <Button href="/consultation" variant="primary">
                درخواست مشاوره
              </Button>
              <Button href="/contact" variant="gray">
                تماس با ما
              </Button>
            </div>
          </div>
        </div>
      </PageSection>

      {details ? (
        <PageSection>
          <PageHeading title="معرفی پروژه" subtitle="Project overview" icon="luxina-icon-building-line" />
          <div className="rb-project-overview">
            <div className="rb-project-main">
              {details.body.map((paragraph) => (
                <p className="rb-detail-text" key={paragraph.slice(0, 24)}>
                  {paragraph}
                </p>
              ))}
              <div className="rb-project-highlights-wrap">
                <span className="rb-project-subtitle">ویژگی‌های شاخص پروژه</span>
                <ul className="rb-project-highlights">
                  {details.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <aside className="rb-project-facts">
              <span className="rb-project-facts-title">مشخصات پروژه</span>
              <ul className="rb-project-facts-list">
                {details.facts.map(([title, value]) => (
                  <li key={title}>
                    <span className="rb-project-facts-label">{title}</span>
                    <span className="rb-project-facts-value">{value}</span>
                  </li>
                ))}
              </ul>
              <Progress value={details.progress} />
              <Button href="/consultation" variant="primary" className="rb-project-facts-button">
                درخواست بازدید
              </Button>
            </aside>
          </div>
        </PageSection>
      ) : null}

      {relatedServices.length ? (
        <PageSection>
          <PageHeading title="خدمات مرتبط" subtitle="Related services" icon="luxina-icon-pencil-ruler-2-fill" />
          <div className="rb-project-services">
            {relatedServices.map((service) => (
              <a className="rb-service-chip" href={`/services/${service.slug}`} key={service.slug}>
                <i className={`luxinaicon ${service.icon}`} aria-hidden="true" />
                <span className="rb-service-chip-body">
                  <span className="rb-service-chip-title">{service.title}</span>
                  <span className="rb-service-chip-subtitle">{service.subtitle}</span>
                </span>
                <i className="luxinaicon luxina-icon-arrow-left-line rb-service-chip-arrow" aria-hidden="true" />
              </a>
            ))}
          </div>
        </PageSection>
      ) : null}

      {relatedProjects.length ? (
        <PageSection>
          <PageHeading title="پروژه‌های دیگر" subtitle="More projects" icon="luxina-icon-building-line" />
          <div className="rb-related">
            {relatedProjects.map((item) => (
              <a className="rb-related-card" href={projectUrl(item)} key={item.slug}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <span className="rb-related-card-body">
                  <span className="rb-related-card-title">{item.title}</span>
                  {item.status ? <span className="rb-related-card-cat">{item.status}</span> : null}
                </span>
              </a>
            ))}
          </div>
        </PageSection>
      ) : null}

      <PageSection>
        <div className="rb-project-cta">
          <div className="rb-project-cta-text">
            <span className="rb-project-cta-title">پروژهٔ مشابهی در ذهن دارید؟</span>
            <p>تیم لوکسینا از مرحلهٔ ایده و طراحی تا تحویل کلید همراه شماست.</p>
          </div>
          <div className="rb-detail-actions">
            <Button href="/consultation" variant="tertiary">
              درخواست مشاوره
            </Button>
            <Button href="/projects" variant="gray">
              همه پروژه‌ها
            </Button>
          </div>
        </div>
      </PageSection>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
