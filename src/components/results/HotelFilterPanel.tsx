import { CheckboxRow, RangeSlider } from '@/components/ui/RangeSlider';
import { FilterSection } from './FilterSection';
import { HOTEL_FACILITIES } from '@/data/hotels';
import { FACILITY_ICONS, Icon } from '@/components/ui/Icon';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber } from '@/lib/utils';
import type { Hotel } from '@/types';

export interface HotelFilters {
  price: [number, number];
  stars: number[];
  score: number;
  facilities: string[];
  freeCancel: boolean;
}

interface HotelFilterPanelProps {
  hotels: Hotel[];
  filters: HotelFilters;
  onChange: (filters: HotelFilters) => void;
  priceBounds: [number, number];
  onReset: () => void;
}

export function HotelFilterPanel({
  hotels,
  filters,
  onChange,
  priceBounds,
  onReset,
}: HotelFilterPanelProps) {
  const set = <K extends keyof HotelFilters>(key: K, value: HotelFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const toggleIn = (key: 'stars' | 'facilities', value: string | number) => {
    const list = filters[key] as Array<string | number>;
    const next = list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
    onChange({ ...filters, [key]: next as never });
  };

  const starsAvailable = Array.from(new Set(hotels.map((hotel) => hotel.stars))).sort((a, b) => b - a);
  const facilitiesAvailable = Array.from(new Set(hotels.flatMap((hotel) => hotel.facilities)));

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <p className="flex items-center gap-1.5 text-xs font-bold text-ink-800">
          <Icon name="filter" className="h-4 w-4 text-brand-600" />
          فیلترها
        </p>
        <button type="button" onClick={onReset} className="text-2xs font-medium text-brand-700 hover:text-brand-800">
          حذف همه
        </button>
      </div>

      <FilterSection
        title="محدوده قیمت هر شب"
        badge={`از ${formatNumber(filters.price[0])} تا ${formatNumber(filters.price[1])}`}
      >
        <RangeSlider
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={100000}
          value={filters.price}
          onChange={(value) => set('price', value)}
        />
      </FilterSection>

      <FilterSection title="ستاره هتل">
        <div className="flex flex-wrap gap-2">
          {starsAvailable.map((star) => {
            const active = filters.stars.includes(star);
            return (
              <button
                key={star}
                type="button"
                onClick={() => toggleIn('stars', star)}
                className={cn(
                  'num flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-2xs transition',
                  active ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300',
                )}
              >
                {faDigits(star)}
                <Icon name="star" filled size={11} className={active ? 'text-accent-500' : 'text-ink-300'} />
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="امتیاز مسافران" badge={`از ${faDigits(filters.score)} به بالا`}>
        <div className="flex gap-2">
          {[7, 8, 8.5, 9].map((score) => {
            const active = filters.score === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => set('score', score)}
                className={cn(
                  'num flex-1 rounded-lg border py-2 text-2xs transition',
                  active ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300',
                )}
              >
                +{faDigits(score)}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="امکانات" defaultOpen={false}>
        <div className="space-y-0.5">
          {facilitiesAvailable.map((facility) => (
            <label key={facility} className="flex cursor-pointer items-center gap-2.5 py-1.5">
              <input
                type="checkbox"
                checked={filters.facilities.includes(facility)}
                onChange={() => toggleIn('facilities', facility)}
                className="h-4 w-4 rounded border-ink-300 accent-brand-600"
              />
              <Icon
                name={FACILITY_ICONS[facility] ?? 'check'}
                className="h-4 w-4 text-ink-400"
              />
              <span className="text-xs text-ink-700">{HOTEL_FACILITIES[facility]}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="شرایط رزرو" defaultOpen={false}>
        <CheckboxRow
          label="فقط اقامتگاه‌های با لغو رایگان"
          checked={filters.freeCancel}
          onChange={(checked) => set('freeCancel', checked)}
        />
      </FilterSection>
    </div>
  );
}
