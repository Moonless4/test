import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StateBlock } from '@/components/ui/StateBlocks';
import { SimpleSearchForm } from '@/components/search/SimpleSearchForm';
import { FaqAccordion } from '@/components/ui/Accordion';
import { SERVICE_PAGES } from '@/data/servicePages';
import { FAQ_ITEMS, SUPPORT_CONTACT } from '@/data/content';
import { cn } from '@/lib/utils';

export default function ServiceDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const page = slug ? SERVICE_PAGES[slug] : undefined;

  const [request, setRequest] = useState({ name: '', phone: '', note: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  if (!page) {
    return (
      <div className="container-page py-10">
        <StateBlock
          icon="grid"
          title="این سرویس در دسترس نیست"
          description="نشانی وارد شده معتبر نیست. از بخش خدمات، سرویس مورد نظر خود را انتخاب کنید."
          action={
            <Link to="/services">
              <Button>مشاهده‌ی همه‌ی خدمات</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const submitRequest = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (request.name.trim().length < 3) next.name = 'نام خود را کامل وارد کنید';
    if (!/^09\d{9}$/.test(request.phone)) next.phone = 'شماره موبایل معتبر وارد کنید';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSent(true);
  };

  const prefillDescription = searchParams.toString();

  return (
    <div className="container-page space-y-5 py-5 sm:py-7">
      <Breadcrumbs items={[{ label: 'خدمات', href: '/services' }, { label: page.title }]} />

      <header className="grid gap-4 rounded-2xl border border-ink-200 bg-white p-5 sm:p-7 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon name={page.icon} className="h-6 w-6" />
          </span>
          <h1 className="mt-3 text-lg font-bold text-ink-900 sm:text-2xl">{page.title}</h1>
          <p className="mt-3 max-w-2xl text-xs leading-7 text-ink-500 sm:text-sm">{page.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`tel:${SUPPORT_CONTACT.phoneRaw}`}>
              <Button variant="secondary" size="md" className="num" icon={<Icon name="phone" className="h-4 w-4" />}>
                {SUPPORT_CONTACT.phone}
              </Button>
            </a>
            <Link to="/contact">
              <Button variant="ghost" size="md">
                ارسال پیام
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
          <p className="text-2xs font-bold text-ink-600">فرایند انجام کار</p>
          <ol className="mt-3 space-y-2.5">
            {page.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[0.6rem] font-bold text-brand-700 shadow-card">
                  {['۱', '۲', '۳', '۴', '۵'][index] ?? index + 1}
                </span>
                <span className="text-2xs leading-6 text-ink-600">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      {page.formService && (
        <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
          <div className="border-b border-ink-200 px-4 py-3 sm:px-5">
            <p className="text-sm font-bold text-ink-900">{page.ctaTitle}</p>
            <p className="mt-1 text-2xs text-ink-500">{page.ctaDescription}</p>
          </div>
          <div className="p-4 sm:p-5">
            <SimpleSearchForm service={page.formService} />
          </div>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {page.features.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-ink-200 bg-white p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon name="check" className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-bold text-ink-900">{feature.title}</p>
            <p className="mt-1.5 text-2xs leading-6 text-ink-500">{feature.description}</p>
          </div>
        ))}
      </section>

      {page.plans && (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {page.plans.map((plan, index) => (
            <div
              key={plan.title}
              className={cn(
                'rounded-xl border bg-white p-5',
                index === 1 ? 'border-brand-300 shadow-card' : 'border-ink-200',
              )}
            >
              {index === 1 && (
                <span className="mb-2 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-2xs font-bold text-brand-700">
                  پرطرفدارترین
                </span>
              )}
              <p className="text-sm font-bold text-ink-900">{plan.title}</p>
              <p className="num mt-1.5 text-xs font-medium text-brand-700">{plan.price}</p>
              <ul className="mt-3 space-y-2">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-2xs text-ink-600">
                    <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {!page.formService && (
        <section className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-bold text-ink-900">{page.ctaTitle}</h2>
          <p className="mt-1.5 text-2xs leading-6 text-ink-500">{page.ctaDescription}</p>

          {sent ? (
            <div className="mt-4 rounded-xl border border-success-500/30 bg-success-50 p-4 text-center">
              <Icon name="check" className="mx-auto h-6 w-6 text-success-600" />
              <p className="mt-2 text-xs font-bold text-success-700">درخواست شما ثبت شد</p>
              <p className="mt-1.5 text-2xs text-success-700/80">
                کارشناسان سفربان در کمتر از یک ساعت کاری با شما تماس می‌گیرند.
              </p>
            </div>
          ) : (
            <form onSubmit={submitRequest} className="mt-4 grid gap-3 lg:grid-cols-3" noValidate>
              <div>
                <label className="field-label">نام و نام خانوادگی</label>
                <div className={cn('field-shell', errors.name && 'field-shell-error')}>
                  <input
                    value={request.name}
                    onChange={(event) => setRequest({ ...request, name: event.target.value })}
                    className="input-base"
                    placeholder="نام شما"
                  />
                </div>
                {errors.name && <p className="mt-1 text-2xs text-danger-600">{errors.name}</p>}
              </div>
              <div>
                <label className="field-label">شماره موبایل</label>
                <div className={cn('field-shell', errors.phone && 'field-shell-error')}>
                  <input
                    value={request.phone}
                    onChange={(event) => setRequest({ ...request, phone: event.target.value.replace(/\D/g, '').slice(0, 11) })}
                    className="input-base num dir-ltr"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    inputMode="numeric"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-2xs text-danger-600">{errors.phone}</p>}
              </div>
              <div className="flex items-end">
                <Button type="submit" size="lg" block>
                  ثبت درخواست
                </Button>
              </div>
            </form>
          )}
          {prefillDescription && (
            <p className="mt-3 text-2xs text-ink-400">
              انتخاب‌های شما در پیام ثبت‌شده لحاظ می‌شود.
            </p>
          )}
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-bold text-ink-900">سوال‌های متداول این سرویس</h2>
          <FaqAccordion items={FAQ_ITEMS.slice(0, 4)} />
        </div>
        <aside className="h-fit rounded-xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-xs font-bold text-brand-900">نیاز به مشاوره دارید؟</p>
          <p className="mt-2 text-2xs leading-6 text-brand-800/80">
            کارشناسان سفربان در تمام ساعات شبانه‌روز پاسخگو هستند و می‌توانند بهترین گزینه را بر اساس
            برنامه‌ی سفر شما پیشنهاد دهند.
          </p>
          <a href={`tel:${SUPPORT_CONTACT.phoneRaw}`} className="num mt-4 flex items-center gap-2 text-sm font-bold text-brand-700">
            <Icon name="phone" className="h-4 w-4" />
            {SUPPORT_CONTACT.phone}
          </a>
          <p className="num mt-3 text-2xs text-brand-800/70">
            میانگین زمان پاسخگویی تلفنی: کمتر از ۳۰ ثانیه
          </p>
        </aside>
      </section>
    </div>
  );
}
