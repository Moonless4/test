import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, PlusCircle, Search, SearchX, Sparkles } from 'lucide-react';
import { matchesTerm, POPULAR_SEARCHES } from '../../lib/search';
import { MIN_QUERY } from '../../services/search';
import { useCategories, useProductSuggestions } from '../../hooks/useCatalog';
import { useDragScroll } from '../../hooks/useDragScroll';
import Img from '../ui/Img';

const MAX_PRODUCTS = 8;
const MAX_CATEGORIES = 4;

type Props = {
  query: string;
  /** Runs once a suggestion is opened, so the caller can close its dropdown or drawer. */
  onSelect: () => void;
};

const heading = 'flex items-center gap-1.5 px-4 pb-1.5 pt-3 text-[12.5px] font-bold text-ink';

/**
 * Live search overlay: matching categories, matching products straight from the API's search, and
 * the shop's popular searches. The products are the API's own answer to the typed term, so a
 * suggestion can never point at something the catalogue does not have.
 */
export default function SearchSuggestions({ query, onSelect }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const railDrag = useDragScroll(railRef);

  const term = query.trim();
  const { data: categories } = useCategories();
  const { data: products, loading, error } = useProductSuggestions(term, MAX_PRODUCTS);

  if (term.length < MIN_QUERY) return null;

  const items = products ?? [];
  const matchedCategories = (categories ?? [])
    .filter((category) => matchesTerm(category.title, term))
    .slice(0, MAX_CATEGORIES);
  const searching = loading && items.length === 0;

  if (error) {
    return (
      <p className="px-4 py-4 text-[12.5px] text-muted">
        {error.message}
      </p>
    );
  }

  if (searching) {
    return (
      <p className="flex items-center gap-2 px-4 py-4 text-[12.5px] text-muted">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        در حال جستجو…
      </p>
    );
  }

  if (items.length === 0 && matchedCategories.length === 0) {
    return (
      <p className="flex items-center gap-2 px-4 py-4 text-[12.5px] text-muted">
        <SearchX className="h-4 w-4 shrink-0" />
        چیزی برای «{term}» پیدا نشد.
      </p>
    );
  }

  return (
    <div className="pb-1.5">
      {matchedCategories.length > 0 ? (
        <section aria-label="دسته‌بندی‌های مرتبط">
          <h3 className={heading}>
            <Search className="h-4 w-4 shrink-0 text-ink" />
            دسته‌بندی‌ها
          </h3>
          <ul>
            {matchedCategories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/shop/${category.id}`}
                  onClick={onSelect}
                  className="block px-4 py-2.5 text-[13px] text-ink transition-colors hover:bg-cream"
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {items.length > 0 ? (
        <section aria-label="محصولات مرتبط" className="mt-1 border-t border-line pt-1">
          <h3 className={heading}>
            <PlusCircle className="h-4 w-4 shrink-0 text-ink" />
            محصولات مرتبط
          </h3>
          <div
            ref={railRef}
            {...railDrag}
            className="no-scrollbar flex cursor-grab select-none overflow-x-auto px-4 pb-2 active:cursor-grabbing [&_a]:cursor-grab [&>*:not(:first-child)]:border-s [&>*:not(:first-child)]:border-line [&>*:not(:first-child)]:ps-4"
          >
            {items.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                onClick={onSelect}
                className="flex w-[232px] shrink-0 items-center gap-3 pe-4 transition-opacity hover:opacity-80"
              >
                <span className="line-clamp-2 flex-1 text-[12.5px] leading-5 text-ink">
                  {product.name}
                </span>
                <Img
                  src={product.images[0]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 shrink-0 rounded-lg bg-cream object-cover"
                />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="جستجوهای پرطرفدار" className="border-t border-line pt-1">
        <h3 className={heading}>
          <Sparkles className="h-4 w-4 shrink-0 text-ink" />
          جستجوهای پرطرفدار:
        </h3>
        <div className="flex flex-wrap gap-2 px-4 pb-3 pt-0.5">
          {POPULAR_SEARCHES.map((item) => (
            <Link
              key={item}
              to={`/search?q=${encodeURIComponent(item)}`}
              onClick={onSelect}
              className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-teal-300 hover:text-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {item}
            </Link>
          ))}
        </div>
      </section>

      <Link
        to={`/search?q=${encodeURIComponent(term)}`}
        onClick={onSelect}
        className="flex items-center justify-between border-t border-line px-4 py-3 text-[12.5px] font-medium text-black transition-colors hover:bg-cream"
      >
        مشاهده همه نتایج برای «{term}»
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}
