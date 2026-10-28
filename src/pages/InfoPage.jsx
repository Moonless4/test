import { useSite } from '../site/SiteContent.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Icon from '../components/Icons.jsx';

export default function InfoPage({ slug, onMenu }) {
  const { content } = useSite();
  const page = content.pages?.[slug];

  if (!page) return null;

  return (
    <section className="page-section">
      <div className="container">
        <Breadcrumbs items={[{ label: 'صفحه اصلی', to: '/' }, { label: page.title }]} />

        <article className="info-page">
          <span className="section-heading__eyebrow">
            <img src="/assets/title-symbol.webp" alt="" aria-hidden="true" />
            {page.kicker}
          </span>
          <h1>{page.title}</h1>
          <p className="info-page__intro">{page.intro}</p>

          <div className="info-page__sections">
            {(page.sections || []).map((section, index) => (
              <div className="info-page__section" key={`${slug}-${index}`}>
                <h2>{section[0]}</h2>
                <p>{section[1]}</p>
              </div>
            ))}
          </div>

          <div className="info-page__footer">
            <button type="button" className="btn btn--primary" onClick={onMenu}>
              مشاهده منوی غذاها
              <Icon name="chevronLeft" size={18} />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
