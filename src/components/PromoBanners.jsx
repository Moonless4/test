import { promoBanners } from '../data/content.js';
import Icon from './Icons.jsx';

export default function PromoBanners({ onMenu, onProduct, onReserve }) {
  const handle = (action) => {
    if (action === 'menu') onMenu();
    else if (action === 'reserve') onReserve();
    else if (action.startsWith('product:')) onProduct(action.split(':')[1]);
  };

  return (
    <section className="promos section" aria-label="پیشنهادها و جشنواره‌ها">
      <div className="container promo-grid">
        {promoBanners.map((banner) => (
          <article className={`promo-card promo-card--${banner.size}`} key={banner.id}>
            <img className="promo-card__bg" src={banner.image} alt="" loading="lazy" />
            <span className="promo-card__wash" aria-hidden="true" />
            <span className="promo-card__ring" aria-hidden="true" />
            <div className="promo-card__body">
              <span className="promo-card__kicker">{banner.kicker}</span>
              <h3>{banner.title}</h3>
              <p>{banner.text}</p>
              <button type="button" className="promo-card__cta" onClick={() => handle(banner.action)}>
                {banner.cta}
                <Icon name="chevronLeft" size={17} />
              </button>
            </div>
            {banner.id === 'festival' && (
              <span className="promo-card__stamp">
                <b>۳۰٪</b>
                <small>تخفیف</small>
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
