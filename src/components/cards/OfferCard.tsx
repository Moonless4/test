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

/** کارت پیشنهاد ویژه — تصویر تمام‌قد و متن مستقیم روی تصویر با سایه */
export function OfferCard({ offer, variant = 'banner', className }: OfferCardProps) {
  return (
    <Link
      to={offer.href}
      className={cn(
        'group relative block overflow-hidden rounded-xl bg-ink-900',
        variant === 'banner' ? 'h-56 sm:h-64' : 'h-64',
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

      {/* بلور خیلی کم که با تصویر ترکیب می‌شود */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent backdrop-blur-[2px] [mask-image:linear-gradient(to_top,black_45%,transparent)]',
          variant === 'banner' ? 'h-32' : 'h-40',
        )}
      />

      <div className="absolute inset-x-0 bottom-0 p-3.5 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.65),0_0_12px_rgba(0,0,0,0.4)] sm:p-4">
        <h3 className={cn('font-bold leading-7 text-white', variant === 'banner' ? 'text-lg sm:text-xl' : 'text-base')}>
          {offer.title}
        </h3>
        <p className="mt-1 text-2xs leading-6 text-white/90 sm:text-xs">{offer.subtitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {offer.code && (
            <span className="num rounded-md border border-dashed border-white/50 bg-ink-900/25 px-2 py-1 text-2xs">
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
