import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { toFa } from '../lib/format';
import {
  DEFAULT_SORT,
  emptyFilters,
  isSort,
  optionSets,
  PRICE_CEILING,
  type Filters,
} from '../lib/filters';
import { useCategories, useProductsPage } from '../hooks/useCatalog';
import FilterLayout from '../components/shop/FilterLayout';
import SortSelect from '../components/shop/SortSelect';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/ui/EmptyState';
import { SectionError, SectionLoading } from '../components/ui/SectionState';

/** The API's own page ceiling — one request, the same "no pager" behaviour the page always had. */
const PAGE_SIZE = 48;

export default function ShopPage() {
  const { category } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const sortParam = searchParams.get('sort');
  const sort = isSort(sortParam) ? sortParam : DEFAULT_SORT;
  const discountParam = searchParams.get('discount') === 'true';

  const { data: categories } = useCategories();
  // The route carries the category slug; the API resolves it, so an unknown slug yields nothing
  // rather than the whole catalogue.
  const activeCategory = category
    ? (categories ?? []).find((item) => item.id === category)
    : undefined;

  // The URL can pre-filter the grid; changing the sort must not reset filters.
  useEffect(() => {
    setFilters({ ...emptyFilters, onlyDiscount: discountParam });
  }, [category, discountParam]);

  const { data, loading, error, reload } = useProductsPage({
    category,
    discounted: discountParam || filters.onlyDiscount || undefined,
    maxPrice: filters.maxPrice < PRICE_CEILING ? filters.maxPrice : undefined,
    sort,
    perPage: PAGE_SIZE,
  });

  const products = data?.products ?? [];
  const options = useMemo(() => optionSets(products), [products]);

  // The price, the discount and the ordering are the API's; sizes and colours are attributes of
  // each product, so those two are matched here against the products the API returned.
  const results = useMemo(
    () =>
      products.filter(
        (product) =>
          (filters.sizes.length === 0 || product.sizes.some((s) => filters.sizes.includes(s))) &&
          (filters.colors.length === 0 ||
            product.colors.some((c) => filters.colors.includes(c.name))),
      ),
    [products, filters.sizes, filters.colors],
  );

  const heading = activeCategory
    ? activeCategory.title
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

      {error ? <SectionError error={error} onRetry={reload} /> : null}

      {!error && loading ? <SectionLoading label="در حال دریافت کالاها…" /> : null}

      {!error && !loading ? (
        <FilterLayout
          filters={filters}
          onChange={setFilters}
          resultCount={results.length}
          options={options}
        >
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
      ) : null}
    </div>
  );
}
