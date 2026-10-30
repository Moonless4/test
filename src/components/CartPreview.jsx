import { useAccount } from '../account/AccountContext.jsx';
import { useRouter } from '../router.jsx';
import Icon from './Icons.jsx';
import { formatPrice } from './ProductCard.jsx';

// Quick look at the cart that slides out from the side of the header button.
// The actual checkout happens on the cart page, so the button only sends the
// visitor there — after making sure they have an account.
export default function CartPreview({ items, onCheckout, onRequireAccount, onFinish }) {
  const { isAuthenticated } = useAccount();
  const { navigate } = useRouter();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const handleCheckout = () => {
    onFinish();
    if (isAuthenticated) onCheckout();
    else onRequireAccount();
  };

  const handleMenu = () => {
    onFinish();
    navigate('/menu');
  };

  return (
    <div className="cart-preview" role="dialog" aria-label="پیش‌نمایش سبد خرید">
      <header className="cart-preview__head">
        <b>سبد خرید</b>
        <span>{count === 0 ? 'خالی' : `${count.toLocaleString('fa-IR')} آیتم`}</span>
      </header>

      {count === 0 ? (
        <div className="cart-preview__empty">
          <span className="cart-preview__empty-icon">
            <Icon name="cart" size={24} />
          </span>
          <b>سبد خرید شما خالی است</b>
          <small>غذای دلخواهتان را از منوی آترین انتخاب کنید.</small>
          <button type="button" className="btn btn--primary" onClick={handleMenu}>
            مشاهده منو
            <Icon name="chevronLeft" size={17} />
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
