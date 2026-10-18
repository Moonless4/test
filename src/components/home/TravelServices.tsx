import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { HOME_SERVICES } from '@/data/services';

/** خدمات سفر — همان فهرست سرویس‌های تب‌های جستجو */
export function TravelServices() {
  return (
    <section className="border-y border-ink-200 bg-white py-8 sm:py-10">
      <div className="container-page">
        <SectionHeader
          title="خدمات سفر سفربان"
          subtitle="از بلیط و اقامت تا ویزا، بیمه و خدمات فرودگاهی"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {HOME_SERVICES.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
