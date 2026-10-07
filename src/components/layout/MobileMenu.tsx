import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Instagram, Search, Send, ShoppingBag, User, X } from 'lucide-react';
import { NAV_LINKS } from '../../lib/nav';
import { MIN_QUERY } from '../../lib/search';
import SearchSuggestions from '../search/SearchSuggestions';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Navigating anywhere closes the drawer, including from the suggestion list.
  useEffect(() => {
    setQuery('');
    onClose();
  }, [location.pathname, location.search, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery('');
    onClose();
  };

  /** Opening one of the live suggestions closes the drawer. */
  const closeSearch = () => {
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        aria-label="بستن منو"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-teal-950/50 backdrop-blur-sm motion-safe:animate-fade-in"
      />

      <div className="absolute inset-y-0 end-0 flex w-[86%] max-w-[340px] flex-col bg-white shadow-2xl motion-safe:animate-drawer-right">
        <div className="flex items-center justify-between border-b border-line bg-teal-800 px-4 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/12 text-base font-black ring-1 ring-white/20">
              S
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-base font-black tracking-[0.14em]">STYLEON</span>
              <span className="mt-1 text-[8px] tracking-[0.3em] text-teal-200">
                WEAR YOUR STYLE
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} role="search" className="border-b border-line p-4">
          <div className="flex items-center gap-2 rounded-xl bg-cream px-3.5 ring-1 ring-line focus-within:ring-teal-300">
            <Search className="h-4 w-4 shrink-0 text-black" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="جستجوی محصولات"
              placeholder="جستجوی محصول..."
              className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>
        </form>

        {query.trim().length >= MIN_QUERY ? (
          <div className="max-h-[46vh] overflow-y-auto border-b border-line">
            <SearchSuggestions query={query} onSelect={closeSearch} />
          </div>
        ) : null}

        <nav className="flex-1 overflow-y-auto p-2" aria-label="ناوبری موبایل">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="flex min-h-12 items-center justify-between rounded-xl px-4 text-[15px] font-medium text-ink transition-colors hover:bg-cream"
            >
              {link.label}
              <span className="text-teal-300">‹</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <div className="grid grid-cols-3 gap-2">
            <Link
              to="/wishlist"
              onClick={onClose}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-cream text-[11px] font-medium text-black"
            >
              <Heart className="h-4 w-4" />
              علاقه‌مندی
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-cream text-[11px] font-medium text-black"
            >
              <ShoppingBag className="h-4 w-4" />
              سبد خرید
            </Link>
            <Link
              to="/account"
              onClick={onClose}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-cream text-[11px] font-medium text-black"
            >
              <User className="h-4 w-4" />
              حساب من
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 text-black">
            <a href="#" aria-label="اینستاگرام" className="rounded-lg p-2 hover:bg-cream">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="تلگرام" className="rounded-lg p-2 hover:bg-cream">
              <Send className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
