import { useState } from 'react';
import { footerColumns } from '../data/content.js';
import Icon from './Icons.jsx';
import { BrandMark } from './Header.jsx';

export default function Footer({ onToast }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const subscribe = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('لطفاً یک ایمیل معتبر وارد کنید.');
      return;
    }
    setError('');
    setSubscribed(true);
    setEmail('');
    onToast('عضویت شما در خبرنامه آترین ثبت شد.');
    setTimeout(() => setSubscribed(false), 6000);
  };

  return (
    <footer className="site-footer" id="footer">
      <div className="container">
        <div className="newsletter">
          <div className="newsletter__copy">
            <span className="newsletter__icon">
              <Icon name="mail" size={24} />
            </span>
            <div>
              <h3>از تخفیف‌ها و طعم‌های تازه باخبر شوید</h3>
              <p>هر هفته یک ایمیل خوشمزه؛ بدون تبلیغ اضافه.</p>
            </div>
          </div>
          <form className="newsletter__form" onSubmit={subscribe} noValidate>
            <label className="sr-only" htmlFor="newsletter-email">
              ایمیل شما
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ایمیل خود را وارد کنید"
              dir="ltr"
            />
            <button type="submit" className="btn btn--gold">
              عضویت
              <Icon name="chevronLeft" size={17} />
            </button>
          </form>
          {error && <span className="form-hint form-hint--error newsletter__hint">{error}</span>}
          {subscribed && (
            <span className="form-hint form-hint--success newsletter__hint">
              <Icon name="check" size={16} />
              عضویت شما ثبت شد.
            </span>
          )}
        </div>

        <div className="footer__main">
          <div className="footer__brand">
            <BrandMark variant="footer" />
            <p>
              رستوران آترین؛ از سال ۱۳۹۲ با عشق به طعم و مهمان‌نوازی، میزبان لحظه‌های خوب شما
              هستیم.
            </p>
            <div className="footer__social" aria-label="شبکه‌های اجتماعی">
              <a href="#footer" aria-label="اینستاگرام">
                <Icon name="instagram" size={19} />
              </a>
              <a href="#footer" aria-label="تلگرام">
                <Icon name="telegram" size={19} />
              </a>
              <a href="#footer" aria-label="واتساپ">
                <Icon name="whatsapp" size={19} />
              </a>
              <a href="#footer" aria-label="یوتیوب">
                <Icon name="youtube" size={19} />
              </a>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div className="footer__col" key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link}>
                    <a href={link === 'سوالات متداول' ? '#faq' : link === 'تماس با ما' ? '#contact' : '#menu'}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer__col footer__contact">
            <h3>اطلاعات تماس</h3>
            <a href="tel:+982188776655">
              <Icon name="phone" size={17} />
              <span dir="ltr">۰۲۱-۸۸۷۷۶۶۵۵</span>
            </a>
            <a href="mailto:info@atrin-restaurant.ir">
              <Icon name="mail" size={17} />
              <span>info@atrin-restaurant.ir</span>
            </a>
            <p>
              <Icon name="pin" size={17} />
              تهران، خیابان ولیعصر، نبش کوچه آترین، پلاک ۱۲
            </p>
            <p>
              <Icon name="clock" size={17} />
              هر روز از ۱۲:۰۰ تا ۲۳:۳۰
            </p>
          </div>
        </div>

        <div className="footer__trust">
          <span className="trust-badge">
            <Icon name="shield" size={22} />
            <span>
              <b>نماد اعتماد الکترونیکی</b>
              <small>پرداخت امن و مطمئن</small>
            </span>
          </span>
          <span className="trust-badge">
            <Icon name="fork" size={22} />
            <span>
              <b>اتحادیه رستوران‌داران</b>
              <small>عضو رسمی صنف</small>
            </span>
          </span>
          <span className="trust-badge">
            <Icon name="truck" size={22} />
            <span>
              <b>ارسال تضمینی</b>
              <small>گرم و تازه درِ خانه</small>
            </span>
          </span>
          <span className="trust-badge">
            <Icon name="check" size={22} />
            <span>
              <b>ضمانت کیفیت</b>
              <small>رضایت ۱۰۰٪ مهمانان</small>
            </span>
          </span>
        </div>

        <div className="footer__bottom">
          <p>© ۱۴۰۴ رستوران آترین. تمامی حقوق محفوظ است.</p>
          <div>
            <a href="#footer">پیگیری سفارش</a>
            <span aria-hidden="true">·</span>
            <a href="#footer">حریم خصوصی</a>
            <span aria-hidden="true">·</span>
            <a href="#footer">شرایط و ضوابط</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
