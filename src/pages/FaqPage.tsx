import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { useFaqGroups } from '../hooks/useContent';
import { SectionError, SectionLoading } from '../components/ui/SectionState';
import FaqAccordion from '../components/faq/FaqAccordion';
import Reveal from '../components/ui/Reveal';
import SectionHeader from '../components/ui/SectionHeader';
import { toFa } from '../lib/format';

const ALL = 'all';

export default function FaqPage() {
  const [activeGroup, setActiveGroup] = useState<string>(ALL);
  // The FAQ lives in the admin panel; the API groups its entries the same way this page shows them.
  const { data, loading, error, reload } = useFaqGroups();
  const faqGroups = data ?? [];

  const total = faqGroups.reduce((count, group) => count + group.items.length, 0);
  const groups =
    activeGroup === ALL ? faqGroups : faqGroups.filter((group) => group.id === activeGroup);

  const chipClass = (isActive: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition-colors lg:w-full lg:justify-between ${
      isActive
        ? 'border-teal-800 bg-teal-800 font-bold text-white'
        : 'border-line bg-white text-ink hover:border-teal-800/40 hover:bg-cream'
    }`;

  const countClass = (isActive: boolean) => `text-[11px] ${isActive ? 'text-white/70' : 'text-muted'}`;

  if (error) {
    return (
      <div className="container py-8 sm:py-10">
        <SectionHeader eyebrow="پشتیبانی مدورا" title="سوالات متداول" />
        <SectionError error={error} onRetry={reload} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 sm:py-10">
        <SectionHeader eyebrow="پشتیبانی مدورا" title="سوالات متداول" />
        <SectionLoading label="در حال دریافت پرسش‌ها…" />
      </div>
    );
  }

  return (
    <div className="container py-8 sm:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <span>/</span>
        <span className="font-medium text-ink">سوالات متداول</span>
      </nav>

      <SectionHeader eyebrow="پشتیبانی مدورا" title="سوالات متداول" />

      <p className="mb-7 max-w-2xl text-[13px] leading-7 text-muted">
        پرتکرارترین پرسش‌های خریداران مدورا را اینجا جمع کرده‌ایم: از ثبت سفارش و پرداخت تا ارسال،
        بازگشت کالا و حساب کاربری. اگر پاسخ پرسش‌تان اینجا نبود، پشتیبانی کنار شماست.
      </p>

      <div className="lg:grid lg:grid-cols-[236px_1fr] lg:items-start lg:gap-10">
        {/* Phone gets a wrapping row of chips; from lg the same buttons stack into a rail. */}
        <nav
          aria-label="دسته‌بندی سوالات"
          className="mb-6 flex flex-wrap gap-2 lg:mb-0 lg:flex-col lg:gap-1.5"
        >
          <button
            type="button"
            aria-pressed={activeGroup === ALL}
            onClick={() => setActiveGroup(ALL)}
            className={chipClass(activeGroup === ALL)}
          >
            <span>همه سوالات</span>
            <span className={countClass(activeGroup === ALL)}>{toFa(total)}</span>
          </button>

          {faqGroups.map((group) => {
            const isActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveGroup(group.id)}
                className={chipClass(isActive)}
              >
                <span>{group.label}</span>
                <span className={countClass(isActive)}>{toFa(group.items.length)}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-8">
          {groups.map((group, index) => (
            <Reveal key={group.id} delay={index * 60}>
              <section aria-labelledby={`faq-group-${group.id}`}>
                <h2 id={`faq-group-${group.id}`} className="mb-4 text-base font-bold text-ink sm:text-[17px]">
                  {group.label}
                </h2>
                <FaqAccordion idPrefix={group.id} items={group.items} />
              </section>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-12">
        <div className="rounded-panel border border-line bg-cream p-6 sm:p-8">
          <h2 className="text-base font-bold text-ink sm:text-[17px]">
            پاسخ پرسش‌تان را پیدا نکردید؟
          </h2>
          <p className="mt-2 max-w-xl text-[13px] leading-7 text-muted">
            پشتیبانی مدورا هر روز از ۹ تا ۲۱ پاسخگوی شماست؛ پرسش خود را تلفنی یا ایمیلی بپرسید.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="tel:+982191002200"
              className="flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-3 text-[13px] font-medium text-white transition-colors hover:bg-teal-700"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr">{toFa('021-9100 2200')}</span>
            </a>
            <a
              href="mailto:info@medora.ir"
              className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-cream"
            >
              <Mail className="h-4 w-4" />
              <span dir="ltr">info@medora.ir</span>
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
