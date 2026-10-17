import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { formatClock, formatDuration, formatNumber } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';
import { cn } from '@/lib/utils';
import type { BusTrip, TrainTrip } from '@/types';

interface TripCardProps {
  trip: TrainTrip | BusTrip;
  kind: 'train' | 'bus';
  queryString: string;
  passengers: number;
}

function isTrain(trip: TrainTrip | BusTrip): trip is TrainTrip {
  return 'wagonClass' in trip;
}

export function TripCard({ trip, kind, queryString, passengers }: TripCardProps) {
  const href = `/booking/${kind}/${trip.id}?${queryString}`;
  const seatsWarning = trip.seatsLeft <= 6;

  return (
    <article className="card p-4 transition hover:border-ink-300 hover:shadow-card-hover">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(150px,1fr)_minmax(0,2fr)_minmax(130px,1fr)_minmax(140px,auto)] lg:items-center lg:gap-5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: trip.operatorColor }}
          >
            <Icon name={kind === 'train' ? 'train' : 'bus'} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink-800">{trip.operator}</p>
            <p className="num mt-0.5 text-2xs text-ink-400">
              {isTrain(trip) ? `قطار ${trip.trainNumber} · ${trip.wagonClassName}` : `${trip.busType} · ${trip.terminal}`}
            </p>
          </div>
          <div className="ms-auto text-end lg:hidden">
            <p className="num text-[0.95rem] font-bold text-ink-900">{formatNumber(trip.price)}</p>
            <p className="text-2xs text-ink-400">هر نفر</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="num text-base font-bold text-ink-900">{formatClock(trip.departMinutes)}</p>
            <p className="mt-0.5 truncate text-2xs text-ink-500">{trip.from.name}</p>
          </div>
          <div className="flex-1 px-1">
            <p className="mb-1 text-center text-2xs text-ink-500">{formatDuration(trip.durationMinutes)}</p>
            <div className="route-line" />
            <p className="mt-1 text-center text-2xs text-ink-500">مستقیم</p>
          </div>
          <div className="text-center">
            <p className="num text-base font-bold text-ink-900">{formatClock(trip.arriveMinutes)}</p>
            <p className="mt-0.5 truncate text-2xs text-ink-500">{trip.to.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="chip border-ink-200 bg-ink-50 text-ink-600">
            <Icon name="ticket" className="h-3.5 w-3.5" />
            {isTrain(trip) ? trip.wagonClassName : `اتوبوس ${trip.busType}`}
          </span>
          {isTrain(trip) && trip.mealService && (
            <span className="chip border-success-500/30 bg-success-50 text-success-700">
              <Icon name="utensils" className="h-3.5 w-3.5" />
              پذیرایی
            </span>
          )}
          <span className={cn('chip', seatsWarning ? 'border-danger-500/30 bg-danger-50 text-danger-700' : 'border-ink-200 bg-white text-ink-600')}>
            <span className="num">{faDigits(trip.seatsLeft)}</span> صندلی خالی
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-3 lg:flex-col lg:items-end lg:border-0 lg:pt-0">
          <div className="hidden text-end lg:block">
            {isTrain(trip) && trip.oldPrice && (
              <p className="num text-2xs text-ink-400 line-through">{formatNumber(trip.oldPrice)}</p>
            )}
            <p className="num text-[1.05rem] font-bold text-ink-900">{formatNumber(trip.price)}</p>
            <p className="text-2xs text-ink-400">تومان · هر نفر</p>
            {passengers > 1 && (
              <p className="num mt-0.5 text-2xs text-ink-500">
                مجموع {faDigits(passengers)} نفر: {formatNumber(trip.price * passengers)}
              </p>
            )}
          </div>
          <Link to={href} className="lg:w-full">
            <Button size="md" className="w-full lg:min-w-[140px]">
              انتخاب صندلی
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
