import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { Accordion } from '@/components/ui/Accordion';
import { SERVICES, MORE_SERVICES } from '@/data/services';
import { FAQ_ITEMS, SUPPORT_CONTACT, BENEFITS } from '@/data/content';
import { BenefitCard } from '@/components/cards/ArticleCard';
import { Icon } from '@/components/ui/Icon';

export default function ServicesIndex() {
  return (
    <div className="container-page space-y-6 py-5 sm:py-7">
      <Breadcrumbs items={[{ label: 'خدمات' }]} />

      <header className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-7">
        <h1 className="text-lg font-bold text-ink-900 sm:text-2xl">خدمات سفر سفربان</h1>
        <p className="mt-3 max-w-3xl text-xs leading-7 text-ink-500 sm:text-sm">
          تمام نیازهای سفر شما در یک پلتفرم: خرید بلیط هواپیما، قطار و اتوبوس، رزرو هتل و اقامتگاه،
          تورهای داخلی و خارجی، ویزا، بیمه‌ی مسافرتی و خدمات فرودگاهی.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-2xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <Icon name="support" className="h-4 w-4 text-brand-600" />
            پشتیبانی ۲۴ ساعته
          </span>
          <span className="num flex items-center gap-1.5">
            <Icon name="phone" className="h-4 w-4 text-brand-600" />
            {SUPPORT_CONTACT.phone}
          </span>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-900">خدمات اصلی</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SERVICES.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-900">سایر خدمات</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MORE_SERVICES.map((service) => (
            <ServiceCard key={service.key} service={service} compact />
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {BENEFITS.map((benefit) => (
          <BenefitCard key={benefit.id} icon={benefit.icon} title={benefit.title} description={benefit.description} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-bold text-ink-900">پرسش‌های متداول</h2>
          <Accordion
            items={FAQ_ITEMS.slice(0, 5).map((item) => ({ id: item.id, title: item.question, content: item.answer }))}
          />
        </div>
        <aside className="h-fit rounded-xl border border-ink-200 bg-white p-5">
          <p className="text-xs font-bold text-ink-900">پیگیری و پشتیبانی</p>
          <p className="mt-2 text-2xs leading-6 text-ink-500">
            برای پیگیری رزرو، استرداد یا مشاوره‌ی سفر، از بخش سفرهای من یا تماس تلفنی استفاده کنید.
          </p>
          <div className="mt-4 space-y-2">
            <Link
              to="/account"
              className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2.5 text-2xs text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              سفرهای من
              <Icon name="chevron-left" className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/help/faq"
              className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2.5 text-2xs text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              سوالات متداول
              <Icon name="chevron-left" className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2.5 text-2xs text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              تماس با ما
              <Icon name="chevron-left" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
