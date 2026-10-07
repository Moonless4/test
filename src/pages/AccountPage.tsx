import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatPrice, toFa } from '../lib/format';
import EmptyState from '../components/ui/EmptyState';

type TabId = 'dashboard' | 'orders' | 'addresses' | 'profile';

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: 'dashboard', label: 'پیشخوان', icon: LayoutDashboard },
  { id: 'orders', label: 'سفارش‌های من', icon: Package },
  { id: 'addresses', label: 'آدرس‌ها', icon: MapPin },
  { id: 'profile', label: 'اطلاعات حساب', icon: User },
];

const field =
  'h-12 w-full rounded-xl border border-line bg-white px-4 text-[13px] text-ink outline-none transition-colors focus:border-teal-400';

const EMPTY_ADDRESS = {
  title: 'خانه',
  receiver: '',
  mobile: '',
  city: '',
  line: '',
  postalCode: '',
};

/** Signed-in area: overview, orders, addresses and profile. */
export default function AccountPage() {
  const { user, orders, addresses, logout, updateProfile, addAddress, removeAddress } = useAuth();
  const { wishlist } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [draft, setDraft] = useState(EMPTY_ADDRESS);
  const [addressError, setAddressError] = useState('');
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    mobile: user?.mobile ?? '',
  });
  const [saved, setSaved] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const stats = [
    { label: 'سفارش', value: toFa(orders.length), icon: Package },
    { label: 'آدرس', value: toFa(addresses.length), icon: MapPin },
    { label: 'علاقه‌مندی', value: toFa(wishlist.length), icon: Heart },
  ];

  const submitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.receiver.trim().length < 3) return setAddressError('نام گیرنده را وارد کنید.');
    if (!/^09\d{9}$/.test(draft.mobile.trim()))
      return setAddressError('شماره موبایل را به شکل ۰۹xxxxxxxxx وارد کنید.');
    if (!draft.city.trim()) return setAddressError('شهر را وارد کنید.');
    if (draft.line.trim().length < 10) return setAddressError('نشانی کامل را وارد کنید.');
    if (!/^\d{10}$/.test(draft.postalCode.trim()))
      return setAddressError('کد پستی باید ۱۰ رقم باشد.');

    addAddress({ ...draft, title: draft.title.trim() || 'آدرس' });
    setDraft(EMPTY_ADDRESS);
    setAddressError('');
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="container py-8 sm:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <span>/</span>
        <span className="font-medium text-ink">حساب کاربری</span>
      </nav>

      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">سلام، {user.name}</h1>
          <p className="mt-2 text-[13px] text-muted">
            سفارش‌ها، آدرس‌ها و اطلاعات حساب خود را از این‌جا مدیریت کنید.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/', { replace: true });
          }}
          className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-ink transition-colors hover:border-sale hover:text-sale"
        >
          <LogOut className="h-4 w-4" />
          خروج از حساب
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
        <nav aria-label="بخش‌های حساب" className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-4 text-[13px] font-medium transition-colors ${
                tab === id
                  ? 'bg-teal-800 text-white'
                  : 'bg-white text-ink ring-1 ring-line hover:bg-cream lg:ring-0'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === 'dashboard' ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-panel border border-line bg-white p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-black">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <p className="mt-4 text-[13px] text-muted">{label}</p>
                    <p className="text-lg font-black text-ink">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-panel border border-line bg-white p-5 sm:p-6">
                <h2 className="text-base font-bold text-ink">دسترسی سریع</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/wishlist"
                    className="flex h-11 items-center gap-2 rounded-xl bg-cream px-4 text-[13px] font-medium text-black transition-colors hover:bg-teal-50"
                  >
                    <Heart className="h-4 w-4" />
                    علاقه‌مندی‌ها
                  </Link>
                  <Link
                    to="/shop"
                    className="flex h-11 items-center gap-2 rounded-xl bg-cream px-4 text-[13px] font-medium text-black transition-colors hover:bg-teal-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    ادامه خرید
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'orders' ? (
            orders.length === 0 ? (
              <EmptyState
                icon={<Package className="h-7 w-7" />}
                title="هنوز سفارشی ثبت نشده است"
                text="پس از تکمیل خرید، سفارش‌های شما در این بخش نمایش داده می‌شود."
                action={
                  <Link
                    to="/shop"
                    className="inline-flex h-11 items-center rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                  >
                    شروع خرید
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-4">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-panel border border-line bg-white p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-bold text-ink">سفارش {order.id}</p>
                        <p className="mt-1 text-[12px] text-muted">{order.date}</p>
                      </div>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-[12px] font-medium text-black">
                        {order.status}
                      </span>
                    </div>
                    <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-[12.5px] text-muted">
                      {order.lines.map((line) => (
                        <li key={line.name} className="flex items-center justify-between gap-3">
                          <span>{line.name}</span>
                          <span>
                            {toFa(line.qty)} × {formatPrice(line.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 border-t border-line pt-4 text-[13px] font-bold text-ink">
                      مبلغ کل: {formatPrice(order.total)}
                    </p>
                  </li>
                ))}
              </ul>
            )
          ) : null}

          {tab === 'addresses' ? (
            <div className="space-y-6">
              {addresses.length > 0 ? (
                <ul className="space-y-3">
                  {addresses.map((address) => (
                    <li
                      key={address.id}
                      className="flex items-start justify-between gap-4 rounded-panel border border-line bg-white p-5"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-ink">
                          {address.title} — {address.receiver}
                        </p>
                        <p className="mt-1.5 text-[12.5px] leading-6 text-muted">
                          {address.city}، {address.line}
                        </p>
                        <p className="mt-1 text-[12px] text-muted">
                          کد پستی {toFa(address.postalCode)} — {toFa(address.mobile)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAddress(address.id)}
                        aria-label="حذف آدرس"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-sale/10 hover:text-sale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-panel border border-line bg-cream p-5 text-[13px] text-muted">
                  هنوز آدرسی ثبت نکرده‌اید. اولین آدرس را از فرم زیر اضافه کنید.
                </p>
              )}

              <form
                onSubmit={submitAddress}
                className="rounded-panel border border-line bg-white p-5 sm:p-6"
                noValidate
              >
                <h2 className="text-base font-bold text-ink">افزودن آدرس جدید</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="عنوان آدرس (خانه، محل کار)"
                    aria-label="عنوان آدرس"
                    className={field}
                  />
                  <input
                    value={draft.receiver}
                    onChange={(e) => setDraft({ ...draft, receiver: e.target.value })}
                    placeholder="نام گیرنده"
                    aria-label="نام گیرنده"
                    className={field}
                  />
                  <input
                    dir="ltr"
                    value={draft.mobile}
                    onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
                    placeholder="09xxxxxxxxx"
                    aria-label="شماره موبایل"
                    className={field}
                  />
                  <input
                    value={draft.city}
                    onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                    placeholder="شهر"
                    aria-label="شهر"
                    className={field}
                  />
                  <input
                    value={draft.line}
                    onChange={(e) => setDraft({ ...draft, line: e.target.value })}
                    placeholder="نشانی کامل"
                    aria-label="نشانی"
                    className={`${field} sm:col-span-2`}
                  />
                  <input
                    dir="ltr"
                    value={draft.postalCode}
                    onChange={(e) => setDraft({ ...draft, postalCode: e.target.value })}
                    placeholder="کد پستی ۱۰ رقمی"
                    aria-label="کد پستی"
                    className={field}
                  />
                </div>

                {addressError ? (
                  <p role="alert" className="mt-4 rounded-xl bg-sale/10 px-4 py-3 text-[12.5px] text-sale">
                    {addressError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="mt-5 flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4" />
                  افزودن آدرس
                </button>
              </form>
            </div>
          ) : null}

          {tab === 'profile' ? (
            <form
              onSubmit={saveProfile}
              className="rounded-panel border border-line bg-white p-5 sm:p-6"
              noValidate
            >
              <h2 className="text-base font-bold text-ink">اطلاعات حساب</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="acc-name" className="mb-1.5 block text-[13px] font-medium text-ink">
                    نام و نام خانوادگی
                  </label>
                  <input
                    id="acc-name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="acc-email" className="mb-1.5 block text-[13px] font-medium text-ink">
                    ایمیل
                  </label>
                  <input
                    id="acc-email"
                    type="email"
                    dir="ltr"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="acc-mobile" className="mb-1.5 block text-[13px] font-medium text-ink">
                    شماره موبایل
                  </label>
                  <input
                    id="acc-mobile"
                    dir="ltr"
                    value={profile.mobile}
                    onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                    className={field}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-teal-800 px-6 text-sm font-bold text-white transition-colors hover:bg-teal-700"
                >
                  ذخیره تغییرات
                </button>
                {saved ? <span className="text-[12.5px] text-teal-800">تغییرات ذخیره شد.</span> : null}
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
