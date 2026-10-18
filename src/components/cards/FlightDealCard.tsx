import { Link } from 'react-router-dom';
import { AirlineBadge } from './FlightCard';
import { Icon } from '@/components/ui/Icon';
import { formatDuration, formatNumber } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';
import type { FlightDeal } from '@/data/popularFlights';

interface FlightDealCardProps {
  deal: FlightDeal;
  className?: string;
}

/** کارت مسیر پرطرفدار — از/به، ایرلاین و ارزان‌ترین قیمت */
export function FlightDealCard({ deal, className }: FlightDealCardProps) {
  // تاریخ همراه لینک می‌رود تا صفحه‌ی نتایج همان پروازها را نشان دهد
  const href = `/flights?from=${deal.from.code}&to=${deal.to.code}&depart=${deal.departDate}&trip=oneway&cabin=economy`;

  return (
    <Link
      to={href}
      className={`group flex w-full flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 transition hover:border-brand-300 ${className ?? ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AirlineBadge airline={deal.airline} size="sm" />
          <span className="text-2xs text-ink-500">{deal.airline.name}</span>
        </div>
        <span className="num flex items-center gap-1 text-2xs text-ink-400">
          <Icon name="clock" className="h-3.5 w-3.5" />
          {formatDuration(deal.durationMinutes)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-ink-900">{deal.from.name}</span>
        <span className="flex flex-1 items-center gap-1 text-ink-300">
          <span className="h-px flex-1 bg-ink-200" />
          <Icon name="plane-side" className="h-3.5 w-3.5 text-brand-500" />
          <span className="h-px flex-1 bg-ink-200" />
        </span>
        <span className="text-sm font-bold text-ink-900">{deal.to.name}</span>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 pt-3">
        <span className="num text-sm font-bold text-ink-900">
          از {formatNumber(deal.price)}
          <span className="ms-1 text-2xs font-normal text-ink-500">تومان</span>
        </span>
        <span className="flex items-center gap-1 text-2xs font-medium text-brand-700">
          مشاهده پروازها
          <Icon name="chevron-left" className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
        </span>
      </div>
      <p className="num text-2xs text-ink-400">
        {faDigits(deal.airline.code)} · {deal.isDomestic ? 'پرواز داخلی' : 'پرواز بین‌المللی'}
      </p>
    </Link>
  );
}
