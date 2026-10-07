import { Link } from 'react-router-dom';
import type { Product } from '../../lib/types';
import DiscountBadge from '../ui/DiscountBadge';
import Img from '../ui/Img';
import PriceDisplay from '../ui/PriceDisplay';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-lg bg-white">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`} aria-label={product.name}>
          <div className="aspect-[4/5] w-full overflow-hidden">
            <Img
              src={product.images[0]}
              alt={product.name}
              width={800}
              height={1000}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </Link>

        {product.isNew && !product.discount ? (
          <span className="pointer-events-none absolute top-2 end-2 rounded-md bg-teal-800 px-2 py-0.5 text-[10px] font-medium text-white">
            جدید
          </span>
        ) : null}

      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-2 min-h-[2.5em] text-start text-[12px] font-medium leading-5 text-ink sm:text-[13px]"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex justify-end pt-1">
          <PriceDisplay
            price={product.price}
            originalPrice={product.originalPrice}
            size="sm"
            align="end"
            tag={<DiscountBadge value={product.discount} size="xs" />}
          />
        </div>
      </div>
    </article>
  );
}
