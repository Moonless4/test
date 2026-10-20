import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icons.jsx';
import { formatPrice } from './ProductCard.jsx';

export default function ProductModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [product?.id]);

  if (!product) return null;

  return (
    <Modal open={Boolean(product)} onClose={onClose} className="modal--product" label={product.name}>
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
          <h2>{product.name}</h2>
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
            onClick={() => {
              onAdd(product, qty);
              onClose();
            }}
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
    </Modal>
  );
}
