import { ArrowLeft, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { fieldClasses } from '@/components/ui/fieldClasses'
import { Modal } from '@/components/ui/Modal'
import type { Agent, Property } from '@/types'
import { toLatinDigits } from '@/lib/format'
import { submitInquiry } from '@/lib/inquiries'

interface ContactModalProps {
  open: boolean
  onClose: () => void
  kind: 'agent' | 'viewing'
  property?: Property
  agent?: Agent
}

const inputClasses = fieldClasses

/** Accepts an Iranian mobile number in Persian or Latin digits. */
const isIranianMobile = (value: string): boolean => /^09\d{9}$/.test(toLatinDigits(value.trim()))

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
      ? `مایل به هماهنگی بازدید از ${property?.name ?? 'این ملک'} هستم. زمان‌های پیشنهادی من…`
      : `می‌خواهم دربارهٔ ${property?.name ?? 'پرتفوی شما'} اطلاعات بیشتری بگیرم.`

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
      setError('برای پاسخ‌دادن، نام و ایمیل خود را وارد کنید.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('این نشانی ایمیل درست به نظر نمی‌رسد.')
      return
    }
    if (phone.trim() && !isIranianMobile(phone)) {
      setError('شمارهٔ تماس باید با ۰۹ شروع شود و ۱۱ رقم باشد.')
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

  const title = kind === 'viewing' ? 'تعیین وقت بازدید' : 'تماس با مشاور'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={sent ? 'سپاسگزاریم — درخواست شما ثبت شد' : title}
      description={
        sent
          ? undefined
          : property
            ? `${property.name} · ${property.city}، ${property.region}`
            : 'بگویید به دنبال چه هستید تا با شما تماس بگیریم.'
      }
    >
      {sent ? (
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
            <Check className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="mt-5 text-sm leading-[1.95] text-muted">
            {agent ? `${agent.name} با شما تماس می‌گیرد` : 'یکی از اعضای تیم ما با شما تماس می‌گیرد'}{' '}
            تا ظرف یک روز کاری مرحلهٔ بعد را هماهنگ کند.
          </p>
          <Button className="mt-7 w-full" size="lg" onClick={onClose}>
            بستن
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-[13px] font-medium text-muted">
                نام و نام خانوادگی
              </label>
              <input
                id="contact-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClasses}
                placeholder="نگار تهرانی"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-2 block text-[13px] font-medium text-muted">
                ایمیل
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClasses}
                placeholder="name@example.com"
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-phone" className="mb-2 block text-[13px] font-medium text-muted">
              شمارهٔ تماس <span className="text-muted/60">(اختیاری)</span>
            </label>
            <input
              id="contact-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClasses}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="mb-2 block text-[13px] font-medium text-muted">
              پیام
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
            icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.8} />}
          >
            {sending ? 'در حال ارسال…' : kind === 'viewing' ? 'ثبت درخواست بازدید' : 'ارسال پیام'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
