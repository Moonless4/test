import { Link } from 'react-router-dom';
import { relatedServiceLinks } from '../../content/service-pages.js';

// The other three services, shown at the bottom of every service detail page.
export default function RelatedServices({ slug }) {
  const items = relatedServiceLinks(slug);

  return (
    <div className="sp-related">
      {items.map((item) => (
        <Link className="sp-related-card" to={`/services/${item.slug}`} key={item.slug}>
          <img src={item.image} alt="" loading="lazy" width="900" height="640" />
          <span className="sp-related-veil" aria-hidden="true" />
          <span className="sp-related-body">
            <span className="sp-related-subtitle">{item.subtitle}</span>
            <span className="sp-related-title">{item.title}</span>
            <span className="sp-related-more">
              مشاهدهٔ خدمت
              <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
