import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { BottomNav } from './BottomNav';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { DOMESTIC_DESTINATIONS, INTERNATIONAL_DESTINATIONS } from '@/data/destinations';
import { MORE_SERVICES } from '@/data/services';
import { POPULAR_DOMESTIC_ROUTES, POPULAR_INTERNATIONAL_ROUTES, cityByCode } from '@/data/cities';
import { SUPPORT_CONTACT } from '@/data/content';
import { cn, formatNumber } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';

interface NavItem {
  label: string;
  href: string;
  mega?: 'flight' | 'hotel' | 'more';
}

const NAV_ITEMS: NavItem[] = [
  { label: 'پرواز', href: '/flights', mega: 'flight' },
  { label: 'هتل', href: '/hotels', mega: 'hotel' },
  { label: 'قطار', href: '/trains' },
  { label: 'اتوبوس', href: '/buses' },
  { label: 'تور', href: '/tours' },
  { label: 'ویلا و اقامتگاه', href: '/stays' },
  { label: 'ویزا', href: '/services/visa' },
  { label: 'بیمه', href: '/services/insurance' },
  { label: 'سایر خدمات', href: '/services', mega: 'more' },
];

export function Header() {
  const location = useLocation();
  const { user, logout } = useApp();
  const [openMega, setOpenMega] = useState<string | null>(null);
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
    setOpenMega(null);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMega(null);
        setAccountOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const openWithDelay = (key: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenMega(key);
  };

  const closeWithDelay = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMega(null), 160);
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
                    onMouseEnter={() => item.mega && openWithDelay(item.mega)}
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
                      onFocus={() => item.mega && openWithDelay(item.mega)}
                    >
                      {item.label}
                      {item.mega && <Icon name="chevron-down" className="h-3.5 w-3.5 opacity-60" />}
                    </NavLink>
                    {item.mega && openMega === item.mega && (
                      <MegaPanel kind={item.mega} onClose={() => setOpenMega(null)} />
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* اقدامات */}
            <div className="ms-auto flex items-center gap-2 lg:ms-0">
              <a
                href={`tel:${SUPPORT_CONTACT.phoneRaw}`}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-600 transition hover:bg-ink-50 xl:flex"
              >
                <Icon name="support" className="h-4 w-4 text-brand-600" />
                <span className="num">{SUPPORT_CONTACT.phone}</span>
              </a>

              <Link
                to="/account"
                className="hidden h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium text-ink-600 transition hover:bg-ink-50 lg:flex"
              >
                <Icon name="briefcase" className="h-4 w-4" />
                سفرهای من
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((current) => !current)}
                    className="flex h-10 items-center gap-2 rounded-lg border border-ink-200 px-2.5 transition hover:border-ink-300"
                    aria-expanded={accountOpen}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                      {user.name.slice(0, 1)}
                    </span>
                    <span className="hidden max-w-[90px] truncate text-xs font-medium text-ink-800 sm:block">
                      {user.name}
                    </span>
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
                <Link to="/login" className="hidden lg:block">
                  <Button size="sm" variant="primary" className="h-10 px-4 text-xs">
                    ورود / ثبت‌نام
                  </Button>
                </Link>
              )}

              <Link
                to="/login"
                aria-label="حساب کاربری"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-600 transition hover:border-ink-300 lg:hidden"
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

/* ------------------------------------------------------------------ مگامنو ---- */

function MegaPanel({ kind, onClose }: { kind: 'flight' | 'hotel' | 'more'; onClose: () => void }) {
  return (
    <div
      className={cn(
        'absolute top-[calc(100%+8px)] z-50 animate-pop-in rounded-xl border border-ink-200 bg-white p-4 shadow-pop',
        kind === 'more' ? 'end-0 w-[520px]' : 'start-0 w-[640px]',
      )}
    >
      {kind === 'flight' && (
        <div className="grid grid-cols-[1.1fr_1.1fr_0.9fr] gap-4">
          <MegaColumn
            title="پرترددترین پروازهای داخلی"
            items={POPULAR_DOMESTIC_ROUTES.map(([from, to]) => ({
              label: `${cityByCode(from)?.name} — ${cityByCode(to)?.name}`,
              href: `/flights?from=${from}&to=${to}&trip=oneway`,
            }))}
            onClose={onClose}
          />
          <MegaColumn
            title="پرترددترین پروازهای خارجی"
            items={POPULAR_INTERNATIONAL_ROUTES.map(([from, to]) => ({
              label: `${cityByCode(from)?.name ?? 'تهران'} — ${cityByCode(to)?.name}`,
              href: `/flights?from=${from}&to=${to}&trip=oneway`,
            })).filter((item) => !item.label.includes('undefined'))}
            onClose={onClose}
          />
          <div className="rounded-xl bg-brand-50 p-3">
            <p className="text-xs font-bold text-brand-800">پروازهای ارزان امروز</p>
            <p className="mt-1.5 text-2xs leading-5 text-brand-700/80">
              با فعال‌کردن «تقویم قیمت»، ارزان‌ترین روزهای ماه را ببینید.
            </p>
            <Link
              to="/flights"
              onClick={onClose}
              className="mt-3 flex items-center gap-1 text-2xs font-medium text-brand-700"
            >
              جستجوی پرواز
              <Icon name="chevron-left" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {kind === 'hotel' && (
        <div className="grid grid-cols-3 gap-4">
          <MegaColumn
            title="اقامت در ایران"
            items={DOMESTIC_DESTINATIONS.slice(0, 6).map((d) => ({
              label: d.name,
              href: `/hotels?city=${d.code}&name=${encodeURIComponent(d.name)}`,
              hint: `از ${formatNumber(d.startingPrice)} تومان`,
            }))}
            onClose={onClose}
          />
          <MegaColumn
            title="اقامت در جهان"
            items={INTERNATIONAL_DESTINATIONS.slice(0, 6).map((d) => ({
              label: d.name,
              href: `/hotels?city=${d.code}&name=${encodeURIComponent(d.name)}`,
              hint: `از ${formatNumber(d.startingPrice)} تومان`,
            }))}
            onClose={onClose}
          />
          <MegaColumn
            title="ویلا و اقامتگاه"
            items={[
              { label: 'ویلای ساحلی کیش', href: '/stays?city=KIH&name=%DA%A9%DB%8C%D8%B4' },
              { label: 'اقامتگاه جنگلی رامسر', href: '/stays?name=%D8%B1%D8%A7%D9%85%D8%B3%D8%B1' },
              { label: 'خانه‌های سنتی اصفهان', href: '/stays?city=IFN&name=%D8%A7%D8%B5%D9%81%D9%87%D8%A7%D9%86' },
              { label: 'آپارتمان مبله مشهد', href: '/stays?city=MHD&name=%D9%85%D8%B4%D9%87%D8%AF' },
              { label: 'همه اقامتگاه‌ها', href: '/stays' },
            ]}
            onClose={onClose}
          />
        </div>
      )}

      {kind === 'more' && (
        <div className="grid grid-cols-2 gap-1.5">
          {MORE_SERVICES.map((service) => (
            <Link
              key={service.key}
              to={service.href}
              onClick={onClose}
              className="flex items-start gap-3 rounded-lg p-2.5 transition hover:bg-ink-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-medium text-ink-800">{service.title}</span>
                <span className="mt-0.5 block text-2xs text-ink-500">{service.description}</span>
              </span>
            </Link>
          ))}
          <Link
            to="/services"
            onClick={onClose}
            className="col-span-2 mt-1 flex items-center justify-center gap-1 rounded-lg bg-ink-50 py-2.5 text-2xs font-medium text-ink-700 transition hover:bg-ink-100"
          >
            مشاهده‌ی همه‌ی خدمات سفربان
            <Icon name="chevron-left" className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function MegaColumn({
  title,
  items,
  onClose,
}: {
  title: string;
  items: Array<{ label: string; href: string; hint?: string }>;
  onClose: () => void;
}) {
  return (
    <div>
      <p className="mb-2 text-2xs font-bold text-ink-400">{title}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href + item.label}>
            <Link
              to={item.href}
              onClick={onClose}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-xs text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
            >
              <span>{item.label}</span>
              {item.hint && <span className="num text-2xs text-ink-400">{item.hint}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { NAV_ITEMS };
export const NAV_BADGE = faDigits(0);
