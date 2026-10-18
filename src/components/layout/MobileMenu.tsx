import { Link } from 'react-router-dom';
import { Drawer } from '@/components/ui/Drawer';
import { Icon } from '@/components/ui/Icon';
import { Logo } from './Logo';
import { NAV_ITEMS } from '@/data/navigation';
import { MORE_SERVICES, OTHER_SERVICES } from '@/data/services';
import { DOMESTIC_DESTINATIONS, INTERNATIONAL_DESTINATIONS } from '@/data/destinations';
import { SUPPORT_CONTACT } from '@/data/content';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useApp();

  return (
    <Drawer open={open} onClose={onClose} side="start" title="منوی سفربان" className="w-[92%] max-w-[380px]">
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3">
          {user ? (
            <>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {user.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink-900">{user.name}</p>
                  <p className="num mt-0.5 text-2xs text-ink-500">{user.phone}</p>
                </div>
              </div>
              <button type="button" onClick={logout} className="text-2xs font-medium text-danger-600">
                خروج
              </button>
            </>
          ) : (
            <>
              <p className="text-2xs text-ink-500">برای رزرو و پیگیری سفرها وارد شوید.</p>
              <Link
                to="/login"
                onClick={onClose}
                className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-2xs font-medium text-white"
              >
                ورود / ثبت‌نام
              </Link>
            </>
          )}
        </div>

        <div>
          <p className="mb-2 text-2xs font-bold text-ink-400">سرویس‌ها</p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink-700 transition hover:bg-ink-50"
                >
                  {item.label}
                  <Icon name="chevron-left" className="h-4 w-4 text-ink-300" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-2xs font-bold text-ink-400">مقصدهای محبوب داخلی</p>
          <div className="flex flex-wrap gap-1.5">
            {DOMESTIC_DESTINATIONS.slice(0, 6).map((destination) => (
              <Link
                key={destination.id}
                to={`/hotels?city=${destination.code}&name=${encodeURIComponent(destination.name)}`}
                onClick={onClose}
                className="rounded-md border border-ink-200 px-2.5 py-1.5 text-2xs text-ink-600"
              >
                {destination.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-2xs font-bold text-ink-400">مقصدهای محبوب خارجی</p>
          <div className="flex flex-wrap gap-1.5">
            {INTERNATIONAL_DESTINATIONS.slice(0, 6).map((destination) => (
              <Link
                key={destination.id}
                to={`/hotels?city=${destination.code}&name=${encodeURIComponent(destination.name)}`}
                onClick={onClose}
                className="rounded-md border border-ink-200 px-2.5 py-1.5 text-2xs text-ink-600"
              >
                {destination.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-2xs font-bold text-ink-400">سایر خدمات</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[...OTHER_SERVICES, ...MORE_SERVICES].map((service) => (
              <Link
                key={service.key}
                to={service.href}
                onClick={onClose}
                className={cn('flex items-center gap-2 rounded-lg border border-ink-200 px-2.5 py-2 text-2xs text-ink-600')}
              >
                <Icon name={service.icon} className="h-4 w-4 text-brand-600" />
                {service.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-ink-50 p-3">
          <p className="text-2xs font-bold text-ink-700">پشتیبانی سفربان</p>
          <a href={`tel:${SUPPORT_CONTACT.phoneRaw}`} className="num mt-1.5 flex items-center gap-2 text-xs text-brand-700">
            <Icon name="phone" className="h-4 w-4" />
            {SUPPORT_CONTACT.phone}
          </a>
          <p className="mt-1 text-2xs leading-5 text-ink-500">{SUPPORT_CONTACT.hours}</p>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 pt-4">
          <Logo compact />
          <span className="num text-2xs text-ink-400">نسخه ۱.۰.۰</span>
        </div>
      </div>
    </Drawer>
  );
}
