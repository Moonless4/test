import { useMemo, useState } from 'react';
import { Icon } from './Icon';
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  faDigits,
  formatJalaliLong,
  fromJalali,
  isSameDay,
  jalaliMonthLength,
  jalaliWeekday,
  startOfDay,
  toJalali,
} from '@/lib/jalali';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  /** کمترین تاریخ قابل انتخاب */
  min?: Date;
  /** برای نمایش بازه‌ی انتخابی (مثلاً ورود تا خروج) */
  rangeEnd?: Date | null;
  className?: string;
}

export function JalaliCalendar({ value, onChange, min, rangeEnd, className }: DatePickerProps) {
  const today = startOfDay(new Date());
  const initial = toJalali(value ?? min ?? today);
  const [view, setView] = useState({ jy: initial.jy, jm: initial.jm });

  const daysInMonth = jalaliMonthLength(view.jy, view.jm);
  const firstDay = fromJalali(view.jy, view.jm, 1);
  const leadingBlanks = jalaliWeekday(firstDay);

  const cells = useMemo(() => {
    const list: Array<{ day: number; date: Date } | null> = [];
    for (let i = 0; i < leadingBlanks; i += 1) list.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      list.push({ day, date: fromJalali(view.jy, view.jm, day) });
    }
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [daysInMonth, leadingBlanks, view.jy, view.jm]);

  const shiftMonth = (delta: number) => {
    setView((current) => {
      let jm = current.jm + delta;
      let jy = current.jy;
      if (jm > 12) {
        jm = 1;
        jy += 1;
      }
      if (jm < 1) {
        jm = 12;
        jy -= 1;
      }
      return { jy, jm };
    });
  };

  const minDay = min ? startOfDay(min) : today;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="ماه قبل"
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
        >
          <Icon name="chevron-right" className="h-4 w-4" />
        </button>
        <div className="text-sm font-semibold text-ink-900">
          {JALALI_MONTHS[view.jm - 1]} {faDigits(view.jy)}
        </div>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="ماه بعد"
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
        >
          <Icon name="chevron-left" className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-1">
        {JALALI_WEEKDAYS.map((day) => (
          <span key={day} className="py-1 text-center text-2xs font-medium text-ink-400">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell) return <span key={`blank-${index}`} className="h-9" />;
          const isDisabled = cell.date < minDay;
          const isSelected = isSameDay(cell.date, value);
          const isRangeEnd = isSameDay(cell.date, rangeEnd);
          const inRange =
            value && rangeEnd && cell.date > value && cell.date < rangeEnd;
          const isToday = isSameDay(cell.date, today);

          return (
            <button
              key={cell.day}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(cell.date)}
              className={cn(
                'num flex h-9 items-center justify-center rounded-md text-sm transition',
                isDisabled && 'cursor-not-allowed text-ink-300',
                !isDisabled && !isSelected && !isRangeEnd && 'text-ink-700 hover:bg-brand-50 hover:text-brand-700',
                inRange && 'bg-brand-50 text-brand-700',
                (isSelected || isRangeEnd) && 'bg-brand-600 font-semibold text-white hover:bg-brand-700',
                isToday && !isSelected && !isRangeEnd && 'ring-1 ring-inset ring-brand-300',
              )}
            >
              {faDigits(cell.day)}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-2xs text-ink-500">
        <span>امروز: {formatJalaliLong(today)}</span>
        {value && <span className="font-medium text-brand-700">{formatJalaliLong(value)}</span>}
      </div>
    </div>
  );
}
