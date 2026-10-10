import { useEffect, useState, type ComponentType } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BadgePercent,
  FolderTree,
  HelpCircle,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Settings,
  FileText,
  X,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** The permission the API checks for this surface; the item is hidden without it. */
  permission?: string;
  end?: boolean;
};

const NAV: Array<{ group: string; items: NavItem[] }> = [
  {
    group: 'نمای کلی',
    items: [{ to: '/admin', label: 'داشبورد', icon: LayoutDashboard, end: true }],
  },
  {
    group: 'کاتالوگ',
    items: [
      { to: '/admin/products', label: 'محصولات', icon: Package, permission: 'products.view' },
      {
        to: '/admin/categories',
        label: 'دسته‌بندی‌ها',
        icon: FolderTree,
        permission: 'categories.manage',
      },
    ],
  },
  {
    group: 'فروش',
    items: [
      { to: '/admin/orders', label: 'سفارش‌ها', icon: ReceiptText, permission: 'orders.view' },
      {
        to: '/admin/coupons',
        label: 'کدهای تخفیف',
        icon: BadgePercent,
        permission: 'coupons.manage',
      },
    ],
  },
  {
    group: 'محتوا',
    items: [
      { to: '/admin/content', label: 'برگه‌ها و نوشته‌ها', icon: FileText, permission: 'content.manage' },
      { to: '/admin/faqs', label: 'سوالات متداول', icon: HelpCircle, permission: 'content.manage' },
      { to: '/admin/media', label: 'کتابخانهٔ رسانه', icon: Images, permission: 'media.manage' },
      { to: '/admin/settings', label: 'تنظیمات', icon: Settings, permission: 'settings.manage' },
    ],
  },
];

export default function AdminLayout() {
  const { user, can, signOut } = useAdminAuth();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // A navigation on a phone must close the drawer, or the page arrives behind it.
  useEffect(() => setNavOpen(false), [location.pathname]);

  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((group) => group.items.length > 0);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors',
      isActive ? 'bg-white/15 font-medium text-white' : 'text-teal-100/80 hover:bg-white/10 hover:text-white',
    ].join(' ');

  const sidebar = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 px-5">
        <img src="/medora-logo-white.webp" alt="مدورا" className="h-7 w-auto" />
        <span className="text-[11.5px] text-teal-100/70">پنل مدیریت</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.group} className="mb-4">
            <p className="mb-1.5 px-3 text-[11px] text-teal-100/50">{group.group}</p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={linkClass}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="mb-2 px-2">
          <p className="truncate text-[12.5px] font-medium text-white">{user?.name}</p>
          <p className="truncate text-[11px] text-teal-100/60">{user?.email}</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-teal-100/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          مشاهدهٔ فروشگاه
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-teal-100/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream/50">
      {/* In RTL `start` is the right edge, so the sidebar and the content padding both follow the
          document direction instead of hardcoding left/right. */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col bg-teal-900 lg:flex">
        {sidebar}
      </aside>

      {navOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            className="absolute inset-0 bg-teal-950/50 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 flex w-72 max-w-[80%] flex-col bg-teal-900 shadow-lift">
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="بستن منو"
              className="absolute end-3 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-teal-100/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:ps-64">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="منو"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-cream lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <img src="/medora-mark.webp" alt="" className="h-8 w-8 lg:hidden" />
            <span className="hidden text-[13.5px] font-medium text-cocoa sm:block">
              پنل مدیریت فروشگاه
            </span>
            <span className="ms-auto text-[12.5px] text-muted">{user?.name}</span>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
