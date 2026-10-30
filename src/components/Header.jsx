import { useEffect, useRef, useState } from 'react';
import { useSite } from '../site/SiteContent.jsx';
import Icon from './Icons.jsx';
import CartPreview from './CartPreview.jsx';
import { Link, useRouter } from '../router.jsx';

function BrandMark({ variant = 'header' }) {
  const { content } = useSite();
  const { prefix, siteName } = content.identity;

  return (
    <span className={`brand brand--${variant}`} aria-label={`${prefix} ${siteName}`}>
      <span className="brand__halo" aria-hidden="true" />
      <span className="brand__plate">
        <span className="brand__kicker">{prefix}</span>
        <span className="brand__name">{siteName}</span>
        <span className="brand__rule" aria-hidden="true">
          <i />
          <b />
          <i />
        </span>
      </span>
    </span>
  );
}

export default function Header({
  cartCount,
  cartItems = [],
  onCart,
  onRequireAccount,
  onSearch,
  onLogin,
  onMenu,
  onCategory,
}) {
  const { path } = useRouter();
  const { content } = useSite();
  const { navLinks, categories, megaMenu } = content;
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const closeTimer = useRef(null);
  const cartTimer = useRef(null);

  const openCart = () => {
    clearTimeout(cartTimer.current);
    setCartOpen(true);
  };
  const closeCart = () => {
    cartTimer.current = setTimeout(() => setCartOpen(false), 140);
  };

  useEffect(() => {
    setCartOpen(false);
  }, [path]);

  useEffect(() => () => clearTimeout(cartTimer.current), []);

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
                  <Link
                    className={`nav-link ${megaOpen ? 'is-open' : ''} ${path === link.href ? 'is-active' : ''}`}
                    to={link.href}
                    onClick={() => setMegaOpen(false)}
                    aria-expanded={megaOpen}
                  >
                    {link.id === 'home' && <Icon name="home" size={15} />}
                    {link.label}
                    <Icon name="chevronLeft" size={14} className="nav-link__caret" />
                  </Link>
                  <div className={`mega ${megaOpen ? 'is-open' : ''}`} aria-hidden={!megaOpen}>
                    <div className="mega__cols">
                      <div className="mega__list">
                        <span className="mega__eyebrow">{megaMenu.eyebrow}</span>
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
                      <Link
                        to={megaMenu.promo.href || '/menu'}
                        className="mega__promo"
                        onClick={() => setMegaOpen(false)}
                      >
                        <img src={megaMenu.promo.image} alt={megaMenu.promo.title} loading="lazy" />
                        <span className="mega__promo-copy">
                          <small>{megaMenu.promo.kicker}</small>
                          <strong>{megaMenu.promo.title}</strong>
                          <span>
                            {megaMenu.promo.cta}
                            <Icon name="chevronLeft" size={15} />
                          </span>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  className={`nav-link ${path === link.href ? 'is-active' : ''}`}
                  key={link.id}
                  to={link.href}
                >
                  {link.id === 'home' && <Icon name="home" size={15} />}
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <Link className="header__brand" to="/" aria-label={`صفحه اصلی ${content.identity.siteName}`}>
            <BrandMark />
          </Link>

          <div className="header__actions">
            <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="منوی موبایل">
              <Icon name="menu" />
            </button>
            <button type="button" className="icon-btn" onClick={onSearch} aria-label="جستجو">
              <Icon name="search" />
            </button>
            <div className="cart-hover" onMouseEnter={openCart} onMouseLeave={closeCart}>
              <button type="button" className="icon-btn cart-btn" onClick={onCart} aria-label={`سبد خرید، ${cartCount} آیتم`}>
                <Icon name="cart" />
                <span className="cart-count">{cartCount.toLocaleString('fa-IR')}</span>
              </button>
              {cartOpen && cartItems.length > 0 && (
                <CartPreview
                  items={cartItems}
                  onCheckout={onCart}
                  onRequireAccount={onRequireAccount}
                  onFinish={() => setCartOpen(false)}
                />
              )}
            </div>
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
