import { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DestinationCarousel } from './DestinationCarousel';
import { DOMESTIC_DESTINATIONS, INTERNATIONAL_DESTINATIONS } from '@/data/destinations';
import { cn } from '@/lib/utils';

/** مقصدهای محبوب — جابجایی بین داخلی و خارجی */
export function PopularDestinations() {
  const [tab, setTab] = useState<'domestic' | 'international'>('domestic');
  const list = tab === 'domestic' ? DOMESTIC_DESTINATIONS.slice(0, 8) : INTERNATIONAL_DESTINATIONS.slice(0, 8);

  return (
    <section className="container-page py-8 sm:py-10">
      <SectionHeader
        title="مقصدهای محبوب"
        subtitle="پرطرفدارترین شهرها برای سفر در این فصل"
        actionLabel="مشاهده همه"
        actionHref="/hotels"
      />

      {/* سوییچ داخلی/خارجی — در وسط بخش */}
      <div className="mb-4 flex justify-center sm:mb-5">
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
      </div>

      <DestinationCarousel key={tab} items={list} />
    </section>
  );
}
