import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import Button from '../components/Button.jsx';
import TeamBand from '../components/TeamBand.jsx';
import Faq from '../components/Faq.jsx';
import { site } from '../content/site.js';

export default function AboutPage() {
  const { about } = site;

  return (
    <>
      <PageSection>
        <PageHeading title="درباره ما" subtitle="About us" icon="luxina-icon-building-line" />
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
            <Button href="/consultation" variant="primary">
              دریافت مشاوره
            </Button>
            <Button href="/projects" variant="gray">
              مشاهدهٔ پروژه‌ها
            </Button>
          </div>
        </div>
      </PageSection>
      <TeamBand />
      <Faq />
    </>
  );
}
