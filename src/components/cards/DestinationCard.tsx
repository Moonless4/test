import { Link } from 'react-router-dom';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber } from '@/lib/utils';
import type { Destination } from '@/types';

interface DestinationCardProps {
  destination: Destination;
  className?: string;
}

/** کارت مقصد — تصویر تمام‌قد و نوار بلورشده‌ی سبک در پایین */
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

      {/* بلور خیلی کم که با تصویر ترکیب می‌شود */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 via-black/20 to-transparent backdrop-blur-[2px] [mask-image:linear-gradient(to_top,black_45%,transparent)]" />

      {/* متن روی تصویر با سایه‌ی سبک برای خوانایی */}
      <div className="absolute inset-x-0 bottom-0 p-3 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.65),0_0_12px_rgba(0,0,0,0.4)]">
        <p className="truncate text-sm font-bold">{destination.name}</p>
        <p className="mt-0.5 truncate text-2xs text-white/85">
          {destination.country} · <span className="num">{faDigits(destination.hotelCount)}</span> اقامتگاه
        </p>
        <p className="mt-1 truncate text-2xs">
          شروع قیمت از{' '}
          <span className="num text-sm font-bold">{formatNumber(destination.startingPrice)}</span>
          <span className="ms-1 font-normal text-white/85">تومان</span>
        </p>
      </div>
    </Link>
  );
}
