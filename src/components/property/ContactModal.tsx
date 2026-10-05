import { ArrowRight, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { fieldClasses } from '@/components/ui/fieldClasses'
import { Modal } from '@/components/ui/Modal'
import type { Agent, Property } from '@/types'
import { submitInquiry } from '@/lib/inquiries'

interface ContactModalProps {
  open: boolean
  onClose: () => void
  kind: 'agent' | 'viewing'
  property?: Property
  agent?: Agent
}

const inputClasses = fieldClasses

export function ContactModal({ open, onClose, kind, property, agent }: ContactModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const defaultMessage =
    kind === 'viewing'
      ? `I would like to schedule a viewing of ${property?.name ?? 'a property'}. My preferred times are…`
      : `I would like to know more about ${property?.name ?? 'your portfolio'}.`

  useEffect(() => {
    if (!open) return
    setSent(false)
    setError('')
    setMessage(defaultMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, property?.id, kind])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please add your name and email so we can reply.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('That email address does not look right.')
      return
    }

    setError('')
    setSending(true)
    await submitInquiry({
      kind,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      message: message.trim(),
      propertySlug: property?.slug,
    })
    setSending(false)
    setSent(true)
    setName('')
    setEmail('')
    setPhone('')
  }

  const title = kind === 'viewing' ? 'Schedule a viewing' : 'Contact your advisor'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={sent ? 'Thank you — request received' : title}
      description={
        sent
          ? undefined
          : property
            ? `${property.name} · ${property.city}, ${property.region}`
            : 'Tell us what you are looking for and we will be in touch.'
      }
    >
      {sent ? (
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
            <Check className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            {agent ? `${agent.name} will contact you` : 'A member of our team will contact you'} within
            one business day to arrange the next step.
          </p>
          <Button className="mt-7 w-full" size="lg" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Full name
              </label>
              <input
                id="contact-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClasses}
                placeholder="Jane Whitfield"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClasses}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-phone" className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Phone <span className="normal-case tracking-normal text-muted/60">(optional)</span>
            </label>
            <input
              id="contact-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClasses}
              placeholder="(555) 000-0000"
              autoComplete="tel"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className={`${inputClasses} resize-none`}
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
            {sending ? 'Sending…' : kind === 'viewing' ? 'Request viewing' : 'Send enquiry'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
