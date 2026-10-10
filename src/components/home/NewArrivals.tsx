import { useNewArrivals } from '../../hooks/useCatalog';
import ProductCarousel from '../product/ProductCarousel';
import SectionHeader from '../ui/SectionHeader';
import { SectionError, SectionLoading } from '../ui/SectionState';
import Reveal from '../ui/Reveal';

/** The newest products the catalogue has, straight from the API's `newest` ordering. */
export default function NewArrivals() {
  const { data, loading, error, reload } = useNewArrivals();
  const products = data ?? [];

  return (
    <section className="container mt-12 sm:mt-16" aria-label="جدیدترین محصولات">
      <SectionHeader
        eyebrow="تازه رسیده‌ها"
        title="جدیدترین‌ها"
        linkLabel="مشاهده همه"
        linkTo="/shop?sort=newest"
      />
      {error ? <SectionError error={error} onRetry={reload} /> : null}
      {!error && loading ? <SectionLoading /> : null}
      {!error && !loading && products.length > 0 ? (
        <Reveal>
          <ProductCarousel products={products} />
        </Reveal>
      ) : null}
    </section>
  );
}
