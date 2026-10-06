import { discountedProducts } from '../../lib/data';
import ProductGrid from '../product/ProductGrid';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../ui/Reveal';

export default function DiscountSection() {
  const items = discountedProducts.slice(0, 8);

  return (
    <section className="mt-12 bg-cream py-12 sm:mt-16 sm:py-16" id="discounts">
      <div className="container">
        <SectionHeader
          eyebrow="پیشنهاد‌های محدود"
          title="تخفیف‌های ویژه"
          linkLabel="مشاهده همه تخفیف‌ها"
          linkTo="/shop?discount=true"
        />
        <Reveal>
          <ProductGrid products={items} />
        </Reveal>
      </div>
    </section>
  );
}
