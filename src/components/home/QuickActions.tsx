import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface QuickAction {
  key: string;
  title: string;
  hint: string;
  href: string;
  icon: string;
  featured?: boolean;
}

/** دسترسی سریع به خدمات جانبی — چهار کارت کوتاه زیر پنل جستجو */
const QUICK_ACTIONS: QuickAction[] = [
  {
    key: 'track',
    title: 'پیگیری خرید',
    hint: 'وضعیت بلیط و رزرو',
    href: '/account',
    icon: 'ticket',
  },
  {
    key: 'visa',
    title: 'ویزا',
    hint: 'مشاوره و تشکیل پرونده',
    href: '/services/visa',
    icon: 'passport',
  },
  {
    key: 'gift-card',
    title: 'کارت هدیه سفر',
    hint: 'خرید و شارژ اعتبار',
    href: '/club',
    icon: 'gift',
  },
  {
    key: 'transfer',
    title: 'ترانسفر فرودگاهی',
    hint: 'سرویس اختصاصی درب فرودگاه',
    href: '/services/transfer',
    icon: 'car',
    featured: true,
  },
];

export function QuickActions() {
  return (
    <section aria-label="دسترسی سریع" className="container-page pt-5 sm:pt-6">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.key}
            to={action.href}
            className={cn(
              'group flex items-center gap-2.5 rounded-xl border p-3 transition sm:gap-3 sm:p-3.5',
              action.featured
                ? 'border-brand-800 bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-card'
                : 'border-ink-200 bg-white hover:border-brand-300 hover:shadow-card',
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition',
                action.featured
                  ? 'bg-white/15 text-white'
                  : 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white',
              )}
            >
              <Icon name={action.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  'block truncate text-xs font-bold',
                  action.featured ? 'text-white' : 'text-ink-900',
                )}
              >
                {action.title}
              </span>
              <span
                className={cn(
                  'mt-0.5 block truncate text-[0.62rem]',
                  action.featured ? 'text-white/75' : 'text-ink-500',
                )}
              >
                {action.hint}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
