import { CheckboxRow, RangeSlider } from '@/components/ui/RangeSlider';
import { FilterSection } from './FilterSection';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber } from '@/lib/utils';
import type { Flight, FareType } from '@/types';

export interface FlightFilters {
  price: [number, number];
  airlines: string[];
  slots: string[];
  maxDuration: number;
  fareTypes: FareType[];
  stops: number[];
}

export const TIME_SLOTS = [
  { key: 'dawn', label: 'بامداد', hint: '۰۰ تا ۰۶' },
  { key: 'morning', label: 'صبح', hint: '۰۶ تا ۱۲' },
  { key: 'afternoon', label: 'بعدازظهر', hint: '۱۲ تا ۱۸' },
  { key: 'evening', label: 'شب', hint: '۱۸ تا ۲۴' },
];

export function slotOf(minutes: number): string {
  if (minutes < 360) return 'dawn';
  if (minutes < 720) return 'morning';
  if (minutes < 1080) return 'afternoon';
  return 'evening';
}

interface FlightFilterPanelProps {
  flights: Flight[];
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
  priceBounds: [number, number];
  durationBounds: [number, number];
  onReset: () => void;
}

export function FlightFilterPanel({
  flights,
  filters,
  onChange,
  priceBounds,
  durationBounds,
  onReset,
}: FlightFilterPanelProps) {
  const set = <K extends keyof FlightFilters>(key: K, value: FlightFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const toggle = <K extends 'airlines' | 'slots' | 'stops' | 'fareTypes'>(
    key: K,
    value: FlightFilters[K][number],
  ) => {
    const list = filters[key] as Array<string | number>;
    const next = list.includes(value as never)
      ? list.filter((item) => item !== value)
      : [...list, value as never];
    onChange({ ...filters, [key]: next });
  };

  const airlineCounts = flights.reduce<Record<string, number>>((acc, flight) => {
    acc[flight.airline.code] = (acc[flight.airline.code] ?? 0) + 1;
    return acc;
  }, {});

  const airlineList = Object.keys(airlineCounts)
    .map((code) => {
      const flight = flights.find((item) => item.airline.code === code)!;
      return { code, name: flight.airline.name, short: flight.airline.short, color: flight.airline.color };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fa'));

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <p className="flex items-center gap-1.5 text-xs font-bold text-ink-800">
          <FilterIcon />
          فیلترها
        </p>
        <button type="button" onClick={onReset} className="text-2xs font-medium text-brand-700 hover:text-brand-800">
          حذف همه
        </button>
      </div>

      <FilterSection
        title="محدوده قیمت"
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

      <FilterSection title="ایرلاین" badge={filters.airlines.length ? `${faDigits(filters.airlines.length)} مورد` : undefined}>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pe-1">
          {airlineList.map((airline) => (
            <label key={airline.code} className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
              <span className="flex min-w-0 items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.airlines.includes(airline.code)}
                  onChange={() => toggle('airlines', airline.code)}
                  className="h-4 w-4 shrink-0 rounded border-ink-300 accent-brand-600"
                />
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[0.55rem] font-bold text-white"
                  style={{ backgroundColor: airline.color }}
                >
                  {airline.short}
                </span>
                <span className="truncate text-xs text-ink-700">{airline.name}</span>
              </span>
              <span className="num shrink-0 text-2xs text-ink-400">{faDigits(airlineCounts[airline.code])}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="ساعت حرکت">
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot) => {
            const active = filters.slots.includes(slot.key);
            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => toggle('slots', slot.key)}
                className={cn(
                  'rounded-lg border px-2.5 py-2 text-start transition',
                  active ? 'border-brand-400 bg-brand-50' : 'border-ink-200 hover:border-ink-300',
                )}
              >
                <span className={cn('block text-2xs font-medium', active ? 'text-brand-700' : 'text-ink-700')}>
                  {slot.label}
                </span>
                <span className="num mt-0.5 block text-[0.6rem] text-ink-400">{slot.hint}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="مدت سفر" badge={`تا ${faDigits(Math.round(filters.maxDuration / 60))} ساعت`}>
        <RangeSlider
          min={durationBounds[0]}
          max={durationBounds[1]}
          step={15}
          value={[durationBounds[0], filters.maxDuration]}
          onChange={(value) => set('maxDuration', value[1])}
          unit="دقیقه"
        />
      </FilterSection>

      <FilterSection title="نوع بلیط">
        <CheckboxRow
          label="سیستمی"
          hint="قابل استرداد"
          checked={filters.fareTypes.includes('system')}
          onChange={() => toggle('fareTypes', 'system')}
        />
        <CheckboxRow
          label="چارتر"
          hint="قیمت مناسب‌تر"
          checked={filters.fareTypes.includes('charter')}
          onChange={() => toggle('fareTypes', 'charter')}
        />
      </FilterSection>

      <FilterSection title="تعداد توقف">
        {[0, 1, 2].map((stop) => (
          <CheckboxRow
            key={stop}
            label={stop === 0 ? 'بدون توقف (مستقیم)' : `${faDigits(stop)} توقف`}
            checked={filters.stops.includes(stop)}
            onChange={() => toggle('stops', stop)}
          />
        ))}
      </FilterSection>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
    </svg>
  );
}
