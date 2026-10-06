import { newArrivals } from '../../lib/data';
import ProductCarousel from '../product/ProductCarousel';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../ui/Reveal';

export default function NewArrivals() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="جدیدترین محصولات">
      <SectionHeader
        eyebrow="تازه رسیده‌ها"
        title="جدیدترین‌ها"
        linkLabel="مشاهده همه"
        linkTo="/shop?sort=newest"
      />
      <Reveal>
        <ProductCarousel products={newArrivals} />
      </Reveal>
    </section>
  );
}
