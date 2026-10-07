import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NAV_LINKS } from '../../lib/nav';
import type { CategoryId } from '../../lib/types';
import { toFa } from '../../lib/format';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';

export default function Header() {
  const { cartCount, wishlist, openCart } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigating away must never leave the mega menu hanging.
  useEffect(() => setOpenMenu(null), [location.pathname, location.search]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery('');
    setMenuOpen(false);
  };

  const isActive = (to: string) => {
    const path = to.split('?')[0];
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const iconBtn =
    'relative flex h-10 w-10 items-center justify-center rounded-xl text-white/85 transition-colors hover:bg-white/10 hover:text-white';

  const closeMenu = () => setOpenMenu(null);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-teal-800 text-white transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_8px_28px_-12px_rgba(13,53,68,.6)]' : ''
        }`}
        onMouseLeave={closeMenu}
      >
        <div className="container relative">
          <div className="flex h-[68px] items-center gap-3 lg:h-[76px] lg:gap-5">
            {/* Mobile: hamburger + logo */}
            <button
              type="button"
              aria-label="منو"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className={`${iconBtn} lg:hidden`}
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex shrink-0 items-center gap-2.5" onMouseEnter={closeMenu}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 text-[17px] font-black tracking-tight ring-1 ring-white/20">
                S
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[19px] font-black tracking-[0.14em] lg:text-[21px]">
                  STYLEON
                </span>
                <span className="mt-1 text-[8.5px] tracking-[0.3em] text-teal-200 lg:text-[9px]">
                  WEAR YOUR STYLE
                </span>
              </span>
            </Link>

            {/* Desktop search */}
            <form
              onSubmit={submitSearch}
              role="search"
              onMouseEnter={closeMenu}
              className="mx-auto hidden min-w-0 max-w-[420px] flex-1 items-center gap-2 rounded-xl bg-white/10 px-4 ring-1 ring-white/15 transition-colors focus-within:bg-white/15 lg:flex"
            >
              <Search className="h-4 w-4 shrink-0 text-teal-200" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="جستجوی محصولات"
                placeholder="جستجوی محصول، برند یا دسته‌بندی..."
                className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/55"
              />
            </form>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onMouseEnter={() => setOpenMenu(link.category ?? null)}
                  aria-haspopup={link.category ? 'true' : undefined}
                  aria-expanded={link.category ? openMenu === link.category : undefined}
                  className={`relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors xl:px-3 xl:text-sm ${
                    isActive(link.to)
                      ? 'text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive(link.to) ? (
                    <span className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-teal-300" />
                  ) : null}
                </Link>
              ))}
            </nav>

            <div className="ms-auto flex items-center gap-1 lg:ms-0" onMouseEnter={closeMenu}>
              <Link to="/search" aria-label="جستجو" className={`${iconBtn} lg:hidden`}>
                <Search className="h-5 w-5" />
              </Link>
              <Link to="/wishlist" aria-label="علاقه‌مندی‌ها" className={`${iconBtn} hidden sm:flex`}>
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 ? (
                  <span className="absolute -top-0.5 end-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-300 px-1 text-[10px] font-bold text-teal-900">
                    {toFa(wishlist.length)}
                  </span>
                ) : null}
              </Link>
              <Link to="/checkout" aria-label="حساب کاربری" className={`${iconBtn} hidden sm:flex`}>
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

          {openMenu ? <MegaMenu category={openMenu} onNavigate={closeMenu} /> : null}
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
