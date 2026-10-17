import { useState } from 'react';
import { Popover } from './Popover';
import { JalaliCalendar } from './JalaliCalendar';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';
import { faDigits, formatJalaliWithWeekdayAndYear, JALALI_WEEKDAYS_FULL, jalaliWeekday, jalaliMonthLength, toJalali, fromJalali, addDays } from '@/lib/jalali';

interface DateFieldProps {
  value: Date | null;
  onChange: (date: Date) => void;
  label: string;
  placeholder?: string;
  min?: Date;
  rangeEnd?: Date | null;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  size?: 'md' | 'lg';
  compact?: boolean;
  /** برای فیلدهایی مثل تاریخ تولد که میان‌بر «امروز» در آن‌ها معنا ندارد */
  hideQuickAction?: boolean;
  /** لبه‌ی چسبیدن پنل تقویم: ابتدای فیلد (راست در RTL) یا انتهای آن */
  align?: 'start' | 'end';
}

/** فیلد تاریخ شمسی با تقویم بازشو */
export function DateField({
  value,
  onChange,
  label,
  placeholder = 'انتخاب تاریخ',
  min,
  rangeEnd,
  disabled,
  error,
  className,
  size = 'lg',
  compact,
  hideQuickAction,
  align = 'start',
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      className={cn('w-full', className)}
      panelClassName="w-[340px] p-4"
      align={align}
      trigger={
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            'flex w-full items-center gap-2 text-start transition',
            size === 'lg' ? 'field-shell' : 'h-11 rounded-lg border border-ink-200 bg-white px-3',
            error && 'field-shell-error',
            open && 'border-brand-500 ring-2 ring-brand-500/15',
            disabled && 'cursor-not-allowed bg-ink-50 opacity-80',
          )}
        >
          <Icon name="calendar" className="h-5 w-5 shrink-0 text-ink-400" />
          <span className="min-w-0 flex-1">
            {!compact && <span className="block truncate text-2xs text-ink-500">{label}</span>}
            <span
              className={cn(
                'block truncate text-sm',
                value ? 'font-medium text-ink-900' : 'text-ink-400',
              )}
            >
              {value ? formatJalaliWithWeekdayAndYear(value) : placeholder}
            </span>
          </span>
        </button>
      }
    >
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-ink-500">{label}</p>
          {!hideQuickAction && (
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const quick = min && min > now ? min : now;
                onChange(quick);
                setOpen(false);
              }}
              className="text-2xs font-medium text-brand-700 hover:text-brand-800"
            >
              امروز
            </button>
          )}
        </div>
        <JalaliCalendar
          value={value}
          onChange={(date) => {
            onChange(date);
            setOpen(false);
          }}
          min={min}
          rangeEnd={rangeEnd}
        />
      </div>
    </Popover>
  );
}

/** فهرست کوتاه روزهای نزدیک برای انتخاب سریع تاریخ */
export function QuickDateList({ onSelect, days = 5 }: { onSelect: (date: Date) => void; days?: number }) {
  const today = new Date();
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {Array.from({ length: days }).map((_, index) => {
        const date = addDays(today, index);
        const { jd, jm } = toJalali(date);
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(date)}
            className="flex min-w-[76px] flex-col items-center rounded-lg border border-ink-200 px-3 py-2 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="text-2xs text-ink-500">
              {index === 0 ? 'امروز' : JALALI_WEEKDAYS_FULL[jalaliWeekday(date)]}
            </span>
            <span className="num text-sm font-semibold text-ink-900">{faDigits(jd)}</span>
            <span className="text-2xs text-ink-400">{JALALI_MONTHS_SHORT[jm - 1]}</span>
          </button>
        );
      })}
    </div>
  );
}

const JALALI_MONTHS_SHORT = [
  'فرو',
  'ارد',
  'خرد',
  'تیر',
  'مرد',
  'شهر',
  'مهر',
  'آبا',
  'آذر',
  'دی',
  'بهم',
  'اسف',
];

export { jalaliMonthLength, fromJalali };
