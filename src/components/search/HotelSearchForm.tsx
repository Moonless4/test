import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateField } from '@/components/ui/DateField';
import { Popover } from '@/components/ui/Popover';
import { Counter } from '@/components/ui/Counter';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { HotelDestinationField, type HotelDestination } from './HotelDestinationField';
import { buildHotelQuery } from '@/lib/searchParams';
import { addDays, faDigits, startOfDay } from '@/lib/jalali';
import { diffDays } from '@/lib/jalali';
import { cn } from '@/lib/utils';

export function HotelSearchForm({ className }: { className?: string }) {
  const navigate = useNavigate();
  const today = startOfDay(new Date());

  const [destination, setDestination] = useState<HotelDestination>({ label: '', cityCode: '' });
  const [checkIn, setCheckIn] = useState<Date | null>(addDays(today, 3));
  const [checkOut, setCheckOut] = useState<Date | null>(addDays(today, 5));
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const nights = checkIn && checkOut ? Math.max(diffDays(checkOut, checkIn), 0) : 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!destination.label) next.destination = 'مقصد یا نام هتل را وارد کنید';
    if (!checkIn) next.checkIn = 'تاریخ ورود را انتخاب کنید';
    if (!checkOut) next.checkOut = 'تاریخ خروج را انتخاب کنید';
    else if (checkIn && checkOut <= checkIn) next.checkOut = 'تاریخ خروج باید بعد از ورود باشد';
    setErrors(next);
    if (Object.keys(next).length) return;

    navigate(
      `/hotels?${buildHotelQuery({
        cityName: destination.label,
        cityCode: destination.cityCode,
        checkIn,
        checkOut,
        rooms,
        guests,
      })}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3.5', className)} noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-2xs text-ink-500">
          <Icon name="hotel" className="h-4 w-4 text-brand-600" />
          بیش از ۹ هزار هتل و اقامتگاه در ایران و جهان
        </div>
        {nights > 0 && (
          <span className="num rounded-md bg-brand-50 px-2 py-1 text-2xs font-medium text-brand-700">
            {faDigits(nights)} شب اقامت
          </span>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <HotelDestinationField
            value={destination}
            error={Boolean(errors.destination)}
            onChange={setDestination}
          />
          {errors.destination && <p className="mt-1 text-2xs text-danger-600">{errors.destination}</p>}
        </div>

        <div className="lg:col-span-3 xl:col-span-2">
          <DateField
            label="تاریخ ورود"
            value={checkIn}
            min={today}
            error={Boolean(errors.checkIn)}
            onChange={(date) => {
              setCheckIn(date);
              if (checkOut && checkOut <= date) setCheckOut(addDays(date, 2));
            }}
          />
          {errors.checkIn && <p className="mt-1 text-2xs text-danger-600">{errors.checkIn}</p>}
        </div>

        <div className="lg:col-span-3 xl:col-span-2">
          <DateField
            label="تاریخ خروج"
            value={checkOut}
            min={checkIn ? addDays(checkIn, 1) : today}
            rangeEnd={null}
            error={Boolean(errors.checkOut)}
            onChange={setCheckOut}
          />
          {errors.checkOut && <p className="mt-1 text-2xs text-danger-600">{errors.checkOut}</p>}
        </div>

        <div className="lg:col-span-3">
          <Popover
            open={guestsOpen}
            onClose={() => setGuestsOpen(false)}
            className="w-full"
            panelClassName="w-[320px] p-4"
            align="end"
            trigger={
              <button
                type="button"
                onClick={() => setGuestsOpen((current) => !current)}
                className={cn('field-shell text-start', guestsOpen && 'border-brand-500 ring-2 ring-brand-500/15')}
              >
                <Icon name="bed" className="h-5 w-5 shrink-0 text-ink-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-2xs text-ink-500">اتاق و مسافر</span>
                  <span className="block truncate text-sm font-medium text-ink-900">
                    {faDigits(rooms)} اتاق · {faDigits(guests)} مسافر
                  </span>
                </span>
                <Icon
                  name="chevron-down"
                  className={cn('h-4 w-4 shrink-0 text-ink-400 transition', guestsOpen && 'rotate-180')}
                />
              </button>
            }
          >
            <div>
              <div className="divide-y divide-ink-100">
                <Counter
                  title="تعداد اتاق"
                  value={rooms}
                  min={1}
                  max={6}
                  onChange={setRooms}
                />
                <Counter
                  title="تعداد مسافر"
                  description="برای هر اتاق حداکثر ۴ نفر"
                  value={guests}
                  min={1}
                  max={24}
                  onChange={setGuests}
                />
              </div>
              <button
                type="button"
                onClick={() => setGuestsOpen(false)}
                className="mt-4 h-10 w-full rounded-lg bg-brand-600 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                تأیید
              </button>
            </div>
          </Popover>
        </div>
      </div>

      {(errors.destination || errors.checkIn || errors.checkOut) && (
        <div className="flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2.5 text-xs text-danger-700">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errors.destination || errors.checkIn || errors.checkOut}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-ink-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-600">
          <input type="checkbox" className="h-4 w-4 rounded border-ink-300 accent-brand-600" defaultChecked />
          فقط اقامتگاه‌های با لغو رایگان
        </label>
        <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-[190px]" icon={<Icon name="search" className="h-5 w-5" />}>
          جستجوی هتل
        </Button>
      </div>
    </form>
  );
}
