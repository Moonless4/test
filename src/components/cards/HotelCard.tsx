import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { ScoreBadge, Stars, scoreLabel } from '@/components/ui/Rating';
import { FACILITY_ICONS } from '@/components/ui/Icon';
import { HOTEL_FACILITIES } from '@/data/hotels';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber, formatToman, percentOff } from '@/lib/utils';
import type { Hotel } from '@/types';

interface HotelCardProps {
  hotel: Hotel;
  queryString?: string;
  nights?: number;
  layout?: 'row' | 'grid';
  className?: string;
}

export function HotelCard({ hotel, queryString = '', nights = 1, layout = 'row', className }: HotelCardProps) {
  const discount = hotel.oldPrice ? percentOff(hotel.pricePerNight, hotel.oldPrice) : 0;
  const total = hotel.pricePerNight * nights;
  const href = `/hotels/${hotel.id}${queryString ? `?${queryString}` : ''}`;

  return (
    <article
      className={cn(
        'group card overflow-hidden transition hover:border-ink-300 hover:shadow-card-hover',
        layout === 'row' ? 'sm:flex' : 'flex flex-col',
        className,
      )}
    >
      <div className={cn('relative shrink-0 overflow-hidden', layout === 'row' ? 'h-48 sm:h-auto sm:w-[260px]' : 'h-44')}>
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          {hotel.freeCancel ? (
            <span className="rounded-md bg-success-600/95 px-2 py-1 text-2xs font-medium text-white">
              لغو رایگان
            </span>
          ) : (
            <span />
          )}
          {discount > 0 && (
            <span className="num rounded-md bg-danger-500 px-2 py-1 text-2xs font-bold text-white">
              {faDigits(discount)}٪ تخفیف
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-ink-900/70 to-transparent p-2.5 pt-6 text-2xs text-white">
          <Icon name="map-pin" className="h-3.5 w-3.5" />
          {hotel.cityName}
          <span className="opacity-70">·</span>
          {hotel.district}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[0.95rem] font-bold text-ink-900">{hotel.name}</h3>
            <div className="mt-1.5 flex items-center gap-2">
              <Stars count={hotel.stars} />
              <span className="text-2xs text-ink-500">
                {hotel.type === 'villa' ? 'ویلا' : hotel.type === 'apartment' ? 'آپارتمان' : hotel.type === 'traditional' ? 'اقامتگاه سنتی' : 'هتل'}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1">
            <ScoreBadge score={hotel.score} />
            <span className="num text-[0.65rem] text-ink-400">{faDigits(hotel.reviewCount)} نظر</span>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-500">{hotel.description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {hotel.facilities.slice(0, 5).map((facility) => (
            <span key={facility} className="chip border-ink-200 bg-ink-50 text-ink-600">
              <Icon name={FACILITY_ICONS[facility] ?? 'check'} className="h-3.5 w-3.5 text-brand-600" />
              {HOTEL_FACILITIES[facility]}
            </span>
          ))}
          {hotel.facilities.length > 5 && (
            <span className="num chip border-ink-200 bg-white text-ink-500">
              +{faDigits(hotel.facilities.length - 5)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-100 pt-3.5">
          <div>
            {hotel.oldPrice && (
              <p className="num text-2xs text-ink-400 line-through">{formatNumber(hotel.oldPrice)}</p>
            )}
            <p className="num text-[1.05rem] font-bold text-ink-900">
              {formatNumber(hotel.pricePerNight)}
              <span className="ms-1 text-2xs font-normal text-ink-500">تومان / شب</span>
            </p>
            {nights > 1 && (
              <p className="num mt-0.5 text-2xs text-ink-500">
                مجموع {faDigits(nights)} شب: {formatToman(total)}
              </p>
            )}
          </div>
          <Link to={href}>
            <Button size="md" className="min-w-[104px]">
              رزرو
            </Button>
          </Link>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-2xs text-ink-400">
          <Icon name="star" filled size={12} className="text-accent-400" />
          امتیاز {faDigits(hotel.score)} از ۱۰ · {scoreLabel(hotel.score)}
        </div>
      </div>
    </article>
  );
}
