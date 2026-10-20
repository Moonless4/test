import { useEffect, useRef, useState } from 'react';
import { categories, navLinks } from '../data/content.js';
import Icon from './Icons.jsx';

function BrandMark({ variant = 'header' }) {
  return (
    <span className={`brand brand--${variant}`} aria-label="رستوران نوال">
      <span className="brand__halo" aria-hidden="true" />
      <span className="brand__plate">
        <span className="brand__kicker">رستوران</span>
        <span className="brand__name">نوال</span>
        <span className="brand__rule" aria-hidden="true">
          <i />
          <b />
          <i />
        </span>
      </span>
    </span>
  );
}

export default function Header({ cartCount, onCart, onSearch, onLogin, onMenu, onCategory }) {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header__shell">
        <div className="header__bar">
          <nav className="header__nav" aria-label="ناوبری اصلی">
            {navLinks.map((link) =>
              link.hasMega ? (
                <div
                  className="nav-mega-wrap"
                  key={link.id}
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <a
                    className={`nav-link ${megaOpen ? 'is-open' : ''}`}
                    href={link.href}
                    onClick={() => setMegaOpen(false)}
                    aria-expanded={megaOpen}
                  >
                    {link.id === 'home' && <Icon name="home" size={15} />}
                    {link.label}
                    <Icon name="chevronLeft" size={14} className="nav-link__caret" />
                  </a>
                  <div className={`mega ${megaOpen ? 'is-open' : ''}`} aria-hidden={!megaOpen}>
                    <div className="mega__cols">
                      <div className="mega__list">
                        <span className="mega__eyebrow">دسته‌بندی غذاها</span>
                        <div className="mega__grid">
                          {categories.map((cat) => (
                            <button
                              type="button"
                              key={cat.id}
                              className="mega__item"
                              onClick={() => {
                                setMegaOpen(false);
                                onCategory(cat.id);
                              }}
                            >
                              <img src={cat.icon} alt="" loading="lazy" />
                              <span>{cat.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <a
                        href="#menu"
                        className="mega__promo"
                        onClick={() => setMegaOpen(false)}
                      >
                        <img src="/assets/megamenu.webp" alt="پیشنهاد ویژه سرآشپز" loading="lazy" />
                        <span className="mega__promo-copy">
                          <small>پیشنهاد امروز</small>
                          <strong>استیک گریل دو نفره</strong>
                          <span>
                            مشاهده منو
                            <Icon name="chevronLeft" size={15} />
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <a className="nav-link" key={link.id} href={link.href}>
                  {link.id === 'home' && <Icon name="home" size={15} />}
                  {link.label}
                </a>
              )
            )}
          </nav>

          <a className="header__brand" href="#home" aria-label="صفحه اصلی رستوران نوال">
            <BrandMark />
          </a>

          <div className="header__actions">
            <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="منوی موبایل">
              <Icon name="menu" />
            </button>
            <button type="button" className="icon-btn" onClick={onSearch} aria-label="جستجو">
              <Icon name="search" />
            </button>
            <button type="button" className="icon-btn cart-btn" onClick={onCart} aria-label={`سبد خرید، ${cartCount} آیتم`}>
              <Icon name="cart" />
              <span className="cart-count">{cartCount.toLocaleString('fa-IR')}</span>
            </button>
            <button type="button" className="login-btn" onClick={onLogin}>
              <Icon name="user" size={18} />
              <span>ورود / ثبت نام</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export { BrandMark };
