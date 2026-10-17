import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export function FilterSection({
  title,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-ink-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-3.5 text-start"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink-800">{title}</span>
          {badge && <span className="num rounded-md bg-brand-50 px-1.5 py-0.5 text-[0.6rem] font-bold text-brand-700">{badge}</span>}
        </span>
        <Icon
          name="chevron-down"
          className={cn('h-4 w-4 text-ink-400 transition', open && 'rotate-180')}
        />
      </button>
      {open && <div className="animate-fade-in pb-4">{children}</div>}
    </div>
  );
}

/** چیپ فیلترهای فعال با امکان حذف */
export function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-2xs text-brand-700">
      {label}
      <button type="button" onClick={onRemove} aria-label={`حذف فیلتر ${label}`} className="text-brand-600 hover:text-brand-800">
        <Icon name="close" className="h-3 w-3" />
      </button>
    </span>
  );
}
