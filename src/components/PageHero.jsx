import Breadcrumbs from './Breadcrumbs.jsx';

export default function PageHero({ eyebrow, title, highlight, script, text, crumbs = [] }) {
  return (
    <section className="page-hero">
      <div className="container">
        <Breadcrumbs items={crumbs} />
        <div className="page-hero__panel">
          {eyebrow && <span className="page-hero__eyebrow">{eyebrow}</span>}
          <h1>
            {title} {highlight && <span>{highlight}</span>}
          </h1>
          {script && <span className="page-hero__script">{script}</span>}
          {text && <p>{text}</p>}
        </div>
      </div>
    </section>
  );
}
