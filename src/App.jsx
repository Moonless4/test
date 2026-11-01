import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import MobileMenu from './components/MobileMenu.jsx';
import Footer from './components/Footer.jsx';
import ScrollTop from './components/ScrollTop.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import ReservationModal from './components/ReservationModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import Toast from './components/Toast.jsx';
import HomePage from './pages/HomePage.jsx';
import { AccountProvider } from './account/AccountContext.jsx';

/* Only the home page is needed for the first paint; every other route (and the
   account/admin areas with their large stylesheets) is split into its own chunk
   and fetched when that route is opened. */
const MenuPage = lazy(() => import('./pages/MenuPage.jsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const InfoPage = lazy(() => import('./pages/InfoPage.jsx'));
const AccountShell = lazy(() => import('./account/AccountShell.jsx'));
const AccountDashboard = lazy(() => import('./account/pages/Dashboard.jsx'));
const AccountOrders = lazy(() => import('./account/pages/OrdersPage.jsx'));
const AccountOrderDetail = lazy(() => import('./account/pages/OrderDetailPage.jsx'));
const AccountReservations = lazy(() => import('./account/pages/ReservationsPage.jsx'));
const AccountReservationDetail = lazy(() => import('./account/pages/ReservationDetailPage.jsx'));
const AccountFavorites = lazy(() => import('./account/pages/FavoritesPage.jsx'));
const AccountComments = lazy(() => import('./account/pages/CommentsPage.jsx'));
const AccountAddresses = lazy(() => import('./account/pages/AddressesPage.jsx'));
const AccountProfile = lazy(() => import('./account/pages/ProfilePage.jsx'));
const AccountNotifications = lazy(() => import('./account/pages/NotificationsPage.jsx'));
const AccountRewards = lazy(() => import('./account/pages/RewardsPage.jsx'));
const AccountSettings = lazy(() => import('./account/pages/SettingsPage.jsx'));
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));
import { adminPathOf } from './lib/adminPath.js';
import { useSite } from './site/SiteContent.jsx';
import { useRouter } from './router.jsx';
import useDragScroll from './hooks/useDragScroll.js';

const STORAGE_KEY = 'naval-cart-v1';

const matchRoute = (path, site) => {
  if (path === '/') return { name: 'home' };
  if (path === '/menu') return { name: 'menu' };
  if (path === '/blog') return { name: 'blog' };
  if (path === '/about') return { name: 'about' };
  if (path === '/contact') return { name: 'contact' };
  if (path === '/cart') return { name: 'cart' };

  const adminPath = adminPathOf(site);
  if (path === adminPath || path.startsWith(`${adminPath}/`)) {
    const section = path.slice(adminPath.length).split('/').filter(Boolean)[0] || 'dashboard';
    return { name: 'admin', section, adminPath };
  }

  const pageMatch = path.match(/^\/p\/([\w-]+)$/);
  if (pageMatch) {
    return site.pages?.[pageMatch[1]]
      ? { name: 'page', slug: pageMatch[1] }
      : { name: 'notfound' };
  }

  const postMatch = path.match(/^\/blog\/([\w-]+)$/);
  if (postMatch) {
    return site.posts.some((post) => post.id === postMatch[1])
      ? { name: 'post', id: postMatch[1] }
      : { name: 'notfound' };
  }

  if (path === '/account') return { name: 'account', section: 'dashboard' };

  const accountMatch = path.match(
    /^\/account\/(orders|reservations|favorites|comments|addresses|profile|notifications|rewards|settings)(?:\/([\w-]+))?$/
  );
  if (accountMatch) {
    return { name: 'account', section: accountMatch[1], id: accountMatch[2] };
  }

  const productMatch = path.match(/^\/food\/([\w-]+)$/);
  if (productMatch) {
    return site.products.some((product) => product.id === productMatch[1])
      ? { name: 'product', id: productMatch[1] }
      : { name: 'notfound' };
  }

  return { name: 'notfound' };
};

const readCart = (products) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => products.some((product) => product.id === item.id) && item.qty > 0);
  } catch {
    return [];
  }
};

export default function App() {
  const { path, navigate } = useRouter();
  const { content: site } = useSite();
  const products = site.products;
  useDragScroll();
  const [cart, setCart] = useState(() => readCart(site.products));
  const [filter, setFilter] = useState('all');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authNext, setAuthNext] = useState('/account');
  const [authMandatory, setAuthMandatory] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* storage can be unavailable in private mode */
    }
  }, [cart]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3600);
  }, []);

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => ({ product: products.find((entry) => entry.id === item.id), qty: item.qty }))
        .filter((item) => item.product),
    [cart, products]
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartIds = useMemo(() => cart.map((item) => item.id), [cart]);

  const addToCart = useCallback(
    (item, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find((entry) => entry.id === item.id);
        if (existing) {
          return prev.map((entry) =>
            entry.id === item.id ? { ...entry, qty: entry.qty + qty } : entry
          );
        }
        return [...prev, { id: item.id, qty }];
      });
      showToast(`${item.name} به سبد خرید اضافه شد.`);
    },
    [showToast]
  );

  const updateQty = useCallback((id, qty) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((item) => item.id !== id) : prev.map((entry) => (entry.id === id ? { ...entry, qty } : entry))
    );
  }, []);

  const removeItem = useCallback(
    (id) => {
      setCart((prev) => prev.filter((item) => item.id !== id));
      showToast('محصول از سبد خرید حذف شد.');
    },
    [showToast]
  );

  const goMenu = useCallback(
    (categoryId) => {
      setFilter(categoryId || 'all');
      navigate('/menu');
    },
    [navigate]
  );

  const openProduct = useCallback(
    (value) => {
      const found =
        typeof value === 'string' ? products.find((product) => product.id === value) : value;
      if (found) navigate(`/food/${found.id}`);
    },
    [navigate, products]
  );

  const reorder = useCallback(
    (order) => {
      const available = (order.items || []).filter((item) =>
        products.some((product) => product.id === item.productId)
      );
      if (!available.length) {
        showToast('آیتم‌های این سفارش در منوی فعلی موجود نیستند.');
        return;
      }
      setCart((prev) => {
        const next = prev.map((entry) => ({ ...entry }));
        available.forEach(({ productId, qty }) => {
          const found = next.find((entry) => entry.id === productId);
          if (found) found.qty += qty;
          else next.push({ id: productId, qty });
        });
        return next;
      });
      showToast('آیتم‌های سفارش قبلی به سبد خرید اضافه شد.');
      navigate('/cart');
    },
    [showToast, products, navigate]
  );

  const openPost = useCallback((post) => navigate(`/blog/${post.id}`), [navigate]);

  const goHome = useCallback(() => navigate('/'), [navigate]);
  const goBlog = useCallback(() => navigate('/blog'), [navigate]);
  const openReserve = useCallback(() => setReserveOpen(true), []);

  const openAuth = useCallback((mode = 'login', next = '/account') => {
    setAuthMode(mode);
    setAuthNext(next);
    setAuthMandatory(false);
    setAuthOpen(true);
  }, []);

  /* Checkout needs an account, so this window can't be dismissed by the visitor */
  const openAuthGate = useCallback(() => {
    setAuthMode('register');
    setAuthNext('/cart');
    setAuthMandatory(true);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setAuthMandatory(false);
  }, []);

  const route = matchRoute(path, site);

  useEffect(() => {
    const title =
      route.name === 'admin'
        ? `${site.identity.siteName} | پنل مدیریت`
        : `${site.identity.siteName} | ${site.identity.prefix}`;
    document.title = title;
  }, [route.name, site.identity.siteName, site.identity.prefix]);

  if (route.name === 'admin') {
    return (
      <Suspense fallback={null}>
        <AdminApp section={route.section} adminPath={route.adminPath} />
      </Suspense>
    );
  }

  const page = (() => {
    switch (route.name) {
      case 'page':
        return <InfoPage slug={route.slug} onMenu={goMenu} />;
      case 'menu':
        return <MenuPage filter={filter} onFilter={setFilter} onAdd={addToCart} onOpen={openProduct} />;
      case 'blog':
        return <BlogPage onOpenPost={openPost} />;
      case 'post':
        return (
          <BlogPostPage id={route.id} onMenu={goMenu} onBlog={goBlog} onOpenPost={openPost} />
        );
      case 'product':
        return (
          <ProductPage
            id={route.id}
            onAdd={addToCart}
            onOpen={openProduct}
            onMenu={goMenu}
            cartIds={cartIds}
            onToast={showToast}
          />
        );
      case 'about':
        return <AboutPage onMenu={goMenu} onReserve={openReserve} />;
      case 'contact':
        return <ContactPage onToast={showToast} />;
      case 'cart':
        return (
          <CartPage
            onRequireAccount={openAuthGate}
            items={cartItems}
            onQty={updateQty}
            onRemove={removeItem}
            onAdd={addToCart}
            onComplete={() => {
              setCart([]);
              showToast('سفارش شما با موفقیت ثبت شد.');
            }}
          />
        );
      case 'account': {
        const sectionPages = {
          dashboard: (
            <AccountDashboard onMenu={goMenu} onReserve={openReserve} onReorder={reorder} />
          ),
          orders: route.id ? (
            <AccountOrderDetail
              id={route.id}
              onReorder={reorder}
              onToast={showToast}
              onMenu={goMenu}
            />
          ) : (
            <AccountOrders onReorder={reorder} onMenu={goMenu} />
          ),
          reservations: route.id ? (
            <AccountReservationDetail id={route.id} onToast={showToast} onReserve={openReserve} />
          ) : (
            <AccountReservations onToast={showToast} onReserve={openReserve} />
          ),
          favorites: <AccountFavorites onAdd={addToCart} onMenu={goMenu} onToast={showToast} />,
          comments: <AccountComments onToast={showToast} />,
          addresses: <AccountAddresses onToast={showToast} />,
          profile: <AccountProfile onToast={showToast} />,
          notifications: <AccountNotifications onToast={showToast} />,
          rewards: <AccountRewards onToast={showToast} />,
          settings: <AccountSettings onToast={showToast} />,
        };

        return (
          <AccountShell
            active={route.section}
            onToast={showToast}
            onLogin={() => openAuth()}
          >
            {sectionPages[route.section] || <AccountDashboard onMenu={goMenu} onReserve={openReserve} onReorder={reorder} />}
          </AccountShell>
        );
      }
      case 'home':
        return (
          <HomePage
            onAdd={addToCart}
            onProduct={openProduct}
            onPost={openPost}
            onReserve={openReserve}
            onCategory={goMenu}
            onMenu={goMenu}
            onBlog={goBlog}
          />
        );
      default:
        return <NotFoundPage />;
    }
  })();

  return (
    <AccountProvider>
      <div className="app">
      <Header
        cartCount={cartCount}
        cartItems={cartItems}
        onSearch={() => setSearchOpen(true)}
        onLogin={() => openAuth()}
        onRequireAccount={openAuthGate}
        onMenu={() => setMobileOpen(true)}
        onCart={() => navigate('/cart')}
        onCategory={goMenu}
      />

      <main>
        <Suspense fallback={null}>{page}</Suspense>
      </main>

      <Footer onToast={showToast} onReserve={openReserve} />
      <ScrollTop />

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogin={() => {
          setMobileOpen(false);
          openAuth();
        }}
        onCategory={goMenu}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenProduct={openProduct}
        onOpenPost={openPost}
      />

      <ReservationModal open={reserveOpen} onClose={() => setReserveOpen(false)} />

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        mandatory={authMandatory}
        onClose={closeAuth}
        onToast={showToast}
        onSuccess={() => navigate(authNext)}
      />

      <Toast message={toast} />
      </div>
    </AccountProvider>
  );
}
