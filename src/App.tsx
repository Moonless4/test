import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import CategoryDrawer from './components/layout/CategoryDrawer';
import MobileTabBar from './components/layout/MobileTabBar';
import HomePage from './pages/HomePage';

/**
 * Every page except the landing page ships as its own chunk: a phone opening the store pays for
 * the shell and the home page only, and each route arrives when it is first visited. HomePage
 * stays in the entry chunk so the first paint never waits on a second request.
 */
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
// The panel is the same SPA but its own shell, so it ships as its own chunk and shoppers never pay
// for it.
const AdminApp = lazy(() => import('./admin/AdminApp'));

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, search]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // The panel owns the whole `/admin` prefix and renders its own shell — mounting it *instead of*
  // the storefront means no shop header, footer, cart drawer or bottom bar around it. It is nested
  // under `/admin/*` so its own relative routes (`products`, `settings`, …) resolve underneath.
  if (pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-cream/50" />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    );
  }

  // The bottom bar is sticky and the shell's last child, so it reserves its own height.
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        {/* The fallback only reserves the strip the page will take, so the footer does not jump up
            while a route chunk arrives. */}
        <Suspense fallback={<div className="min-h-[70vh]" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:category" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/:id" element={<PaymentPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <CartDrawer />

      {/* Phone chrome: the bottom bar owns the category sheet, so the pages stay untouched.
          On a product page it steps aside for that page's own price/action bar. */}
      {pathname.startsWith('/product/') ? null : (
        <MobileTabBar onOpenCategories={() => setCategoriesOpen(true)} />
      )}
      <CategoryDrawer open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
    </div>
  );
}
