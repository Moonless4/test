import { useEffect, useMemo, useRef, useState } from 'react';
import { Popover } from './Popover';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';
import { CITIES, POPULAR_CITIES } from '@/data/cities';
import type { City } from '@/types';

interface CityFieldProps {
  value: City | null;
  onChange: (city: City) => void;
  label: string;
  placeholder: string;
  className?: string;
  error?: boolean;
  /** جلوگیری از انتخاب شهری مشخص (مثلاً مقصد برابر مبدا) */
  blockedCode?: string | null;
}

/** جستجوی شهر مبدا/مقصد با ترکیب فهرست ایران و خارجی */
export function CityField({
  value,
  onChange,
  label,
  placeholder,
  className,
  error,
  blockedCode,
}: CityFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return { domestic: CITIES.filter((c) => c.isDomestic), international: CITIES.filter((c) => !c.isDomestic) };
    const match = (city: City) =>
      city.name.includes(q) ||
      city.nameEn.toLowerCase().includes(q.toLowerCase()) ||
      city.code.toLowerCase().includes(q.toLowerCase()) ||
      city.countryName.includes(q);
    const list = CITIES.filter(match);
    return {
      domestic: list.filter((c) => c.isDomestic),
      international: list.filter((c) => !c.isDomestic),
    };
  }, [query]);

  const flat = useMemo(
    () => [...results.domestic, ...results.international].filter((c) => c.code !== blockedCode),
    [results, blockedCode],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  const select = (city: City) => {
    if (city.code === blockedCode) return;
    onChange(city);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, flat.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const city = flat[activeIndex];
      if (city) select(city);
    }
  };

  const renderGroup = (title: string, list: City[]) => {
    if (!list.length) return null;
    return (
      <div className="mb-2 last:mb-0">
        <p className="px-2 pb-1 pt-2 text-2xs font-medium text-ink-400">{title}</p>
        <ul>
          {list.map((city) => {
            const isBlocked = city.code === blockedCode;
            const index = flat.findIndex((c) => c.code === city.code);
            return (
              <li key={city.code}>
                <button
                  type="button"
                  disabled={isBlocked}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(city)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-start transition',
                    isBlocked
                      ? 'cursor-not-allowed opacity-40'
                      : index === activeIndex
                        ? 'bg-brand-50'
                        : 'hover:bg-ink-50',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-9 items-center justify-center rounded-md bg-ink-100 text-2xs font-semibold text-ink-600">
                      {city.code}
                    </span>
                    <span>
                      <span className="block text-sm text-ink-800">{city.name}</span>
                      <span className="block text-2xs text-ink-400">
                        {city.countryName} · {city.nameEn}
                      </span>
                    </span>
                  </span>
                  {value?.code === city.code && <Icon name="check" className="h-4 w-4 text-brand-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      className={cn('w-full', className)}
      panelClassName="w-[360px] p-2"
      trigger={
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn('field-shell text-start', error && 'field-shell-error', open && 'border-brand-500 ring-2 ring-brand-500/15')}
        >
          <Icon name="map-pin" className="h-5 w-5 shrink-0 text-ink-400" />
          <span className="min-w-0 flex-1">
            <span className="block text-2xs text-ink-500">{label}</span>
            <span
              className={cn('block truncate text-sm font-medium', value ? 'text-ink-900' : 'text-ink-400')}
            >
              {value ? `${value.name} (${value.code})` : placeholder}
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
            onKeyDown={handleKeyDown}
            placeholder="نام شهر، کشور یا کد فرودگاه"
            className="h-9 w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="پاک کردن" className="text-ink-400 hover:text-ink-600">
              <Icon name="close" className="h-4 w-4" />
            </button>
          )}
        </div>

        {!query && (
          <div className="flex flex-wrap gap-1.5 px-2 pt-3">
            {POPULAR_CITIES.slice(0, 6).map((city) => (
              <button
                key={city.code}
                type="button"
                onClick={() => select(city)}
                className="rounded-md border border-ink-200 px-2 py-1 text-2xs text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {city.name}
              </button>
            ))}
          </div>
        )}

        <div className="max-h-[320px] overflow-y-auto px-1 pt-1">
          {flat.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ink-500">شهری با این نام پیدا نشد.</p>
          ) : (
            <>
              {renderGroup('ایران', results.domestic)}
              {renderGroup('خارجی', results.international)}
            </>
          )}
        </div>
      </div>
    </Popover>
  );
}
