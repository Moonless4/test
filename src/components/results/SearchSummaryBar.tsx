import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { formatJalaliWithWeekday } from '@/lib/jalali';
import { faDigits } from '@/lib/jalali';
import { cn } from '@/lib/utils';

interface SearchSummaryBarProps {
  title: string;
  subtitle?: string;
  meta: string[];
  editContent?: ReactNode;
  onEditLabel?: string;
}

/** نوار خلاصه‌ی جستجو در بالای صفحه‌های نتایج */
export function SearchSummaryBar({
  title,
  subtitle,
  meta,
  editContent,
  onEditLabel = 'ویرایش جستجو',
}: SearchSummaryBarProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-ink-900 sm:text-lg">{title}</h1>
          {subtitle && <p className="mt-1 text-2xs text-ink-500 sm:text-xs">{subtitle}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-2xs text-ink-500">
            {meta.map((item) => (
              <span key={item} className="flex items-center gap-1">
                <Icon name="check" className="h-3.5 w-3.5 text-brand-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {editContent && (
          <Button
            variant="secondary"
            size="md"
            className="shrink-0"
            onClick={() => setEditing((current) => !current)}
            icon={<Icon name="sliders" className="h-4 w-4" />}
          >
            {editing ? 'بستن' : onEditLabel}
          </Button>
        )}
      </div>

      {editContent && editing && (
        <div className="animate-fade-in border-t border-ink-200 bg-ink-50/60 p-4">{editContent}</div>
      )}
    </div>
  );
}

export function formatDateLabel(date: Date | null): string {
  if (!date) return '—';
  return formatJalaliWithWeekday(date);
}

export function passengersLabel(adults: number, children: number, infants: number): string {
  const parts: string[] = [];
  parts.push(`${faDigits(adults)} بزرگسال`);
  if (children) parts.push(`${faDigits(children)} کودک`);
  if (infants) parts.push(`${faDigits(infants)} نوزاد`);
  return parts.join(' · ');
}

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'accent' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-2xs font-medium',
        tone === 'brand' && 'bg-brand-50 text-brand-700',
        tone === 'accent' && 'bg-accent-50 text-accent-700',
        tone === 'neutral' && 'bg-ink-100 text-ink-600',
      )}
    >
      {children}
    </span>
  );
}
