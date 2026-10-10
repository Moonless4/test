import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { useAuth } from '@/contexts/AuthContext'
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
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted">…</div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
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
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/properties" element={<AdminRoute><AdminProperties /></AdminRoute>} />
        <Route path="/admin/inquiries" element={<AdminRoute><AdminInquiries /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<SiteLayout><NotFoundPage /></SiteLayout>} />
      </Routes>
    </div>
  )
}
