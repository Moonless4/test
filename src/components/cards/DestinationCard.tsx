import { Link } from 'react-router-dom';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber } from '@/lib/utils';
import type { Destination } from '@/types';

interface DestinationCardProps {
  destination: Destination;
  className?: string;
  /** کارت میانی کاروسل — اندازه‌ی کامل، بقیه کوچک و محو می‌شوند */
  active?: boolean;
  /** روی کارت‌های کناری، کلیک اول کارت را وسط می‌آورد */
  onFocus?: () => void;
}

/** کارت مقصد — تصویر تمام‌قد، پرده‌ی شیشه‌ای پایین و برچسب قیمت */
export function DestinationCard({ destination, className, active = true, onFocus }: DestinationCardProps) {
  return (
    <Link
      to={`/hotels?city=${destination.code}&name=${encodeURIComponent(destination.name)}`}
      onClick={(event) => {
        if (active) return;
        event.preventDefault();
        onFocus?.();
      }}
      className={cn(
        'group relative block h-64 overflow-hidden rounded-2xl border border-ink-200 bg-ink-900 transition sm:h-72',
        active ? 'shadow-card' : 'shadow-none',
        className,
      )}
    >
      <img
        src={destination.image}
        alt={destination.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      {/* برچسب قیمت */}
      <span className="num absolute start-3 top-3 rounded-full bg-ink-900/55 px-2.5 py-1 text-2xs font-bold text-white backdrop-blur-sm">
        از {formatNumber(destination.startingPrice)} تومان
      </span>

      {/* پرده‌ی شیشه‌ای پایین کارت — لبه‌اش در تصویر محو می‌شود */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-900/85 via-ink-900/35 to-transparent backdrop-blur-[3px] [mask-image:linear-gradient(to_top,black_45%,transparent)]" />

      <div className="absolute inset-x-0 bottom-0 p-4 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
        <p className="truncate text-base font-bold">{destination.name}</p>
        <p className="mt-1 truncate text-2xs text-white/85">
          {destination.country} · <span className="num">{faDigits(destination.hotelCount)}</span> اقامتگاه
        </p>
        <span className="mt-3 flex h-9 items-center justify-center rounded-full bg-white text-2xs font-bold text-ink-900 transition group-hover:bg-brand-600 group-hover:text-white">
          مشاهده اقامتگاه‌ها
        </span>
      </div>
    </Link>
  );
}
