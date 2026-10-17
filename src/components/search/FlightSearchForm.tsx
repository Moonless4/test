import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CityField } from '@/components/ui/CityField';
import { DateField } from '@/components/ui/DateField';
import { PassengerField } from '@/components/ui/PassengerField';
import { PillSelect } from '@/components/ui/PillSelect';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { buildFlightQuery } from '@/lib/searchParams';
import { addDays, startOfDay } from '@/lib/jalali';
import { faDigits } from '@/lib/jalali';
import type { CabinClass, City, PassengerSelection, TripType } from '@/types';

const TRIP_TYPES: Array<{ key: TripType; title: string }> = [
  { key: 'oneway', title: 'یک‌طرفه' },
  { key: 'round', title: 'رفت و برگشت' },
  { key: 'multi', title: 'چند مقصد' },
];

const CABIN_OPTIONS: Array<{ key: CabinClass; title: string }> = [
  { key: 'economy', title: 'اقتصادی' },
  { key: 'comfort', title: 'کامفورت' },
  { key: 'business', title: 'بیزینس' },
  { key: 'first', title: 'فرست کلاس' },
];

interface MultiLeg {
  origin: City | null;
  destination: City | null;
  departDate: Date | null;
}

interface FlightSearchFormProps {
  variant?: 'hero' | 'compact';
  className?: string;
}

export function FlightSearchForm({ className }: FlightSearchFormProps) {
  const navigate = useNavigate();
  const today = startOfDay(new Date());

  const [tripType, setTripType] = useState<TripType>('round');
  const [origin, setOrigin] = useState<City | null>(null);
  const [destination, setDestination] = useState<City | null>(null);
  const [departDate, setDepartDate] = useState<Date | null>(addDays(today, 7));
  const [returnDate, setReturnDate] = useState<Date | null>(addDays(today, 12));
  const [passengers, setPassengers] = useState<PassengerSelection>({ adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState<CabinClass>('economy');
  const [legs, setLegs] = useState<MultiLeg[]>([{ origin: null, destination: null, departDate: null }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (tripType === 'multi') {
      legs.forEach((leg, index) => {
        if (!leg.origin) next[`leg-${index}-origin`] = 'مبدا را انتخاب کنید';
        if (!leg.destination) next[`leg-${index}-destination`] = 'مقصد را انتخاب کنید';
        if (!leg.departDate) next[`leg-${index}-date`] = 'تاریخ را انتخاب کنید';
      });
      return next;
    }
    if (!origin) next.origin = 'شهر مبدا را انتخاب کنید';
    if (!destination) next.destination = 'شهر مقصد را انتخاب کنید';
    if (origin && destination && origin.code === destination.code) {
      next.destination = 'مبدا و مقصد نمی‌توانند یکسان باشند';
    }
    if (!departDate) next.departDate = 'تاریخ رفت را انتخاب کنید';
    if (tripType === 'round') {
      if (!returnDate) next.returnDate = 'تاریخ برگشت را انتخاب کنید';
      else if (departDate && returnDate <= departDate) next.returnDate = 'تاریخ برگشت باید بعد از رفت باشد';
    }
    return next;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (tripType === 'multi') {
      const first = legs[0];
      navigate(`/flights?${buildFlightQuery({ origin: first.origin, destination: first.destination, departDate: first.departDate, returnDate: null, tripType: 'oneway', passengers, cabin })}`);
      return;
    }

    navigate(
      `/flights?${buildFlightQuery({ origin, destination, departDate, returnDate, tripType, passengers, cabin })}`,
    );
  };

  // در دسکتاپ باریک (lg) فیلدها دو ردیفه می‌شوند تا متنشان بریده نشود؛ از xl به بعد چیدمان یک‌ردیفه‌ی فعلی حفظ می‌شود
  const wideField = 'lg:col-span-6 xl:col-span-3';
  const narrowField = 'lg:col-span-4 xl:col-span-2';

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3.5', className)} noValidate>
      {/* نوع سفر و کلاس پروازی */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PillSelect
            ariaLabel="نوع سفر"
            value={tripType}
            options={TRIP_TYPES}
            onChange={(key) => setTripType(key as TripType)}
          />
          <PillSelect
            ariaLabel="کلاس پروازی"
            value={cabin}
            options={CABIN_OPTIONS}
            onChange={(key) => setCabin(key as CabinClass)}
          />
        </div>

        <div className="flex items-center gap-2 text-2xs text-ink-500">
          <Icon name="shield-check" className="h-4 w-4 text-success-600" />
          تضمین بهترین قیمت و استرداد آنلاین
        </div>
      </div>

      {tripType === 'multi' ? (
        <div className="space-y-3">
          {legs.map((leg, index) => (
            <div key={index} className="grid gap-3 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <CityField
                  label={index === 0 ? 'مبدا' : `مبدا مسیر ${faDigits(index + 1)}`}
                  placeholder="شهر مبدا"
                  value={leg.origin}
                  error={Boolean(errors[`leg-${index}-origin`])}
                  blockedCode={leg.destination?.code}
                  onChange={(city) =>
                    setLegs((current) => current.map((item, i) => (i === index ? { ...item, origin: city } : item)))
                  }
                />
                {errors[`leg-${index}-origin`] && (
                  <p className="mt-1 text-2xs text-danger-600">{errors[`leg-${index}-origin`]}</p>
                )}
              </div>
              <div className="lg:col-span-4">
                <CityField
                  label={index === 0 ? 'مقصد' : `مقصد مسیر ${faDigits(index + 1)}`}
                  placeholder="شهر مقصد"
                  value={leg.destination}
                  error={Boolean(errors[`leg-${index}-destination`])}
                  blockedCode={leg.origin?.code}
                  onChange={(city) =>
                    setLegs((current) => current.map((item, i) => (i === index ? { ...item, destination: city } : item)))
                  }
                />
                {errors[`leg-${index}-destination`] && (
                  <p className="mt-1 text-2xs text-danger-600">{errors[`leg-${index}-destination`]}</p>
                )}
              </div>
              <div className="lg:col-span-3">
                <DateField
                  label="تاریخ پرواز"
                  value={leg.departDate}
                  min={today}
                  error={Boolean(errors[`leg-${index}-date`])}
                  onChange={(date) =>
                    setLegs((current) => current.map((item, i) => (i === index ? { ...item, departDate: date } : item)))
                  }
                />
                {errors[`leg-${index}-date`] && (
                  <p className="mt-1 text-2xs text-danger-600">{errors[`leg-${index}-date`]}</p>
                )}
              </div>
              <div className="flex items-end lg:col-span-1">
                {legs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLegs((current) => current.filter((_, i) => i !== index))}
                    className="flex h-[52px] w-full items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-danger-500/40 hover:bg-danger-50 hover:text-danger-600"
                    aria-label="حذف مسیر"
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={legs.length >= 4}
            onClick={() => setLegs((current) => [...current, { origin: null, destination: null, departDate: null }])}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-700 transition hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="plus" className="h-4 w-4" />
            افزودن مقصد جدید {legs.length >= 4 && '(حداکثر ۴ مسیر)'}
          </button>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-12">
          <div className={cn('relative', wideField)}>
            <CityField
              label="مبدا"
              placeholder="شهر یا فرودگاه مبدا"
              value={origin}
              error={Boolean(errors.origin)}
              blockedCode={destination?.code}
              onChange={setOrigin}
            />
            <button
              type="button"
              onClick={swap}
              aria-label="جابجایی مبدا و مقصد"
              className="absolute -start-4 top-1/2 z-30 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-500 shadow-card transition hover:border-brand-300 hover:text-brand-700 lg:flex"
              style={{ insetInlineStart: '-1rem' }}
            >
              <Icon name="swap" className="h-4 w-4" />
            </button>
          </div>

          <div className={wideField}>
            <CityField
              label="مقصد"
              placeholder="شهر یا فرودگاه مقصد"
              value={destination}
              error={Boolean(errors.destination)}
              blockedCode={origin?.code}
              onChange={setDestination}
            />
          </div>

          <div className={narrowField}>
            <DateField
              label="تاریخ رفت"
              value={departDate}
              min={today}
              error={Boolean(errors.departDate)}
              onChange={(date) => {
                setDepartDate(date);
                if (returnDate && returnDate <= date) setReturnDate(addDays(date, 5));
              }}
            />
          </div>

          <div className={narrowField}>
            <DateField
              label="تاریخ برگشت"
              value={tripType === 'round' ? returnDate : null}
              min={departDate ? addDays(departDate, 1) : today}
              rangeEnd={null}
              disabled={tripType !== 'round'}
              placeholder={tripType === 'round' ? 'انتخاب تاریخ' : 'یک‌طرفه'}
              error={Boolean(errors.returnDate)}
              onChange={setReturnDate}
            />
          </div>

          <div className={narrowField}>
            <PassengerField passengers={passengers} onChange={setPassengers} align="end" />
          </div>
        </div>
      )}

      {(errors.origin || errors.destination || errors.departDate || errors.returnDate) && (
        <div className="flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2.5 text-xs text-danger-700">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {errors.origin || errors.destination || errors.departDate || errors.returnDate}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-ink-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-600">
          <input type="checkbox" className="h-4 w-4 rounded border-ink-300 accent-brand-600" defaultChecked />
          نمایش تقویم قیمت و پروازهای ارزان‌تر
        </label>
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto sm:min-w-[190px]"
          icon={<Icon name="search" className="h-5 w-5" />}
        >
          جستجوی پرواز
        </Button>
      </div>
    </form>
  );
}
