import Hero from '../components/Hero.jsx';
import Categories from '../components/Categories.jsx';
import FeaturedProducts from '../components/FeaturedProducts.jsx';
import PromoBanners from '../components/PromoBanners.jsx';
import BenefitsSection from '../components/BenefitsSection.jsx';
import LatestFood from '../components/LatestFood.jsx';
import DeliveryBanner from '../components/DeliveryBanner.jsx';
import BlogSection from '../components/BlogSection.jsx';
import FinalCta from '../components/FinalCta.jsx';
import { products, heroSlides } from '../data/content.js';

export default function HomePage({ onAdd, onProduct, onPost, onReserve, onCategory, onMenu, onBlog }) {
  const featured = products.filter((item) => item.featured);

  return (
    <>
      <Hero products={products} slides={heroSlides} onProduct={onProduct} onReserve={onReserve} />
      <Categories onCategory={onCategory} />
      <FeaturedProducts products={featured} onAdd={onAdd} onOpen={onProduct} onViewAll={onMenu} />
      <PromoBanners onMenu={onMenu} onProduct={onProduct} onReserve={onReserve} />
      <BenefitsSection />
      <LatestFood products={products} onOpen={onProduct} onAdd={onAdd} onViewAll={onMenu} />
      <DeliveryBanner onMenu={onMenu} />
      <BlogSection onOpenPost={onPost} onViewAll={onBlog} />
      <FinalCta onReserve={onReserve} onMenu={onMenu} />
    </>
  );
}
