import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { Icon } from '@/components/ui/Icon';
import { HOME_SERVICES, HOME_MORE_SERVICES } from '@/data/services';

/** خدمات سفر — همان فهرست سرویس‌های تب‌های جستجو */
export function TravelServices() {
  const [moreOpen, setMoreOpen] = useState(false);

  const mainServices = HOME_SERVICES.filter((service) => service.key !== 'more');
  const moreService = HOME_SERVICES.find((service) => service.key === 'more');

  return (
    <section className="border-y border-ink-200 bg-white py-8 sm:py-10">
      <div className="container-page">
        <SectionHeader
          title="خدمات سفر سفربان"
          subtitle="از بلیط و اقامت تا ویزا، بیمه و خدمات فرودگاهی"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {mainServices.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
          {moreService && (
            <ServiceCard
              service={moreService}
              onClick={() => setMoreOpen((open) => !open)}
              expanded={moreOpen}
            />
          )}
        </div>

        {moreOpen && (
          <ul
            id="more-services"
            className="mt-4 divide-y divide-ink-200 overflow-hidden rounded-xl border border-ink-200"
          >
            {HOME_MORE_SERVICES.map((service) => (
              <li key={service.key}>
                <Link
                  to={service.href}
                  className="flex items-center gap-3 bg-white px-4 py-3 transition hover:bg-ink-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon name={service.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.8rem] font-bold text-ink-900">{service.title}</span>
                    <span className="mt-0.5 block truncate text-2xs text-ink-500">
                      {service.description}
                    </span>
                  </span>
                  <Icon name="chevron-left" className="h-4 w-4 shrink-0 text-ink-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
