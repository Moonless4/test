// Route table. Every page is its own module, so the initial load only ships the
// page the visitor asked for.
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'));
const ProjectPage = lazy(() => import('./pages/ProjectPage.jsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const ArticlePage = lazy(() => import('./pages/ArticlePage.jsx'));
const ServicePage = lazy(() => import('./pages/ServicePage.jsx'));
const InteriorDesignPage = lazy(() => import('./pages/services/InteriorDesignPage.jsx'));
const OldHouseRenovationPage = lazy(() => import('./pages/services/OldHouseRenovationPage.jsx'));
const LuxuryConstructionPage = lazy(() => import('./pages/services/LuxuryConstructionPage.jsx'));
const ArchitecturePlansPage = lazy(() => import('./pages/services/ArchitecturePlansPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage.jsx'));
const CooperationPage = lazy(() => import('./pages/CooperationPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/project/:slug" element={<ProjectPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<ArticlePage />} />
      <Route path="/services/interior-design" element={<InteriorDesignPage />} />
      <Route path="/services/old-house-renovation" element={<OldHouseRenovationPage />} />
      <Route path="/services/luxury-construction" element={<LuxuryConstructionPage />} />
      <Route path="/services/architecture-plans" element={<ArchitecturePlansPage />} />
      <Route path="/services/:slug" element={<ServicePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/consultation" element={<ConsultationPage />} />
      <Route path="/cooperation" element={<CooperationPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
