import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { FaqAccordion } from '@/components/ui/Accordion';
import { FAQ_ITEMS, SUPPORT_CONTACT } from '@/data/content';

/** پرسش‌های متداول */
export function FaqSection() {
  return (
    <section className="container-page py-8 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="text-lg font-bold text-ink-900 sm:text-xl">پرسش‌های متداول</h2>
          <p className="mt-1 text-xs text-ink-500 sm:text-sm">
            پاسخ پرتکرارترین سوال‌های مسافران سفربان درباره‌ی رزرو، پرداخت و استرداد
          </p>
          <div className="mt-4">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
          <Link
            to="/help/faq"
            className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-700 transition hover:text-brand-800"
          >
            مشاهده‌ی همه‌ی پرسش‌ها
            <Icon name="chevron-left" className="h-4 w-4" />
          </Link>
        </div>

        <aside className="h-fit rounded-xl border border-ink-200 bg-white p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon name="support" className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-sm font-bold text-ink-900">پاسخ سوال خود را پیدا نکردید؟</h3>
          <p className="mt-2 text-xs leading-6 text-ink-500">
            کارشناسان سفر سفربان در تمام ساعات شبانه‌روز آماده‌ی راهنمایی شما هستند؛ از انتخاب
            پرواز مناسب تا پیگیری استرداد بلیط.
          </p>
          <a href={`tel:${SUPPORT_CONTACT.phoneRaw}`} className="num mt-4 flex items-center gap-2 text-sm font-bold text-brand-700">
            <Icon name="phone" className="h-4 w-4" />
            {SUPPORT_CONTACT.phone}
          </a>
          <a
            href={`mailto:${SUPPORT_CONTACT.email}`}
            className="mt-2 flex items-center gap-2 text-xs text-ink-500 transition hover:text-brand-700"
          >
            <Icon name="mail" className="h-4 w-4" />
            <span className="dir-ltr">{SUPPORT_CONTACT.email}</span>
          </a>
          <Link
            to="/help/guide"
            className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-ink-200 py-2.5 text-2xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            راهنمای خرید و رزرو
            <Icon name="chevron-left" className="h-3.5 w-3.5" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
