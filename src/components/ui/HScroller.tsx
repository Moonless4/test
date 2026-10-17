import { useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface HScrollerProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  showArrows?: boolean;
}

/**
 * ردیف افقی کارت‌ها با اسکرول لمسی روی موبایل و دکمه‌های پیمایش روی دسکتاپ.
 */
export function HScroller({ children, className, itemClassName, showArrows = true }: HScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 640);
    // در حالت RTL مقدار منفی به سمت چپ (بعدی) حرکت می‌کند
    el.scrollBy({ left: direction * amount * -1, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative', className)}>
      <div
        ref={ref}
        className={cn(
          'no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:gap-4',
          itemClassName,
        )}
      >
        {children}
      </div>
      {showArrows && (
        <>
          <button
            type="button"
            aria-label="قبلی"
            onClick={() => scrollBy(-1)}
            className="absolute -end-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-card transition hover:border-ink-300 hover:text-brand-700 lg:flex"
          >
            <Icon name="chevron-right" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="بعدی"
            onClick={() => scrollBy(1)}
            className="absolute -start-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-card transition hover:border-ink-300 hover:text-brand-700 lg:flex"
          >
            <Icon name="chevron-left" className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
