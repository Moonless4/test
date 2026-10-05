import { ArrowLeft, Check, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { fieldClasses, fieldLabelClasses } from '@/components/ui/fieldClasses'
import { company } from '@/data/site'
import { toLatinDigits } from '@/lib/format'
import { photo, photoSrcSet } from '@/lib/images'
import { submitInquiry } from '@/lib/inquiries'

const interests = [
  'خرید خانه',
  'فروش خانه',
  'سرمایه‌گذاری ملکی',
  'ارزیابی و مشاوره',
  'جابه‌جایی',
]

/** Accepts an Iranian mobile number in Persian or Latin digits. */
const isIranianMobile = (value: string): boolean => /^09\d{9}$/.test(toLatinDigits(value.trim()))

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
      setError('لطفاً نام، ایمیل و متن پیام را کامل کنید.')
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
        label="تماس"
        title="بیایید نشانی بعدی شما را پیدا کنیم"
        description="بگویید دنبال چه هستید. هر پیام شخصاً توسط یک مشاور ارشد و ظرف یک روز کاری پاسخ داده می‌شود."
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
                    <h2 className="mt-6 text-[21px] font-bold text-ink">
                      سپاسگزاریم — پیام شما به دست ما رسید
                    </h2>
                    <p className="mt-3 text-sm leading-[1.95] text-muted">
                      یک مشاور ارشد ظرف یک روز کاری با شما تماس می‌گیرد. اگر موضوع فوری است،
                      مستقیماً با شمارهٔ{' '}
                      <span dir="ltr" className="inline-block">
                        {company.phone}
                      </span>{' '}
                      تماس بگیرید.
                    </p>
                    <Button className="mt-8" size="lg" onClick={() => setSent(false)}>
                      ارسال پیام دیگر
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="page-contact-name" className={fieldLabelClasses}>
                          نام و نام خانوادگی
                        </label>
                        <input
                          id="page-contact-name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className={fieldClasses}
                          placeholder="نگار تهرانی"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label htmlFor="page-contact-email" className={fieldLabelClasses}>
                          ایمیل
                        </label>
                        <input
                          id="page-contact-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className={fieldClasses}
                          placeholder="name@example.com"
                          autoComplete="email"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="page-contact-phone" className={fieldLabelClasses}>
                          شمارهٔ تماس <span className="text-muted/60">(اختیاری)</span>
                        </label>
                        <input
                          id="page-contact-phone"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className={fieldClasses}
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          inputMode="tel"
                          autoComplete="tel"
                        />
                      </div>
                      <div>
                        <label htmlFor="page-contact-interest" className={fieldLabelClasses}>
                          علاقه‌مندم به
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
                        پیام
                      </label>
                      <textarea
                        id="page-contact-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={5}
                        placeholder="دربارهٔ خانه‌ای که می‌خواهید، زمان‌بندی و بودجه‌تان بنویسید."
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
                      icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.8} />}
                    >
                      {sending ? 'در حال ارسال…' : 'ارسال پیام'}
                    </Button>

                    <p className="text-[13px] leading-[1.9] text-muted/80">
                      از اطلاعات شما تنها برای پاسخ به همین پیام استفاده می‌کنیم. بدون فهرست
                      تبلیغاتی و بدون اشخاص ثالث.
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
                  alt="اقامتگاهی مدرن با نمای چوبی و ورودی محوطه‌سازی‌شده"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/11] w-full object-cover"
                />
              </div>

              <dl className="mt-9 grid gap-7 border-t border-line pt-9 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-2 text-[12px] text-muted">
                    <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                    تلفن
                  </dt>
                  <dd className="mt-2.5 text-sm">
                    <a
                      href={company.phoneHref}
                      className="text-ink transition-colors hover:text-gold"
                      dir="ltr"
                    >
                      {company.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-[12px] text-muted">
                    <Mail className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                    ایمیل
                  </dt>
                  <dd className="mt-2.5 text-sm">
                    <a
                      href={`mailto:${company.email}`}
                      className="break-all text-ink transition-colors hover:text-gold"
                      dir="ltr"
                    >
                      {company.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-[12px] text-muted">
                    <MapPin className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                    دفتر
                  </dt>
                  <dd className="mt-2.5 text-sm leading-[1.95] text-ink">
                    {company.address.line1}
                    <br />
                    {company.address.line2}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-[12px] text-muted">
                    <Clock className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                    ساعات کاری
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
