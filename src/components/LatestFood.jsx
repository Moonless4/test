import { latestProducts } from '../data/content.js';
import SectionHeading from './SectionHeading.jsx';
import Icon from './Icons.jsx';
import { formatPrice } from './ProductCard.jsx';

export default function LatestFood({ products, onOpen, onAdd }) {
  const items = latestProducts
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  return (
    <section className="latest section" aria-labelledby="latest-title">
      <div className="container">
        <div className="latest__panel">
          <img className="latest__bg" src="/assets/on-sale-bg.png" alt="" aria-hidden="true" />
          <div id="latest-title">
            <SectionHeading
              eyebrow="تازه از آشپزخانه"
              title="جدیدترین غذاهای منوی ما"
              script="Fresh & New"
              text="طعم‌های تازه‌ای که همین هفته به منوی نوال اضافه شده‌اند."
            />
          </div>

          <div className="latest__track">
            {items.map((product) => (
              <article className="latest-card" key={product.id}>
                <button
                  type="button"
                  className="latest-card__media"
                  onClick={() => onOpen(product)}
                  aria-label={`مشاهده ${product.name}`}
                >
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.discount > 0 && (
                    <span className="latest-card__discount">
                      {product.discount.toLocaleString('fa-IR')}٪ تخفیف
                    </span>
                  )}
                </button>
                <div className="latest-card__body">
                  <span className="latest-card__cat">{product.categoryLabel}</span>
                  <h3>
                    <button type="button" onClick={() => onOpen(product)}>
                      {product.name}
                    </button>
                  </h3>
                  <div className="latest-card__footer">
                    <span className="price__now">
                      {formatPrice(product.price)}
                      <small>تومان</small>
                    </span>
                    <button type="button" className="latest-card__add" onClick={() => onAdd(product)} aria-label={`افزودن ${product.name} به سبد`}>
                      <Icon name="plus" size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
