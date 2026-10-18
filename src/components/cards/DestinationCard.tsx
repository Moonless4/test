import { Link } from 'react-router-dom';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber } from '@/lib/utils';
import type { Destination } from '@/types';

interface DestinationCardProps {
  destination: Destination;
  className?: string;
}

/** کارت مقصد — تصویر تمام‌قد و متن روی نوار بلورشده‌ی پایین */
export function DestinationCard({ destination, className }: DestinationCardProps) {
  return (
    <Link
      to={`/hotels?city=${destination.code}&name=${encodeURIComponent(destination.name)}`}
      className={cn(
        'group relative block h-48 overflow-hidden rounded-xl border border-ink-200 bg-ink-900 transition hover:border-ink-300 sm:h-52',
        className,
      )}
    >
      <img
        src={destination.image}
        alt={destination.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-ink-900/45 p-3 text-white backdrop-blur-md">
        <p className="truncate text-sm font-bold">{destination.name}</p>
        <p className="mt-1 truncate text-2xs text-white/80">
          {destination.country} · <span className="num">{faDigits(destination.hotelCount)}</span> اقامتگاه
        </p>

        <div className="mt-2.5 flex items-end justify-between gap-2">
          <span className="text-2xs text-white/75">شروع قیمت از</span>
          <span className="num text-sm font-bold">
            {formatNumber(destination.startingPrice)}
            <span className="ms-1 text-2xs font-normal text-white/75">تومان</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
