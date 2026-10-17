import { Hero } from '@/components/home/Hero';
import { QuickActions } from '@/components/home/QuickActions';
import { PopularDestinations } from '@/components/home/PopularDestinations';
import { PopularFlights } from '@/components/home/PopularFlights';
import { PopularHotels } from '@/components/home/PopularHotels';
import { TravelServices } from '@/components/home/TravelServices';
import { PromoBanner } from '@/components/home/PromoBanner';
import { SpecialOffers } from '@/components/home/SpecialOffers';
import { TravelInspiration } from '@/components/home/TravelInspiration';
import { SeoContent } from '@/components/home/SeoContent';
import { Benefits } from '@/components/home/Benefits';
import { FaqSection } from '@/components/home/FaqSection';
import { AppBanner } from '@/components/home/AppBanner';

export default function Home() {
  return (
    <>
      {/* ۱. جستجوی اصلی */}
      <Hero />

      {/* ۲. دسترسی سریع (پیگیری خرید، ویزا، کارت هدیه، ترانسفر) */}
      <QuickActions />

      {/* ۳. مقصدهای محبوب */}
      <PopularDestinations />

      {/* ۴. پروازهای پرطرفدار داخلی و خارجی */}
      <PopularFlights scope="combined" />

      {/* ۵. هتل‌های محبوب داخلی و خارجی */}
      <PopularHotels scope="combined" />

      {/* ۶. خدمات سفر */}
      <TravelServices />

      {/* ۷. بنر رزرو اقامت */}
      <PromoBanner />

      {/* ۸. پیشنهادهای ویژه */}
      <SpecialOffers />

      {/* ۹. الهام‌بخش سفر */}
      <TravelInspiration />

      {/* ۱۰. معرفی سرویس‌ها */}
      <SeoContent />

      {/* ۱۱. مزایای مشتریان */}
      <Benefits />

      {/* ۱۲. پرسش‌های متداول */}
      <FaqSection />

      {/* ۱۳. اپلیکیشن */}
      <AppBanner />
    </>
  );
}
