import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchX, Sparkles } from 'lucide-react';
import { categories, products } from '../lib/data';
import { toFa } from '../lib/format';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/ui/EmptyState';

/** Normalises Persian/Arabic glyph variants so search matches either spelling. */
const normalise = (value: string): string =>
  value
    .replace(/[\u200c\u200f\u200e]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const SUGGESTIONS = ['کت جین', 'مانتو کتان', 'کتانی کلاسیک', 'کیف دستی', 'عینک آفتابی', 'هودی'];

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const term = normalise(query);

  const results = useMemo(() => {
    if (!term) return [];
    return products.filter((product) => {
      const categoryTitle =
        categories.find((c) => c.id === product.category)?.title ?? '';
      const haystack = normalise(
        [product.name, product.brand, product.description, categoryTitle].join(' '),
      );
      return term.split(' ').every((word) => haystack.includes(word));
    });
  }, [term]);

  return (
    <div className="container py-8 sm:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <span>/</span>
        <span className="font-medium text-ink">جستجو</span>
      </nav>

      <header className="mb-7">
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
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
          <Sparkles className="h-3.5 w-3.5 text-black" />
          جستجوهای پیشنهادی:
        </span>
        {SUGGESTIONS.map((item) => (
          <Link
            key={item}
            to={`/search?q=${encodeURIComponent(item)}`}
            className="rounded-xl border border-line bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-teal-300 hover:text-black"
          >
            {item}
          </Link>
        ))}
      </div>

      {results.length > 0 ? (
        <ProductGrid products={results} />
      ) : (
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
      )}
    </div>
  );
}
