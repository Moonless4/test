import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '../../lib/types';
import { useStore } from '../../context/StoreContext';
import DiscountBadge from '../ui/DiscountBadge';
import Img from '../ui/Img';
import PriceDisplay from '../ui/PriceDisplay';

export default function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 hover:-translate-y-1">
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
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          </div>
        </Link>

        {product.discount > 0 ? (
          <div className="pointer-events-none absolute top-2 end-2">
            <DiscountBadge value={product.discount} size="sm" />
          </div>
        ) : null}

        {product.isNew && !product.discount ? (
          <span className="pointer-events-none absolute top-2 end-2 rounded-md bg-teal-800 px-2 py-0.5 text-[10px] font-medium text-white">
            جدید
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          aria-pressed={wishlisted}
          className={`absolute top-2 start-2 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition-all duration-300 ${
            wishlisted
              ? 'border-sale/20 bg-sale text-white shadow-soft'
              : 'border-line bg-white/90 text-teal-800 hover:bg-white hover:shadow-soft'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-current' : ''}`} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-2 min-h-[2.5em] text-start text-[12px] font-medium leading-5 text-ink transition-colors hover:text-teal-700 sm:text-[13px]"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex justify-end pt-1">
          <PriceDisplay
            price={product.price}
            originalPrice={product.originalPrice}
            size="sm"
            align="end"
          />
        </div>
      </div>
    </article>
  );
}
