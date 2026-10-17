import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';
import type { ReactNode } from 'react';

interface SortOption<T extends string> {
  key: T;
  label: string;
  icon?: string;
}

interface SortBarProps<T extends string> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  resultCount: number;
  countLabel?: string;
  onOpenFilters?: () => void;
  filterCount?: number;
  extra?: ReactNode;
}

/** نوار مرتب‌سازی و شمارش نتایج */
export function SortBar<T extends string>({
  options,
  value,
  onChange,
  resultCount,
  countLabel = 'گزینه یافت شد',
  onOpenFilters,
  filterCount = 0,
  extra,
}: SortBarProps<T>) {
  return (
    <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="relative flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-2xs font-medium text-ink-700 transition hover:border-ink-300 lg:hidden"
          >
            <Icon name="filter" className="h-4 w-4" />
            فیلترها
            {filterCount > 0 && (
              <span className="num absolute -end-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[0.6rem] font-bold text-white">
                {faDigits(filterCount)}
              </span>
            )}
          </button>
        )}
        <p className="num text-2xs text-ink-500 sm:text-xs">
          <span className="font-bold text-ink-800">{faDigits(resultCount)}</span> {countLabel}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-2xs text-ink-500 sm:block">مرتب‌سازی:</span>
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-ink-200 p-0.5">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              className={cn(
                'flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-2xs font-medium transition',
                value === option.key ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-50',
              )}
            >
              {option.icon && <Icon name={option.icon} className="h-3.5 w-3.5" />}
              {option.label}
            </button>
          ))}
        </div>
        {extra}
      </div>
    </div>
  );
}
