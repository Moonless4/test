import { useState } from 'react';
import { contactItems } from '../data/content.js';
import Icon from './Icons.jsx';

const iconMap = { mail: 'mail', phone: 'phone', clock: 'clock', pin: 'pin' };

export default function ContactSection({ onToast }) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setError('لطفاً همه فیلدها را تکمیل کنید.');
      return;
    }
    if (!/^[0-9\u06F0-\u06F9+\-\s]{8,}$/.test(form.phone.trim())) {
      setError('شماره تماس معتبر نیست.');
      return;
    }
    setError('');
    setSent(true);
    onToast('پیام شما ثبت شد؛ به‌زودی با شما تماس می‌گیریم.');
    setForm({ name: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 6000);
  };

  return (
    <section className="contact section" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact__panel">
          <img className="contact__bg" src="/assets/contact-bg.png" alt="" aria-hidden="true" />

          <div className="contact__visual">
            <span className="contact__blob" aria-hidden="true" />
            <img src="/assets/contact-chef.webp" alt="پذیرایی سرآشپز نوال" loading="lazy" />
            <span className="contact__note">
              <Icon name="check" size={18} />
              پاسخ‌گویی کمتر از ۲۴ ساعت
            </span>
          </div>

          <div className="contact__main">
            <span className="section-heading__eyebrow">
              <img src="/assets/title-symbol.webp" alt="" aria-hidden="true" />
              با ما در تماس باشید
            </span>
            <h2 id="contact-title">
              همیشه خوشحال می‌شویم <span className="title-highlight">بشنویم</span>
            </h2>
            <p className="contact__lead">
              برای رزرو، پیشنهاد، انتقاد یا هر سوالی درباره منو و خدمات نوال، از هر راهی که راحت‌تر
              است با ما در ارتباط باشید.
            </p>

            <div className="contact__cards">
              {contactItems.map((item) => (
                <a
                  className="contact-card"
                  key={item.id}
                  href={
                    item.id === 'phone'
                      ? 'tel:+982188776655'
                      : item.id === 'email'
                        ? 'mailto:info@naval-restaurant.ir'
                        : '#contact'
                  }
                >
                  <span className="contact-card__icon">
                    <Icon name={iconMap[item.icon]} size={23} />
                  </span>
                  <span className="contact-card__copy">
                    <small>{item.title}</small>
                    <b>{item.value}</b>
                    <em>{item.note}</em>
                  </span>
                </a>
              ))}
            </div>

            <form className="contact-form" onSubmit={submit} noValidate>
              <div className="contact-form__row">
                <label>
                  <span>نام و نام خانوادگی</span>
                  <input value={form.name} onChange={update('name')} placeholder="مثلاً نیلوفر احمدی" />
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
                <span>پیام شما</span>
                <textarea
                  rows="3"
                  value={form.message}
                  onChange={update('message')}
                  placeholder="پیام یا درخواست خود را بنویسید..."
                />
              </label>
              <div className="contact-form__footer">
                <button type="submit" className="btn btn--primary">
                  ارسال پیام
                  <Icon name="chevronLeft" size={18} />
                </button>
                {error && <span className="form-hint form-hint--error">{error}</span>}
                {sent && (
                  <span className="form-hint form-hint--success">
                    <Icon name="check" size={16} />
                    پیام شما با موفقیت ثبت شد.
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
