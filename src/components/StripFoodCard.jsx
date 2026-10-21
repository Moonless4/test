import Icon from './Icons.jsx';
import { formatPrice } from './ProductCard.jsx';

export default function StripFoodCard({ product, onAdd, onOpen }) {
  return (
    <article className="strip-card">
      <div className="strip-card__media">
        <button
          type="button"
          className="strip-card__thumb"
          onClick={() => onOpen(product)}
          aria-label={`مشاهده ${product.name}`}
        >
          <img src={product.image} alt={product.name} loading="lazy" />
        </button>
        {product.discount > 0 && (
          <span className="strip-card__badge">
            {product.discount.toLocaleString('fa-IR')}٪
          </span>
        )}
      </div>

      <div className="strip-card__body">
        <h3>
          <button type="button" onClick={() => onOpen(product)}>
            {product.name}
          </button>
        </h3>
        <span className="strip-card__chef">
          <Icon name="cart" size={13} />
          پیشنهاد سرآشپز
        </span>
        <span className="strip-card__rule" aria-hidden="true" />
        <div className="strip-card__price">
          {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
          <span className="strip-card__now">
            {formatPrice(product.price)}
            <small>تومان</small>
          </span>
        </div>
      </div>

      <button
        type="button"
        className="strip-card__add"
        onClick={() => onAdd(product)}
        aria-label={`افزودن ${product.name} به سبد`}
      >
        <Icon name="cart" size={18} />
      </button>
    </article>
  );
}
