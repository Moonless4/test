import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Band from '../components/editorial/Band.jsx';
import WorkCard from '../components/editorial/WorkCard.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import ServiceCta from '../components/services/ServiceCta.jsx';
import Button from '../components/Button.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { findProject, projects } from '../content/projects.js';
import { findProjectDetails } from '../content/project-details.js';
import { findService } from '../content/services.js';
import NotFoundPage from './NotFoundPage.jsx';

const HERO_FACTS = ['کاربری', 'سال شروع', 'زیربنا', 'تعداد طبقات'];

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

// Project detail: an editorial case study — photographic hero, the concept and
// challenge, a facts sheet, the gallery and the related work.
export default function ProjectPage() {
  const { slug } = useParams();
  const [lightbox, setLightbox] = useState(null);
  const project = findProject(slug);
  const details = findProjectDetails(slug);

  if (!project) return <NotFoundPage />;

  const heroFacts = details ? details.facts.filter(([title]) => HERO_FACTS.includes(title)) : [];
  const related = projects.filter((item) => item.slug !== project.slug).slice(0, 3);
  const services = (details?.services || []).map(findService).filter(Boolean);

  return (
    <div className="ed-page">
      <section className="ed-case-hero">
        <div className="ed-case-hero-media" aria-hidden="true">
          <img src={project.image} alt="" width="1920" height="1080" />
        </div>
        <div className="ed-case-hero-veil" aria-hidden="true" />

        <div className="ed-case-hero-inner">
          <Breadcrumbs
            items={[
              { href: '/', label: 'خانه' },
              { href: '/projects', label: 'پروژه‌ها' },
              { label: project.title },
            ]}
          />

          <div className="ed-case-hero-copy">
            <div className="ed-case-hero-eyebrow">
              {details?.category ? <span className="sp-eyebrow">{details.category}</span> : null}
              {project.status ? (
                <span className="ed-case-status" style={{ background: project.statusColor || 'var(--primary-100)' }}>
                  {project.status}
                </span>
              ) : null}
            </div>

            <h1 className="ed-case-title">{project.title}</h1>

            {details?.lead ? <p className="ed-case-lead">{details.lead}</p> : null}

            <div className="ed-case-actions">
              <Button href="/consultation">درخواست مشاوره</Button>
              {details?.location ? (
                <span className="ed-case-location">
                  <i className="luxinaicon luxina-icon-map-pin-2-fill" aria-hidden="true" />
                  {details.location}
                </span>
              ) : null}
            </div>
          </div>

          {heroFacts.length ? (
            <div className="sp-hero-facts">
              {heroFacts.map(([title, value]) => (
                <div className="sp-hero-fact" key={title}>
                  <span className="sp-hero-fact-label">{title}</span>
                  <span className="sp-hero-fact-value">{value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {details ? (
        <Band tone="soft">
          <div className="ed-case-overview">
            <div className="ed-prose">
              <span className="sp-kicker">
                <span className="sp-kicker-rule" aria-hidden="true" />
                معرفی پروژه
              </span>
              <p className="ed-prose-lead">{details.lead}</p>
              {details.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}

              <h2 className="ed-case-subtitle">ویژگی‌های شاخص پروژه</h2>
              <ul className="ed-prose-list">
                {details.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <aside className="ed-article-aside">
              <span className="ed-article-aside-title">مشخصات پروژه</span>
              <div className="ed-facts">
                {details.facts.map(([title, value]) => (
                  <div className="ed-facts-row" key={title}>
                    <span className="ed-facts-label">{title}</span>
                    <span className="ed-facts-value">{value}</span>
                  </div>
                ))}
              </div>
              <Progress value={details.progress} />
              <Button href="/consultation" variant="primary" className="rb-project-facts-button">
                درخواست بازدید
              </Button>
            </aside>
          </div>
        </Band>
      ) : null}

      {details?.gallery?.length ? (
        <Band>
          <SectionHead
            kicker="گالری پروژه"
            title="نماها و جزئیات اجرا"
            text="برای دیدن تصویر در اندازهٔ کامل، روی هر قاب کلیک کنید."
          />
          <div className="sp-gallery">
            {details.gallery.map((image, index) => (
              <button
                type="button"
                className={`sp-gallery-item sp-gallery-item-${index + 1}`}
                key={image}
                onClick={() => setLightbox(image)}
                aria-label={`بزرگ‌نمایش تصویر ${index + 1}`}
              >
                <img src={image} alt={`${project.title} — تصویر ${index + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        </Band>
      ) : null}

      {services.length ? (
        <Band tone="soft">
          <SectionHead kicker="خدمات این پروژه" title="مسیر اجرای پروژه" />
          <div className="rb-project-services">
            {services.map((service) => (
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
        </Band>
      ) : null}

      <Band>
        <div className="ed-related-head">
          <SectionHead kicker="پروژه‌های مرتبط" title="کارهای دیگر لوکسینا" />
          <a className="ed-more-link" href="/projects">
            همهٔ پروژه‌ها
            <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
          </a>
        </div>
        <div className="ed-portfolio ed-portfolio--pair">
          {related.map((item, index) => (
            <WorkCard
              key={item.slug}
              project={item}
              details={findProjectDetails(item.slug)}
              index={index}
              size="third"
              reveal={false}
            />
          ))}
        </div>
      </Band>

      <Band>
        <ServiceCta
          image={project.image}
          title="پروژه‌ای در همین مقیاس در ذهن دارید؟"
          text="تیم لوکسینا از بررسی زمین و امکان‌سنجی تا تحویل کلید همراه شماست. قدم اول یک جلسهٔ مشاورهٔ کوتاه است."
        />
      </Band>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
