import { useState } from 'react';
import { Popover } from './Popover';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface PillSelectProps {
  value: string;
  options: Array<{ key: string; title: string }>;
  onChange: (key: string) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * دکمه‌ی قرصی با فلش پایین برای انتخاب‌های کوتاه (نوع سفر، کلاس پروازی).
 * فهرست گزینه‌ها با پنل شناور خودِ اپ نمایش داده می‌شود تا هم‌رنگ و هم‌زبان بقیه‌ی رابط باشد
 * (به‌جای فهرست پیش‌فرض مرورگر که با تم مینیمال هم‌خوان نیست).
 */
export function PillSelect({ value, options, onChange, ariaLabel, className }: PillSelectProps) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.key === value)?.title ?? '—';

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      className={cn('inline-flex', className)}
      panelClassName="w-auto min-w-[11rem] p-1.5"
      sheetOnMobile={false}
      trigger={
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-full border bg-white px-3.5 text-xs font-medium text-ink-900 transition',
            'focus-visible:ring-2 focus-visible:ring-brand-500/20 sm:text-sm',
            open ? 'border-brand-600' : 'border-ink-800 hover:border-ink-900 hover:bg-ink-50',
          )}
        >
          {current}
          <Icon
            name="chevron-down"
            className={cn('h-4 w-4 text-ink-400 transition', open && 'rotate-180 text-brand-600')}
          />
        </button>
      }
    >
      <ul role="listbox" aria-label={ariaLabel} className="space-y-0.5">
        {options.map((option) => {
          const active = option.key === value;
          return (
            <li key={option.key}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs transition',
                  active ? 'bg-brand-50 font-medium text-brand-700' : 'text-ink-700 hover:bg-ink-50',
                )}
              >
                {option.title}
                {active && <Icon name="check" className="h-4 w-4 text-brand-600" />}
              </button>
            </li>
          );
        })}
      </ul>
    </Popover>
  );
}
