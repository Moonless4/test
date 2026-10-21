import Icon from './Icons.jsx';
import { formatPrice } from './ProductCard.jsx';

export default function FoodCard({ product, onAdd, onOpen }) {
  return (
    <article className="food-card">
      <div className="food-card__top">
        <button
          type="button"
          className="food-card__thumb"
          onClick={() => onOpen(product)}
          aria-label={`مشاهده ${product.name}`}
        >
          <img src={product.image} alt={product.name} loading="lazy" />
        </button>

        <div className="food-card__info">
          <h3>
            <button type="button" onClick={() => onOpen(product)}>
              {product.name}
            </button>
          </h3>
          <p>{product.description}</p>
        </div>
      </div>

      <div className="food-card__foot">
        <div className="food-card__price">
          {(product.oldPrice || product.discount > 0) && (
            <span className="food-card__meta">
              {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
              {product.discount > 0 && (
                <span className="food-card__off">
                  {product.discount.toLocaleString('fa-IR')}٪
                </span>
              )}
            </span>
          )}
          <span className="food-card__now">
            {formatPrice(product.price)}
            <small>تومان</small>
          </span>
        </div>

        <span className="food-card__chef">
          <Icon name="chef" size={15} />
          پیشنهاد سرآشپز
        </span>

        <button
          type="button"
          className="food-card__add"
          onClick={() => onAdd(product)}
          aria-label={`افزودن ${product.name} به سبد`}
        >
          <Icon name="cart" size={18} />
        </button>
      </div>
    </article>
  );
}
