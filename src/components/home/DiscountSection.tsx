import { useCallback, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { discountedProducts } from '../../lib/data';
import CountdownPanel from './CountdownPanel';
import ProductCard from '../product/ProductCard';
import Reveal from '../ui/Reveal';

/** "Off-time" strip: scrolling deal cards next to the countdown panel. */
export default function DiscountSection() {
  const items = discountedProducts;
  const railRef = useRef<HTMLDivElement>(null);

  const step = useCallback(() => {
    const el = railRef.current;
    if (!el) return;

    const isRtl = getComputedStyle(el).direction === 'rtl';
    // RTL rails start at offset 0 and grow towards negative values.
    const progress = isRtl ? -el.scrollLeft : el.scrollLeft;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);

    if (progress >= maxScroll - 8) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    const delta = Math.max(el.clientWidth * 0.8, 260);
    el.scrollBy({ left: isRtl ? -delta : delta, behavior: 'smooth' });
  }, []);

  return (
    <section
      className="mt-12 bg-cream py-10 sm:mt-16 sm:py-14"
      id="discounts"
      aria-label="تخفیف‌های ویژه"
    >
      <div className="container">
        <Reveal>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:gap-4">
            <CountdownPanel />

            <div
              ref={railRef}
              className="no-scrollbar flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1 xl:gap-4"
            >
              {items.map((product) => (
                <div
                  key={product.id}
                  className="w-[150px] shrink-0 sm:w-[164px] xl:w-[172px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={step}
              aria-label="محصولات تخفیف‌دار بعدی"
              className="hidden h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border border-line bg-white text-cocoa shadow-lift transition-colors hover:bg-cream sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
