import { Link } from 'react-router-dom';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber } from '@/lib/utils';
import type { Destination } from '@/types';

interface DestinationCardProps {
  destination: Destination;
  className?: string;
}

/** کارت مقصد — تصویر در بالا و اطلاعات ساده در پایین */
export function DestinationCard({ destination, className }: DestinationCardProps) {
  return (
    <Link
      to={`/hotels?city=${destination.code}&name=${encodeURIComponent(destination.name)}`}
      className={cn(
        'group overflow-hidden rounded-xl border border-ink-200 bg-white transition hover:border-ink-300',
        className,
      )}
    >
      <div className="overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          className="h-32 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-36"
        />
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-bold text-ink-900 transition group-hover:text-brand-700">
          {destination.name}
        </p>
        <p className="mt-1 truncate text-2xs text-ink-500">
          {destination.country} · <span className="num">{faDigits(destination.hotelCount)}</span> اقامتگاه
        </p>

        <p className="mt-3 text-2xs text-ink-500">شروع قیمت از</p>
        <p className="num text-sm font-bold text-brand-700">
          {formatNumber(destination.startingPrice)}
          <span className="ms-1 text-2xs font-normal text-ink-500">تومان</span>
        </p>
      </div>
    </Link>
  );
}
