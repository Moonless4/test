import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import type { ServiceItem } from '@/types';

interface ServiceCardProps {
  service: ServiceItem;
  className?: string;
  compact?: boolean;
  /** با کلیک، به‌جای رفتن به صفحه‌ی خدمت، فهرست باز/بسته می‌شود */
  onClick?: () => void;
  expanded?: boolean;
}

/** کارت خدمت — آیکون، عنوان، توضیح کوتاه */
export function ServiceCard({ service, className, compact, onClick, expanded }: ServiceCardProps) {
  const classes = cn(
    'group relative flex w-full flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 text-start transition hover:border-brand-300 hover:shadow-card',
    compact && 'gap-2 p-3',
    onClick && expanded && 'border-brand-300 shadow-card',
    className,
  );

  const body = (
    <>
      {service.badge && (
        <span className="absolute end-3 top-3 rounded-md bg-accent-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-accent-700">
          {service.badge}
        </span>
      )}
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white',
          onClick && expanded && 'bg-brand-600 text-white',
        )}
      >
        <Icon name={service.icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[0.8rem] font-bold text-ink-900">{service.title}</p>
        <p className="mt-1 text-2xs leading-5 text-ink-500">{service.description}</p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-expanded={expanded} className={classes}>
        {body}
        <span className="mt-auto flex items-center gap-1 text-2xs font-medium text-brand-700">
          {expanded ? 'بستن فهرست' : 'مشاهده فهرست'}
          <Icon name="chevron-down" className={cn('h-3.5 w-3.5 transition', expanded && 'rotate-180')} />
        </span>
      </button>
    );
  }

  return (
    <Link to={service.href} className={classes}>
      {body}
      <span className="mt-auto flex items-center gap-1 text-2xs font-medium text-brand-700 opacity-0 transition group-hover:opacity-100">
        مشاهده و رزرو
        <Icon name="chevron-left" className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
