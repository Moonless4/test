import { Icon } from '@/components/ui/Icon';
import { SERVICE_TABS } from '@/data/services';
import { cn } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';

interface ServiceTabsProps {
  active: string;
  onChange: (key: string) => void;
  className?: string;
  /** نمایش شمارنده‌ی تخفیف روی تب‌های خاص */
  badges?: Record<string, number>;
}

/**
 * تب‌های سرویس جستجو — روی موبایل به‌صورت ردیف افقی قابل اسکرول.
 */
export function ServiceTabs({ active, onChange, className, badges }: ServiceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="انتخاب سرویس"
      className={cn(
        'no-scrollbar flex items-stretch gap-1 overflow-x-auto border-b border-ink-200 px-1.5 sm:gap-1.5 sm:px-3',
        className,
      )}
    >
      {SERVICE_TABS.map((tab) => {
        const isActive = tab.key === active;
        const badge = badges?.[tab.key];
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-3 text-xs font-medium transition sm:gap-2 sm:px-3 sm:text-sm',
              isActive ? 'text-brand-700' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            <Icon name={tab.icon} className={cn('h-5 w-5', isActive ? 'text-brand-600' : 'text-ink-400')} />
            {tab.title}
            {badge !== undefined && (
              <span className="num rounded-md bg-accent-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-accent-700">
                {faDigits(badge)}٪
              </span>
            )}
            <span
              className={cn(
                'absolute inset-x-1 -bottom-px h-0.5 rounded-t-full transition',
                isActive ? 'bg-brand-600' : 'bg-transparent',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
