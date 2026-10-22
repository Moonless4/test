import Icon from '../components/Icons.jsx';
import { Link } from '../router.jsx';
import { StatusPill } from './ui.jsx';
import {
  fa,
  formatDate,
  formatTime,
  money,
  ORDER_STATUS,
  ORDER_TYPE,
  orderItemCount,
  orderTotal,
  PAYMENT_STATUS,
  resolveItems,
} from '../data/account.js';

export default function OrderCard({ order, onReorder }) {
  const items = resolveItems(order);
  const reorderable = order.status !== 'cancelled';

  return (
    <article className={`order-card ${order.status === 'cancelled' ? 'is-cancelled' : ''}`}>
      <header className="order-card__head">
        <div className="order-card__id">
          <span className="order-card__badge">
            <Icon name="box" size={17} />
          </span>
          <div>
            <b>سفارش #{fa(order.id)}</b>
            <small>
              {formatDate(order.createdAt)} · ساعت {formatTime(order.createdAt)} · {ORDER_TYPE[order.type]}
            </small>
          </div>
        </div>
        <div className="order-card__status">
          <StatusPill tone={ORDER_STATUS[order.status].tone}>{ORDER_STATUS[order.status].label}</StatusPill>
          <StatusPill tone={PAYMENT_STATUS[order.payment.status].tone}>
            {PAYMENT_STATUS[order.payment.status].label}
          </StatusPill>
        </div>
      </header>

      <ul className="order-card__items">
        {items.map((item) => (
          <li key={item.productId}>
            <span className="order-card__thumb">
              {item.product ? (
                <img src={item.product.image} alt={item.product.name} loading="lazy" />
              ) : (
                <Icon name="fork" size={16} />
              )}
            </span>
            <span className="order-card__item-copy">
              <b>{item.product?.name || 'آیتم حذف‌شده از منو'}</b>
              <small>{fa(item.qty)} عدد × {money(item.price)}</small>
            </span>
            <b className="order-card__item-price">{money(item.price * item.qty)}</b>
          </li>
        ))}
      </ul>

      <footer className="order-card__foot">
        <div className="order-card__meta">
          <span>
            <Icon name="fork" size={15} />
            {fa(orderItemCount(order))} آیتم
          </span>
          <span>
            <Icon name="wallet" size={15} />
            {order.payment.label}
          </span>
        </div>

        <div className="order-card__total">
          <small>مبلغ کل سفارش</small>
          <b>{money(orderTotal(order))}</b>
        </div>

        <div className="order-card__actions">
          <Link className="btn btn--outline btn--sm" to={`/account/orders/${order.id}`}>
            مشاهده جزئیات
          </Link>
          {reorderable && (
            <button type="button" className="btn btn--primary btn--sm" onClick={() => onReorder(order)}>
              <Icon name="repeat" size={15} />
              سفارش مجدد
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
