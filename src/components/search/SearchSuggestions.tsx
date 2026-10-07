import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { MIN_QUERY, searchCatalog } from '../../lib/search';
import { toFa } from '../../lib/format';
import Img from '../ui/Img';
import PriceDisplay from '../ui/PriceDisplay';

const MAX_PRODUCTS = 5;
const MAX_CATEGORIES = 3;

type Props = {
  query: string;
  /** Runs once a suggestion is opened, so the caller can close its dropdown or drawer. */
  onSelect: () => void;
};

/** Live product and category matches for what is typed into a search field. */
export default function SearchSuggestions({ query, onSelect }: Props) {
  const term = query.trim();
  if (term.length < MIN_QUERY) return null;

  const { products, categories } = searchCatalog(term);
  const items = products.slice(0, MAX_PRODUCTS);
  const cats = categories.slice(0, MAX_CATEGORIES);

  if (items.length === 0 && cats.length === 0) {
    return (
      <p className="flex items-center gap-2 px-4 py-4 text-[12.5px] text-muted">
        <SearchX className="h-4 w-4 shrink-0" />
        چیزی برای «{term}» پیدا نشد.
      </p>
    );
  }

  return (
    <div className="py-1.5">
      {items.length > 0 ? (
        <section aria-label="محصولات">
          <h3 className="px-4 pb-1 pt-2.5 text-[11px] font-medium text-muted">محصولات</h3>
          <ul>
            {items.map((product) => (
              <li key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  onClick={onSelect}
                  className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-cream"
                >
                  <Img
                    src={product.images[0]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-11 w-11 shrink-0 rounded-lg bg-cream object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">
                      {product.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted">
                      {product.brand}
                    </span>
                  </span>
                  <PriceDisplay
                    price={product.price}
                    originalPrice={product.originalPrice}
                    size="sm"
                    align="end"
                    className="shrink-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {cats.length > 0 ? (
        <section aria-label="دسته‌بندی‌ها">
          <h3 className="px-4 pb-1 pt-3 text-[11px] font-medium text-muted">دسته‌بندی‌ها</h3>
          <ul>
            {cats.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/shop/${category.id}`}
                  onClick={onSelect}
                  className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-cream"
                >
                  <Img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-11 w-11 shrink-0 rounded-lg bg-cream object-cover"
                  />
                  <span className="flex-1 text-[13px] font-medium text-ink">
                    {category.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">
                    {toFa(category.itemCount)} کالا
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        to={`/search?q=${encodeURIComponent(term)}`}
        onClick={onSelect}
        className="mt-1.5 flex items-center justify-between border-t border-line px-4 py-3 text-[12.5px] font-medium text-black transition-colors hover:bg-cream"
      >
        مشاهده همه نتایج برای «{term}»
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}
