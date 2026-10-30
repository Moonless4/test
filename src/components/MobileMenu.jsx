import { useEffect } from 'react';
import { useSite } from '../site/SiteContent.jsx';
import { useAccount } from '../account/AccountContext.jsx';
import Icon from './Icons.jsx';
import { BrandMark } from './Header.jsx';
import { Link } from '../router.jsx';
import { lockScroll, unlockScroll } from '../lib/smoothScroll.js';

export default function MobileMenu({ open, onClose, onLogin, onCategory }) {
  const { content } = useSite();
  const { navLinks, categories, identity } = content;
  const { isAuthenticated, user } = useAccount();
  const accountLabel = user.firstName || user.lastName || 'حساب من';

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.body.classList.add('no-scroll');
    lockScroll();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      unlockScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <button type="button" className="sheet-backdrop" onClick={onClose} aria-label="بستن منو" />
      <aside className="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="منوی موبایل">
        <div className="mobile-menu__head">
          <span className="mobile-menu__brand">
            <BrandMark variant="compact" />
          </span>
          <button type="button" className="icon-btn icon-btn--ghost" onClick={onClose} aria-label="بستن">
            <Icon name="close" />
          </button>
        </div>

        <nav className="mobile-menu__nav" aria-label="ناوبری موبایل">
          {navLinks.map((link) => (
            <Link key={link.id} to={link.href} onClick={onClose}>
              <span>{link.label}</span>
              <Icon name="chevronLeft" size={18} />
            </Link>
          ))}
        </nav>

        <div className="mobile-menu__section">
          <h3>دسته‌بندی‌ها</h3>
          <div className="mobile-menu__cats">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => {
                  onClose();
                  onCategory(cat.id);
                }}
              >
                <img src={cat.icon} alt="" loading="lazy" />
                <span>{cat.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mobile-menu__footer">
          {isAuthenticated ? (
            <Link className="btn btn--primary btn--block" to="/account" onClick={onClose}>
              <Icon name="user" size={18} />
              {accountLabel}
            </Link>
          ) : (
            <button type="button" className="btn btn--primary btn--block" onClick={onLogin}>
              <Icon name="user" size={18} />
              ورود / ثبت نام
            </button>
          )}
          <a className="mobile-menu__phone" href={`tel:${identity.phoneHref}`} dir="ltr">
            <Icon name="phone" size={18} />
            {identity.phone}
          </a>
        </div>
      </aside>
    </div>
  );
}
