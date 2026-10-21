import Icon from './Icons.jsx';
import { formatPrice } from './ProductCard.jsx';

export default function FoodCard({ product, onAdd, onOpen }) {
  return (
    <article className="food-card">
      <div className="food-card__media">
        <button
          type="button"
          className="food-card__thumb"
          onClick={() => onOpen(product)}
          aria-label={`مشاهده ${product.name}`}
        >
          <img src={product.image} alt={product.name} loading="lazy" />
        </button>
        {product.discount > 0 && (
          <span className="food-card__badge">
            {product.discount.toLocaleString('fa-IR')}٪
          </span>
        )}
      </div>

      <div className="food-card__info">
        <h3>
          <button type="button" onClick={() => onOpen(product)}>
            {product.name}
          </button>
        </h3>
        <span className="food-card__chef">
          <Icon name="cart" size={13} />
          پیشنهاد سرآشپز
        </span>
        <div className="food-card__price">
          {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
          <span className="food-card__now">
            {formatPrice(product.price)}
            <small>تومان</small>
          </span>
        </div>
      </div>

      <button
        type="button"
        className="food-card__add"
        onClick={() => onAdd(product)}
        aria-label={`افزودن ${product.name} به سبد`}
      >
        <Icon name="cart" size={19} />
      </button>
    </article>
  );
}
