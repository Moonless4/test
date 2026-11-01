import Icon from './Icons.jsx';
import { useAccount } from '../account/AccountContext.jsx';

export const formatPrice = (value) => Number(value || 0).toLocaleString('fa-IR');

export default function ProductCard({ product, onAdd, onOpen, onToast, rating }) {
  const { isFavorite, toggleFavorite } = useAccount();
  const favorite = isFavorite(product.id);
  const open = () => onOpen(product);

  return (
    <article className="product-card" onClick={open}>
      <div className="product-card__media">
        <span className="product-card__halo" aria-hidden="true" />
        <button
          type="button"
          className="product-card__image"
          onClick={(event) => {
            event.stopPropagation();
            open();
          }}
          aria-label={`مشاهده ${product.name}`}
        >
          <img src={product.image} alt={product.name} loading="lazy" />
        </button>
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
        {product.discount > 0 && (
          <span className="product-card__discount">{product.discount.toLocaleString('fa-IR')}٪</span>
        )}
        <button
          type="button"
          className="product-card__quick"
          onClick={(event) => {
            event.stopPropagation();
            open();
          }}
          aria-label={`جزئیات ${product.name}`}
        >
          <Icon name="plus" size={17} />
        </button>
        <button
          type="button"
          className={`product-card__fav ${favorite ? 'is-on' : ''}`}
          aria-label={favorite ? `حذف ${product.name} از علاقه‌مندی‌ها` : `افزودن ${product.name} به علاقه‌مندی‌ها`}
          aria-pressed={favorite}
          onClick={(event) => {
            event.stopPropagation();
            const added = toggleFavorite(product.id);
            onToast?.(
              added
                ? `${product.name} به علاقه‌مندی‌ها اضافه شد.`
                : `${product.name} از علاقه‌مندی‌ها حذف شد.`
            );
          }}
        >
          <Icon name="heart" size={16} filled={favorite} />
        </button>
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__cat">{product.categoryLabel}</span>
          {rating && (
            <span
              className="product-card__rating"
              aria-label={`امتیاز ${rating.average.toLocaleString('fa-IR')} از ۵`}
            >
              <Icon name="star" size={13} filled />
              {rating.average.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <small>({rating.reviews.toLocaleString('fa-IR')})</small>
            </span>
          )}
        </div>
        <h3>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              open();
            }}
          >
            {product.name}
          </button>
        </h3>
        <p>{product.description}</p>
        <span className="product-card__rule" aria-hidden="true" />
        <div className="product-card__footer">
          <div className="price">
            <span className="price__now">
              {formatPrice(product.price)}
              <small>تومان</small>
            </span>
            {product.oldPrice && <del className="price__old">{formatPrice(product.oldPrice)}</del>}
          </div>
          <button
            type="button"
            className="add-btn"
            onClick={(event) => {
              event.stopPropagation();
              onAdd(product);
            }}
          >
            <Icon name="cart" size={17} />
            افزودن
          </button>
        </div>
      </div>
    </article>
  );
}
