import { useState, type ReactNode } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { PRICE_CEILING, PRICE_FLOOR, emptyFilters, isFiltersDirty, type Filters } from '../../lib/filters';
import { toFa } from '../../lib/format';
import Price from '../ui/Price';

/** The size and colour options the catalogue actually has, derived from the products on screen. */
export type FilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string }[];
};

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  resultCount: number;
  options: FilterOptions;
};

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** One collapsible filter group: closed by default so the user opens only what is needed. */
function Group({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 py-2.5 text-start"
      >
        <span className="flex items-center gap-2 text-[13px] font-bold text-ink">
          {title}
          {badge ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-800 px-1 text-[10px] font-bold text-white">
              {toFa(badge)}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open ? <div className="pb-4 pt-1">{children}</div> : null}
    </section>
  );
}

/**
 * The filter rail. Every group here narrows the result set for real: the price and the sale flag
 * are asked of the API, while sizes and colours are matched against the product attributes the
 * catalogue published — and a group with no options behind it is not rendered at all.
 */
export default function FilterSidebar({ filters, onChange, resultCount, options }: Props) {
  const patch = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 border-b border-line pb-4">
        <p className="text-[13px] text-muted">
          <span className="font-bold text-ink">{toFa(resultCount)}</span> کالا
        </p>
        {isFiltersDirty(filters) ? (
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

      <Group title="محدوده قیمت" badge={filters.maxPrice < PRICE_CEILING ? 1 : 0}>
        <input
          type="range"
          min={PRICE_FLOOR}
          max={PRICE_CEILING}
          step={50000}
          value={filters.maxPrice}
          onChange={(e) => patch({ maxPrice: Number(e.target.value) })}
          aria-label="حداکثر قیمت"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-teal-800"
        />
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
          <span><Price value={PRICE_FLOOR} /></span>
          <span className="font-medium text-black">تا <Price value={filters.maxPrice} /></span>
        </div>
      </Group>

      {options.sizes.length > 0 ? (
        <Group title="سایز" badge={filters.sizes.length}>
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => {
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
        </Group>
      ) : null}

      {options.colors.length > 0 ? (
        <Group title="رنگ" badge={filters.colors.length}>
          <div className="flex flex-wrap gap-2">
            {options.colors.map((color) => {
              const active = filters.colors.includes(color.name);
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => patch({ colors: toggle(filters.colors, color.name) })}
                  aria-pressed={active}
                  className={`flex h-10 items-center gap-2 rounded-xl border px-2.5 text-[12px] font-medium transition-all ${
                    active
                      ? 'border-teal-800 bg-teal-50 text-black'
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
        </Group>
      ) : null}

      <Group title="فقط تخفیف‌دارها">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-cream px-3 py-3">
          <span className="text-[13px] font-medium text-ink">کالاهای تخفیف‌دار</span>
          <input
            type="checkbox"
            checked={filters.onlyDiscount}
            onChange={(e) => patch({ onlyDiscount: e.target.checked })}
            className="h-4 w-4 accent-teal-800"
          />
        </label>
      </Group>
    </div>
  );
}
