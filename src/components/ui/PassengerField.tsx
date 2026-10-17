import { useState } from 'react';
import { Popover } from './Popover';
import { Counter } from './Counter';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';
import type { PassengerSelection } from '@/types';

interface PassengerFieldProps {
  passengers: PassengerSelection;
  onChange: (passengers: PassengerSelection) => void;
  className?: string;
  error?: boolean;
  /** لبه‌ی چسبیدن پنل: ابتدای فیلد (راست در RTL) یا انتهای آن */
  align?: 'start' | 'end';
}

export function PassengerField({
  passengers,
  onChange,
  className,
  error,
  align = 'start',
}: PassengerFieldProps) {
  const [open, setOpen] = useState(false);
  const total = passengers.adults + passengers.children + passengers.infants;

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
          onClick={() => setOpen((current) => !current)}
          className={cn(
            'field-shell text-start',
            error && 'field-shell-error',
            open && 'border-brand-500 ring-2 ring-brand-500/15',
          )}
        >
          <Icon name="users" className="h-5 w-5 shrink-0 text-ink-400" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-2xs text-ink-500">مسافران</span>
            <span className="block truncate text-sm font-medium text-ink-900">{faDigits(total)} مسافر</span>
          </span>
          <Icon name="chevron-down" className={cn('h-4 w-4 shrink-0 text-ink-400 transition', open && 'rotate-180')} />
        </button>
      }
    >
      <div>
        <p className="mb-1 text-xs font-medium text-ink-500">تعداد مسافران</p>
        <div className="divide-y divide-ink-100">
          <Counter
            title="بزرگسال"
            description="۱۲ سال به بالا"
            value={passengers.adults}
            min={1}
            max={9}
            onChange={(adults) =>
              onChange({
                ...passengers,
                adults,
                infants: Math.min(passengers.infants, adults),
              })
            }
          />
          <Counter
            title="کودک"
            description="۲ تا ۱۲ سال"
            value={passengers.children}
            min={0}
            max={8}
            onChange={(children) => onChange({ ...passengers, children })}
          />
          <Counter
            title="نوزاد"
            description="زیر ۲ سال — بدون صندلی"
            value={passengers.infants}
            min={0}
            max={passengers.adults}
            onChange={(infants) => onChange({ ...passengers, infants })}
          />
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-4 h-10 w-full rounded-lg bg-brand-600 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          تأیید
        </button>
      </div>
    </Popover>
  );
}
