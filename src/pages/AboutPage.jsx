import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import Button from '../components/Button.jsx';
import TeamBand from '../components/TeamBand.jsx';
import Faq from '../components/Faq.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { site } from '../content/site.js';

// Page copy, stats and calls to action come from the admin panel's page editor.
export default function AboutPage() {
  const { about } = site;
  const page = site.pages?.about || {};

  return (
    <>
      <PageMeta title={page.seoTitle} description={page.seoDescription} path="/about" />
      <PageSection>
        <PageHeading
          title={page.title || 'درباره ما'}
          subtitle={page.subtitle || 'About us'}
          icon={page.icon || 'luxina-icon-building-line'}
        />
        <div className="rb-about">
          <p className="rb-service-intro">{about.intro}</p>
          {(about.body || []).map((paragraph, index) => (
            <p className="rb-detail-text" key={index}>
              {paragraph}
            </p>
          ))}
          <div className="rb-about-stats">
            {(about.stats || []).map((stat) => (
              <div className="rb-about-stat" key={stat.label}>
                <span className="rb-about-stat-value">{stat.value}</span>
                <span className="rb-about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="rb-detail-actions">
            <Button href={page.ctaPrimaryHref || '/consultation'} variant="primary">
              {page.ctaPrimaryLabel || 'دریافت مشاوره'}
            </Button>
            <Button href={page.ctaSecondaryHref || '/projects'} variant="gray">
              {page.ctaSecondaryLabel || 'مشاهدهٔ پروژه‌ها'}
            </Button>
          </div>
        </div>
      </PageSection>
      <TeamBand />
      <Faq />
    </>
  );
}
