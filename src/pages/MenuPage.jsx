import PageHero from '../components/PageHero.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import LatestFood from '../components/LatestFood.jsx';
import { products } from '../data/content.js';

export default function MenuPage({ filter, onFilter, onAdd, onOpen }) {
  return (
    <>
      <PageHero
        eyebrow="منوی رستوران"
        title="منوی کامل"
        highlight="نوال"
        script="Our Menu"
        text="از پیش‌غذاهای سبک تا استیک‌های گریل؛ روی هر غذا بزنید تا جزئیات کامل و مواد اولیه‌اش را ببینید."
        crumbs={[{ label: 'منو' }]}
      />
      <ProductGrid
        filter={filter}
        onFilter={onFilter}
        onAdd={onAdd}
        onOpen={onOpen}
        onViewAll={() => onFilter('all')}
      />
      <LatestFood products={products} onOpen={onOpen} onAdd={onAdd} />
    </>
  );
}
