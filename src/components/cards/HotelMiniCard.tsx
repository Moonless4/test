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

/** کارت ساده‌ی هتل — تصویر، نام، ستاره، امکانات و قیمت شروع */
export function HotelMiniCard({ hotel, queryString = '', className }: HotelMiniCardProps) {
  const href = `/hotels/${hotel.id}${queryString ? `?${queryString}` : ''}`;

  return (
    <article className={cn('card flex flex-col overflow-hidden transition hover:border-ink-300', className)}>
      <Link to={href} className="group block overflow-hidden">
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          loading="lazy"
          className="h-32 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-36"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link to={href} className="truncate text-xs font-bold text-ink-900 transition hover:text-brand-700 sm:text-sm">
          {hotel.name}
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-2xs text-ink-500">
          <Stars count={hotel.stars} />
          <span className="num">{faDigits(hotel.stars)} ستاره</span>
          <span className="text-ink-300">·</span>
          <span className="truncate">{hotel.cityName}</span>
        </div>

        <ul className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-2xs text-ink-500">
          {hotel.facilities.slice(0, 4).map((facility) => (
            <li key={facility} className="flex items-center gap-1" title={HOTEL_FACILITIES[facility]}>
              <Icon name={FACILITY_ICONS[facility] ?? 'check'} className="h-3.5 w-3.5 text-brand-600" />
              <span className="hidden sm:inline">{HOTEL_FACILITIES[facility]}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-ink-100 pt-2.5">
          <p className="text-2xs text-ink-500">شروع قیمت از</p>
          <p className="num text-sm font-bold text-brand-700">
            {formatNumber(hotel.pricePerNight)}
            <span className="ms-1 text-2xs font-normal text-ink-500">تومان / شب</span>
          </p>
        </div>
      </div>
    </article>
  );
}
