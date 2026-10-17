import { SectionHeader } from '@/components/ui/SectionHeader';
import { OfferCard } from '@/components/cards/OfferCard';
import { OFFERS } from '@/data/offers';

/** پیشنهادهای ویژه — یک بنر بزرگ و چند کاشی */
export function SpecialOffers() {
  const [lead, ...rest] = OFFERS;

  return (
    <section className="container-page py-8 sm:py-10">
      <SectionHeader
        title="پیشنهادهای ویژه‌ی این هفته"
        subtitle="تخفیف‌های محدود روی پرواز، اقامت، تور و بیمه"
        actionLabel="همه‌ی پیشنهادها"
        actionHref="/offers"
      />
      <div className="grid gap-3 lg:grid-cols-3">
        <OfferCard offer={lead} variant="banner" className="lg:col-span-2 lg:h-full" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {rest.slice(0, 2).map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {rest.slice(2, 4).map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
