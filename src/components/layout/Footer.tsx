import { ArrowRight, Check, Instagram, Linkedin, Facebook, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { company, navLinks, services } from '@/data/site'
import { submitInquiry } from '@/lib/inquiries'

const socialIcons = {
  Instagram: Instagram,
  LinkedIn: Linkedin,
  Facebook: Facebook,
} as const

export function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'done'>('idle')

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      setStatus('error')
      return
    }
    await submitInquiry({
      kind: 'contact',
      name: email.trim(),
      email: email.trim(),
      message: 'Newsletter subscription request',
    })
    setStatus('done')
    setEmail('')
  }

  return (
    <footer className="bg-navy text-white">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/60">
              A boutique agency representing architecturally significant homes and prime
              residential investments across the United States.
            </p>
            <div className="mt-7 flex items-center gap-3">
              {company.socials.map((social) => {
                const Icon = socialIcons[social.label as keyof typeof socialIcons]
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors duration-500 ease-premium hover:border-gold hover:text-gold"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </a>
                )
              })}
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              Navigate
            </h2>
            <ul className="mt-6 space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/65 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              Services
            </h2>
            <ul className="mt-6 space-y-3">
              {services.slice(0, 5).map((service) => (
                <li key={service.title}>
                  <Link
                    to="/services"
                    className="text-sm text-white/65 transition-colors duration-300 hover:text-white"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              Get in touch
            </h2>
            <ul className="mt-6 space-y-4 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.7} />
                <a href={company.phoneHref} className="transition-colors hover:text-white">
                  {company.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.7} />
                <a
                  href={`mailto:${company.email}`}
                  className="transition-colors hover:text-white"
                >
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.7} />
                <span>
                  {company.address.line1}
                  <br />
                  {company.address.line2}
                </span>
              </li>
            </ul>

            <form onSubmit={handleSubscribe} className="mt-7">
              <label
                htmlFor="newsletter-email"
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50"
              >
                Private listings
              </label>
              <div className="mt-3 flex items-center gap-2 border-b border-white/20 pb-2 focus-within:border-gold">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (status !== 'idle') setStatus('idle')
                  }}
                  placeholder="Email address"
                  aria-invalid={status === 'error'}
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to private listings"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-gold transition-colors duration-300 hover:bg-gold hover:text-navy"
                >
                  {status === 'done' ? (
                    <Check className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              </div>
              <p
                aria-live="polite"
                className="mt-2 min-h-[18px] text-xs text-white/50"
              >
                {status === 'error'
                  ? 'Please enter a valid email address.'
                  : status === 'done'
                    ? 'Thank you — you will hear from us shortly.'
                    : 'Off-market homes, sent monthly.'}
              </p>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Horizon Properties. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>{company.hours}</span>
            <Link to="/contact" className="transition-colors hover:text-white">
              Privacy & terms
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  )
}
