import { useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useCategories } from '../../hooks/useCatalog';
import Img from '../ui/Img';
import Reveal from '../ui/Reveal';
import { SectionError, SectionLoading } from '../ui/SectionState';
import { useDragScroll } from '../../hooks/useDragScroll';

/** Category carousel: rounded photo tiles, swipeable on phones, a single row on desktop. */
export default function CategoryCards() {
  const railRef = useRef<HTMLDivElement>(null);
  const railDrag = useDragScroll(railRef);
  // The tiles are whatever the catalogue has — no list of categories is written down here.
  const { data, loading, error, reload } = useCategories();
  const categories = data ?? [];

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
      <section className="container mt-10 sm:mt-14">
        <SectionError error={error} onRetry={reload} />
      </section>
    );
  }

  if (loading) {
    return (
      <section className="container mt-10 sm:mt-14">
        <SectionLoading label="در حال دریافت دسته‌بندی‌ها…" />
      </section>
    );
  }

  // A store with no categories yet has nothing to browse, so the rail stays out of the page.
  if (categories.length === 0) return null;

  return (
    <section className="container mt-10 sm:mt-14" aria-label="دسته‌بندی‌ها">
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          ref={railRef}
          {...railDrag}
          className="no-scrollbar flex min-w-0 flex-1 cursor-grab select-none gap-3 overflow-x-auto pb-1 [&_a]:cursor-grab active:cursor-grabbing sm:gap-4 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0"
        >
          {categories.map((category, i) => (
            <div key={category.id} className="w-[136px] shrink-0 sm:w-[168px] lg:w-auto">
              <Reveal delay={i * 60}>
                <Link
                  to={`/shop/${category.id}`}
                  className="group flex flex-col items-center text-center transition-transform duration-500 ease-out group-hover:-translate-y-1"
                >
                  <Img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full rounded-lg bg-cream object-cover shadow-soft"
                  />
                  <h3 className="mt-2.5 text-[13px] font-bold text-ink transition-colors duration-300 group-hover:text-black sm:text-sm lg:text-[15px]">
                    {category.title}
                  </h3>
                </Link>
              </Reveal>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={step}
          aria-label="دسته‌بندی‌های بعدی"
          className="hidden h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border border-line bg-white text-cocoa shadow-lift transition-colors hover:bg-cream sm:flex lg:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
