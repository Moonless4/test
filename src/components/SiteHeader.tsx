import { useEffect, useRef, useState } from 'react';
import { brand, navItems, type NavItem } from '@/data/site';
import {
  ArticleIcon,
  CartIcon,
  ChevronDownIcon,
  CloseIcon,
  FolderIcon,
  HomeIcon,
  LuxinaMark,
  MenuIcon,
  PagesIcon,
  PhoneIcon,
  UserIcon,
} from '@/components/Icons';

const iconMap = {
  home: HomeIcon,
  folder: FolderIcon,
  article: ArticleIcon,
  pages: PagesIcon,
};

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-3">
      <LuxinaMark className="h-10 w-10 shrink-0 lg:h-11 lg:w-11" />
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-extrabold tracking-tight text-white lg:text-xl">
          {brand.name}
        </span>
        <span className="text-[10px] font-medium text-white/50 lg:text-[11px]">
          {brand.tagline}
        </span>
      </span>
    </a>
  );
}

function NavDropdown({ item, isOpen, onToggle }: { item: NavItem; isOpen: boolean; onToggle: () => void }) {
  const Icon = iconMap[item.icon];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isOpen ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
        }`}
      >
        <Icon className="h-[18px] w-[18px] text-white/60" />
        <span>{item.label}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && item.items && (
        <div className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-night-800/95 p-1.5 shadow-overlay backdrop-blur-xl animate-fade-up">
          {item.items.map((sub) => (
            <a
              key={sub.href}
              href={sub.href}
              className="block rounded-md px-3 py-2 text-[13px] text-white/75 transition-colors hover:bg-white/[0.07] hover:text-gold"
            >
              {sub.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="relative z-50 border-b border-white/[0.07] bg-night/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-5 lg:h-24 lg:px-12">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
          {navItems.map((item) =>
            item.items ? (
              <NavDropdown
                key={item.label}
                item={item}
                isOpen={openMenu === item.label}
                onToggle={() => setOpenMenu(openMenu === item.label ? null : item.label)}
              />
            ) : (
              <a
                key={item.label}
                href="#top"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
              >
                <HomeIcon className="h-[18px] w-[18px] text-gold" />
                <span>{item.label}</span>
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${brand.phone}`}
            className="hidden items-center gap-2 text-sm text-white/75 transition-colors hover:text-gold xl:flex"
          >
            <span className="text-white/50">{brand.consultationLabel}</span>
            <span className="font-medium tracking-wide text-white/90" dir="ltr">
              {brand.phone}
            </span>
            <PhoneIcon className="h-[18px] w-[18px] text-gold" />
          </a>

          <span className="hidden h-6 w-px bg-white/15 xl:block" />

          <button
            type="button"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:text-gold sm:block"
          >
            ورود
          </button>

          <button
            type="button"
            className="hidden items-center gap-2 rounded-md border border-white/15 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:border-gold/50 hover:text-gold sm:flex"
          >
            <UserIcon className="h-[18px] w-[18px]" />
            <span>عضویت</span>
          </button>

          <button
            type="button"
            aria-label="سبد خرید"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-white/85 transition-colors hover:border-gold/40 hover:text-gold"
          >
            <CartIcon className="h-[18px] w-[18px]" />
          </button>

          <button
            type="button"
            aria-label="منو"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-white lg:hidden"
          >
            {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.07] bg-night-900/95 px-5 pb-6 pt-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              منوی سایت
            </span>
            <button
              type="button"
              aria-label="بستن منو"
              onClick={() => setMobileOpen(false)}
              className="text-white/60"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col" aria-label="ناوبری موبایل">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <div key={item.label} className="border-b border-white/[0.06] last:border-0">
                  <div className="flex items-center gap-2.5 py-3 text-sm font-medium text-white">
                    <Icon className="h-[18px] w-[18px] text-gold" />
                    <span>{item.label}</span>
                  </div>
                  {item.items && (
                    <div className="flex flex-col gap-1 pb-3 ps-7">
                      {item.items.map((sub) => (
                        <a
                          key={sub.href}
                          href={sub.href}
                          className="text-[13px] text-white/60 transition-colors hover:text-gold"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <a
            href={`tel:${brand.phone}`}
            className="mt-4 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white"
          >
            <span className="flex items-center gap-2">
              <PhoneIcon className="h-[18px] w-[18px] text-gold" />
              {brand.consultationLabel}
            </span>
            <span dir="ltr" className="font-medium">
              {brand.phone}
            </span>
          </a>
        </div>
      )}
    </header>
  );
}
