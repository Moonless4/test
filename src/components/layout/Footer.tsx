import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Logo } from './Logo';
import { FOOTER_LINKS, SOCIALS, SUPPORT_CONTACT, TRUST_BADGES } from '@/data/content';
import { cn, formatNumber } from '@/lib/utils';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError('ایمیل معتبر وارد کنید.');
      return;
    }
    setError('');
    setSubscribed(true);
  };

  return (
    <footer className="mt-12 border-t border-ink-200 bg-white pb-20 lg:pb-0">
      {/* خبرنامه */}
      <div className="border-b border-ink-200 bg-ink-50/70">
        <div className="container-page flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Icon name="mail" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">خبرنامه‌ی پیشنهادهای سفر</p>
              <p className="mt-1 text-2xs leading-5 text-ink-500">
                تخفیف‌های هفتگی پرواز و هتل را مستقیم در ایمیل خود دریافت کنید.
              </p>
            </div>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 rounded-lg border border-success-500/30 bg-success-50 px-4 py-3 text-xs text-success-700">
              <Icon name="check" className="h-4 w-4" />
              عضویت شما ثبت شد. اولین پیشنهاد را همین هفته دریافت می‌کنید.
            </div>
          ) : (
            <form onSubmit={subscribe} className="flex w-full max-w-md flex-col gap-2 sm:flex-row" noValidate>
              <div className={cn('field-shell flex-1 bg-white', error && 'field-shell-error')}>
                <Icon name="mail" className="h-4 w-4 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError('');
                  }}
                  placeholder="ایمیل شما"
                  className="input-base dir-ltr"
                  aria-label="ایمیل"
                />
              </div>
              <Button type="submit" size="lg" className="sm:w-auto">
                عضویت
              </Button>
              {error && <p className="text-2xs text-danger-600 sm:hidden">{error}</p>}
            </form>
          )}
        </div>
      </div>

      {/* لینک‌ها */}
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-xs leading-6 text-ink-500">
            سفربان پلتفرم رزرو آنلاین سفر است؛ مقایسه و خرید بلیط هواپیما، قطار، اتوبوس، رزرو هتل،
            اقامتگاه و تور در ایران و سراسر جهان با پشتیبانی ۲۴ ساعته.
          </p>

          <div className="mt-5 space-y-2.5 text-xs text-ink-600">
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
          </div>

          <div className="mt-5 flex gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                <Icon name={social.id} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_LINKS.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-bold text-ink-900">{column.title}</p>
            <ul className="mt-3.5 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className="text-xs text-ink-500 transition hover:text-brand-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* نمادها و اپلیکیشن */}
      <div className="border-t border-ink-200">
        <div className="container-page flex flex-col gap-6 py-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2.5 rounded-lg border border-ink-200 px-3 py-2.5"
                title={badge.subtitle}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-50 text-ink-400">
                  <Icon name="shield-check" className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-2xs font-bold text-ink-700">{badge.title}</span>
                  <span className="block text-[0.6rem] text-ink-400">{badge.subtitle}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="me-1 text-2xs text-ink-500">اپلیکیشن سفربان:</p>
            <a
              href="/app"
              className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 transition hover:border-ink-300"
            >
              <Icon name="apple" className="h-5 w-5 text-ink-800" />
              <span className="text-2xs text-ink-600">App Store</span>
            </a>
            <a
              href="/app"
              className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 transition hover:border-ink-300"
            >
              <Icon name="playstore" className="h-5 w-5 text-ink-800" />
              <span className="text-2xs text-ink-600">Google Play</span>
            </a>
          </div>
        </div>
      </div>

      {/* کپی‌رایت */}
      <div className="border-t border-ink-200 bg-ink-50/60">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-4 text-2xs text-ink-500 sm:flex-row">
          <p className="num">
            © {formatNumber(1404)} سفربان — تمام حقوق محفوظ است.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/terms" className="transition hover:text-brand-700">
              قوانین و مقررات
            </Link>
            <Link to="/terms" className="transition hover:text-brand-700">
              حریم خصوصی
            </Link>
            <Link to="/help/refund" className="transition hover:text-brand-700">
              شرایط استرداد
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
