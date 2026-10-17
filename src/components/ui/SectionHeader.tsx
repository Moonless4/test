import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-4 sm:mb-5', className)}>
      <div>
        <h2 className="text-lg font-bold text-ink-900 sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-ink-500 sm:text-sm">{subtitle}</p>}
      </div>
      {action}
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-700 transition hover:text-brand-800 sm:text-sm"
        >
          {actionLabel}
          <Icon name="chevron-left" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
