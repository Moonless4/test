import type { ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import AdminLayout from './AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CouponsPage from './pages/CouponsPage';
import ContentPage from './pages/ContentPage';
import FaqsPage from './pages/FaqsPage';
import SettingsPage from './pages/SettingsPage';
import MediaPage from './pages/MediaPage';
import { adminHref } from './lib/basePath';

/**
 * The panel, mounted under its own URL prefix inside the storefront's own SPA.
 *
 * It is the same application and the same origin — the token, the API client and the design tokens
 * are all the storefront's — but it renders with its own shell instead of the shop's header, footer
 * and bottom bar, which is why `App.tsx` routes the whole prefix to this component.
 */

function FullPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream/50 px-6">{children}</div>
  );
}

/** Staff only. `/auth/me` decides, and the API decides again on every route behind this. */
function RequireAdmin() {
  const { user, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <FullPage>
        <p className="flex items-center gap-2.5 text-[13px] text-muted" role="status">
          <Loader2 className="h-4 w-4 animate-spin" />
          در حال بررسی دسترسی…
        </p>
      </FullPage>
    );
  }

  if (!user) {
    return <Navigate to={adminHref('login')} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />

        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id" element={<ProductFormPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="faqs" element={<FaqsPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* A surface the visitor may not open still has to land somewhere inside the panel. */}
            <Route path="*" element={<Navigate to={adminHref()} replace />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
