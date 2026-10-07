import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Heart, Search, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NAV_LINKS } from '../../lib/nav';
import type { CategoryId } from '../../lib/types';
import { toFa } from '../../lib/format';
import MegaMenu from './MegaMenu';
import SearchBox from '../search/SearchBox';

export default function Header() {
  const { cartCount, wishlist, openCart } = useStore();
  const [openMenu, setOpenMenu] = useState<CategoryId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigating away must never leave the mega menu hanging.
  useEffect(() => setOpenMenu(null), [location.pathname, location.search]);

  const isActive = (to: string) => {
    const path = to.split('?')[0];
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const iconBtn =
    'relative flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-cream';

  const closeMenu = () => setOpenMenu(null);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_8px_28px_-18px_rgba(13,53,68,.35)]' : ''
      }`}
      onMouseLeave={closeMenu}
    >
      <div className="container relative">
        <div className="flex h-[64px] items-center gap-3 lg:h-[74px] lg:gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" onMouseEnter={closeMenu}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-[17px] font-black tracking-tight text-white">
              S
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[19px] font-black tracking-[0.14em] text-ink lg:text-[21px]">
                STYLEON
              </span>
              <span className="mt-1 text-[8.5px] tracking-[0.3em] text-muted lg:text-[9px]">
                WEAR YOUR STYLE
              </span>
            </span>
          </Link>

          {/* Desktop search: light pill, per the reference header */}
          <div
            onMouseEnter={closeMenu}
            className="mx-auto hidden min-w-0 max-w-[620px] flex-1 lg:block"
          >
            <SearchBox />
          </div>

          {/* Phones use the bottom tab bar for the cart; this row keeps the search shortcut. */}
          <div className="ms-auto flex items-center gap-1 lg:ms-0" onMouseEnter={closeMenu}>
            <Link to="/search" aria-label="جستجو" className={`${iconBtn} lg:hidden`}>
              <Search className="h-5 w-5" />
            </Link>
            <Link to="/wishlist" aria-label="علاقه‌مندی‌ها" className={`${iconBtn} hidden sm:flex`}>
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 ? (
                <span className="absolute -top-0.5 end-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-800 px-1 text-[10px] font-bold text-white">
                  {toFa(wishlist.length)}
                </span>
              ) : null}
            </Link>
            <Link to="/account" aria-label="حساب کاربری" className={`${iconBtn} hidden sm:flex`}>
              <User className="h-5 w-5" />
            </Link>
            <button type="button" onClick={openCart} aria-label="سبد خرید" className={iconBtn}>
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 end-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">
                  {toFa(cartCount)}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Second row: the main menu sits under the search bar */}
        <nav className="hidden items-center gap-1 pb-2 lg:flex" aria-label="ناوبری اصلی">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onMouseEnter={() => setOpenMenu(link.category ?? null)}
              aria-haspopup={link.category ? 'true' : undefined}
              aria-expanded={link.category ? openMenu === link.category : undefined}
              className={`relative flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors xl:px-3 xl:text-sm ${
                isActive(link.to) ? 'text-black' : 'text-ink/75 hover:bg-cream hover:text-ink'
              }`}
            >
              {link.label}
              {link.category ? <ChevronDown className="h-3.5 w-3.5 opacity-60" /> : null}
              {isActive(link.to) ? (
                <span className="absolute inset-x-2.5 bottom-0.5 h-0.5 rounded-full bg-teal-700" />
              ) : null}
            </Link>
          ))}
        </nav>

        {openMenu ? <MegaMenu category={openMenu} onNavigate={closeMenu} /> : null}
      </div>
    </header>
  );
}
