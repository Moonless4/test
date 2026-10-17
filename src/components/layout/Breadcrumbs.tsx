import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';

interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string }>;
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-1.5 text-2xs text-ink-500">
      <Link to="/" className="flex items-center gap-1 transition hover:text-brand-700">
        <Icon name="home" className="h-3.5 w-3.5" />
        خانه
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <Icon name="chevron-left" className="h-3 w-3 text-ink-300" />
          {item.href ? (
            <Link to={item.href} className="transition hover:text-brand-700">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
