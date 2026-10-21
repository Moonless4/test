import { useEffect, useState } from 'react';
import { products } from '../data/content.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Icon from '../components/Icons.jsx';
import ProductCard, { formatPrice } from '../components/ProductCard.jsx';

export default function ProductPage({ id, onAdd, onOpen, onMenu }) {
  const product = products.find((item) => item.id === id);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [id]);

  if (!product) return null;

  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .concat(products.filter((item) => item.category !== product.category && item.id !== product.id))
    .slice(0, 3);

  return (
    <section className="page-section">
      <div className="container">
        <Breadcrumbs items={[{ label: 'منو', to: '/menu' }, { label: product.name }]} />

        <div className="product-detail">
          <div className="product-modal">
            <div className="product-modal__media">
              <span className="product-modal__halo" aria-hidden="true" />
              <img src={product.image} alt={product.name} />
              {product.discount > 0 && (
                <span className="product-modal__discount">
                  {product.discount.toLocaleString('fa-IR')}٪ تخفیف
                </span>
              )}
              <img className="product-modal__dots" src="/assets/yellow-dots.png" alt="" aria-hidden="true" />
            </div>

            <div className="product-modal__body">
              <div className="product-modal__top">
                <span className="product-modal__cat">{product.categoryLabel}</span>
                <span className="product-modal__rating">
                  <Icon name="star" size={15} filled />
                  ۴٫۹
                  <small>(۱۲۴ نظر)</small>
                </span>
              </div>
              <h1>{product.name}</h1>
              <p className="product-modal__desc">{product.longDescription}</p>

              <div className="product-modal__meta">
                <span>
                  <Icon name="fork" size={17} />
                  {product.weight}
                </span>
                <span>
                  <Icon name="leaf" size={17} />
                  مواد اولیه تازه
                </span>
                <span>
                  <Icon name="chef" size={17} />
                  دست‌ساز
                </span>
              </div>

              <div className="product-modal__price">
                <div>
                  <span className="price__now">
                    {formatPrice(product.price)}
                    <small>تومان</small>
                  </span>
                  {product.oldPrice && <del className="price__old">{formatPrice(product.oldPrice)}</del>}
                </div>
                <div className="qty qty--large">
                  <button type="button" onClick={() => setQty((prev) => prev + 1)} aria-label="افزایش تعداد">
                    <Icon name="plus" size={15} />
                  </button>
                  <span>{qty.toLocaleString('fa-IR')}</span>
                  <button type="button" onClick={() => setQty((prev) => Math.max(1, prev - 1))} aria-label="کاهش تعداد">
                    <Icon name="minus" size={15} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn btn--primary btn--block product-modal__add"
                onClick={() => onAdd(product, qty)}
              >
                <Icon name="cart" size={19} />
                افزودن به سبد خرید
                <span>{formatPrice(product.price * qty)} تومان</span>
              </button>
              <p className="product-modal__note">
                <Icon name="truck" size={16} />
                ارسال داغ و تازه در ۳۰ تا ۴۵ دقیقه
              </p>
            </div>
          </div>
        </div>

        <div className="related">
          <div className="related__head">
            <h2>پیشنهادهای مشابه</h2>
            <button type="button" className="text-link text-link--button" onClick={onMenu}>
              همه غذاها
              <Icon name="chevronLeft" size={16} />
            </button>
          </div>
          <div className="menu-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} onAdd={onAdd} onOpen={onOpen} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
