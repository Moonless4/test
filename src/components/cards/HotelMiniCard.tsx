import { Link } from 'react-router-dom';
import { Icon, FACILITY_ICONS } from '@/components/ui/Icon';
import { Stars } from '@/components/ui/Rating';
import { HOTEL_FACILITIES } from '@/data/hotels';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber } from '@/lib/utils';
import type { Hotel } from '@/types';

interface HotelMiniCardProps {
  hotel: Hotel;
  queryString?: string;
  className?: string;
}

/** کارت ساده‌ی هتل — تصویر تمام‌قد و نوار بلورشده‌ی سبک در پایین */
export function HotelMiniCard({ hotel, queryString = '', className }: HotelMiniCardProps) {
  const href = `/hotels/${hotel.id}${queryString ? `?${queryString}` : ''}`;

  return (
    <article
      className={cn(
        'group relative h-64 overflow-hidden rounded-xl border border-ink-200 bg-ink-900 transition hover:border-ink-300 sm:h-72',
        className,
      )}
    >
      <img
        src={hotel.images[0]}
        alt={hotel.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/55 via-ink-900/30 to-ink-900/10 p-3 text-white backdrop-blur-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">
        <Link to={href} className="block truncate text-xs font-bold sm:text-sm">
          {hotel.name}
        </Link>

        <div className="mt-1 flex items-center gap-1.5 text-2xs text-white/85">
          <Stars count={hotel.stars} />
          <span className="num">{faDigits(hotel.stars)} ستاره</span>
          <span className="text-white/40">·</span>
          <span className="truncate">{hotel.cityName}</span>
        </div>

        <ul className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-2xs text-white/80">
          {hotel.facilities.slice(0, 4).map((facility) => (
            <li key={facility} className="flex items-center gap-1" title={HOTEL_FACILITIES[facility]}>
              <Icon name={FACILITY_ICONS[facility] ?? 'check'} className="h-3.5 w-3.5 text-white/90" />
              <span className="hidden sm:inline">{HOTEL_FACILITIES[facility]}</span>
            </li>
          ))}
        </ul>

        <p className="mt-1.5 text-2xs">
          شروع قیمت از{' '}
          <span className="num text-sm font-bold">{formatNumber(hotel.pricePerNight)}</span>
          <span className="ms-1 font-normal text-white/85">تومان / شب</span>
        </p>
      </div>
    </article>
  );
}
