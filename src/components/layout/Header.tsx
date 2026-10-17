import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { BottomNav } from './BottomNav';
import { Icon } from '@/components/ui/Icon';
import { useApp } from '@/context/AppContext';
import { OTHER_SERVICES } from '@/data/services';
import { SUPPORT_CONTACT } from '@/data/content';
import { NAV_ITEMS } from '@/data/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  const { user, logout } = useApp();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setAccountOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const openWithDelay = (key: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenMenu(key);
  };

  const closeWithDelay = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 160);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition',
          scrolled ? 'border-ink-200 shadow-card' : 'border-transparent',
        )}
      >
        <div className="container-page">
          <div className="flex h-16 items-center gap-4">
            {/* منوی موبایل */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="باز کردن منو"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 transition hover:bg-ink-100 lg:hidden"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>

            <Logo />

            {/* ناوبری دسکتاپ */}
            <nav className="hidden flex-1 items-center justify-center lg:flex">
              <ul className="flex items-center gap-0.5">
                {NAV_ITEMS.map((item) => (
                  <li
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => item.menu && openWithDelay(item.menu)}
                    onMouseLeave={closeWithDelay}
                  >
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-1 rounded-lg px-3 py-2 text-[0.8rem] font-medium transition',
                          isActive ? 'text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                        )
                      }
                      onFocus={() => item.menu && openWithDelay(item.menu)}
                    >
                      {item.label}
                      {item.menu && <Icon name="chevron-down" className="h-3.5 w-3.5 opacity-60" />}
                    </NavLink>
                    {item.menu === 'more' && openMenu === 'more' && (
                      <ServicesMenu onClose={() => setOpenMenu(null)} />
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* اقدامات */}
            <div className="ms-auto flex items-center gap-2 lg:ms-0">
              {/* فقط آیکون هدفون — شماره با هاور باز می‌شود */}
              <a
                href={`tel:${SUPPORT_CONTACT.phoneRaw}`}
                aria-label={`تماس با پشتیبانی ${SUPPORT_CONTACT.phone}`}
                className="group hidden h-10 items-center rounded-lg px-2.5 text-xs font-medium text-ink-600 transition hover:text-brand-700 xl:flex"
              >
                <Icon name="support" className="h-5 w-5 text-brand-600" />
                <span className="num max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ms-1.5 group-hover:max-w-[110px] group-hover:opacity-100">
                  {SUPPORT_CONTACT.phone}
                </span>
              </a>

              {/* فقط آیکون کیف — متن با هاور باز می‌شود */}
              <Link
                to="/account"
                aria-label="سفرهای من"
                className="group hidden h-10 items-center rounded-lg px-2.5 text-xs font-medium text-ink-600 transition hover:text-brand-700 lg:flex"
              >
                <Icon name="briefcase" className="h-5 w-5" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ms-1.5 group-hover:max-w-[80px] group-hover:opacity-100">
                  سفرهای من
                </span>
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((current) => !current)}
                    className="flex h-10 items-center gap-2 rounded-lg px-2.5 transition hover:text-brand-700"
                    aria-expanded={accountOpen}
                  >
                    <Icon name="user" className="h-5 w-5" />
                    <Icon name="chevron-down" className="h-3.5 w-3.5 text-ink-400" />
                  </button>
                  {accountOpen && (
                    <div className="absolute end-0 top-[calc(100%+6px)] z-50 w-56 animate-pop-in rounded-xl border border-ink-200 bg-white p-1.5 shadow-pop">
                      <div className="border-b border-ink-100 px-3 py-2.5">
                        <p className="text-xs font-semibold text-ink-900">{user.name}</p>
                        <p className="num mt-0.5 text-2xs text-ink-500">{user.phone}</p>
                      </div>
                      <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-700 hover:bg-ink-50">
                        <Icon name="briefcase" className="h-4 w-4 text-ink-400" />
                        سفرهای من
                      </Link>
                      <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-700 hover:bg-ink-50">
                        <Icon name="heart" className="h-4 w-4 text-ink-400" />
                        علاقه‌مندی‌ها
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setAccountOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-danger-600 hover:bg-danger-50"
                      >
                        <Icon name="logout" className="h-4 w-4" />
                        خروج از حساب
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* فقط آیکون — متن با هاور باز می‌شود */
                <Link
                  to="/login"
                  aria-label="ورود / ثبت‌نام"
                  className="group hidden h-10 items-center rounded-lg px-2.5 text-xs font-medium text-ink-600 transition hover:text-brand-700 lg:flex"
                >
                  <Icon name="user" className="h-5 w-5" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ms-1.5 group-hover:max-w-[90px] group-hover:opacity-100">
                    ورود / ثبت‌نام
                  </span>
                </Link>
              )}

              <Link
                to="/login"
                aria-label="حساب کاربری"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 transition hover:text-brand-700 lg:hidden"
              >
                <Icon name="user" className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <BottomNav />
    </>
  );
}

/* --------------------------------------------- منوی کشویی «سایر خدمات» ---- */

function ServicesMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute end-0 top-[calc(100%+8px)] z-50 w-60 animate-pop-in rounded-xl border border-ink-200 bg-white p-1.5 shadow-pop">
      {OTHER_SERVICES.map((service) => (
        <Link
          key={service.key}
          to={service.href}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-ink-700 transition hover:bg-ink-50"
        >
          <Icon name={service.icon} className="h-4 w-4 text-brand-600" />
          {service.title}
        </Link>
      ))}
      <Link
        to="/services"
        onClick={onClose}
        className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-ink-50 py-2 text-2xs font-medium text-ink-700 transition hover:bg-ink-100"
      >
        همه‌ی خدمات سفربان
        <Icon name="chevron-left" className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
