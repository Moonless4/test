import { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FlightDealCard } from '@/components/cards/FlightDealCard';
import { DOMESTIC_FLIGHT_DEALS, INTERNATIONAL_FLIGHT_DEALS } from '@/data/popularFlights';
import { cn } from '@/lib/utils';

interface PopularFlightsProps {
  scope: 'domestic' | 'international' | 'combined';
}

/** پروازهای پرطرفدار داخلی و خارجی */
export function PopularFlights({ scope }: PopularFlightsProps) {
  const [tab, setTab] = useState<'domestic' | 'international'>(
    scope === 'international' ? 'international' : 'domestic',
  );

  if (scope === 'combined') {
    return (
      <section className="container-page py-8 sm:py-10">
        <SectionHeader
          title="پروازهای پرطرفدار"
          subtitle="ارزان‌ترین نرخ‌های امروز در پرترددترین مسیرها"
          actionLabel="همه‌ی پروازها"
          actionHref="/flights"
          action={
            <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5">
              {[
                { key: 'domestic' as const, label: 'داخلی' },
                { key: 'international' as const, label: 'خارجی' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-2xs font-medium transition',
                    tab === item.key ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-800',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(tab === 'domestic' ? DOMESTIC_FLIGHT_DEALS : INTERNATIONAL_FLIGHT_DEALS)
            .slice(0, 4)
            .map((deal) => (
              <FlightDealCard key={deal.id} deal={deal} />
            ))}
        </div>
      </section>
    );
  }

  const isDomestic = scope === 'domestic';
  const deals = isDomestic ? DOMESTIC_FLIGHT_DEALS : INTERNATIONAL_FLIGHT_DEALS;

  return (
    <section className="container-page py-8 sm:py-10">
      <SectionHeader
        title={isDomestic ? 'پروازهای پرطرفدار داخلی' : 'پروازهای پرطرفدار خارجی'}
        subtitle={
          isDomestic
            ? 'پرترددترین مسیرهای پروازی داخل کشور با نرخ لحظه‌ای'
            : 'پروازهای بین‌المللی از تهران با بهترین قیمت'
        }
        actionLabel={isDomestic ? 'همه پروازهای داخلی' : 'همه پروازهای خارجی'}
        actionHref="/flights"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {deals.slice(0, 4).map((deal) => (
          <FlightDealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </section>
  );
}
