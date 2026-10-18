import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { faDigits } from '@/lib/jalali';
import { cn } from '@/lib/utils';
import type { Offer } from '@/types';

interface OfferCardProps {
  offer: Offer;
  variant?: 'banner' | 'tile';
  className?: string;
}

const TONE_STRIP: Record<Offer['tone'], string> = {
  brand: 'bg-brand-800/70',
  accent: 'bg-accent-700/70',
  dark: 'bg-ink-900/65',
};

/** کارت پیشنهاد ویژه — تصویر تمام‌قد و متن روی نوار بلورشده‌ی پایین */
export function OfferCard({ offer, variant = 'banner', className }: OfferCardProps) {
  return (
    <Link
      to={offer.href}
      className={cn(
        'group relative block overflow-hidden rounded-xl bg-ink-900',
        variant === 'banner' ? 'h-56 sm:h-64' : 'h-56',
        className,
      )}
    >
      <img
        src={offer.image}
        alt={offer.title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 sm:p-5">
        <span className="num rounded-md bg-white/95 px-2 py-1 text-2xs font-bold text-ink-900">
          {offer.discountLabel}
        </span>
        <span className="num flex items-center gap-1 rounded-md bg-ink-900/35 px-2 py-1 text-2xs text-white backdrop-blur-sm">
          <Icon name="clock" className="h-3.5 w-3.5" />
          {faDigits(offer.expiresInDays)} روز باقی‌مانده
        </span>
      </div>

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 border-t border-white/15 p-4 text-white backdrop-blur-md sm:p-5',
          TONE_STRIP[offer.tone],
        )}
      >
        <h3 className={cn('font-bold leading-7', variant === 'banner' ? 'text-lg sm:text-xl' : 'text-base')}>
          {offer.title}
        </h3>
        <p className="mt-1.5 text-2xs leading-6 text-white/85 sm:text-xs">{offer.subtitle}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {offer.code && (
            <span className="num rounded-md border border-dashed border-white/50 px-2 py-1 text-2xs">
              کد تخفیف: {offer.code}
            </span>
          )}
          <span className="flex items-center gap-1 text-2xs font-medium">
            مشاهده‌ی پیشنهادها
            <Icon name="chevron-left" className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
