import { RotateCcw } from 'lucide-react';
import { allBrands, allColors, allSizes } from '../../lib/data';
import { formatPrice, toFa } from '../../lib/format';

export type Filters = {
  sizes: string[];
  colors: string[];
  brands: string[];
  onlyDiscount: boolean;
  minRating: number;
  maxPrice: number;
};

export const PRICE_CEILING = 5000000;

export const emptyFilters: Filters = {
  sizes: [],
  colors: [],
  brands: [],
  onlyDiscount: false,
  minRating: 0,
  maxPrice: PRICE_CEILING,
};

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  resultCount: number;
};

const RATINGS = [4.5, 4, 3.5, 3];

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterSidebar({ filters, onChange, resultCount }: Props) {
  const patch = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  const isDirty =
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.brands.length > 0 ||
    filters.onlyDiscount ||
    filters.minRating > 0 ||
    filters.maxPrice < PRICE_CEILING;

  const groupTitle = 'mb-3 text-[13px] font-bold text-ink';

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted">
          <span className="font-bold text-ink">{toFa(resultCount)}</span> کالا
        </p>
        {isDirty ? (
          <button
            type="button"
            onClick={() => onChange({ ...emptyFilters })}
            className="flex items-center gap-1.5 text-[12px] font-medium text-sale transition-colors hover:text-sale/80"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            حذف فیلترها
          </button>
        ) : null}
      </div>

      <section>
        <h3 className={groupTitle}>محدوده قیمت</h3>
        <input
          type="range"
          min={200000}
          max={PRICE_CEILING}
          step={50000}
          value={filters.maxPrice}
          onChange={(e) => patch({ maxPrice: Number(e.target.value) })}
          aria-label="حداکثر قیمت"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-teal-800"
        />
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
          <span>{formatPrice(200000)}</span>
          <span className="font-medium text-teal-800">تا {formatPrice(filters.maxPrice)}</span>
        </div>
      </section>

      <section>
        <h3 className={groupTitle}>سایز</h3>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => patch({ sizes: toggle(filters.sizes, size) })}
                aria-pressed={active}
                className={`h-10 min-w-11 rounded-xl border px-3 text-[13px] font-medium transition-all ${
                  active
                    ? 'border-teal-800 bg-teal-800 text-white'
                    : 'border-line bg-white text-ink hover:border-teal-300'
                }`}
              >
                {toFa(size)}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className={groupTitle}>رنگ</h3>
        <div className="flex flex-wrap gap-2">
          {allColors.map((color) => {
            const active = filters.colors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => patch({ colors: toggle(filters.colors, color.name) })}
                aria-pressed={active}
                className={`flex h-10 items-center gap-2 rounded-xl border px-2.5 text-[12px] font-medium transition-all ${
                  active
                    ? 'border-teal-800 bg-teal-50 text-teal-900'
                    : 'border-line bg-white text-ink hover:border-teal-300'
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className={groupTitle}>برند</h3>
        <div className="space-y-1">
          {allBrands.map((brand) => (
            <label
              key={brand}
              className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-[13px] text-ink transition-colors hover:bg-cream"
            >
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => patch({ brands: toggle(filters.brands, brand) })}
                className="h-4 w-4 rounded border-line accent-teal-800"
              />
              <span dir="ltr">{brand}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className={groupTitle}>امتیاز</h3>
        <div className="space-y-1">
          {RATINGS.map((rating) => (
            <label
              key={rating}
              className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-[13px] text-ink transition-colors hover:bg-cream"
            >
              <input
                type="radio"
                name="rating-filter"
                checked={filters.minRating === rating}
                onChange={() => patch({ minRating: rating })}
                className="h-4 w-4 border-line accent-teal-800"
              />
              بالای {toFa(rating)} ستاره
            </label>
          ))}
          <button
            type="button"
            onClick={() => patch({ minRating: 0 })}
            className="px-1 pt-1 text-[12px] text-muted transition-colors hover:text-teal-800"
          >
            بدون محدودیت امتیاز
          </button>
        </div>
      </section>

      <section className="rounded-panel border border-line bg-cream p-4">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-ink">فقط کالاهای تخفیف‌دار</span>
          <input
            type="checkbox"
            checked={filters.onlyDiscount}
            onChange={(e) => patch({ onlyDiscount: e.target.checked })}
            className="h-4 w-4 accent-teal-800"
          />
        </label>
      </section>
    </div>
  );
}
