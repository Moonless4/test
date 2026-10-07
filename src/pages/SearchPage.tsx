import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Sparkles, SearchX } from 'lucide-react';
import { POPULAR_SEARCHES, searchCatalog } from '../lib/search';
import { applyFilters, emptyFilters, sortProducts, type Filters } from '../lib/filters';
import { toFa } from '../lib/format';
import FilterLayout from '../components/shop/FilterLayout';
import SortSelect from '../components/shop/SortSelect';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/ui/EmptyState';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState('newest');

  // A new query starts from a clean filter set.
  useEffect(() => {
    setFilters({ ...emptyFilters });
    setSort('newest');
  }, [query]);

  const matches = useMemo(() => searchCatalog(query).products, [query]);

  const results = useMemo(
    () => sortProducts(applyFilters(matches, filters), sort),
    [matches, filters, sort],
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
          {query ? (
            <p className="mt-2 text-[13px] text-muted">{toFa(results.length)} کالا پیدا شد</p>
          ) : (
            <p className="mt-2 text-[13px] text-muted">
              نام محصول، برند یا دسته‌بندی مورد نظرتان را جستجو کنید.
            </p>
          )}
        </div>

        {query && results.length > 0 ? (
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

      {matches.length === 0 ? (
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
      ) : (
        <FilterLayout filters={filters} onChange={setFilters} resultCount={results.length}>
          {results.length === 0 ? (
            <EmptyState
              icon={<SlidersHorizontal className="h-7 w-7" />}
              title="با این فیلترها کالایی پیدا نشد"
              text="فیلترها را تغییر دهید یا همه فیلترها را حذف کنید تا نتایج بیشتری ببینید."
              action={
                <button
                  type="button"
                  onClick={() => setFilters({ ...emptyFilters })}
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
      )}
    </div>
  );
}
