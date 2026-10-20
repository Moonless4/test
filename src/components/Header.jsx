import { useState } from 'react'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { navLinks } from '../data/site'

const iconButton =
  'grid h-10 w-10 place-items-center rounded-full border border-black/10 text-ink/65 transition hover:border-brand hover:text-brand'

export default function Header({ cartCount = 0 }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="container-page flex h-20 items-center gap-3 md:h-24 md:gap-6">
        <nav className="hidden flex-1 items-center gap-7 text-[15px] font-medium text-ink/75 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-brand">
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#home"
          className="shrink-0 rounded-[20px] bg-brand px-5 py-2 text-center text-white shadow-[0_14px_30px_-14px_rgba(184,0,31,0.85)] transition hover:bg-brand-dark md:px-8 md:py-2.5"
        >
          <span className="block text-[9px] font-medium tracking-[0.32em] text-white/75 md:text-[10px]">
            رستوران
          </span>
          <span className="block text-xl font-black leading-tight md:text-2xl">نوال</span>
        </a>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-2.5">
          <button type="button" className={`${iconButton} relative`} aria-label="سبد خرید">
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -left-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink">
                {cartCount.toLocaleString('fa-IR')}
              </span>
            )}
          </button>

          <button type="button" className={iconButton} aria-label="جستجو">
            <Search size={18} />
          </button>

          <button type="button" className={`${iconButton} hidden sm:grid`} aria-label="حساب کاربری">
            <User size={18} />
          </button>

          <a
            href="#contact"
            className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark md:inline-flex"
          >
            ورود / ثبت نام
          </a>

          <button
            type="button"
            className={`${iconButton} lg:hidden`}
            aria-label="منو"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-black/5 py-3 text-sm font-medium text-ink/80 last:border-0"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-full bg-brand px-5 py-2.5 text-center text-sm font-medium text-white"
            >
              ورود / ثبت نام
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
