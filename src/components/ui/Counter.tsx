import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface CounterProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  title: string;
  description?: string;
  className?: string;
}

export function Counter({
  value,
  min = 0,
  max = 9,
  onChange,
  title,
  description,
  className,
}: CounterProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className={cn('flex items-center justify-between gap-4 py-2.5', className)}>
      <div>
        <p className="text-sm font-medium text-ink-800">{title}</p>
        {description && <p className="mt-0.5 text-2xs text-ink-500">{description}</p>}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          aria-label={`افزودن ${title}`}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-200 text-brand-600 transition hover:border-brand-300 hover:bg-brand-50 disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:bg-transparent"
        >
          <Icon name="plus" className="h-4 w-4" />
        </button>
        <span className="num w-9 text-center text-sm font-semibold text-ink-900">{value.toLocaleString('fa-IR')}</span>
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          aria-label={`کاهش ${title}`}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-200 text-ink-600 transition hover:border-ink-300 hover:bg-ink-50 disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:bg-transparent"
        >
          <Icon name="minus" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
