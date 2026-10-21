import Breadcrumbs from '../Breadcrumbs.jsx';
import Button from '../Button.jsx';

// Full-bleed service hero: architectural photograph, deep teal overlay, and a
// floating facts card that overlaps the next band.
export default function ServiceHero({ service }) {
  return (
    <section className={`sp-hero sp-hero-${service.slug}`}>
      <div className="sp-hero-media" aria-hidden="true">
        <img src={service.image} alt="" width="1920" height="1080" />
      </div>
      <div className="sp-hero-overlay" aria-hidden="true" />

      <div className="sp-hero-inner">
        <Breadcrumbs
          items={[{ href: '/', label: 'خانه' }, { label: 'خدمات' }, { label: service.title }]}
        />

        <div className="sp-hero-copy">
          <span className="sp-eyebrow">
            <i className="luxinaicon luxina-icon-pencil-ruler-2-fill" aria-hidden="true" />
            {service.eyebrow}
          </span>
          <h1 className="sp-hero-title">{service.title}</h1>
          <p className="sp-hero-lead">{service.lead}</p>
          <div className="sp-hero-actions">
            <Button href="/consultation" variant="primary">
              درخواست مشاوره
            </Button>
            <a className="sp-hero-ghost" href="#service-content">
              <span>مشاهدهٔ جزئیات خدمت</span>
              <i className="luxinaicon luxina-icon-arrow-down-line" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="sp-hero-facts">
          {service.facts.map((fact) => (
            <div className="sp-hero-fact" key={fact.label}>
              <span className="sp-hero-fact-label">{fact.label}</span>
              <span className="sp-hero-fact-value">{fact.value}</span>
            </div>
          ))}
          <span className="sp-hero-fact-mark" aria-hidden="true">
            <i className="luxinaicon luxina-icon-pencil-ruler-fill" />
          </span>
        </div>
      </div>
    </section>
  );
}
