import { useMemo, useRef, useState } from 'react';
import { Popover } from '@/components/ui/Popover';
import { Icon } from '@/components/ui/Icon';
import { CITIES } from '@/data/cities';
import { HOTELS } from '@/data/hotels';
import { cn } from '@/lib/utils';

export interface HotelDestination {
  label: string;
  cityCode: string;
}

interface HotelDestinationFieldProps {
  value: HotelDestination;
  onChange: (value: HotelDestination) => void;
  error?: boolean;
}

/** فیلد «مقصد یا نام هتل» با پیشنهاد شهرها و هتل‌ها */
export function HotelDestinationField({ value, onChange, error }: HotelDestinationFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) {
      return { cities: CITIES.filter((c) => c.popular).slice(0, 6), hotels: HOTELS.filter((h) => h.popular).slice(0, 4) };
    }
    return {
      cities: CITIES.filter((c) => c.name.includes(q) || c.nameEn.toLowerCase().includes(q.toLowerCase())).slice(0, 6),
      hotels: HOTELS.filter((h) => h.name.includes(q)).slice(0, 6),
    };
  }, [query]);

  const commit = (next: HotelDestination) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      className="w-full"
      panelClassName="w-[380px] p-2"
      trigger={
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn('field-shell text-start', error && 'field-shell-error', open && 'border-brand-500 ring-2 ring-brand-500/15')}
        >
          <Icon name="map-pin" className="h-5 w-5 shrink-0 text-ink-400" />
          <span className="min-w-0 flex-1">
            <span className="block text-2xs text-ink-500">مقصد یا نام هتل</span>
            <span className={cn('block truncate text-sm font-medium', value.label ? 'text-ink-900' : 'text-ink-400')}>
              {value.label || 'شهر، منطقه یا نام هتل'}
            </span>
          </span>
          <Icon name="chevron-down" className={cn('h-4 w-4 shrink-0 text-ink-400 transition', open && 'rotate-180')} />
        </button>
      }
    >
      <div>
        <div className="flex items-center gap-2 border-b border-ink-100 px-2 pb-2">
          <Icon name="search" className="h-4 w-4 text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && query.trim().length >= 2) {
                event.preventDefault();
                commit({ label: query.trim(), cityCode: '' });
              }
            }}
            placeholder="نام شهر یا هتل را بنویسید"
            className="h-9 w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-[330px] overflow-y-auto px-1 pt-1">
          {suggestions.cities.length > 0 && (
            <>
              <p className="px-2 pb-1 pt-2 text-2xs font-medium text-ink-400">شهرها و مقاصد</p>
              <ul>
                {suggestions.cities.map((city) => (
                  <li key={city.code}>
                    <button
                      type="button"
                      onClick={() => commit({ label: `${city.name}، ${city.countryName}`, cityCode: city.code })}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start transition hover:bg-ink-50"
                    >
                      <span className="flex h-7 w-9 items-center justify-center rounded-md bg-ink-100 text-2xs font-semibold text-ink-600">
                        {city.code}
                      </span>
                      <span className="text-sm text-ink-800">{city.name}</span>
                      <span className="text-2xs text-ink-400">{city.countryName}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {suggestions.hotels.length > 0 && (
            <>
              <p className="px-2 pb-1 pt-3 text-2xs font-medium text-ink-400">هتل‌ها</p>
              <ul>
                {suggestions.hotels.map((hotel) => (
                  <li key={hotel.id}>
                    <button
                      type="button"
                      onClick={() =>
                        commit({ label: hotel.name, cityCode: hotel.cityCode })
                      }
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-start transition hover:bg-ink-50"
                    >
                      <span>
                        <span className="block text-sm text-ink-800">{hotel.name}</span>
                        <span className="block text-2xs text-ink-400">
                          {hotel.cityName} · {hotel.stars} ستاره
                        </span>
                      </span>
                      <Icon name="hotel" className="h-4 w-4 text-ink-300" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {suggestions.cities.length === 0 && suggestions.hotels.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-500">
              موردی پیدا نشد. نام شهر را کامل بنویسید.
            </p>
          )}
        </div>
      </div>
    </Popover>
  );
}
