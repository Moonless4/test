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

/** کارت ساده‌ی هتل — تصویر تمام‌قد و متن روی نوار بلورشده‌ی پایین */
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

      <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-ink-900/45 p-3 text-white backdrop-blur-md">
        <Link to={href} className="block truncate text-xs font-bold transition sm:text-sm">
          {hotel.name}
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-2xs text-white/80">
          <Stars count={hotel.stars} />
          <span className="num">{faDigits(hotel.stars)} ستاره</span>
          <span className="text-white/40">·</span>
          <span className="truncate">{hotel.cityName}</span>
        </div>

        <ul className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-2xs text-white/80">
          {hotel.facilities.slice(0, 4).map((facility) => (
            <li key={facility} className="flex items-center gap-1" title={HOTEL_FACILITIES[facility]}>
              <Icon name={FACILITY_ICONS[facility] ?? 'check'} className="h-3.5 w-3.5 text-white/90" />
              <span className="hidden sm:inline">{HOTEL_FACILITIES[facility]}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2.5 border-t border-white/20 pt-2">
          <p className="text-2xs text-white/75">شروع قیمت از</p>
          <p className="num text-sm font-bold">
            {formatNumber(hotel.pricePerNight)}
            <span className="ms-1 text-2xs font-normal text-white/75">تومان / شب</span>
          </p>
        </div>
      </div>
    </article>
  );
}
