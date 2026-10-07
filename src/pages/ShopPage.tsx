import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { categories, products } from '../lib/data';
import { toFa } from '../lib/format';
import { applyFilters, emptyFilters, sortProducts, type Filters } from '../lib/filters';
import type { CategoryId } from '../lib/types';
import FilterLayout from '../components/shop/FilterLayout';
import SortSelect from '../components/shop/SortSelect';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/ui/EmptyState';

const VALID: CategoryId[] = categories.map((c) => c.id);

export default function ShopPage() {
  const { category } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const activeCategory =
    category && VALID.includes(category as CategoryId) ? (category as CategoryId) : undefined;

  const sort = searchParams.get('sort') ?? 'newest';

  const discountParam = searchParams.get('discount') === 'true';

  // The URL can pre-filter the grid; changing the sort must not reset filters.
  useEffect(() => {
    setFilters({ ...emptyFilters, onlyDiscount: discountParam });
  }, [category, discountParam]);

  const results = useMemo(() => {
    const list = activeCategory
      ? products.filter((p) => p.category === activeCategory)
      : [...products];

    return sortProducts(applyFilters(list, filters), sort);
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
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </header>

      <FilterLayout filters={filters} onChange={setFilters} resultCount={results.length}>
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
      </FilterLayout>
    </div>
  );
}
