import { Hero } from '@/components/home/Hero';
import { PopularDestinations } from '@/components/home/PopularDestinations';
import { PopularFlights } from '@/components/home/PopularFlights';
import { PopularHotels } from '@/components/home/PopularHotels';
import { TravelServices } from '@/components/home/TravelServices';
import { SpecialOffers } from '@/components/home/SpecialOffers';
import { TravelInspiration } from '@/components/home/TravelInspiration';
import { Benefits } from '@/components/home/Benefits';
import { FaqSection } from '@/components/home/FaqSection';

export default function Home() {
  return (
    <>
      {/* ۱. جستجوی اصلی */}
      <Hero />

      {/* ۲. مقصدهای محبوب */}
      <PopularDestinations />

      {/* ۳ و ۴. پروازهای پرطرفدار داخلی و خارجی */}
      <PopularFlights scope="combined" />

      {/* ۶. خدمات سفر */}
      <TravelServices />

      {/* ۵. هتل‌های محبوب داخلی و خارجی */}
      <PopularHotels scope="combined" />

      {/* ۷. پیشنهادهای ویژه */}
      <SpecialOffers />

      {/* ۸. الهام‌بخش سفر */}
      <TravelInspiration />

      {/* ۹. مزایای مشتریان */}
      <Benefits />

      {/* ۱۰. پرسش‌های متداول */}
      <FaqSection />
    </>
  );
}
