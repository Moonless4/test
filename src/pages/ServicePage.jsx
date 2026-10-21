import { useParams } from 'react-router-dom';
import PageHero from '../components/editorial/PageHero.jsx';
import Band from '../components/editorial/Band.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import FeatureList from '../components/services/FeatureList.jsx';
import RelatedServices from '../components/services/RelatedServices.jsx';
import ServiceCta from '../components/services/ServiceCta.jsx';
import { findService } from '../content/services.js';
import NotFoundPage from './NotFoundPage.jsx';

// Secondary service page (/services/construction and siblings): a compact
// editorial layout that still matches the four flagship service pages.
export default function ServicePage() {
  const { slug } = useParams();
  const service = findService(slug);

  if (!service) return <NotFoundPage />;

  return (
    <div className="ed-page">
      <PageHero
        image="/img/services/lux-hero.jpg"
        eyebrow={`خدمات لوکسینا · ${service.subtitle}`}
        icon={service.icon}
        title={service.title}
        lead={service.intro}
        breadcrumbs={[{ href: '/', label: 'خانه' }, { href: '/services', label: 'خدمات' }, { label: service.title }]}
        size="compact"
        actions={[
          { label: 'درخواست مشاوره', href: '/consultation' },
          { label: 'همهٔ خدمات', href: '/services' },
        ]}
      />

      <Band tone="soft">
        <div className="ed-split">
          <div className="ed-split-body">
            <span className="sp-kicker">
              <span className="sp-kicker-rule" aria-hidden="true" />
              دربارهٔ این خدمت
            </span>
            <h2 className="ed-split-title">{service.title}</h2>
            {service.body.map((paragraph) => (
              <p className="ed-split-text" key={paragraph.slice(0, 24)}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="ed-split-media">
            <figure className="ed-split-figure">
              <img src="/img/services/interior-hero.jpg" alt={service.title} loading="lazy" width="900" height="1120" />
            </figure>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHead kicker="آنچه دریافت می‌کنید" title="خروجی این خدمت" />
        <FeatureList
          items={service.points.map((point, index) => ({
            no: String(index + 1).padStart(2, '۰'),
            title: point,
            text: '',
          }))}
          columns={1}
        />
      </Band>

      <Band tone="soft">
        <SectionHead kicker="خدمات مرتبط" title="ادامهٔ مسیر با لوکسینا" />
        <RelatedServices slug="interior-design" />
      </Band>

      <Band>
        <ServiceCta image="/img/services/plans-hero.jpg" text={service.intro} />
      </Band>
    </div>
  );
}
