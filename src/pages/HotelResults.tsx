import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SearchSummaryBar } from '@/components/results/SearchSummaryBar';
import { SortBar } from '@/components/results/SortBar';
import { HotelFilterPanel, type HotelFilters } from '@/components/results/HotelFilterPanel';
import { ActiveFilterChip } from '@/components/results/FilterSection';
import { HotelCard } from '@/components/cards/HotelCard';
import { HotelSearchForm } from '@/components/search/HotelSearchForm';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StateBlock, EmptyResults, ErrorState } from '@/components/ui/StateBlocks';
import { HotelCardSkeleton } from '@/components/ui/Skeleton';
import { searchHotels, searchStays } from '@/services/api';
import { parseHotelQuery, readRequestOptions } from '@/lib/searchParams';
import { diffDays, faDigits, formatJalaliLong } from '@/lib/jalali';
import { HOTEL_FACILITIES } from '@/data/hotels';
import { formatNumber } from '@/lib/utils';
import type { Hotel } from '@/types';

type SortKey = 'cheapest' | 'best' | 'stars';

const SORT_OPTIONS: Array<{ key: SortKey; label: string; icon: string }> = [
  { key: 'best', label: 'بهترین پیشنهاد', icon: 'sparkle' },
  { key: 'cheapest', label: 'ارزان‌ترین', icon: 'tag' },
  { key: 'stars', label: 'بیشترین ستاره', icon: 'star' },
];

export default function HotelResults({ stayMode = false }: { stayMode?: boolean }) {
  const [searchParams] = useSearchParams();
  const query = useMemo(() => parseHotelQuery(searchParams), [searchParams]);
  const requestOptions = readRequestOptions(searchParams);
  const { cityName, cityCode, checkIn, checkOut, rooms, guests } = query;

  const nights = checkIn && checkOut ? Math.max(diffDays(checkOut, checkIn), 1) : 1;

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [sort, setSort] = useState<SortKey>('best');
  const [filters, setFilters] = useState<HotelFilters | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bounds = useMemo(() => {
    if (!hotels.length) return [0, 0] as [number, number];
    const prices = hotels.map((hotel) => hotel.pricePerNight);
    return [Math.min(...prices), Math.max(...prices)] as [number, number];
  }, [hotels]);

  const load = useCallback(() => {
    if (!cityName) {
      setStatus('ready');
      setHotels([]);
      return;
    }
    setStatus('loading');
    const request = stayMode
      ? searchStays(cityName, cityCode, { fail: requestOptions.fail })
      : searchHotels({ cityName, cityCode }, { fail: requestOptions.fail });

    request
      .then((result) => {
        setHotels(result);
        const prices = result.map((hotel) => hotel.pricePerNight);
        setFilters({
          price: [Math.min(...prices), Math.max(...prices)],
          stars: [],
          score: 0,
          facilities: [],
          freeCancel: false,
        });
        setStatus('ready');
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setStatus('error');
      });
  }, [cityName, cityCode, stayMode, requestOptions.fail]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!filters) return hotels;
    return hotels.filter((hotel) => {
      if (hotel.pricePerNight < filters.price[0] || hotel.pricePerNight > filters.price[1]) return false;
      if (filters.stars.length && !filters.stars.includes(hotel.stars)) return false;
      if (filters.score && hotel.score < filters.score) return false;
      if (filters.facilities.length && !filters.facilities.every((item) => hotel.facilities.includes(item))) return false;
      if (filters.freeCancel && !hotel.freeCancel) return false;
      return true;
    });
  }, [hotels, filters]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === 'cheapest') return list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sort === 'stars') return list.sort((a, b) => b.stars - a.stars || b.score - a.score);
    return list.sort((a, b) => b.score - a.score || a.pricePerNight - b.pricePerNight);
  }, [filtered, sort]);

  const resetFilters = () =>
    setFilters({ price: bounds, stars: [], score: 0, facilities: [], freeCancel: false });

  const activeFilterCount = filters
    ? filters.stars.length +
      filters.facilities.length +
      (filters.score ? 1 : 0) +
      (filters.freeCancel ? 1 : 0) +
      (filters.price[0] > bounds[0] || filters.price[1] < bounds[1] ? 1 : 0)
    : 0;

  if (!cityName) {
    return (
      <div className="container-page space-y-4 py-6">
        <Breadcrumbs items={[{ label: stayMode ? 'ویلا و اقامتگاه' : 'هتل', href: stayMode ? '/stays' : '/hotels' }, { label: 'نتایج جستجو' }]} />
        <StateBlock
          icon="hotel"
          title="مقصد و تاریخ اقامت را انتخاب کنید"
          description="برای دیدن هتل‌ها و اقامتگاه‌های موجود، نام شهر یا هتل را بنویسید و تاریخ ورود و خروج را مشخص کنید."
        />
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
          <div className="border-b border-ink-200 px-4 py-3">
            <p className="text-sm font-bold text-ink-900">جستجوی اقامتگاه</p>
          </div>
          <div className="p-4 sm:p-5">
            <HotelSearchForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page space-y-4 py-5 sm:py-6">
      <Breadcrumbs
        items={[
          { label: stayMode ? 'ویلا و اقامتگاه' : 'هتل', href: stayMode ? '/stays' : '/hotels' },
          { label: cityName },
        ]}
      />

      <SearchSummaryBar
        title={`${stayMode ? 'اقامتگاه‌ها' : 'هتل‌ها'} و اقامت در ${cityName}`}
        subtitle={
          checkIn && checkOut
            ? `${formatJalaliLong(checkIn)} تا ${formatJalaliLong(checkOut)} · ${faDigits(nights)} شب`
            : 'تاریخ اقامت انتخاب نشده است'
        }
        meta={[
          `${faDigits(rooms)} اتاق`,
          `${faDigits(guests)} مسافر`,
          ...(hotels.length ? [`شروع قیمت از ${formatNumber(bounds[0])} تومان`] : []),
        ]}
        editContent={<HotelSearchForm />}
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-4">
            {filters && (
              <HotelFilterPanel
                hotels={hotels}
                filters={filters}
                onChange={setFilters}
                priceBounds={bounds}
                onReset={resetFilters}
              />
            )}
          </div>
        </aside>

        <div className="space-y-3">
          <SortBar
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
            resultCount={sorted.length}
            countLabel={stayMode ? 'اقامتگاه یافت شد' : 'هتل یافت شد'}
            onOpenFilters={() => setDrawerOpen(true)}
            filterCount={activeFilterCount}
          />

          {filters && activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {filters.stars.map((star) => (
                <ActiveFilterChip
                  key={star}
                  label={`${faDigits(star)} ستاره`}
                  onRemove={() => setFilters({ ...filters, stars: filters.stars.filter((item) => item !== star) })}
                />
              ))}
              {filters.facilities.map((facility) => (
                <ActiveFilterChip
                  key={facility}
                  label={HOTEL_FACILITIES[facility] ?? facility}
                  onRemove={() =>
                    setFilters({ ...filters, facilities: filters.facilities.filter((item) => item !== facility) })
                  }
                />
              ))}
              {filters.score > 0 && (
                <ActiveFilterChip
                  label={`امتیاز +${faDigits(filters.score)}`}
                  onRemove={() => setFilters({ ...filters, score: 0 })}
                />
              )}
              {filters.freeCancel && (
                <ActiveFilterChip label="لغو رایگان" onRemove={() => setFilters({ ...filters, freeCancel: false })} />
              )}
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <HotelCardSkeleton key={index} />
              ))}
            </div>
          )}

          {status === 'error' && <ErrorState message={errorMessage} onRetry={load} />}

          {status === 'ready' && sorted.length === 0 && (
            hotels.length === 0 ? (
              <StateBlock
                icon="hotel"
                title="اقامتگاهی در این مقصد پیدا نشد"
                description="نام مقصد دیگری را امتحان کنید یا تاریخ اقامت را تغییر دهید. پشتیبانی سفربان می‌تواند اقامتگاه‌های تازه‌افزوده را برای شما بررسی کند."
                action={
                  <Button variant="secondary" onClick={load} icon={<Icon name="refresh" className="h-4 w-4" />}>
                    تلاش دوباره
                  </Button>
                }
              />
            ) : (
              <EmptyResults onReset={resetFilters} />
            )
          )}

          {status === 'ready' && (
            <div className="space-y-3">
              {sorted.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  nights={nights}
                  queryString={searchParams.toString()}
                />
              ))}
            </div>
          )}

          {status === 'ready' && sorted.length > 0 && (
            <p className="num rounded-xl border border-ink-200 bg-white px-4 py-3 text-2xs text-ink-500">
              نمایش {faDigits(sorted.length)} اقامتگاه · قیمت‌ها برای {faDigits(nights)} شب اقامت محاسبه شده است
            </p>
          )}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="bottom"
        title="فیلتر اقامتگاه‌ها"
        footer={
          <Button block size="lg" onClick={() => setDrawerOpen(false)}>
            نمایش {faDigits(sorted.length)} اقامتگاه
          </Button>
        }
      >
        {filters && (
          <HotelFilterPanel
            hotels={hotels}
            filters={filters}
            onChange={setFilters}
            priceBounds={bounds}
            onReset={resetFilters}
          />
        )}
      </Drawer>
    </div>
  );
}
