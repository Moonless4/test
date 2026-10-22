import Icon from '../../components/Icons.jsx';
import { Link } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import { EmptyState, PageHead } from '../ui.jsx';
import { fa, findProduct, money } from '../../data/account.js';

export default function FavoritesPage({ onAdd, onMenu, onToast }) {
  const { favorites, toggleFavorite, loading } = useAccount();
  const products = favorites.map(findProduct).filter(Boolean);

  return (
    <div className="acct-page">
      <PageHead
        title="علاقه‌مندی‌ها"
        text="غذاها و نوشیدنی‌هایی که برای سفارش بعدی کنار گذاشته‌اید."
        action={
          <button type="button" className="btn btn--outline" onClick={() => onMenu('all')}>
            مشاهده منو
          </button>
        }
      />

      {loading ? (
        <div className="acct-skeleton acct-skeleton--grid" aria-hidden="true">
          <div className="acct-skeleton__tile acct-skeleton__tile--tall" />
          <div className="acct-skeleton__tile acct-skeleton__tile--tall" />
          <div className="acct-skeleton__tile acct-skeleton__tile--tall" />
        </div>
      ) : products.length ? (
        <div className="fav-grid">
          {products.map((product) => (
            <article key={product.id} className="fav-card">
              <div className="fav-card__media">
                <Link to={`/food/${product.id}`} aria-label={`مشاهده ${product.name}`}>
                  <img src={product.image} alt={product.name} loading="lazy" />
                </Link>
                {product.discount > 0 && (
                  <span className="fav-card__discount">{fa(product.discount)}٪</span>
                )}
                <button
                  type="button"
                  className="fav-card__heart is-on"
                  aria-label={`حذف ${product.name} از علاقه‌مندی‌ها`}
                  aria-pressed="true"
                  onClick={() => {
                    toggleFavorite(product.id);
                    onToast(`${product.name} از علاقه‌مندی‌ها حذف شد.`);
                  }}
                >
                  <Icon name="heart" size={17} filled />
                </button>
              </div>

              <div className="fav-card__body">
                <span className="fav-card__cat">{product.categoryLabel}</span>
                <h3>
                  <Link to={`/food/${product.id}`}>{product.name}</Link>
                </h3>
                <p>{product.description}</p>
                <div className="fav-card__foot">
                  <span className="fav-card__price">
                    {money(product.price)}
                    {product.oldPrice && <del>{fa(product.oldPrice)}</del>}
                  </span>
                  <button type="button" className="add-btn" onClick={() => onAdd(product)}>
                    <Icon name="cart" size={16} />
                    افزودن
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="heart"
          title="هنوز غذایی به علاقه‌مندی‌ها اضافه نکرده‌اید."
          text="با زدن علامت قلب روی کارت هر غذا، آن را برای بعد ذخیره کنید."
          actionLabel="مشاهده منو"
          onAction={() => onMenu('all')}
        />
      )}
    </div>
  );
}
