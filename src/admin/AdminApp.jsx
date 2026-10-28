import { useEffect, useState } from 'react';
import { useSite } from '../site/SiteContent.jsx';
import { useRouter } from '../router.jsx';
import Icon from '../components/Icons.jsx';
import { isAdminSignedIn, signOutAdmin, touchSession } from './auth.js';
import AdminLogin from './AdminLogin.jsx';
import DashboardPanel from './panels/DashboardPanel.jsx';
import OrdersPanel from './panels/OrdersPanel.jsx';
import NewsletterPanel from './panels/NewsletterPanel.jsx';
import DiscountsPanel from './panels/DiscountsPanel.jsx';
import ProductsPanel from './panels/ProductsPanel.jsx';
import CategoriesPanel from './panels/CategoriesPanel.jsx';
import MenuPanel from './panels/MenuPanel.jsx';
import MegaMenuPanel from './panels/MegaMenuPanel.jsx';
import HeroPanel from './panels/HeroPanel.jsx';
import BannersPanel from './panels/BannersPanel.jsx';
import BlogPanel from './panels/BlogPanel.jsx';
import FooterPanel from './panels/FooterPanel.jsx';
import PagesPanel from './panels/PagesPanel.jsx';
import IdentityPanel from './panels/IdentityPanel.jsx';
import SettingsPanel from './panels/SettingsPanel.jsx';

const SECTIONS = [
  { id: 'dashboard', label: 'داشبورد', icon: 'home' },
  { id: 'orders', label: 'سفارش‌ها', icon: 'cart' },
  { id: 'products', label: 'غذاها', icon: 'fork' },
  { id: 'categories', label: 'دسته‌بندی‌ها', icon: 'box' },
  { id: 'menu', label: 'منو', icon: 'chef' },
  { id: 'mega', label: 'مگامنوی هدر', icon: 'menu' },
  { id: 'hero', label: 'اسلاید هیرو', icon: 'play' },
  { id: 'banners', label: 'بنرها', icon: 'sparkle' },
  { id: 'blog', label: 'وبلاگ', icon: 'edit' },
  { id: 'footer', label: 'فوتر', icon: 'quote' },
  { id: 'pages', label: 'صفحات', icon: 'calendar' },
  { id: 'discounts', label: 'کدهای تخفیف', icon: 'gift' },
  { id: 'newsletter', label: 'خبرنامه', icon: 'mail' },
  { id: 'identity', label: 'هویت سایت', icon: 'star' },
  { id: 'settings', label: 'تنظیمات', icon: 'gear' },
];

const PANELS = {
  dashboard: DashboardPanel,
  orders: OrdersPanel,
  discounts: DiscountsPanel,
  newsletter: NewsletterPanel,
  products: ProductsPanel,
  categories: CategoriesPanel,
  menu: MenuPanel,
  mega: MegaMenuPanel,
  hero: HeroPanel,
  banners: BannersPanel,
  blog: BlogPanel,
  footer: FooterPanel,
  pages: PagesPanel,
  identity: IdentityPanel,
  settings: SettingsPanel,
};

export default function AdminApp({ section }) {
  const { content } = useSite();
  const { navigate } = useRouter();
  const [signedIn, setSignedIn] = useState(isAdminSignedIn);

  // An expired session locks the panel again on the next panel navigation.
  useEffect(() => {
    if (isAdminSignedIn()) touchSession();
    else setSignedIn(false);
  }, [section]);

  if (!signedIn) {
    return (
      <AdminLogin siteName={content.identity.siteName} onSuccess={() => setSignedIn(true)} />
    );
  }

  const active = PANELS[section] ? section : 'dashboard';
  const Panel = PANELS[active];
  const current = SECTIONS.find((item) => item.id === active);

  const signOut = () => {
    signOutAdmin();
    setSignedIn(false);
    navigate('/admin');
  };

  return (
    <div className="admin" dir="rtl">
      <aside className="admin__side">
        <div className="admin__brand">
          <span className="admin__brand-mark">{content.identity.siteName.slice(0, 1)}</span>
          <span>
            <b>{content.identity.siteName}</b>
            <small>پنل مدیریت</small>
          </span>
        </div>

        <nav className="admin__nav" aria-label="بخش‌های پنل مدیریت">
          {SECTIONS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`admin__nav-item${item.id === active ? ' is-active' : ''}`}
              onClick={() => navigate(`/admin/${item.id}`)}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin__side-footer">
          <button type="button" className="admin__side-link" onClick={() => navigate('/')}>
            <Icon name="home" size={17} />
            مشاهده سایت
          </button>
          <button type="button" className="admin__side-link" onClick={signOut}>
            <Icon name="logout" size={17} />
            خروج از پنل
          </button>
        </div>
      </aside>

      <div className="admin__main">
        <header className="admin__topbar">
          <div>
            <small>پنل مدیریت</small>
            <h1>{current.label}</h1>
          </div>
          <a className="adm-btn adm-btn--ghost" href="/" target="_blank" rel="noreferrer">
            <Icon name="search" size={16} />
            دیدن سایت
          </a>
        </header>

        <div className="admin__content">
          <Panel onGo={(id) => navigate(`/admin/${id}`)} />
        </div>
      </div>
    </div>
  );
}
