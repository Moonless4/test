import { useRef } from 'react';
import ProductCard from './ProductCard.jsx';
import SectionHeading from './SectionHeading.jsx';
import Icon from './Icons.jsx';

export default function FeaturedProducts({ products, onAdd, onOpen, onViewAll }) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 720);
    el.scrollBy({ left: dir * -amount, behavior: 'smooth' });
  };

  return (
    <section className="featured section" id="specials" aria-labelledby="specials-title">
      <div className="container">
        <div className="section-heading-wrap title-accent" id="specials-title">
          <SectionHeading
            eyebrow="پیشنهاد ویژه"
            title="منوی محبوب امروز"
            script="Today’s Special"
            text="تازه‌ترین و محبوب‌ترین طعم‌های نوال، انتخاب‌شده توسط سرآشپز."
          >
            <div className="carousel-arrows">
              <button type="button" className="round-arrow" onClick={() => scroll(1)} aria-label="محصولات قبلی">
                <Icon name="chevronRight" size={19} />
              </button>
              <button type="button" className="round-arrow" onClick={() => scroll(-1)} aria-label="محصولات بعدی">
                <Icon name="chevronLeft" size={19} />
              </button>
            </div>
            <button type="button" className="text-link text-link--button" onClick={onViewAll}>
              مشاهده همه
              <Icon name="chevronLeft" size={17} />
            </button>
          </SectionHeading>
        </div>

        <div className="specials-band">
          <div className="product-track" ref={trackRef}>
            {products.map((product) => (
              <div className="product-track__item" key={product.id}>
                <ProductCard product={product} onAdd={onAdd} onOpen={onOpen} />
              </div>
            ))}
          </div>
        </div>

        <img className="featured__dots" src="/assets/yellow-dots.png" alt="" aria-hidden="true" />
        <img className="featured__leaf" src="/assets/yellow-leaf.png" alt="" aria-hidden="true" />
      </div>
    </section>
  );
}
