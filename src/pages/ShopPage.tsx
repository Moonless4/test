import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, SlidersHorizontal, X } from 'lucide-react';
import { categories, products, sortOptions } from '../lib/data';
import { toFa } from '../lib/format';
import type { CategoryId } from '../lib/types';
import FilterSidebar, {
  PRICE_CEILING,
  emptyFilters,
  type Filters,
} from '../components/shop/FilterSidebar';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/ui/EmptyState';

const VALID: CategoryId[] = categories.map((c) => c.id);

export default function ShopPage() {
  const { category } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeCategory =
    category && VALID.includes(category as CategoryId) ? (category as CategoryId) : undefined;

  const sort = searchParams.get('sort') ?? 'newest';

  const discountParam = searchParams.get('discount') === 'true';

  // The URL can pre-filter the grid; changing the sort must not reset filters.
  useEffect(() => {
    setFilters({ ...emptyFilters, onlyDiscount: discountParam });
  }, [category, discountParam]);

  const results = useMemo(() => {
    let list = activeCategory
      ? products.filter((p) => p.category === activeCategory)
      : [...products];

    if (filters.onlyDiscount) list = list.filter((p) => p.discount > 0);
    if (filters.sizes.length) list = list.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
    if (filters.colors.length)
      list = list.filter((p) => p.colors.some((c) => filters.colors.includes(c.name)));
    if (filters.brands.length) list = list.filter((p) => filters.brands.includes(p.brand));
    if (filters.minRating) list = list.filter((p) => p.rating >= filters.minRating);
    if (filters.maxPrice < PRICE_CEILING) list = list.filter((p) => p.price <= filters.maxPrice);

    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'popular':
        return list.sort((a, b) => b.reviewCount - a.reviewCount);
      case 'discount':
        return list.sort((a, b) => b.discount - a.discount);
      default:
        return list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }
  }, [activeCategory, filters, sort]);

  const heading = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.title ?? 'فروشگاه'
    : filters.onlyDiscount
      ? 'تخفیف‌های ویژه'
      : 'همه محصولات';

  const setSort = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', value);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="container py-6 sm:py-8">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <Link to="/shop" className="transition-colors hover:text-black">
          فروشگاه
        </Link>
        {activeCategory ? (
          <>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="font-medium text-ink">{heading}</span>
          </>
        ) : null}
      </nav>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink sm:text-2xl lg:text-[28px]">{heading}</h1>
          <p className="mt-2 text-[13px] text-muted">
            {toFa(results.length)} کالا در این دسته‌بندی موجود است
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white text-[13px] font-medium text-ink transition-colors hover:border-teal-300 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            فیلترها
          </button>

          <div className="relative flex-1 sm:flex-none">
            <label htmlFor="sort" className="sr-only">
              ترتیب نمایش
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-line bg-white ps-4 pe-9 text-[13px] font-medium text-ink outline-none transition-colors hover:border-teal-300 sm:w-[190px]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronLeft className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 -rotate-90 text-muted" />
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-panel border border-line bg-white p-5">
            <FilterSidebar filters={filters} onChange={setFilters} resultCount={results.length} />
          </div>
        </aside>

        <div>
          {results.length === 0 ? (
            <EmptyState
              icon={<SlidersHorizontal className="h-7 w-7" />}
              title="کالایی با این مشخصات پیدا نشد"
              text="فیلترها را تغییر دهید یا همه فیلترها را حذف کنید تا نتایج بیشتری ببینید."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ ...emptyFilters });
                    setSearchParams({}, { replace: true });
                  }}
                  className="h-11 rounded-xl bg-teal-800 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                >
                  حذف فیلترها
                </button>
              }
            />
          ) : (
            <ProductGrid products={results} />
          )}
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[75] lg:hidden">
          <button
            type="button"
            aria-label="بستن فیلترها"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 h-full w-full bg-teal-950/50 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-panel bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-bold text-ink">فیلترها</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="بستن"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-cream"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterSidebar filters={filters} onChange={setFilters} resultCount={results.length} />
            </div>
            <footer className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-12 w-full rounded-xl bg-teal-800 text-sm font-bold text-white transition-colors hover:bg-teal-700"
              >
                نمایش {toFa(results.length)} کالا
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
