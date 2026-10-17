import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AppProvider } from '@/context/AppContext';
import Home from '@/pages/Home';
import FlightResults from '@/pages/FlightResults';
import FlightDetail from '@/pages/FlightDetail';
import HotelResults from '@/pages/HotelResults';
import HotelDetail from '@/pages/HotelDetail';
import TripResults from '@/pages/TripResults';
import ToursResults from '@/pages/ToursResults';
import BookingPage from '@/pages/BookingPage';
import Login from '@/pages/Login';
import Account from '@/pages/Account';
import ServicesIndex from '@/pages/ServicesIndex';
import ServiceDetail from '@/pages/ServiceDetail';
import Magazine from '@/pages/Magazine';
import ArticlePage from '@/pages/ArticlePage';
import StaticPage from '@/pages/StaticPage';
import NotFound from '@/pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-16 lg:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/flights" element={<FlightResults />} />
            <Route path="/flights/:flightId" element={<FlightDetail />} />

            <Route path="/hotels" element={<HotelResults />} />
            <Route path="/hotels/:hotelId" element={<HotelDetail />} />

            <Route path="/trains" element={<TripResults kind="train" />} />
            <Route path="/buses" element={<TripResults kind="bus" />} />
            <Route path="/tours" element={<ToursResults />} />
            <Route path="/stays" element={<HotelResults stayMode />} />

            <Route path="/booking/:kind/:itemId" element={<BookingPage />} />

            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />

            <Route path="/services" element={<ServicesIndex />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />

            <Route path="/magazine" element={<Magazine />} />
            <Route path="/magazine/:slug" element={<ArticlePage />} />

            <Route path="/about" element={<StaticPage slug="about" />} />
            <Route path="/contact" element={<StaticPage slug="contact" />} />
            <Route path="/terms" element={<StaticPage slug="terms" />} />
            <Route path="/help/guide" element={<StaticPage slug="guide" />} />
            <Route path="/help/faq" element={<StaticPage slug="faq" />} />
            <Route path="/help/refund" element={<StaticPage slug="refund" />} />
            <Route path="/club" element={<StaticPage slug="club" />} />
            <Route path="/careers" element={<StaticPage slug="careers" />} />
            <Route path="/app" element={<StaticPage slug="app" />} />
            <Route path="/partners" element={<StaticPage slug="partners" />} />
            <Route path="/agent" element={<StaticPage slug="agent" />} />
            <Route path="/offers" element={<StaticPage slug="offers" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}
