import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import MobileMenu from './components/MobileMenu.jsx';
import Footer from './components/Footer.jsx';
import ScrollTop from './components/ScrollTop.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import ReservationModal from './components/ReservationModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import Toast from './components/Toast.jsx';
import HomePage from './pages/HomePage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import BlogPostPage from './pages/BlogPostPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useRouter } from './router.jsx';
import { posts, products } from './data/content.js';

const STORAGE_KEY = 'naval-cart-v1';

const matchRoute = (path) => {
  if (path === '/') return { name: 'home' };
  if (path === '/menu') return { name: 'menu' };
  if (path === '/blog') return { name: 'blog' };
  if (path === '/about') return { name: 'about' };
  if (path === '/contact') return { name: 'contact' };

  const postMatch = path.match(/^\/blog\/([\w-]+)$/);
  if (postMatch) {
    return posts.some((post) => post.id === postMatch[1])
      ? { name: 'post', id: postMatch[1] }
      : { name: 'notfound' };
  }

  const productMatch = path.match(/^\/food\/([\w-]+)$/);
  if (productMatch) {
    return products.some((product) => product.id === productMatch[1])
      ? { name: 'product', id: productMatch[1] }
      : { name: 'notfound' };
  }

  return { name: 'notfound' };
};

const readCart = () => {
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

const findProduct = (value) =>
  typeof value === 'string' ? products.find((product) => product.id === value) : value;

export default function App() {
  const { path, navigate } = useRouter();
  const [cart, setCart] = useState(readCart);
  const [filter, setFilter] = useState('all');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
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
    [cart]
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

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
      const found = findProduct(value);
      if (found) navigate(`/food/${found.id}`);
    },
    [navigate]
  );

  const openPost = useCallback((post) => navigate(`/blog/${post.id}`), [navigate]);

  const goHome = useCallback(() => navigate('/'), [navigate]);
  const goBlog = useCallback(() => navigate('/blog'), [navigate]);
  const openReserve = useCallback(() => setReserveOpen(true), []);

  const route = matchRoute(path);

  const page = (() => {
    switch (route.name) {
      case 'menu':
        return <MenuPage filter={filter} onFilter={setFilter} onAdd={addToCart} onOpen={openProduct} />;
      case 'blog':
        return <BlogPage onOpenPost={openPost} />;
      case 'post':
        return <BlogPostPage id={route.id} onMenu={goMenu} onBlog={goBlog} />;
      case 'product':
        return <ProductPage id={route.id} onAdd={addToCart} onOpen={openProduct} onMenu={goMenu} />;
      case 'about':
        return <AboutPage onMenu={goMenu} onReserve={openReserve} />;
      case 'contact':
        return <ContactPage onToast={showToast} />;
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
    <div className="app">
      <Header
        cartCount={cartCount}
        onSearch={() => setSearchOpen(true)}
        onLogin={() => setAuthOpen(true)}
        onMenu={() => setMobileOpen(true)}
        onCart={() => setCartOpen(true)}
        onCategory={goMenu}
      />

      <main>{page}</main>

      <Footer onToast={showToast} />
      <ScrollTop />

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogin={() => {
          setMobileOpen(false);
          setAuthOpen(true);
        }}
        onCategory={goMenu}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenProduct={openProduct}
        onOpenPost={openPost}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onQty={updateQty}
        onRemove={removeItem}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        onBrowse={() => {
          setCartOpen(false);
          goMenu();
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onComplete={() => {
          setCart([]);
          showToast('سفارش شما با موفقیت ثبت شد.');
        }}
      />

      <ReservationModal open={reserveOpen} onClose={() => setReserveOpen(false)} />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onToast={showToast} />

      <Toast message={toast} />
    </div>
  );
}
