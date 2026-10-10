import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, SearchX } from 'lucide-react';
import { POPULAR_SEARCHES } from '../lib/search';
import {
  DEFAULT_SORT,
  emptyFilters,
  optionSets,
  PRICE_CEILING,
  type Filters,
} from '../lib/filters';
import { MIN_QUERY } from '../services/search';
import { listProductsPage } from '../services/products';
import { useAsync } from '../hooks/useAsync';
import { toFa } from '../lib/format';
import FilterLayout from '../components/shop/FilterLayout';
import SortSelect from '../components/shop/SortSelect';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/ui/EmptyState';
import { SectionError, SectionLoading } from '../components/ui/SectionState';

const PAGE_SIZE = 48;

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState(DEFAULT_SORT);

  // A new query starts from a clean filter set.
  useEffect(() => {
    setFilters({ ...emptyFilters });
    setSort(DEFAULT_SORT);
  }, [query]);

  const term = query.trim();
  const searching = term.length >= MIN_QUERY;

  // The search itself is the API's `q` parameter: the store decides what matches, not the browser.
  const { data, loading, error, reload } = useAsync(
    (signal) =>
      searching
        ? listProductsPage(
            {
              search: term,
              discounted: filters.onlyDiscount || undefined,
              maxPrice: filters.maxPrice < PRICE_CEILING ? filters.maxPrice : undefined,
              sort,
              perPage: PAGE_SIZE,
            },
            signal,
          )
        : Promise.resolve({ products: [], total: 0, totalPages: 1 }),
    [term, filters.onlyDiscount, filters.maxPrice, sort],
  );

  const products = data?.products ?? [];
  const options = useMemo(() => optionSets(products), [products]);

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

  return (
    <div className="container py-8 sm:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <span>/</span>
        <span className="font-medium text-ink">جستجو</span>
      </nav>

      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">
            {query ? (
              <>
                نتایج جستجو برای «<span className="text-black">{query}</span>»
              </>
            ) : (
              'جستجو در فروشگاه'
            )}
          </h1>
          {searching ? (
            <p className="mt-2 text-[13px] text-muted">{toFa(results.length)} کالا پیدا شد</p>
          ) : (
            <p className="mt-2 text-[13px] text-muted">
              نام محصول، برند یا دسته‌بندی مورد نظرتان را جستجو کنید.
            </p>
          )}
        </div>

        {searching && results.length > 0 ? (
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <SortSelect value={sort} onChange={setSort} id="search-sort" />
          </div>
        ) : null}
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
          <Sparkles className="h-3.5 w-3.5 text-black" />
          جستجوهای پیشنهادی:
        </span>
        {POPULAR_SEARCHES.map((item) => (
          <Link
            key={item}
            to={`/search?q=${encodeURIComponent(item)}`}
            className="rounded-xl border border-line bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-teal-300 hover:text-black"
          >
            {item}
          </Link>
        ))}
      </div>

      {error ? <SectionError error={error} onRetry={reload} /> : null}

      {!error && loading ? <SectionLoading label="در حال جستجو…" /> : null}

      {!error && !loading && !searching ? (
        <EmptyState
          icon={<SearchX className="h-7 w-7" />}
          title="عبارتی برای جستجو وارد کنید"
          text="نام محصول، دسته‌بندی یا بخشی از توضیح کالا را بنویسید تا نتیجه‌ها را ببینید."
        />
      ) : null}

      {!error && !loading && searching && results.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-7 w-7" />}
          title="نتیجه‌ای برای این جستجو پیدا نشد"
          text="املای عبارت را بررسی کنید یا یکی از جستجوهای پیشنهادی بالا را انتخاب کنید."
          action={
            <Link
              to="/shop"
              className="inline-flex h-11 items-center rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              مشاهده همه محصولات
            </Link>
          }
        />
      ) : null}

      {!error && !loading && searching && results.length > 0 ? (
        <FilterLayout
          filters={filters}
          onChange={setFilters}
          resultCount={results.length}
          options={options}
        >
          <ProductGrid products={results} />
        </FilterLayout>
      ) : null}
    </div>
  );
}
