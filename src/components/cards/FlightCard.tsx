import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { formatClock, formatDuration, formatToman } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';
import { cn } from '@/lib/utils';
import type { Airline, Flight } from '@/types';

export function AirlineBadge({ airline, size = 'md' }: { airline: Airline; size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = size === 'sm' ? 'h-7 w-7 text-[0.6rem]' : size === 'lg' ? 'h-12 w-12 text-xs' : 'h-10 w-10 text-2xs';
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-lg font-bold text-white', dimensions)}
      style={{ backgroundColor: airline.color }}
      title={airline.name}
    >
      {airline.short}
    </span>
  );
}

interface FlightCardProps {
  flight: Flight;
  queryString: string;
  passengers: number;
  tripType: 'oneway' | 'round' | 'multi';
}

export function FlightCard({ flight, queryString, passengers, tripType }: FlightCardProps) {
  const totalPrice = flight.price * Math.max(passengers, 1);
  const detailHref = `/flights/${flight.id}?${queryString}`;
  const returnSegment = tripType === 'round' ? flight.segments[1] : undefined;

  return (
    <article className="card overflow-hidden transition hover:border-ink-300 hover:shadow-card-hover">
      <div className="flex flex-col gap-4 p-4 lg:grid lg:grid-cols-[minmax(140px,0.9fr)_minmax(0,2fr)_minmax(140px,1fr)_minmax(150px,auto)] lg:items-center lg:gap-5">
        {/* ایرلاین */}
        <div className="flex items-center gap-3">
          <AirlineBadge airline={flight.airline} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink-800">{flight.airline.name}</p>
            <p className="num mt-0.5 text-2xs text-ink-400">
              {flight.segments[0].flightNumber} · {flight.segments[0].aircraft}
            </p>
          </div>
          <div className="ms-auto text-end lg:hidden">
            <p className="num text-[0.95rem] font-bold text-ink-900">{formatToman(flight.price)}</p>
            <p className="text-2xs text-ink-400">هر مسافر</p>
          </div>
        </div>

        {/* زمان‌ها */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="num text-base font-bold text-ink-900">{formatClock(flight.departMinutes)}</p>
            <p className="mt-0.5 truncate text-2xs text-ink-500">{flight.from.name}</p>
          </div>
          <div className="flex-1 px-1">
            <p className="mb-1 text-center text-2xs text-ink-500">{formatDuration(flight.durationMinutes)}</p>
            <div className="route-line" />
            <p className="mt-1 text-center text-2xs font-medium text-ink-600">
              {flight.stops === 0 ? 'بدون توقف' : `${faDigits(flight.stops)} توقف`}
              {flight.stops > 0 && flight.stopCities.length > 0 && (
                <span className="text-ink-400"> · {flight.stopCities.map((c) => c.name).join('، ')}</span>
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="num text-base font-bold text-ink-900">{formatClock(flight.arriveMinutes)}</p>
            <p className="mt-0.5 truncate text-2xs text-ink-500">
              {flight.to.name}
              {flight.arrivesNextDay && <span className="num text-warning-600"> (+۱)</span>}
            </p>
          </div>
        </div>

        {/* شرایط بلیط */}
        <div className="flex flex-wrap items-center gap-1.5 lg:flex-col lg:items-start">
          <span className="chip border-ink-200 bg-ink-50 text-ink-600">
            <Icon name="suitcase" className="h-3.5 w-3.5" />
            {flight.baggage}
          </span>
          <span className="chip border-ink-200 bg-ink-50 text-ink-600">
            <Icon name="briefcase" className="h-3.5 w-3.5" />
            {flight.cabinBaggage}
          </span>
          <span
            className={cn(
              'chip',
              flight.fareType === 'charter'
                ? 'border-accent-200 bg-accent-50 text-accent-700'
                : 'border-brand-200 bg-brand-50 text-brand-700',
            )}
          >
            {flight.fareType === 'charter' ? 'چارتر' : 'سیستمی'}
          </span>
          {!flight.refundable && (
            <span className="chip border-ink-200 bg-white text-ink-500">بدون استرداد</span>
          )}
        </div>

        {/* قیمت و اقدام */}
        <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-3 lg:flex-col lg:items-end lg:border-0 lg:pt-0">
          <div className="hidden text-end lg:block">
            {flight.oldPrice && (
              <p className="num text-2xs text-ink-400 line-through">{formatToman(flight.oldPrice)}</p>
            )}
            <p className="num text-[1.05rem] font-bold text-ink-900">{formatToman(flight.price)}</p>
            <p className="text-2xs text-ink-400">
              هر مسافر{tripType === 'round' ? ' · رفت و برگشت' : ''}
            </p>
            {passengers > 1 && (
              <p className="num mt-0.5 text-2xs text-ink-500">
                مجموع {faDigits(passengers)} مسافر: {formatToman(totalPrice)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 lg:w-full lg:flex-col lg:items-end">
            {flight.seatsLeft <= 5 && (
              <span className="num text-2xs font-medium text-danger-600">
                {faDigits(flight.seatsLeft)} صندلی باقی مانده
              </span>
            )}
            <Link to={detailHref} className="lg:w-full">
              <Button size="md" className="w-full lg:min-w-[140px]">
                انتخاب پرواز
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {returnSegment && (
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 bg-ink-50/60 px-4 py-2.5 text-2xs text-ink-600">
          <span className="rounded-md bg-white px-2 py-0.5 font-medium text-ink-700 shadow-card">برگشت</span>
          <span className="flex items-center gap-2">
            <span className="font-medium text-ink-800">{returnSegment.departTime}</span>
            <span className="text-ink-400">→</span>
            <span className="font-medium text-ink-800">{returnSegment.arriveTime}</span>
          </span>
          <span>{formatDuration(returnSegment.durationMinutes)}</span>
          <span className="num">{returnSegment.flightNumber}</span>
        </div>
      )}
    </article>
  );
}
