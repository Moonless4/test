import { useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EmptyNote } from '../ui.jsx';
import { money, formatDate, fa } from '../../data/account.js';
import { ORDER_STATUSES, deleteOrder, listOrders, orderStatusLabel, updateOrderStatus } from '../../data/records.js';

const toneOf = (status) => ORDER_STATUSES.find((item) => item.id === status)?.tone || 'gold';

export default function OrdersPanel() {
  const [orders, setOrders] = useState(listOrders);

  const refresh = (next) => setOrders(next ?? listOrders());

  const changeStatus = (id, status) => refresh(updateOrderStatus(id, status));

  const remove = (order) => {
    if (!window.confirm(`سفارش ${order.code} حذف شود؟`)) return;
    refresh(deleteOrder(order.id));
  };

  const open = orders.filter((order) => order.status !== 'done' && order.status !== 'cancelled');
  const income = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <AdminPanel
      title="سفارش‌ها"
      description="سفارش‌هایی که مشتری‌ها از فرم تکمیل خرید ثبت کرده‌اند."
      actions={
        <button type="button" className="adm-btn adm-btn--ghost" onClick={() => refresh()}>
          <Icon name="repeat" size={16} />
          به‌روزرسانی
        </button>
      }
    >
      <div className="adm-stats">
        <div className="adm-stat">
          <span className="adm-stat__icon">
            <Icon name="cart" size={20} />
          </span>
          <strong>{fa(orders.length)}</strong>
          <small>کل سفارش‌ها</small>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__icon">
            <Icon name="clock" size={20} />
          </span>
          <strong>{fa(open.length)}</strong>
          <small>در جریان</small>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__icon">
            <Icon name="wallet" size={20} />
          </span>
          <strong>{money(income)}</strong>
          <small>مجموع مبلغ (بدون لغوشده‌ها)</small>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyNote>هنوز سفارشی ثبت نشده است. سفارش‌های تکمیل خرید اینجا جمع می‌شوند.</EmptyNote>
      ) : (
        <div className="adm-orders">
          {orders.map((order) => (
            <article className="adm-order" key={order.id}>
              <header className="adm-order__head">
                <div>
                  <b dir="ltr">{order.code}</b>
                  <small>{order.createdAt ? formatDate(order.createdAt) : '—'}</small>
                </div>
                <span className={`adm-pill adm-pill--${toneOf(order.status)}`}>
                  {orderStatusLabel(order.status)}
                </span>
              </header>

              <div className="adm-order__meta">
                <span>
                  <small>مشتری</small>
                  <b>{order.name || '—'}</b>
                </span>
                <span>
                  <small>تماس</small>
                  <b dir="ltr">{order.phone || '—'}</b>
                </span>
                <span>
                  <small>اقلام</small>
                  <b>{fa(order.count || 0)} عدد</b>
                </span>
                <span>
                  <small>مبلغ</small>
                  <b>{money(order.total || 0)}</b>
                </span>
              </div>

              {order.address ? <p className="adm-order__address">{order.address}</p> : null}

              {order.items?.length ? (
                <div className="adm-order__items">
                  <small className="adm-order__items-title">جزئیات اقلام</small>
                  <ul>
                    {order.items.map((item, itemIndex) => (
                      <li key={`${order.id}-${item.productId || item.name}-${itemIndex}`}>
                        <span className="adm-order__item-name">{item.name}</span>
                        <span className="adm-order__item-qty">×{fa(item.qty || 1)}</span>
                        <span className="adm-order__item-price">
                          {money((item.price || 0) * (item.qty || 1))}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="adm-order__totals">
                    {order.subtotal != null ? (
                      <span>
                        جمع اقلام <b>{money(order.subtotal)}</b>
                      </span>
                    ) : null}
                    {order.delivery != null ? (
                      <span>
                        هزینه ارسال <b>{money(order.delivery)}</b>
                      </span>
                    ) : null}
                    <span>
                      مبلغ کل <b>{money(order.total || 0)}</b>
                    </span>
                  </div>
                </div>
              ) : null}

              <footer className="adm-order__foot">
                <select
                  className="adm-input adm-select adm-order__select"
                  value={order.status}
                  onChange={(event) => changeStatus(order.id, event.target.value)}
                  aria-label={`وضعیت سفارش ${order.code}`}
                >
                  {ORDER_STATUSES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="adm-order__pay">{order.payment || '—'} · {order.time || '—'}</span>
                <button
                  type="button"
                  className="adm-icon-btn"
                  onClick={() => remove(order)}
                  aria-label={`حذف سفارش ${order.code}`}
                >
                  <Icon name="trash" size={16} />
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
