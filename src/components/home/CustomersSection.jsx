import { Fragment } from 'react';
import { site } from '../../content/site.js';

// Partner logos band ("افتخارات همکاری"). The placeholder cell keeps the title
// badge inside the grid on desktop.
export default function CustomersSection() {
  const logos = site.clients || [];

  return (
    <section className="hp-section hp-customers">
      <div className="hp-inner">
        <div className="luxina_customers_container">
          <div className="luxina_customers_title-wrap title-in-items">
            <span className="luxina_customers_title-bg" aria-hidden="true" />
            <i className="luxina-icon-user-star-fill luxina_customers_title-icon" aria-hidden="true" />
            <span className="luxina_customers_title-text">افتخارات همکاری</span>
            <span className="luxina_customers_title-subtitle">Partnership honors</span>
          </div>

          <div
            className="luxina_customers_items"
            style={{ '--desktop-cols': 5, '--tablet-cols': 4, '--mobile-cols': 2 }}
          >
            {logos.map((logo, index) => (
              <Fragment key={`${logo.src}-${index}`}>
                <div className="luxina_customers_item">
                  <img
                    className="luxina_customers_item-img"
                    src={logo.src}
                    alt=""
                    decoding="async"
                    loading="lazy"
                  />
                  <span className={`luxina_customers_item-square ${logo.square || ''}`.trim()} aria-hidden="true" />
                </div>
                {index === 1 ? (
                  <span
                    className="luxina_customers_item title-placeholder show-only-desktop desktop-first-row"
                    aria-hidden="true"
                  >
                    <span className="luxina_customers_item-square" />
                  </span>
                ) : null}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
