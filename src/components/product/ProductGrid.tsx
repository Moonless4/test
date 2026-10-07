import type { Product } from '../../lib/types';
import ProductCard from './ProductCard';

type Props = {
  products: Product[];
  className?: string;
  columns?: 'grid' | 'four';
};

/** 2 per row on mobile, 3 on tablet, 4 on laptop, 6 on desktop. */
export default function ProductGrid({ products, className = '' }: Props) {
  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6 ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
