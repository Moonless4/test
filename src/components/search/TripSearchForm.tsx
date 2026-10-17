import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CityField } from '@/components/ui/CityField';
import { DateField } from '@/components/ui/DateField';
import { Popover } from '@/components/ui/Popover';
import { Counter } from '@/components/ui/Counter';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { buildTripQuery } from '@/lib/searchParams';
import { addDays, faDigits, startOfDay } from '@/lib/jalali';
import { cn } from '@/lib/utils';
import type { City } from '@/types';

interface TripSearchFormProps {
  service: 'train' | 'bus';
  className?: string;
}

/** فرم جستجوی قطار و اتوبوس (ساختار مشترک، تفاوت در متن‌ها) */
export function TripSearchForm({ service, className }: TripSearchFormProps) {
  const navigate = useNavigate();
  const today = startOfDay(new Date());
  const isTrain = service === 'train';

  const [origin, setOrigin] = useState<City | null>(null);
  const [destination, setDestination] = useState<City | null>(null);
  const [departDate, setDepartDate] = useState<Date | null>(addDays(today, 4));
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [paxOpen, setPaxOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!origin) next.origin = 'شهر مبدا را انتخاب کنید';
    if (!destination) next.destination = 'شهر مقصد را انتخاب کنید';
    if (origin && destination && origin.code === destination.code) {
      next.destination = 'مبدا و مقصد نمی‌توانند یکسان باشند';
    }
    if (!departDate) next.departDate = 'تاریخ حرکت را انتخاب کنید';
    setErrors(next);
    if (Object.keys(next).length) return;

    navigate(`/${isTrain ? 'trains' : 'buses'}?${buildTripQuery({ origin, destination, departDate, returnDate, passengers })}`);
  };

  // در دسکتاپ باریک (lg) فیلدها دو ردیفه می‌شوند تا متنشان بریده نشود؛ از xl به بعد چیدمان یک‌ردیفه‌ی فعلی حفظ می‌شود
  const wideField = 'lg:col-span-6 xl:col-span-3';
  const narrowField = 'lg:col-span-4 xl:col-span-2';

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3.5', className)} noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-2xs text-ink-500">
          <Icon name={isTrain ? 'train' : 'bus'} className="h-4 w-4 text-brand-600" />
          {isTrain
            ? 'قطارهای سریع‌السیر، درجه یک و لوکس رجا و شرکت‌های خصوصی'
            : 'اتوبوس‌های VIP و معمولی از تمام پایانه‌های کشور'}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className={cn('relative', wideField)}>
          <CityField
            label="مبدا"
            placeholder="شهر مبدا"
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
          >
            <Icon name="swap" className="h-4 w-4" />
          </button>
        </div>

        <div className={wideField}>
          <CityField
            label="مقصد"
            placeholder="شهر مقصد"
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
              if (returnDate && returnDate <= date) setReturnDate(null);
            }}
          />
        </div>

        <div className={narrowField}>
          <DateField
            label="تاریخ برگشت (اختیاری)"
            value={returnDate}
            min={departDate ? addDays(departDate, 1) : today}
            onChange={setReturnDate}
          />
        </div>

        <div className={narrowField}>
          <Popover
            open={paxOpen}
            onClose={() => setPaxOpen(false)}
            className="w-full"
            panelClassName="w-[300px] p-4"
            align="end"
            trigger={
              <button
                type="button"
                onClick={() => setPaxOpen((current) => !current)}
                className={cn('field-shell text-start', paxOpen && 'border-brand-500 ring-2 ring-brand-500/15')}
              >
                <Icon name="users" className="h-5 w-5 shrink-0 text-ink-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-2xs text-ink-500">مسافران</span>
                  <span className="block truncate text-sm font-medium text-ink-900">
                    {faDigits(passengers)} مسافر
                  </span>
                </span>
                <Icon name="chevron-down" className={cn('h-4 w-4 shrink-0 text-ink-400 transition', paxOpen && 'rotate-180')} />
              </button>
            }
          >
            <div>
              <Counter title="تعداد مسافر" value={passengers} min={1} max={10} onChange={setPassengers} />
              <button
                type="button"
                onClick={() => setPaxOpen(false)}
                className="mt-3 h-10 w-full rounded-lg bg-brand-600 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                تأیید
              </button>
            </div>
          </Popover>
        </div>
      </div>

      {(errors.origin || errors.destination || errors.departDate) && (
        <div className="flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2.5 text-xs text-danger-700">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errors.origin || errors.destination || errors.departDate}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-ink-100 pt-3.5 sm:flex-row sm:items-center sm:justify-end">
        <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-[190px]" icon={<Icon name="search" className="h-5 w-5" />}>
          {isTrain ? 'جستجوی قطار' : 'جستجوی اتوبوس'}
        </Button>
      </div>
    </form>
  );
}
