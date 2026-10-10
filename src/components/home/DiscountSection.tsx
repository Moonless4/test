import { useCallback, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useDeals } from '../../hooks/useCatalog';
import { SectionError, SectionLoading } from '../ui/SectionState';
import CountdownPanel from './CountdownPanel';
import ProductCard from '../product/ProductCard';
import Reveal from '../ui/Reveal';
import { useDragScroll } from '../../hooks/useDragScroll';

/** "Off-time" strip: scrolling deal cards next to the countdown panel. */
export default function DiscountSection() {
  const { data, loading, error, reload } = useDeals();
  const items = data ?? [];
  const railRef = useRef<HTMLDivElement>(null);
  const railDrag = useDragScroll(railRef);

  const step = useCallback(() => {
    const el = railRef.current;
    if (!el) return;

    // RTL rails scroll towards negative offsets; the button stops at the end of the
    // rail instead of looping back to the start.
    const isRtl = getComputedStyle(el).direction === 'rtl';
    const delta = Math.max(el.clientWidth * 0.8, 260);
    el.scrollBy({ left: isRtl ? -delta : delta, behavior: 'smooth' });
  }, []);

  if (error) {
    return (
      <section className="mt-12 bg-white py-10 sm:mt-16 sm:py-14">
        <div className="container">
          <SectionError error={error} onRetry={reload} />
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mt-12 bg-white py-10 sm:mt-16 sm:py-14">
        <div className="container">
          <SectionLoading label="در حال دریافت پیشنهادها…" />
        </div>
      </section>
    );
  }

  // No product is discounted deeply enough: a countdown next to an empty rail is worse than no
  // section at all, so the whole strip steps out.
  if (items.length === 0) return null;

  return (
    <section
      className="mt-12 bg-white py-10 sm:mt-16 sm:py-14"
      id="discounts"
      aria-label="تخفیف‌های ویژه"
    >
      <div className="container">
        <Reveal>
          {/* Phones and tablets stack the promo banner above the rail; only the desktop
              row splits it into a side panel. */}
          <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:gap-4">
            <CountdownPanel />

            <div
              ref={railRef}
              {...railDrag}
              className="no-scrollbar flex min-w-0 flex-1 cursor-grab select-none gap-3 overflow-x-auto pb-1 active:cursor-grabbing [&_a]:cursor-grab xl:gap-4"
            >
              {items.map((product) => (
                <div
                  key={product.id}
                  className="w-[150px] shrink-0 sm:w-[164px] xl:w-[calc((100%-64px)/5)]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={step}
              aria-label="محصولات تخفیف‌دار بعدی"
              className="hidden h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border border-line bg-white text-cocoa shadow-lift transition-colors hover:bg-cream lg:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
