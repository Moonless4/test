import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber } from '@/lib/utils';
import type { Destination } from '@/types';

interface DestinationCardProps {
  destination: Destination;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** کارت مقصد — تصویر بزرگ با اطلاعات روی آن */
export function DestinationCard({ destination, className, size = 'md' }: DestinationCardProps) {
  const heights = {
    sm: 'h-32',
    md: 'h-44',
    lg: 'h-56',
  };

  return (
    <Link
      to={`/hotels?city=${destination.code}&name=${encodeURIComponent(destination.name)}`}
      className={cn('group relative block overflow-hidden rounded-xl', heights[size], className)}
    >
      <img
        src={destination.image}
        alt={destination.name}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-white">{destination.name}</p>
            <p className="text-2xs text-white/75">
              {destination.country} · <span className="num">{faDigits(destination.hotelCount)}</span> اقامتگاه
            </p>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-white backdrop-blur-sm transition group-hover:bg-white group-hover:text-brand-700">
            <Icon name="arrow-left" className="h-4 w-4" />
          </span>
        </div>
        <p className="num mt-2 border-t border-white/15 pt-2 text-2xs text-white/90">
          بلیط از {formatNumber(destination.startingPrice)} تومان
        </p>
      </div>
    </Link>
  );
}
