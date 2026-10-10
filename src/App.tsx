import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminRoutes } from '@/lib/adminRoutes'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import FavoritesPage from '@/pages/FavoritesPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import PropertiesPage from '@/pages/PropertiesPage'
import PropertyDetailPage from '@/pages/PropertyDetailPage'
import ServicesPage from '@/pages/ServicesPage'
import TeamPage from '@/pages/TeamPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminInquiries from '@/pages/admin/AdminInquiries'
import AdminProperties from '@/pages/admin/AdminProperties'
import AdminSettings from '@/pages/admin/AdminSettings'
import LoginPage from '@/pages/admin/LoginPage'

function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const [routes] = useAdminRoutes()
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted">…</div>
  if (!user) return <Navigate to={routes.loginPath} replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const [routes] = useAdminRoutes()
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Routes>
        {/* Public site routes */}
        <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
        <Route path="/properties" element={<SiteLayout><PropertiesPage /></SiteLayout>} />
        <Route path="/properties/:slug" element={<SiteLayout><PropertyDetailPage /></SiteLayout>} />
        <Route path="/about" element={<SiteLayout><AboutPage /></SiteLayout>} />
        <Route path="/services" element={<SiteLayout><ServicesPage /></SiteLayout>} />
        <Route path="/team" element={<SiteLayout><TeamPage /></SiteLayout>} />
        <Route path="/contact" element={<SiteLayout><ContactPage /></SiteLayout>} />
        <Route path="/favorites" element={<SiteLayout><FavoritesPage /></SiteLayout>} />

        {/* Auth route */}
        <Route path={routes.loginPath} element={<LoginPage />} />

        {/* Admin routes */}
        <Route path={routes.adminPath} element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path={`${routes.adminPath}/properties`} element={<AdminRoute><AdminProperties /></AdminRoute>} />
        <Route path={`${routes.adminPath}/inquiries`} element={<AdminRoute><AdminInquiries /></AdminRoute>} />
        <Route path={`${routes.adminPath}/settings`} element={<AdminRoute><AdminSettings /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<SiteLayout><NotFoundPage /></SiteLayout>} />
      </Routes>
    </div>
  )
}
