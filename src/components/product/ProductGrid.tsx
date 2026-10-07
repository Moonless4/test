import type { Product } from '../../lib/types';
import ProductCard from './ProductCard';

type Props = {
  products: Product[];
  className?: string;
};

/** 2 per row on mobile, 3 on tablet, 4 on desktop. */
export default function ProductGrid({ products, className = '' }: Props) {
  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
