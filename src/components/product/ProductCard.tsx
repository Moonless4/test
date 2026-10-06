import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../../lib/types';
import { useStore } from '../../context/StoreContext';
import DiscountBadge from '../ui/DiscountBadge';
import Img from '../ui/Img';
import PriceDisplay from '../ui/PriceDisplay';
import Rating from '../ui/Rating';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lift">
      <div className="relative overflow-hidden bg-cream">
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
          <div className="pointer-events-none absolute top-3 end-3">
            <DiscountBadge value={product.discount} />
          </div>
        ) : null}

        {product.isNew && !product.discount ? (
          <span className="pointer-events-none absolute top-3 end-3 rounded-lg bg-teal-800 px-2.5 py-1 text-[11px] font-medium text-white">
            جدید
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          aria-pressed={wishlisted}
          className={`absolute top-3 start-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all duration-300 ${
            wishlisted
              ? 'border-sale/20 bg-sale text-white shadow-soft'
              : 'border-line bg-white/90 text-teal-800 hover:bg-white hover:shadow-soft'
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-2 min-h-[2.6em] text-[13px] font-medium leading-6 text-ink transition-colors hover:text-teal-700 sm:text-[15px]"
        >
          {product.name}
        </Link>

        <Rating value={product.rating} count={product.reviewCount} />

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <PriceDisplay price={product.price} originalPrice={product.originalPrice} />
          <button
            type="button"
            onClick={() => addToCart(product)}
            aria-label={`افزودن ${product.name} به سبد خرید`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800 transition-all duration-300 hover:bg-teal-800 hover:text-white hover:shadow-card group-hover:bg-teal-800 group-hover:text-white"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </article>
  );
}
