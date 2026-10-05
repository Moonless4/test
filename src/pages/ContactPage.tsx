import { ArrowRight, Check, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { fieldClasses, fieldLabelClasses } from '@/components/ui/fieldClasses'
import { company } from '@/data/site'
import { photo, photoSrcSet } from '@/lib/images'
import { submitInquiry } from '@/lib/inquiries'

const interests = [
  'Buying a home',
  'Selling a home',
  'Investment property',
  'Valuation or advisory',
  'Relocation',
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [interest, setInterest] = useState(interests[0])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please complete your name, email and message.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('That email address does not look right.')
      return
    }

    setError('')
    setSending(true)
    await submitInquiry({
      kind: 'contact',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      message: `[${interest}] ${message.trim()}`,
    })
    setSending(false)
    setSent(true)
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
  }

  return (
    <>
      <PageHero
        label="Contact"
        title="Let's find your next address"
        description="Tell us what you are looking for. Every enquiry is answered personally by a senior advisor within one business day."
      />

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <Reveal>
              <div className="rounded-card border border-line bg-white p-7 shadow-soft sm:p-9">
                {sent ? (
                  <div className="py-6">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
                      <Check className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h2 className="mt-6 text-[22px] font-semibold tracking-tight text-ink">
                      Thank you — your enquiry is with us
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      A senior advisor will be in touch within one business day. If your enquiry is
                      urgent, call us directly on {company.phone}.
                    </p>
                    <Button className="mt-8" size="lg" onClick={() => setSent(false)}>
                      Send another enquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="page-contact-name" className={fieldLabelClasses}>
                          Full name
                        </label>
                        <input
                          id="page-contact-name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className={fieldClasses}
                          placeholder="Jane Whitfield"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label htmlFor="page-contact-email" className={fieldLabelClasses}>
                          Email
                        </label>
                        <input
                          id="page-contact-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className={fieldClasses}
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="page-contact-phone" className={fieldLabelClasses}>
                          Phone <span className="normal-case tracking-normal text-muted/60">(optional)</span>
                        </label>
                        <input
                          id="page-contact-phone"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className={fieldClasses}
                          placeholder="(555) 000-0000"
                          autoComplete="tel"
                        />
                      </div>
                      <div>
                        <label htmlFor="page-contact-interest" className={fieldLabelClasses}>
                          I am interested in
                        </label>
                        <select
                          id="page-contact-interest"
                          value={interest}
                          onChange={(event) => setInterest(event.target.value)}
                          className={fieldClasses}
                        >
                          {interests.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="page-contact-message" className={fieldLabelClasses}>
                        Message
                      </label>
                      <textarea
                        id="page-contact-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={5}
                        placeholder="Tell us about the home you are looking for, your timeline and budget."
                        className={`${fieldClasses} resize-none`}
                      />
                    </div>

                    {error ? (
                      <p role="alert" className="text-sm text-gold-dark">
                        {error}
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={sending}
                      icon={<ArrowRight className="h-4 w-4" strokeWidth={1.8} />}
                    >
                      {sending ? 'Sending…' : 'Send enquiry'}
                    </Button>

                    <p className="text-xs leading-relaxed text-muted/80">
                      We use your details only to respond to this enquiry. No marketing lists, no
                      third parties.
                    </p>
                  </form>
                )}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="overflow-hidden rounded-card bg-mist">
                <img
                  src={photo('photo-1600566753190-17f0baa2a6c3', 1200)}
                  srcSet={photoSrcSet('photo-1600566753190-17f0baa2a6c3', [640, 960, 1280])}
                  sizes="(min-width: 1024px) 42vw, 90vw"
                  alt="A modern residence with timber cladding and a landscaped approach"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/11] w-full object-cover"
                />
              </div>

              <dl className="mt-9 grid gap-7 border-t border-line pt-9 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                    <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                    Telephone
                  </dt>
                  <dd className="mt-2.5 text-sm">
                    <a href={company.phoneHref} className="text-ink transition-colors hover:text-gold">
                      {company.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                    <Mail className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                    Email
                  </dt>
                  <dd className="mt-2.5 text-sm">
                    <a
                      href={`mailto:${company.email}`}
                      className="break-all text-ink transition-colors hover:text-gold"
                    >
                      {company.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                    <MapPin className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                    Office
                  </dt>
                  <dd className="mt-2.5 text-sm leading-relaxed text-ink">
                    {company.address.line1}
                    <br />
                    {company.address.line2}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                    <Clock className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                    Hours
                  </dt>
                  <dd className="mt-2.5 text-sm text-ink">{company.hours}</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  )
}
