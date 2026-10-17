import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface StateBlockProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  tone?: 'neutral' | 'danger';
}

/** حالت‌های خالی/خطا با طراحی یکسان در همه‌ی صفحه‌ها */
export function StateBlock({ icon, title, description, action, className, tone = 'neutral' }: StateBlockProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center',
        tone === 'danger' ? 'border-danger-500/40 bg-danger-50/40' : 'border-ink-300 bg-white',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full',
          tone === 'danger' ? 'bg-danger-50 text-danger-600' : 'bg-brand-50 text-brand-600',
        )}
      >
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function EmptyResults({ onReset, description }: { onReset?: () => void; description?: string }) {
  return (
    <StateBlock
      icon="search"
      title="نتیجه‌ای با این فیلترها پیدا نشد"
      description={
        description ??
        'برای مشاهده‌ی نتایج بیشتر، محدوده‌ی قیمت را بازتر کنید یا برخی فیلترها را حذف کنید.'
      }
      action={
        onReset ? (
          <Button variant="secondary" onClick={onReset} icon={<Icon name="refresh" className="h-4 w-4" />}>
            حذف همه‌ی فیلترها
          </Button>
        ) : undefined
      }
    />
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <StateBlock
      tone="danger"
      icon="alert"
      title="خطا در دریافت اطلاعات"
      description={message ?? 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.'}
      action={
        onRetry ? (
          <Button onClick={onRetry} icon={<Icon name="refresh" className="h-4 w-4" />}>
            تلاش دوباره
          </Button>
        ) : undefined
      }
    />
  );
}
