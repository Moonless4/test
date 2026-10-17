import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

const ITEMS = [
  { label: 'خانه', href: '/', icon: 'home' },
  { label: 'پرواز', href: '/flights', icon: 'plane' },
  { label: 'هتل', href: '/hotels', icon: 'hotel' },
  { label: 'سفرهای من', href: '/account', icon: 'briefcase' },
  { label: 'حساب من', href: '/login', icon: 'user' },
];

/** نوار پایین مخصوص موبایل */
export function BottomNav() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 backdrop-blur lg:hidden">
      <ul className="flex items-stretch">
        {ITEMS.map((item) => (
          <li key={item.href} className="flex-1">
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[0.65rem] transition',
                  isActive ? 'text-brand-700' : 'text-ink-500',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} className={cn('h-5 w-5', isActive && 'text-brand-600')} />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
