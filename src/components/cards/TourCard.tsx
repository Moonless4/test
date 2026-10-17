import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Stars } from '@/components/ui/Rating';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber, percentOff } from '@/lib/utils';
import type { Tour } from '@/types';

interface TourCardProps {
  tour: Tour;
  className?: string;
}

export function TourCard({ tour, className }: TourCardProps) {
  const discount = tour.oldPrice ? percentOff(tour.price, tour.oldPrice) : 0;

  return (
    <article className={cn('group card flex flex-col overflow-hidden transition hover:border-ink-300 hover:shadow-card-hover', className)}>
      <div className="relative h-40 overflow-hidden">
        <img
          src={tour.image}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <span className="num rounded-md bg-ink-900/55 px-2 py-1 text-2xs text-white backdrop-blur-sm">
            {faDigits(tour.days)} روز · {faDigits(tour.nights)} شب
          </span>
          {discount > 0 && (
            <span className="num rounded-md bg-danger-500 px-2 py-1 text-2xs font-bold text-white">
              {faDigits(discount)}٪ تخفیف
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <Stars count={Math.round(tour.rating)} />
          <span className="num text-2xs text-ink-500">
            {faDigits(tour.rating.toFixed(1))} ({faDigits(tour.reviewCount)} نظر)
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-7 text-ink-900">{tour.title}</h3>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {tour.includes.slice(0, 3).map((item) => (
            <span key={item} className="chip border-ink-200 bg-ink-50 text-ink-600">
              <Icon name="check" className="h-3 w-3 text-success-600" />
              {item}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 text-2xs text-ink-500">
          <Icon name="calendar" className="h-3.5 w-3.5" />
          تاریخ حرکت: {tour.travelDate}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-100 pt-3.5">
          <div>
            {tour.oldPrice && (
              <p className="num text-2xs text-ink-400 line-through">{formatNumber(tour.oldPrice)}</p>
            )}
            <p className="num text-[1.05rem] font-bold text-ink-900">
              {formatNumber(tour.price)}
              <span className="ms-1 text-2xs font-normal text-ink-500">تومان</span>
            </p>
            <p className="text-2xs text-ink-400">قیمت هر نفر</p>
          </div>
          <Link to={`/booking/tour/${tour.id}`}>
            <Button size="md" className="min-w-[104px]">
              رزرو تور
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
