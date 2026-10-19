import { useState } from 'react';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import type { Destination } from '@/types';

interface DestinationCarouselProps {
  items: Destination[];
}

/** کارت‌های کناری کوچک‌تر و محوتر می‌شوند */
function styleForDistance(distance: number) {
  if (distance === 0) return { transform: 'scale(1)', opacity: 1, filter: 'none' };
  if (distance === 1) return { transform: 'scale(0.86)', opacity: 0.9, filter: 'brightness(0.85)' };
  return { transform: 'scale(0.76)', opacity: 0.6, filter: 'brightness(0.7)' };
}

/**
 * کاروسل مقصدها — کارت میانی بزرگ و کناری‌ها کوچک و محو، با هم‌پوشانی.
 * عرض کارت و میزان هم‌پوشانی با متغیرهای CSS تعیین می‌شود و جابجایی ردیف از روی
 * شماره‌ی کارت فعال حساب می‌شود؛ پس در هر عرضی کارت فعال دقیقاً وسط می‌ماند.
 */
export function DestinationCarousel({ items }: DestinationCarouselProps) {
  const [active, setActive] = useState(() => Math.min(2, items.length - 1));

  const go = (step: number) => setActive((index) => Math.min(items.length - 1, Math.max(0, index + step)));

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex items-center py-3 transition-transform duration-500 ease-out [--card-w:15rem] [--overlap:2.5rem] sm:[--card-w:18rem] sm:[--overlap:3.5rem]"
          style={{
            paddingInlineStart: 'calc(50% - var(--card-w) / 2)',
            transform: `translateX(calc(${active} * (var(--card-w) - var(--overlap))))`,
          }}
        >
          {items.map((destination, index) => {
            const distance = Math.abs(index - active);
            return (
              <div
                key={destination.id}
                className={cn(
                  'shrink-0 transition-all duration-500 ease-out',
                  distance === 0 ? 'z-20' : distance === 1 ? 'z-10' : 'z-0',
                )}
                style={{
                  width: 'var(--card-w)',
                  marginInlineStart: index === 0 ? undefined : 'calc(-1 * var(--overlap))',
                  ...styleForDistance(distance),
                }}
              >
                <DestinationCard
                  destination={destination}
                  active={distance === 0}
                  onFocus={() => setActive(index)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => go(1)}
        disabled={active === items.length - 1}
        aria-label="مقصد بعدی"
        className="absolute end-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white/95 text-ink-600 shadow-card transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-600"
      >
        <Icon name="chevron-left" className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => go(-1)}
        disabled={active === 0}
        aria-label="مقصد قبلی"
        className="absolute start-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white/95 text-ink-600 shadow-card transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-600"
      >
        <Icon name="chevron-right" className="h-5 w-5" />
      </button>
    </div>
  );
}
