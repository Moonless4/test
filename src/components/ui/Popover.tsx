import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** لبه‌ی چسبیدن پنل: ابتدای فیلد (راست در RTL) یا انتهای آن */
  align?: 'start' | 'end';
  panelClassName?: string;
  /** روی موبایل پنل به شکل صفحه‌ی پایین‌کش نمایش داده می‌شود */
  sheetOnMobile?: boolean;
}

/**
 * پنل شناور مشترک همه‌ی فیلدهای جستجو (تاریخ، مسافر، شهر و …).
 * با کلیک بیرون یا کلید Escape بسته می‌شود.
 */
export function Popover({
  open,
  onClose,
  children,
  className,
  align = 'start',
  panelClassName,
  sheetOnMobile = true,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {children}
      {open && (
        <div
          role="dialog"
          className={cn(
            'absolute top-[calc(100%+6px)] z-50 animate-pop-in rounded-xl border border-ink-200 bg-white shadow-pop',
            align === 'start' ? 'start-0' : 'end-0',
            sheetOnMobile && 'max-sm:fixed max-sm:inset-x-3 max-sm:bottom-3 max-sm:top-auto max-sm:max-h-[82vh] max-sm:overflow-y-auto',
            panelClassName ?? 'w-[320px] p-4',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
