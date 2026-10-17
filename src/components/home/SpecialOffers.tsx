import { SectionHeader } from '@/components/ui/SectionHeader';
import { OfferCard } from '@/components/cards/OfferCard';
import { OFFERS } from '@/data/offers';

/** پیشنهادهای ویژه — چهار کاشی جمع‌وجور در یک ردیف */
export function SpecialOffers() {
  return (
    <section className="container-page py-8 sm:py-10">
      <SectionHeader
        title="پیشنهادهای ویژه‌ی این هفته"
        subtitle="تخفیف‌های محدود روی پرواز، اقامت، تور و بیمه"
        actionLabel="همه‌ی پیشنهادها"
        actionHref="/offers"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {OFFERS.slice(0, 4).map((offer) => (
          <OfferCard key={offer.id} offer={offer} variant="tile" />
        ))}
      </div>
    </section>
  );
}
