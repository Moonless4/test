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
 * انتخاب با یک select نامرئی روی قرص انجام می‌شود تا روی موبایل هم تجربه‌ی بومی داشته باشد.
 */
export function PillSelect({ value, options, onChange, ariaLabel, className }: PillSelectProps) {
  const current = options.find((option) => option.key === value)?.title ?? '—';

  return (
    <div className={cn('relative inline-flex', className)}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.title}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none flex h-9 items-center gap-1.5 rounded-full border border-ink-800 bg-white px-3.5 text-xs font-medium text-ink-900 transition',
          'peer-hover:border-ink-900 peer-hover:bg-ink-50 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/20 sm:text-sm',
        )}
      >
        {current}
        <Icon name="chevron-down" className="h-4 w-4" />
      </span>
    </div>
  );
}
