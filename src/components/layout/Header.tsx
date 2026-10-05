import clsx from 'clsx'
import { Heart, Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { company, navLinks } from '@/data/site'
import { useFavorites } from '@/lib/favorites'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const favorites = useFavorites()

  const isHome = pathname === '/'
  const onDark = !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  const shellClasses = scrolled
    ? 'border-b border-navy/10 bg-white/95 backdrop-blur-md'
    : isHome
      ? 'border-b border-transparent bg-gradient-to-b from-navy/55 via-navy/20 to-transparent'
      : 'border-b border-white/10 bg-navy'

  const linkTone = onDark
    ? 'text-white/75 hover:text-white'
    : 'text-ink/65 hover:text-ink'
  const linkActive = onDark ? 'text-white' : 'text-ink'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={clsx('transition-colors duration-500 ease-premium', shellClasses)}>
        <Container>
          <div className="flex h-[70px] items-center justify-between gap-6 lg:h-[84px]">
            <Logo tone={onDark ? 'light' : 'dark'} />

            <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    clsx(
                      'group relative py-2 text-[13px] font-medium tracking-wide transition-colors duration-500',
                      linkTone,
                      isActive && linkActive,
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={clsx(
                          'absolute -bottom-0.5 left-0 h-px bg-gold transition-[width] duration-500 ease-premium',
                          isActive ? 'w-full' : 'w-0 group-hover:w-full',
                        )}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <NavLink
                to="/favorites"
                aria-label={`Saved properties${favorites.length ? ` (${favorites.length})` : ''}`}
                className={({ isActive }) =>
                  clsx(
                    'relative hidden h-10 w-10 place-items-center rounded-full border transition-colors duration-500 ease-premium sm:grid',
                    onDark
                      ? 'border-white/25 text-white hover:border-white hover:bg-white/10'
                      : 'border-navy/15 text-navy hover:border-navy hover:bg-navy hover:text-white',
                    isActive && 'border-gold text-gold',
                  )
                }
              >
                <Heart className="h-4 w-4" strokeWidth={1.8} />
                {favorites.length > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-semibold text-white">
                    {favorites.length}
                  </span>
                ) : null}
              </NavLink>

              <Button
                href={company.phoneHref}
                variant={onDark ? 'outlineLight' : 'outlineDark'}
                size="sm"
                icon={<Phone className="h-3.5 w-3.5" strokeWidth={1.8} />}
                className="hidden sm:inline-flex"
              >
                {company.phone}
              </Button>

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className={clsx(
                  'grid h-10 w-10 place-items-center rounded-full border transition-colors duration-500 ease-premium lg:hidden',
                  onDark
                    ? 'border-white/25 text-white hover:border-white hover:bg-white/10'
                    : 'border-navy/15 text-navy hover:border-navy hover:bg-navy hover:text-white',
                )}
              >
                {menuOpen ? (
                  <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
                ) : (
                  <Menu className="h-[18px] w-[18px]" strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>
        </Container>

        {menuOpen ? (
          <div id="mobile-menu" className="animate-panel-in border-t border-white/10 bg-navy lg:hidden">
            <Container className="py-7">
              <nav aria-label="Mobile" className="flex flex-col">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center justify-between border-b border-white/10 py-4 text-[15px] font-medium transition-colors duration-300',
                        isActive ? 'text-white' : 'text-white/70 hover:text-white',
                      )
                    }
                  >
                    {link.label}
                    <span className="h-1 w-1 rounded-full bg-gold opacity-0 transition-opacity duration-300 [.text-white_&]:opacity-100" />
                  </NavLink>
                ))}
              </nav>

              <div className="mt-7 flex flex-col gap-3">
                <Button
                  href={company.phoneHref}
                  variant="ivory"
                  size="lg"
                  icon={<Phone className="h-4 w-4" strokeWidth={1.8} />}
                  className="w-full"
                >
                  {company.phone}
                </Button>
                <Button
                  to="/favorites"
                  variant="outlineLight"
                  size="lg"
                  icon={<Heart className="h-4 w-4" strokeWidth={1.8} />}
                  className="w-full"
                >
                  Saved properties{favorites.length ? ` (${favorites.length})` : ''}
                </Button>
              </div>
            </Container>
          </div>
        ) : null}
      </div>
    </header>
  )
}
