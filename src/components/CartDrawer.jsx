import { formatPrice } from './ProductCard.jsx';
import Icon from './Icons.jsx';
import { useOverlay } from './Modal.jsx';
import OrderSuggestions from './OrderSuggestions.jsx';

const deliveryFee = 35000;
const freeDeliveryFrom = 500000;

export default function CartDrawer({ open, onClose, items, onQty, onRemove, onAdd, onCheckout, onBrowse }) {
  useOverlay(open, onClose);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const delivery = subtotal === 0 || subtotal >= freeDeliveryFrom ? 0 : deliveryFee;
  const total = subtotal + delivery;

  return (
    <div className={`cart-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <button type="button" className="sheet-backdrop" onClick={onClose} aria-label="بستن سبد خرید" />
      <aside className="cart-drawer__panel" role="dialog" aria-modal="true" aria-label="سبد خرید">
        <header className="cart-drawer__head">
          <div>
            <h2>سبد خرید</h2>
            <span>{items.length.toLocaleString('fa-IR')} نوع غذا در سبد شما</span>
          </div>
          <button type="button" className="icon-btn icon-btn--ghost" onClick={onClose} aria-label="بستن">
            <Icon name="close" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon">
              <Icon name="cart" size={38} />
            </span>
            <h3>سبد خرید شما خالی است</h3>
            <p>از منوی متنوع نوال، غذای دلخواهتان را انتخاب کنید.</p>
            <button type="button" className="btn btn--primary" onClick={onBrowse}>
              مشاهده منو
              <Icon name="chevronLeft" size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(({ product, qty }) => (
                <article className="cart-item" key={product.id}>
                  <span className="cart-item__media">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </span>
                  <div className="cart-item__copy">
                    <h3>{product.name}</h3>
                    <span className="cart-item__price">{formatPrice(product.price)} تومان</span>
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => onQty(product.id, qty + 1)}
                        aria-label={`افزایش تعداد ${product.name}`}
                      >
                        <Icon name="plus" size={14} />
                      </button>
                      <span>{qty.toLocaleString('fa-IR')}</span>
                      <button
                        type="button"
                        onClick={() => onQty(product.id, qty - 1)}
                        aria-label={`کاهش تعداد ${product.name}`}
                      >
                        <Icon name="minus" size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-item__remove"
                    onClick={() => onRemove(product.id)}
                    aria-label={`حذف ${product.name} از سبد`}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </article>
              ))}
              <OrderSuggestions exclude={items.map((item) => item.product.id)} onAdd={onAdd} />
            </div>

            <div className="cart-summary">
              <div>
                <span>جمع غذاها</span>
                <b>{formatPrice(subtotal)} تومان</b>
              </div>
              <div>
                <span>هزینه ارسال</span>
                <b>{delivery === 0 ? 'رایگان' : `${formatPrice(delivery)} تومان`}</b>
              </div>
              {subtotal < freeDeliveryFrom && (
                <p className="cart-summary__hint">
                  <Icon name="truck" size={15} />
                  با {formatPrice(freeDeliveryFrom - subtotal)} تومان خرید بیشتر، ارسال رایگان می‌شود.
                </p>
              )}
              <div className="cart-summary__total">
                <span>مبلغ قابل پرداخت</span>
                <b>{formatPrice(total)} تومان</b>
              </div>
              <button type="button" className="btn btn--primary btn--block" onClick={onCheckout}>
                ادامه فرآیند خرید
                <Icon name="chevronLeft" size={18} />
              </button>
              <span className="cart-summary__secure">
                <Icon name="shield" size={16} />
                پرداخت امن و تضمین کیفیت
              </span>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
