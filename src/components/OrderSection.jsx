import { orderSteps } from '../data/content.js';
import Icon from './Icons.jsx';

export default function OrderSection({ onMenu }) {
  return (
    <section className="order section" aria-labelledby="order-title">
      <div className="container">
        <div className="order__panel">
          <div className="order__copy">
            <span className="section-heading__eyebrow">
              <img src="/assets/title-symbol.webp" alt="" aria-hidden="true" />
              سفارش آسان
            </span>
            <h2 id="order-title">
              سفارش آنلاین در <em>۴ قدم</em> ساده
            </h2>
            <p>
              از انتخاب غذا تا تحویل درِ خانه؛ همه‌چیز سریع، امن و بدون دردسر. غذای داغ و تازه،
              دقیقاً همان‌طور که دوست دارید.
            </p>

            <div className="order__steps">
              {orderSteps.map((step) => (
                <div className="order-step" key={step.num}>
                  <span className="order-step__num">{step.num}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order__actions">
              <button type="button" className="btn btn--gold" onClick={onMenu}>
                همین حالا سفارش دهید
                <Icon name="chevronLeft" size={18} />
              </button>
              <a className="order__phone" href="tel:+982188776655">
                <span>
                  <small>سفارش تلفنی</small>
                  <b dir="ltr">۰۲۱-۸۸۷۷۶۶۵۵</b>
                </span>
                <Icon name="phone" size={22} />
              </a>
            </div>
          </div>

          <div className="order__visual">
            <span className="order__ring" aria-hidden="true" />
            <img src="/assets/promo-waiter.webp" alt="پیک سفارش رستوران نوال" loading="lazy" />
            <span className="order__badge">
              <Icon name="scooter" size={24} />
              <b>ارسال سریع</b>
              <small>۳۰ تا ۴۵ دقیقه</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
