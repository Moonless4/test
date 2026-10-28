import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icons.jsx';
import { formatPrice } from './ProductCard.jsx';
import { addOrder } from '../data/records.js';

const deliveryFee = 35000;
const freeDeliveryFrom = 500000;

export default function CheckoutModal({ open, onClose, items, onComplete }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', time: 'asap', payment: 'online' });
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (open) {
      setOrder(null);
      setError('');
    }
  }, [open]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const delivery = subtotal >= freeDeliveryFrom ? 0 : deliveryFee;
  const total = subtotal + delivery;

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('لطفاً نام، شماره تماس و آدرس را تکمیل کنید.');
      return;
    }
    if (!/^[0-9\u06F0-\u06F9+\-\s]{8,}$/.test(form.phone.trim())) {
      setError('شماره تماس معتبر نیست.');
      return;
    }
    const code = `NW-${Math.floor(100000 + Math.random() * 900000)}`;
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const payment = form.payment === 'online' ? 'پرداخت آنلاین' : 'پرداخت در محل';
    const time = form.time === 'asap' ? 'در اولین فرصت' : form.time;

    addOrder({
      code,
      total,
      subtotal,
      delivery,
      count,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      payment,
      time,
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
      })),
    });

    setOrder({ code, total, count, name: form.name.trim(), payment, time });
    setError('');
    onComplete();
  };

  return (
    <Modal open={open} onClose={onClose} className="modal--checkout" label="تکمیل سفارش">
      {order ? (
        <div className="order-success">
          <span className="order-success__icon">
            <Icon name="check" size={38} />
          </span>
          <h2>سفارش شما ثبت شد!</h2>
          <p>
            {order.name} عزیز، سفارش شما با کد <b dir="ltr">{order.code}</b> ثبت شد و به‌زودی برای
            هماهنگی با شما تماس می‌گیریم.
          </p>
          <div className="order-success__summary">
            <span>
              <small>تعداد اقلام</small>
              <b>{order.count.toLocaleString('fa-IR')} عدد</b>
            </span>
            <span>
              <small>روش پرداخت</small>
              <b>{order.payment}</b>
            </span>
            <span>
              <small>زمان تحویل</small>
              <b>{order.time}</b>
            </span>
            <span>
              <small>مبلغ کل</small>
              <b>{formatPrice(order.total)} تومان</b>
            </span>
          </div>
          <button type="button" className="btn btn--primary btn--block" onClick={onClose}>
            بازگشت به سایت
          </button>
        </div>
      ) : (
        <div className="checkout">
          <div className="checkout__head">
            <span className="checkout__badge">
              <Icon name="shield" size={18} />
              پرداخت امن
            </span>
            <h2>تکمیل سفارش</h2>
            <p>اطلاعات تحویل را وارد کنید تا سفارش شما آماده شود.</p>
          </div>

          <form className="checkout__form" onSubmit={submit} noValidate>
            <div className="checkout__row">
              <label>
                <span>نام و نام خانوادگی</span>
                <input value={form.name} onChange={update('name')} placeholder="نام گیرنده سفارش" />
              </label>
              <label>
                <span>شماره تماس</span>
                <input
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  inputMode="tel"
                  dir="ltr"
                />
              </label>
            </div>

            <label>
              <span>آدرس تحویل</span>
              <textarea
                rows="2"
                value={form.address}
                onChange={update('address')}
                placeholder="خیابان، کوچه، پلاک و واحد"
              />
            </label>

            <div className="checkout__row">
              <label>
                <span>زمان تحویل</span>
                <select value={form.time} onChange={update('time')}>
                  <option value="asap">در اولین فرصت</option>
                  <option value="۱۲:۳۰ تا ۱۳:۳۰">۱۲:۳۰ تا ۱۳:۳۰</option>
                  <option value="۱۹:۰۰ تا ۲۰:۰۰">۱۹:۰۰ تا ۲۰:۰۰</option>
                  <option value="۲۰:۰۰ تا ۲۱:۰۰">۲۰:۰۰ تا ۲۱:۰۰</option>
                </select>
              </label>
              <div className="checkout__payment">
                <span>روش پرداخت</span>
                <label className={`pay-option ${form.payment === 'online' ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={form.payment === 'online'}
                    onChange={update('payment')}
                  />
                  <Icon name="shield" size={18} />
                  پرداخت آنلاین
                </label>
                <label className={`pay-option ${form.payment === 'door' ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="door"
                    checked={form.payment === 'door'}
                    onChange={update('payment')}
                  />
                  <Icon name="user" size={18} />
                  پرداخت در محل
                </label>
              </div>
            </div>

            <div className="checkout__summary">
              <div>
                <span>جمع سفارش</span>
                <b>{formatPrice(subtotal)} تومان</b>
              </div>
              <div>
                <span>هزینه ارسال</span>
                <b>{delivery === 0 ? 'رایگان' : `${formatPrice(delivery)} تومان`}</b>
              </div>
              <div className="checkout__total">
                <span>مبلغ قابل پرداخت</span>
                <b>{formatPrice(total)} تومان</b>
              </div>
            </div>

            {error && <span className="form-hint form-hint--error">{error}</span>}

            <button type="submit" className="btn btn--primary btn--block">
              ثبت نهایی سفارش
              <Icon name="chevronLeft" size={18} />
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
}
