import { useAccount } from '../account/AccountContext.jsx';
import Icon from './Icons.jsx';
import { formatPrice } from './ProductCard.jsx';

// Quick look at the cart that slides out from the side of the header button.
// The actual checkout happens on the cart page, so the button only sends the
// visitor there — after making sure they have an account.
export default function CartPreview({ items, onCheckout, onRequireAccount, onFinish }) {
  const { isAuthenticated } = useAccount();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const handleCheckout = () => {
    onFinish();
    if (isAuthenticated) onCheckout();
    else onRequireAccount();
  };

  return (
    <div className="cart-preview" role="dialog" aria-label="پیش‌نمایش سبد خرید">
      <header className="cart-preview__head">
        <b>سبد خرید</b>
        <span>{count.toLocaleString('fa-IR')} آیتم</span>
      </header>

      <ul className="cart-preview__list">
        {items.map(({ product, qty }) => (
          <li key={product.id}>
            <img src={product.image} alt="" loading="lazy" />
            <span className="cart-preview__copy">
              <b>{product.name}</b>
              <small>
                {qty.toLocaleString('fa-IR')} × {formatPrice(product.price)} تومان
              </small>
            </span>
            <span className="cart-preview__price">{formatPrice(product.price * qty)}</span>
          </li>
        ))}
      </ul>

      <div className="cart-preview__total">
        <span>مبلغ اقلام</span>
        <b>{formatPrice(subtotal)} تومان</b>
      </div>

      {!isAuthenticated && (
        <p className="cart-preview__note">برای تسویه حساب ابتدا یک حساب کاربری بسازید.</p>
      )}

      <div className="cart-preview__actions">
        <button type="button" className="btn btn--primary" onClick={handleCheckout}>
          تسویه حساب
          <Icon name="chevronLeft" size={17} />
        </button>
        <button type="button" className="btn btn--outline" onClick={onCheckout}>
          مشاهده سبد خرید
        </button>
      </div>
    </div>
  );
}
