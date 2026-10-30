import { useRef } from 'react';
import Icon from '../../components/Icons.jsx';
import { Link } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import { EmptyState, Panel, StatusPill } from '../ui.jsx';
import {
  fa,
  findProduct,
  formatDate,
  formatTime,
  money,
  ORDER_STATUS,
  ORDER_TYPE,
  orderNumber,
  orderSubtotal,
  orderTotal,
  PAYMENT_STATUS,
  resolveItems,
} from '../../data/account.js';

const STEPS = [
  { key: 'placed', label: 'ثبت سفارش', icon: 'check' },
  { key: 'review', label: 'تایید سفارش', icon: 'check' },
  { key: 'preparing', label: 'در حال آماده‌سازی', icon: 'chef' },
  { key: 'ready', label: 'آماده تحویل', icon: 'box' },
  { key: 'delivered', label: 'تحویل داده شد', icon: 'scooter' },
];

const FLOW_INDEX = { review: 1, preparing: 2, ready: 3, delivered: 4 };

export default function OrderDetailPage({ id, onReorder, onToast, onMenu }) {
  const { orders, addresses } = useAccount();
  const trackRef = useRef(null);

  const order = orders.find((item) => item.id === id);

  if (!order) {
    return (
      <div className="acct-page">
        <EmptyState
          icon="box"
          title="این سفارش پیدا نشد."
          text="ممکن است سفارش حذف شده باشد یا شماره آن تغییر کرده باشد."
          actionLabel="بازگشت به سفارش‌ها"
          to="/account/orders"
        />
      </div>
    );
  }

  const items = resolveItems(order);
  const address = addresses.find((item) => item.id === order.addressId);
  const cancelled = order.status === 'cancelled';
  const currentStep = cancelled ? 0 : FLOW_INDEX[order.status] ?? 0;

  const track = () => {
    trackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    onToast('وضعیت لحظه‌ای سفارش شما در ادامه نمایش داده می‌شود.');
  };

  return (
    <div className="acct-page">
      <Link className="acct-back" to="/account/orders">
        <Icon name="chevronRight" size={15} />
        بازگشت به سفارش‌ها
      </Link>

      <section className="order-hero">
        <div className="order-hero__copy">
          <span className="order-hero__eyebrow">{ORDER_TYPE[order.type]}</span>
          <h1>سفارش #{orderNumber(order)}</h1>
          <p>
            {formatDate(order.createdAt)} · ساعت {formatTime(order.createdAt)} · {order.restaurant}
          </p>
          <div className="order-hero__pills">
            <StatusPill tone={ORDER_STATUS[order.status].tone}>{ORDER_STATUS[order.status].label}</StatusPill>
            <StatusPill tone={PAYMENT_STATUS[order.payment.status].tone}>
              {PAYMENT_STATUS[order.payment.status].label}
            </StatusPill>
          </div>
        </div>
        <div className="order-hero__actions">
          {!cancelled && (
            <button type="button" className="btn btn--outline" onClick={track}>
              <Icon name="scooter" size={17} />
              پیگیری سفارش
            </button>
          )}
          {!cancelled && (
            <button type="button" className="btn btn--primary" onClick={() => onReorder(order)}>
              <Icon name="repeat" size={17} />
              سفارش مجدد
            </button>
          )}
          {cancelled && (
            <button type="button" className="btn btn--outline" onClick={() => onMenu('all')}>
              مشاهده منو
            </button>
          )}
        </div>
      </section>

      <div className="acct-columns acct-columns--wide">
        <Panel title="اقلام سفارش" subtitle={`${fa(order.items.length)} نوع غذا`}>
          <ul className="order-detail-items">
            {items.map((item) => (
              <li key={item.productId}>
                <span className="order-detail-items__thumb">
                  {item.product ? (
                    <img src={item.product.image} alt={item.product.name} loading="lazy" />
                  ) : (
                    <Icon name="fork" size={18} />
                  )}
                </span>
                <div className="order-detail-items__copy">
                  <b>{item.product?.name || 'آیتم حذف‌شده از منو'}</b>
                  <small>{item.product?.description || 'این آیتم در منوی فعلی موجود نیست.'}</small>
                </div>
                <div className="order-detail-items__qty">
                  <span>{fa(item.qty)} عدد</span>
                  <b>{money(item.price * item.qty)}</b>
                </div>
              </li>
            ))}
          </ul>

          <div className="order-summary">
            <div>
              <span>جمع سفارش</span>
              <b>{money(orderSubtotal(order))}</b>
            </div>
            {order.discount > 0 && (
              <div className="is-discount">
                <span>تخفیف سفارش</span>
                <b>{money(order.discount)}−</b>
              </div>
            )}
            <div>
              <span>هزینه ارسال</span>
              <b>{order.deliveryFee ? money(order.deliveryFee) : 'رایگان'}</b>
            </div>
            <div className="order-summary__total">
              <span>مبلغ پرداختی</span>
              <b>{money(orderTotal(order))}</b>
            </div>
          </div>
        </Panel>

        <div className="acct-stack">
          <Panel title="وضعیت سفارش" id="order-track">
            <div ref={trackRef} className="order-track">
              {cancelled ? (
                <div className="order-track__cancelled">
                  <Icon name="close" size={18} />
                  <div>
                    <b>این سفارش لغو شده است</b>
                    <small>
                      {order.payment.status === 'refunded'
                        ? 'مبلغ سفارش به حساب شما بازگشت داده شد.'
                        : 'در صورت نیاز با پشتیبانی آترین تماس بگیرید.'}
                    </small>
                  </div>
                </div>
              ) : (
                <ol>
                  {STEPS.map((step, index) => (
                    <li
                      key={step.key}
                      className={`${index <= currentStep ? 'is-done' : ''} ${
                        index === currentStep ? 'is-current' : ''
                      }`}
                    >
                      <span className="order-track__dot">
                        <Icon name={step.icon} size={13} />
                      </span>
                      <span>{step.label}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Panel>

          <Panel title="اطلاعات پرداخت و تحویل">
            <dl className="acct-rows">
              <div>
                <dt>روش پرداخت</dt>
                <dd>{order.payment.label}</dd>
              </div>
              <div>
                <dt>وضعیت پرداخت</dt>
                <dd>{PAYMENT_STATUS[order.payment.status].label}</dd>
              </div>
              <div>
                <dt>نوع سفارش</dt>
                <dd>{ORDER_TYPE[order.type]}</dd>
              </div>
              {address && (
                <div>
                  <dt>آدرس تحویل</dt>
                  <dd>
                    {address.title} — {address.full}
                  </dd>
                </div>
              )}
              {order.note && (
                <div>
                  <dt>یادداشت سفارش</dt>
                  <dd>{order.note}</dd>
                </div>
              )}
            </dl>
          </Panel>
        </div>
      </div>

      {items.some((item) => !findProduct(item.productId)) && (
        <p className="acct-note">
          برخی آیتم‌های این سفارش در منوی فعلی موجود نیستند و در سفارش مجدد کنار گذاشته می‌شوند.
        </p>
      )}
    </div>
  );
}
