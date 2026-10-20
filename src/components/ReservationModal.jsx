import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icons.jsx';

const times = ['۱۲:۳۰', '۱۴:۰۰', '۱۸:۳۰', '۱۹:۳۰', '۲۰:۳۰', '۲۱:۳۰'];

export default function ReservationModal({ open, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '۱۹:۳۰', guests: '۲', note: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setDone(false);
      setError('');
      setForm({ name: '', phone: '', date: '', time: '۱۹:۳۰', guests: '۲', note: '' });
    }
  }, [open]);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.date) {
      setError('لطفاً نام، شماره تماس و تاریخ رزرو را وارد کنید.');
      return;
    }
    if (!/^[0-9\u06F0-\u06F9+\-\s]{8,}$/.test(form.phone.trim())) {
      setError('شماره تماس معتبر نیست.');
      return;
    }
    setError('');
    setDone(true);
  };

  const formattedDate = form.date
    ? new Date(`${form.date}T12:00:00`).toLocaleDateString('fa-IR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';

  return (
    <Modal open={open} onClose={onClose} className="modal--reserve" label="رزرو میز">
      {done ? (
        <div className="order-success">
          <span className="order-success__icon">
            <Icon name="calendar" size={36} />
          </span>
          <h2>رزرو شما ثبت شد</h2>
          <p>
            {form.name} عزیز، میز شما برای <b>{formattedDate}</b> ساعت <b>{form.time}</b> به تعداد{' '}
            <b>{form.guests} نفر</b> درخواست شد. برای تأیید نهایی با شما تماس می‌گیریم.
          </p>
          <div className="reserve-summary">
            <span>
              <Icon name="phone" size={17} />
              {form.phone}
            </span>
            <span>
              <Icon name="users" size={17} />
              {form.guests} نفر
            </span>
          </div>
          <button type="button" className="btn btn--primary btn--block" onClick={onClose}>
            بستن
          </button>
        </div>
      ) : (
        <div className="reserve">
          <div className="checkout__head">
            <span className="checkout__badge">
              <Icon name="calendar" size={18} />
              رزرو آنلاین
            </span>
            <h2>میز خود را رزرو کنید</h2>
            <p>برای یک شب دلنشین، میزتان را از قبل رزرو کنید.</p>
          </div>

          <form className="checkout__form" onSubmit={submit} noValidate>
            <div className="checkout__row">
              <label>
                <span>نام و نام خانوادگی</span>
                <input value={form.name} onChange={update('name')} placeholder="نام رزروکننده" />
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
            <div className="checkout__row checkout__row--3">
              <label>
                <span>تاریخ رزرو</span>
                <input type="date" value={form.date} onChange={update('date')} min={new Date().toISOString().slice(0, 10)} />
              </label>
              <label>
                <span>ساعت</span>
                <select value={form.time} onChange={update('time')}>
                  {times.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>تعداد نفرات</span>
                <select value={form.guests} onChange={update('guests')}>
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <option key={num} value={String(num)}>
                      {num.toLocaleString('fa-IR')} نفر
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span>توضیحات (اختیاری)</span>
              <textarea
                rows="2"
                value={form.note}
                onChange={update('note')}
                placeholder="مثلاً میز کنار پنجره یا مناسبت خاص"
              />
            </label>

            {error && <span className="form-hint form-hint--error">{error}</span>}

            <button type="submit" className="btn btn--primary btn--block">
              ثبت درخواست رزرو
              <Icon name="chevronLeft" size={18} />
            </button>
            <p className="product-modal__note">
              <Icon name="clock" size={16} />
              رزرو شما پس از تماس تأیید می‌شود.
            </p>
          </form>
        </div>
      )}
    </Modal>
  );
}
