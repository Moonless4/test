import SiteHeader from '@/components/SiteHeader';
import HeroSection from '@/components/HeroSection';

export default function App() {
  return (
    <div className="min-h-screen bg-night">
      <SiteHeader />
      <main>
        <HeroSection />
        {/* ادامه‌ی صفحه‌ی روشن — بخش‌های بعدی سایت در گام‌های بعدی افزوده می‌شوند */}
        <div className="h-24 bg-white lg:h-32" aria-hidden />
      </main>
    </div>
  );
}
