import { useCallback, useState } from 'react';
import Icon from './Icons.jsx';

const formatPrice = (value) => value.toLocaleString('fa-IR');

export default function Hero({ products, slides: heroSlides, onProduct, onReserve }) {
  const slides = heroSlides
    .map((slide) => {
      const product = products.find((item) => item.id === slide.id);
      return product ? { ...product, image: slide.image } : null;
    })
    .filter(Boolean);
  const [active, setActive] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (dir) => setActive((current) => (current + dir + count) % count),
    [count]
  );

  const activeProduct = slides[active];

  return (
    <section className="hero" id="home" aria-label="خوش‌آمدگویی رستوران نوال">
      <div className="hero__inner">
        <div className="hero__bg" aria-hidden="true">
          <img className="hero__frame" src="/assets/hero-bg.png" alt="" />
        </div>

        <img className="hero__leaf" src="/assets/yellow-leaf.png" alt="" aria-hidden="true" />
        <img className="hero__dots hero__dots--one" src="/assets/purple-dots.png" alt="" aria-hidden="true" />
        <img className="hero__dots hero__dots--two" src="/assets/yellow-dots.png" alt="" aria-hidden="true" />

        <div className="hero__content">
          <p className="hero__kicker">
            <span />
            تجربه‌ای متفاوت از غذای اصیل
            <span />
          </p>
          <h1 className="hero__title">
            جایی که <em>طعم</em> و <b>کیفیت</b> کنار
            <br />
            هـــم <strong>کامل می‌شوند</strong>
          </h1>
          <p className="hero__sub">
            رستوران نوال؛ طعم‌های تازه، دستورهای ویژه و لحظه‌هایی که به یاد می‌مانند.
          </p>
          <div className="hero__cta">
            <a className="btn btn--gold" href="#menu">
              سفارش آنلاین
              <Icon name="chevronLeft" size={18} />
            </a>
            <button type="button" className="btn btn--ghost-light" onClick={onReserve}>
              <Icon name="calendar" size={18} />
              رزرو میز
            </button>
          </div>
        </div>

        <div className="hero__carousel" aria-label="پیشنهادهای ویژه امروز">
          <div className="food-carousel" role="group" aria-roledescription="carousel">
            <div className="food-carousel__stage">
              <span className="food-carousel__glow" aria-hidden="true" />
              {slides.map((product, index) => {
                let diff = index - active;
                if (diff > count / 2) diff -= count;
                if (diff < -count / 2) diff += count;
                const abs = Math.abs(diff);
                const scale = abs === 0 ? 1 : abs === 1 ? 0.82 : 0.68;
                const offsetMul = diff === 0 ? 0 : Math.sign(diff) * (abs >= 2 ? 1.61 : 0.9);
                return (
                  <button
                    type="button"
                    key={product.id}
                    className={`dish ${abs === 0 ? 'is-active' : ''}`}
                    style={{
                      '--offset-mul': offsetMul,
                      '--scale': scale,
                      zIndex: 10 - abs,
                    }}
                    onClick={() => (abs === 0 ? onProduct(product) : setActive(index))}
                    aria-label={`${product.name}${abs === 0 ? ' - مشاهده محصول' : ''}`}
                    aria-current={abs === 0}
                    tabIndex={abs === 0 ? 0 : -1}
                  >
                    <span className="dish__shadow" aria-hidden="true" />
                    <img src={product.image} alt={product.name} loading={index > 1 ? 'lazy' : 'eager'} />
                    {product.discount > 0 && (
                      <span className="hero__discount" aria-hidden="true">
                        <b>{product.discount.toLocaleString('fa-IR')}٪</b>
                        <small>تخفیف</small>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="food-carousel__caption">
              <div className="food-carousel__meta">
                <strong>{activeProduct?.name}</strong>
                <span>{formatPrice(activeProduct?.price || 0)} تومان</span>
              </div>
              <button
                type="button"
                className="food-carousel__add"
                onClick={() => activeProduct && onProduct(activeProduct)}
              >
                مشاهده و سفارش
                <Icon name="chevronLeft" size={16} />
              </button>
            </div>

            <div className="food-carousel__controls">
              <button type="button" className="round-arrow" onClick={() => go(-1)} aria-label="پیشنهاد قبلی">
                <Icon name="chevronRight" size={20} />
              </button>
              <div className="food-carousel__dots" role="tablist" aria-label="اسلایدها">
                {slides.map((product, index) => (
                  <button
                    type="button"
                    key={product.id}
                    role="tab"
                    aria-selected={index === active}
                    className={index === active ? 'is-active' : ''}
                    onClick={() => setActive(index)}
                    aria-label={product.name}
                  />
                ))}
              </div>
              <button type="button" className="round-arrow" onClick={() => go(1)} aria-label="پیشنهاد بعدی">
                <Icon name="chevronLeft" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
