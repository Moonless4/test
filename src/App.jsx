import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import MobileMenu from './components/MobileMenu.jsx';
import Hero from './components/Hero.jsx';
import Categories from './components/Categories.jsx';
import FeaturedProducts from './components/FeaturedProducts.jsx';
import PromoBanners from './components/PromoBanners.jsx';
import BenefitsSection from './components/BenefitsSection.jsx';
import Stats from './components/Stats.jsx';
import AboutSection from './components/AboutSection.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import LatestFood from './components/LatestFood.jsx';
import OrderSection from './components/OrderSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import FAQ from './components/FAQ.jsx';
import Testimonials from './components/Testimonials.jsx';
import BlogSection from './components/BlogSection.jsx';
import FinalCta from './components/FinalCta.jsx';
import Footer from './components/Footer.jsx';
import ScrollTop from './components/ScrollTop.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ProductModal from './components/ProductModal.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import ReservationModal from './components/ReservationModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import ArticleModal from './components/ArticleModal.jsx';
import Toast from './components/Toast.jsx';
import { products } from './data/content.js';

const STORAGE_KEY = 'naval-cart-v1';

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
  const [cart, setCart] = useState(readCart);
  const [filter, setFilter] = useState('all');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [post, setPost] = useState(null);
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
      qty <= 0 ? prev.filter((item) => item.id !== id) : prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  }, []);

  const removeItem = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast('محصول از سبد خرید حذف شد.');
  }, [showToast]);

  const scrollTo = useCallback((id) => {
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const openProduct = useCallback((value) => {
    const found = findProduct(value);
    if (found) setProduct(found);
  }, []);

  const openMenu = useCallback(() => {
    setCartOpen(false);
    scrollTo('menu');
  }, [scrollTo]);

  const handleCategory = useCallback(
    (categoryId) => {
      setFilter(categoryId);
      scrollTo('menu');
    },
    [scrollTo]
  );

  const onPromoProduct = useCallback(
    (id) => {
      openProduct(id);
    },
    [openProduct]
  );

  return (
    <div className="app">
      <Header
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        onSearch={() => setSearchOpen(true)}
        onLogin={() => setAuthOpen(true)}
        onMenu={() => setMobileOpen(true)}
        onCategory={handleCategory}
      />

      <main>
        <Hero products={products.filter((item) => item.featured)} onProduct={openProduct} onReserve={() => setReserveOpen(true)} />
        <Categories onCategory={handleCategory} />
        <FeaturedProducts
          products={products.filter((item) => item.featured)}
          onAdd={addToCart}
          onOpen={openProduct}
          onViewAll={openMenu}
        />
        <PromoBanners onMenu={openMenu} onProduct={onPromoProduct} onReserve={() => setReserveOpen(true)} />
        <BenefitsSection />
        <Stats />
        <AboutSection onMenu={openMenu} onReserve={() => setReserveOpen(true)} />
        <ProductGrid
          filter={filter}
          onFilter={setFilter}
          onAdd={addToCart}
          onOpen={openProduct}
          onViewAll={() => setFilter('all')}
        />
        <LatestFood products={products} onOpen={openProduct} onAdd={addToCart} />
        <OrderSection onMenu={openMenu} />
        <FAQ />
        <ContactSection onToast={showToast} />
        <Testimonials />
        <BlogSection onOpenPost={setPost} />
        <FinalCta onReserve={() => setReserveOpen(true)} onMenu={openMenu} />
      </main>

      <Footer onToast={showToast} />
      <ScrollTop />

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogin={() => {
          setMobileOpen(false);
          setAuthOpen(true);
        }}
        onCategory={handleCategory}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenProduct={openProduct}
        onOpenPost={setPost}
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
          openMenu();
        }}
      />

      <ProductModal product={product} onClose={() => setProduct(null)} onAdd={addToCart} />

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

      <ArticleModal post={post} onClose={() => setPost(null)} onMenu={openMenu} />

      <Toast message={toast} />
    </div>
  );
}
