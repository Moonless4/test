import { useState } from 'react';
import { useSite } from '../site/SiteContent.jsx';
import Icon from './Icons.jsx';
import { BrandMark } from './Header.jsx';
import { Link } from '../router.jsx';

const splitLink = (value) => {
  const [label, href] = value.split('|').map((part) => part.trim());
  return { label, href };
};

export default function Footer({ onToast }) {
  const { content } = useSite();
  const { identity, footer } = content;
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
            <p>{identity.footerAbout}</p>
            <div className="footer__social" aria-label="شبکه‌های اجتماعی">
              {footer.socials.map((social) => (
                <a key={social.id} href={social.href || '#'} aria-label={social.label}>
                  <Icon name={social.icon} size={19} />
                </a>
              ))}
            </div>
          </div>

          {footer.columns.map((column) => (
            <div className="footer__col" key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((raw) => {
                  const { label, href } = splitLink(raw);
                  return (
                    <li key={`${column.title}-${label}`}>
                      <a href={href || '#menu'}>{label}</a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="footer__col footer__contact">
            <h3>اطلاعات تماس</h3>
            <a href={`tel:${identity.phoneHref}`}>
              <Icon name="phone" size={17} />
              <span dir="ltr">{identity.phone}</span>
            </a>
            <a href={`mailto:${identity.email}`}>
              <Icon name="mail" size={17} />
              <span>{identity.email}</span>
            </a>
            <p>
              <Icon name="pin" size={17} />
              {identity.address}
            </p>
            <p>
              <Icon name="clock" size={17} />
              {identity.hours}
            </p>
          </div>
        </div>

        <div className="footer__trust">
          {footer.badges.map((badge) => (
            <span className="trust-badge" key={badge.id}>
              <Icon name={badge.icon} size={22} />
              <span>
                <b>{badge.title}</b>
                <small>{badge.subtitle}</small>
              </span>
            </span>
          ))}
        </div>

        <div className="footer__bottom">
          <p>{identity.copyright}</p>
          <div>
            {footer.legalLinks.map((link, index) => (
              <span key={`${link.label}-${index}`}>
                {index > 0 ? (
                  <span aria-hidden="true" className="footer__dot">
                    ·
                  </span>
                ) : null}
                {link.href?.startsWith('/') ? (
                  <Link to={link.href}>{link.label}</Link>
                ) : (
                  <a href={link.href || '#footer'}>{link.label}</a>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
