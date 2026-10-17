import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { FaqAccordion } from '@/components/ui/Accordion';
import { OfferCard } from '@/components/cards/OfferCard';
import { StateBlock } from '@/components/ui/StateBlocks';
import { FAQ_ITEMS, SUPPORT_CONTACT, SOCIALS } from '@/data/content';
import { OFFERS } from '@/data/offers';
import { STATIC_PAGES } from '@/data/pages';

interface StaticPageProps {
  slug: string;
}

export default function StaticPage({ slug }: StaticPageProps) {
  const page = STATIC_PAGES[slug];

  if (!page) {
    return (
      <div className="container-page py-10">
        <StateBlock
          icon="info"
          title="این صفحه در دسترس نیست"
          description="نشانی وارد شده معتبر نیست. از منوی اصلی سرویس مورد نظر خود را انتخاب کنید."
          action={
            <Link to="/">
              <Button>بازگشت به صفحه‌ی اصلی</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page space-y-5 py-5 sm:py-7">
      <Breadcrumbs items={[{ label: page.title }]} />

      <header className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-7">
        <h1 className="text-lg font-bold text-ink-900 sm:text-2xl">{page.title}</h1>
        <p className="mt-3 max-w-3xl text-xs leading-7 text-ink-500 sm:text-sm">{page.description}</p>
      </header>

      {page.special === 'contact' && <ContactSection />}
      {page.special === 'faq' && (
        <div className="max-w-4xl">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      )}
      {page.special === 'offers' && (
        <div className="grid gap-3 lg:grid-cols-2">
          {OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} variant="banner" className="h-52" />
          ))}
        </div>
      )}

      {page.sections.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {page.sections.map((section) => (
            <section key={section.title} className="rounded-xl border border-ink-200 bg-white p-5">
              <h2 className="text-sm font-bold text-ink-900">{section.title}</h2>
              <p className="mt-2.5 text-xs leading-7 text-ink-600">{section.body}</p>
              {section.bullets && (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-xs text-ink-600">
                      <Icon name="check" className="mt-1 h-3.5 w-3.5 shrink-0 text-success-600" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {page.special === 'refund' && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
          <p className="flex items-center gap-2 text-xs font-bold text-brand-900">
            <Icon name="info" className="h-4 w-4" />
            پیگیری درخواست استرداد
          </p>
          <p className="mt-2 text-2xs leading-6 text-brand-800/80">
            برای ثبت درخواست استرداد به بخش «سفرهای من» بروید. در صورت نیاز به راهنمایی، پشتیبانی سفربان
            در تمام ساعات پاسخگو است.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/account">
              <Button size="sm">سفرهای من</Button>
            </Link>
            <a href={`tel:${SUPPORT_CONTACT.phoneRaw}`}>
              <Button size="sm" variant="secondary" className="num">
                {SUPPORT_CONTACT.phone}
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', subject: 'پیگیری رزرو', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = 'نام خود را کامل وارد کنید';
    if (!/^09\d{9}$/.test(form.phone)) next.phone = 'شماره موبایل معتبر وارد کنید';
    if (form.message.trim().length < 10) next.message = 'متن پیام حداقل ۱۰ کاراکتر باشد';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSent(true);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <section className="rounded-xl border border-ink-200 bg-white p-5">
        {sent ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-600">
              <Icon name="check" className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-bold text-ink-900">پیام شما ثبت شد</p>
            <p className="mt-2 text-xs text-ink-500">
              کارشناسان سفربان در اولین فرصت و حداکثر تا ۲ ساعت کاری با شما تماس می‌گیرند.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3" noValidate>
            <h2 className="text-sm font-bold text-ink-900">ارسال پیام</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">نام و نام خانوادگی</label>
                <div className={errors.name ? 'field-shell field-shell-error' : 'field-shell'}>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="input-base"
                    placeholder="نام شما"
                  />
                </div>
                {errors.name && <p className="mt-1 text-2xs text-danger-600">{errors.name}</p>}
              </div>
              <div>
                <label className="field-label">شماره موبایل</label>
                <div className={errors.phone ? 'field-shell field-shell-error' : 'field-shell'}>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, '').slice(0, 11) })}
                    className="input-base num dir-ltr"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    inputMode="numeric"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-2xs text-danger-600">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="field-label">موضوع</label>
              <div className="field-shell">
                <select
                  value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })}
                  className="input-base cursor-pointer"
                >
                  <option>پیگیری رزرو</option>
                  <option>درخواست استرداد</option>
                  <option>مشاوره‌ی ویزا</option>
                  <option>همکاری با آژانس‌ها</option>
                  <option>انتقاد و پیشنهاد</option>
                </select>
              </div>
            </div>

            <div>
              <label className="field-label">متن پیام</label>
              <textarea
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                rows={5}
                className={`w-full rounded-lg border bg-white p-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none ${
                  errors.message ? 'border-danger-500' : 'border-ink-200 focus:border-brand-500'
                }`}
                placeholder="شماره سفارش و توضیح درخواست خود را بنویسید…"
              />
              {errors.message && <p className="mt-1 text-2xs text-danger-600">{errors.message}</p>}
            </div>

            <Button type="submit" size="lg" block>
              ارسال پیام
            </Button>
          </form>
        )}
      </section>

      <section className="space-y-3">
        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-bold text-ink-900">راه‌های ارتباطی</h2>
          <div className="mt-3 space-y-3 text-xs text-ink-600">
            <a href={`tel:${SUPPORT_CONTACT.phoneRaw}`} className="flex items-center gap-2 transition hover:text-brand-700">
              <Icon name="phone" className="h-4 w-4 text-brand-600" />
              <span className="num">{SUPPORT_CONTACT.phone}</span>
            </a>
            <a href={`mailto:${SUPPORT_CONTACT.email}`} className="flex items-center gap-2 transition hover:text-brand-700">
              <Icon name="mail" className="h-4 w-4 text-brand-600" />
              <span className="dir-ltr">{SUPPORT_CONTACT.email}</span>
            </a>
            <p className="flex items-start gap-2">
              <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              {SUPPORT_CONTACT.address}
            </p>
            <p className="flex items-start gap-2">
              <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              {SUPPORT_CONTACT.hours}
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                <Icon name={social.id} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-ink-200 bg-ink-50 p-5">
          <p className="text-xs font-bold text-ink-900">پیش از تماس، این‌ها را آماده کنید</p>
          <ul className="mt-2.5 space-y-2 text-2xs leading-6 text-ink-600">
            <li>• شماره سفارش (مثال: SB-۴۵۸۷۱۲)</li>
            <li>• نام و کد ملی مسافر اصلی</li>
            <li>• شماره موبایلی که با آن رزرو ثبت شده است</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
