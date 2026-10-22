import { useState } from 'react';
import Icon from '../components/Icons.jsx';
import { Link, useRouter } from '../router.jsx';
import { useAccount } from './AccountContext.jsx';
import { ConfirmDialog } from './ui.jsx';
import { fa } from '../data/account.js';

const NAV_ITEMS = [
  { key: 'dashboard', to: '/account', label: 'داشبورد', icon: 'home' },
  { key: 'orders', to: '/account/orders', label: 'سفارش‌های من', icon: 'cart' },
  { key: 'reservations', to: '/account/reservations', label: 'رزروهای من', icon: 'calendar' },
  { key: 'favorites', to: '/account/favorites', label: 'علاقه‌مندی‌ها', icon: 'heart' },
  { key: 'addresses', to: '/account/addresses', label: 'آدرس‌ها', icon: 'pin' },
  { key: 'profile', to: '/account/profile', label: 'اطلاعات شخصی', icon: 'user' },
  { key: 'notifications', to: '/account/notifications', label: 'اعلان‌ها', icon: 'bell' },
  { key: 'rewards', to: '/account/rewards', label: 'باشگاه مشتریان', icon: 'gift' },
  { key: 'settings', to: '/account/settings', label: 'تنظیمات', icon: 'gear' },
];

export default function AccountShell({ active, onToast, onLogin, children }) {
  const { user, loyalty, unreadCount, isAuthenticated, signOut } = useAccount();
  const { navigate } = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const progress = Math.min(100, Math.round((loyalty.points / loyalty.nextRewardAt) * 100));

  if (!isAuthenticated) {
    return (
      <div className="account">
        <div className="container">
          <div className="acct-signin">
            <span className="acct-signin__icon">
              <Icon name="user" size={32} />
            </span>
            <h1>برای دیدن حساب کاربری وارد شوید</h1>
            <p>
              سفارش‌ها، رزروها، علاقه‌مندی‌ها و امتیازهای باشگاه مشتریان پس از ورود یا ساخت حساب
              نمایش داده می‌شوند.
            </p>
            <button type="button" className="btn btn--primary" onClick={onLogin}>
              <Icon name="user" size={17} />
              ورود یا ثبت‌نام
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account">
      <div className="container account__grid">
        <aside className="account-sidebar">
          <Link className="account-sidebar__user" to="/account/profile">
            <span className="account-sidebar__avatar">
              <img src={user.avatar} alt={fullName} />
            </span>
            <span className="account-sidebar__id">
              <b>{fullName}</b>
              <small>عضو باشگاه {loyalty.tier}</small>
            </span>
          </Link>

          <nav className="account-nav" aria-label="بخش‌های حساب کاربری">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`account-nav__item ${active === item.key ? 'is-active' : ''}`}
                aria-current={active === item.key ? 'page' : undefined}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.key === 'notifications' && unreadCount > 0 && (
                  <i className="account-nav__badge">{fa(unreadCount)}</i>
                )}
              </Link>
            ))}
            <button
              type="button"
              className="account-nav__item account-nav__item--logout"
              onClick={() => setLogoutOpen(true)}
            >
              <Icon name="logout" size={18} />
              <span>خروج از حساب</span>
            </button>
          </nav>

          <Link className="account-sidebar__loyalty" to="/account/rewards">
            <span className="account-sidebar__loyalty-head">
              <Icon name="star" size={15} filled />
              امتیاز باشگاه
            </span>
            <b>{fa(loyalty.points)}</b>
            <span className="account-sidebar__bar" aria-hidden="true">
              <i style={{ width: `${progress}%` }} />
            </span>
            <small>{fa(Math.max(0, loyalty.nextRewardAt - loyalty.points))} امتیاز تا پاداش بعدی</small>
          </Link>
        </aside>

        <div className="account-main">{children}</div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          signOut();
          onToast('از حساب کاربری خود خارج شدید.');
          navigate('/');
        }}
        title="از حساب خارج می‌شوید؟"
        text="همچنان می‌توانید به منو و رزرو میز دسترسی داشته باشید؛ برای پیگیری سفارش‌ها دوباره وارد شوید."
        confirmLabel="خروج از حساب"
        tone="danger"
      />
    </div>
  );
}
