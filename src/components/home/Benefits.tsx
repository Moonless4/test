import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { BenefitCard } from '@/components/cards/ArticleCard';
import { BENEFITS, SUPPORT_CONTACT } from '@/data/content';

/** مزایای خرید از سفربان + پشتیبانی و اپلیکیشن */
export function Benefits() {
  return (
    <section className="border-y border-ink-200 bg-white py-8 sm:py-10">
      <div className="container-page">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink-900 sm:text-xl">مزایای رزرو از سفربان</h2>
            <p className="mt-1 text-xs text-ink-500 sm:text-sm">
              تجربه‌ی خرید مطمئن، شفاف و سریع برای بیش از دو میلیون مسافر
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map((benefit) => (
            <BenefitCard key={benefit.id} icon={benefit.icon} title={benefit.title} description={benefit.description} />
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-4 lg:col-span-2">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
              <Icon name="support" className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-brand-900">پشتیبانی ۲۴ ساعته، ۷ روز هفته</p>
              <p className="mt-1 text-2xs leading-5 text-brand-800/80">{SUPPORT_CONTACT.hours}</p>
            </div>
            <a href={`tel:${SUPPORT_CONTACT.phoneRaw}`} className="hidden sm:block">
              <Button variant="secondary" size="md" className="num">
                {SUPPORT_CONTACT.phone}
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-ink-50 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-ink-700 shadow-card">
              <Icon name="sim" className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink-900">اپلیکیشن سفربان</p>
              <p className="mt-1 text-2xs leading-5 text-ink-500">مدیریت سفرها و بلیط‌ها روی موبایل</p>
            </div>
            <Link to="/app" className="text-2xs font-medium text-brand-700">
              دریافت
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
