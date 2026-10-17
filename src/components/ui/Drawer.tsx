import { useEffect, type ReactNode } from 'react';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'start' | 'end' | 'bottom';
  className?: string;
}

/** کشوی کنار/پایین — برای منوی موبایل و فیلترهای نتایج */
export function Drawer({ open, onClose, title, children, footer, side = 'end', className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="بستن"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink-900/40"
      />
      <div
        className={cn(
          'relative z-10 flex flex-col bg-white shadow-pop',
          side === 'bottom'
            ? 'mt-auto max-h-[88vh] w-full animate-slide-up rounded-t-2xl'
            : cn(
                'h-full w-[88%] max-w-[360px] animate-fade-in',
                side === 'end' ? 'ms-auto' : 'me-auto',
              ),
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3.5">
          <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="border-t border-ink-200 p-4 pb-safe">{footer}</div>}
      </div>
    </div>
  );
}
