import Icon from './Icons.jsx';

export default function DeliveryBanner({ onMenu }) {
  return (
    <section className="delivery-banner" aria-labelledby="delivery-banner-title">
      <div className="container">
        <div className="delivery-banner__panel">
          <span className="delivery-banner__dots" aria-hidden="true" />
          <span className="delivery-banner__leaf" aria-hidden="true" />

          <div className="delivery-banner__copy">
            <h2 id="delivery-banner-title">
              در کمترین زمان سفارش بده
              <img src="/assets/yellow-leaf.png" alt="" aria-hidden="true" />
            </h2>
            <p>در کمتر از ۱ دقیقه غذای دلخواهت رو انتخاب و پرداخت کن!</p>
          </div>

          <div className="delivery-banner__visual">
            <img src="/assets/promo-waiter.webp" alt="پیک سفارش رستوران نوال" loading="lazy" />
          </div>

          <div className="delivery-banner__actions">
            <button type="button" className="delivery-banner__cta" onClick={onMenu}>
              اکنون سفارش دهید
              <span className="delivery-banner__cta-icon">
                <Icon name="arrowUp" size={16} />
              </span>
            </button>
            <a className="delivery-banner__phone" href="tel:+982188776655">
              <b dir="ltr">۰۲۱-۸۸۷۷۶۶۵۵</b>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
