import { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HotelMiniCard } from '@/components/cards/HotelMiniCard';
import { HOTELS } from '@/data/hotels';
import { cn } from '@/lib/utils';

interface PopularHotelsProps {
  scope: 'domestic' | 'international' | 'combined';
}

/** هتل‌های محبوب — کارت‌های ساده و یکدست */
export function PopularHotels({ scope }: PopularHotelsProps) {
  const [tab, setTab] = useState<'domestic' | 'international'>(
    scope === 'international' ? 'international' : 'domestic',
  );

  const domestic = HOTELS.filter((hotel) => hotel.isDomestic && hotel.type === 'hotel');
  const international = HOTELS.filter((hotel) => !hotel.isDomestic && hotel.type === 'hotel');
  const list = scope === 'combined' ? (tab === 'domestic' ? domestic : international) : scope === 'domestic' ? domestic : international;

  return (
    <section className="container-page py-8 sm:py-10">
      <SectionHeader
        title={scope === 'domestic' ? 'هتل‌های محبوب ایران' : scope === 'international' ? 'هتل‌های محبوب خارجی' : 'هتل‌های محبوب'}
        subtitle={
          scope === 'domestic'
            ? 'منتخب هتل‌های چهار و پنج‌ستاره با بالاترین امتیاز مسافران'
            : scope === 'international'
              ? 'اقامتگاه‌های منتخب در محبوب‌ترین شهرهای جهان'
              : 'پرفروش‌ترین اقامتگاه‌های سفربان'
        }
        actionLabel="مشاهده همه"
        actionHref="/hotels"
        action={
          scope === 'combined' ? (
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
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {list.slice(0, 4).map((hotel) => (
          <HotelMiniCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </section>
  );
}
