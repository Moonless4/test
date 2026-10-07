import { useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../lib/types';
import ProductCard from './ProductCard';

/** Horizontally scrollable product rail with RTL-aware arrow controls. */
export default function ProductCarousel({ products }: { products: Product[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollByCards = useCallback((forward: boolean) => {
    const el = railRef.current;
    if (!el) return;
    const isRtl = getComputedStyle(el).direction === 'rtl';
    const step = Math.max(el.clientWidth * 0.7, 240);
    // RTL scroll offsets grow towards the start, so the sign flips.
    const delta = isRtl ? (forward ? -step : step) : forward ? step : -step;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  const arrow =
    'flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-teal-800 shadow-soft transition-all hover:bg-teal-800 hover:text-white';

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-14 start-0 hidden items-center gap-2 sm:flex">
        <button
          type="button"
          aria-label="محصولات قبلی"
          className={`pointer-events-auto ${arrow}`}
          onClick={() => scrollByCards(false)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="محصولات بعدی"
          className={`pointer-events-auto ${arrow}`}
          onClick={() => scrollByCards(true)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-5 sm:px-0"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[46%] shrink-0 snap-start sm:w-[30%] md:w-[23%] lg:w-[18.3%] xl:w-[15%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
