import Hero from '../components/home/Hero';
import CategoryCards from '../components/home/CategoryCards';
import DiscountSection from '../components/home/DiscountSection';
import PromoBanners from '../components/home/PromoBanners';
import NewArrivals from '../components/home/NewArrivals';
import Benefits from '../components/home/Benefits';
import PromoCollection from '../components/home/PromoCollection';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryCards />
      <DiscountSection />
      <PromoBanners />
      <NewArrivals />
      <Benefits />
      <PromoCollection />
      <Testimonials />
      <Newsletter />
    </>
  );
}
