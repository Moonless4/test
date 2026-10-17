import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SearchSummaryBar, passengersLabel } from '@/components/results/SearchSummaryBar';
import { SortBar } from '@/components/results/SortBar';
import { FlightFilterPanel, slotOf, type FlightFilters } from '@/components/results/FlightFilterPanel';
import { ActiveFilterChip } from '@/components/results/FilterSection';
import { FlightCard } from '@/components/cards/FlightCard';
import { FlightSearchForm } from '@/components/search/FlightSearchForm';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StateBlock, EmptyResults, ErrorState } from '@/components/ui/StateBlocks';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { searchFlights } from '@/services/api';
import { parseFlightQuery, readRequestOptions } from '@/lib/searchParams';
import { formatJalaliWithWeekday, faDigits } from '@/lib/jalali';
import { formatDuration, formatNumber } from '@/lib/utils';
import type { Flight } from '@/types';

type SortKey = 'cheapest' | 'fastest' | 'best';

const SORT_OPTIONS: Array<{ key: SortKey; label: string; icon: string }> = [
  { key: 'cheapest', label: 'ارزان‌ترین', icon: 'tag' },
  { key: 'fastest', label: 'سریع‌ترین', icon: 'bolt' },
  { key: 'best', label: 'بهترین پیشنهاد', icon: 'sparkle' },
];

export default function FlightResults() {
  const [searchParams] = useSearchParams();
  const query = useMemo(() => parseFlightQuery(searchParams), [searchParams]);
  const requestOptions = readRequestOptions(searchParams);

  const { origin, destination, departDate, returnDate, tripType, passengers, cabin } = query;
  const passengerCount = passengers.adults + passengers.children;

  const [flights, setFlights] = useState<Flight[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [sort, setSort] = useState<SortKey>('best');
  const [filters, setFilters] = useState<FlightFilters | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'outbound' | 'return'>('outbound');

  const bounds = useMemo(() => {
    if (!flights.length) return { price: [0, 0] as [number, number], duration: [0, 0] as [number, number] };
    const prices = flights.map((flight) => flight.price);
    const durations = flights.map((flight) => flight.durationMinutes);
    return {
      price: [Math.min(...prices), Math.max(...prices)] as [number, number],
      duration: [Math.min(...durations), Math.max(...durations)] as [number, number],
    };
  }, [flights]);

  const load = useCallback(() => {
    if (!origin || !destination || !departDate) {
      setStatus('ready');
      setFlights([]);
      return;
    }
    setStatus('loading');
    searchFlights(
      {
        origin,
        destination,
        date: departDate,
        tripType,
        cabin,
        passengers: passengerCount,
      },
      { fail: requestOptions.fail },
    )
      .then((result) => {
        setFlights(result);
        const prices = result.map((flight) => flight.price);
        const durations = result.map((flight) => flight.durationMinutes);
        setFilters({
          price: [Math.min(...prices), Math.max(...prices)],
          airlines: [],
          slots: [],
          maxDuration: Math.max(...durations),
          fareTypes: [],
          stops: [],
        });
        setStatus('ready');
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setStatus('error');
      });
  }, [origin, destination, departDate, tripType, cabin, passengerCount, requestOptions.fail]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!filters) return flights;
    return flights.filter((flight) => {
      if (flight.price < filters.price[0] || flight.price > filters.price[1]) return false;
      if (filters.airlines.length && !filters.airlines.includes(flight.airline.code)) return false;
      if (filters.slots.length && !filters.slots.includes(slotOf(flight.departMinutes))) return false;
      if (flight.durationMinutes > filters.maxDuration) return false;
      if (filters.fareTypes.length && !filters.fareTypes.includes(flight.fareType)) return false;
      if (filters.stops.length && !filters.stops.includes(flight.stops)) return false;
      return true;
    });
  }, [flights, filters]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === 'cheapest') return list.sort((a, b) => a.price - b.price);
    if (sort === 'fastest') return list.sort((a, b) => a.durationMinutes - b.durationMinutes);
    const priceRange = Math.max(...list.map((f) => f.price), 1) - Math.min(...list.map((f) => f.price), 0) || 1;
    const durationRange = Math.max(...list.map((f) => f.durationMinutes), 1);
    return list.sort((a, b) => {
      const scoreA = (a.price / priceRange) * 0.62 + (a.durationMinutes / durationRange) * 0.3 + a.stops * 0.08;
      const scoreB = (b.price / priceRange) * 0.62 + (b.durationMinutes / durationRange) * 0.3 + b.stops * 0.08;
      return scoreA - scoreB;
    });
  }, [filtered, sort]);

  const activeFilterCount = filters
    ? filters.airlines.length +
      filters.slots.length +
      filters.fareTypes.length +
      filters.stops.length +
      (filters.price[0] > bounds.price[0] || filters.price[1] < bounds.price[1] ? 1 : 0) +
      (filters.maxDuration < bounds.duration[1] ? 1 : 0)
    : 0;

  const resetFilters = () =>
    setFilters({
      price: bounds.price,
      airlines: [],
      slots: [],
      maxDuration: bounds.duration[1],
      fareTypes: [],
      stops: [],
    });

  const editForm = <FlightSearchForm variant="compact" />;
  const queryString = searchParams.toString();

  const chips =
    filters && activeFilterCount > 0 ? (
      <div className="flex flex-wrap gap-1.5">
        {filters.airlines.map((code) => {
          const airline = flights.find((flight) => flight.airline.code === code)?.airline;
          return (
            <ActiveFilterChip
              key={code}
              label={airline?.short ?? code}
              onRemove={() => setFilters({ ...filters, airlines: filters.airlines.filter((item) => item !== code) })}
            />
          );
        })}
        {filters.slots.map((slot) => (
          <ActiveFilterChip
            key={slot}
            label={slot === 'dawn' ? 'بامداد' : slot === 'morning' ? 'صبح' : slot === 'afternoon' ? 'بعدازظهر' : 'شب'}
            onRemove={() => setFilters({ ...filters, slots: filters.slots.filter((item) => item !== slot) })}
          />
        ))}
        {filters.fareTypes.map((fare) => (
          <ActiveFilterChip
            key={fare}
            label={fare === 'charter' ? 'چارتر' : 'سیستمی'}
            onRemove={() => setFilters({ ...filters, fareTypes: filters.fareTypes.filter((item) => item !== fare) })}
          />
        ))}
        {filters.stops.map((stop) => (
          <ActiveFilterChip
            key={stop}
            label={stop === 0 ? 'بدون توقف' : `${faDigits(stop)} توقف`}
            onRemove={() => setFilters({ ...filters, stops: filters.stops.filter((item) => item !== stop) })}
          />
        ))}
      </div>
    ) : null;

  if (!origin || !destination || !departDate) {
    return (
      <div className="container-page space-y-4 py-6">
        <Breadcrumbs items={[{ label: 'پرواز', href: '/flights' }, { label: 'نتایج جستجو' }]} />
        <StateBlock
          icon="plane"
          title="برای دیدن نتایج، مبدا، مقصد و تاریخ را انتخاب کنید"
          description="پس از تکمیل اطلاعات سفر، فهرست پروازها را با امکان مقایسه‌ی قیمت و زمان مشاهده می‌کنید."
        />
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
          <div className="border-b border-ink-200 px-4 py-3">
            <p className="text-sm font-bold text-ink-900">جستجوی پرواز</p>
          </div>
          <div className="p-4 sm:p-5">{editForm}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page space-y-4 py-5 sm:py-6">
      <Breadcrumbs
        items={[
          { label: 'پرواز', href: '/flights' },
          { label: `${origin.name} به ${destination.name}` },
        ]}
      />

      <SearchSummaryBar
        title={`پرواز ${origin.name} به ${destination.name}`}
        subtitle={
          tripType === 'round'
            ? `${formatJalaliWithWeekday(departDate)} تا ${returnDate ? formatJalaliWithWeekday(returnDate) : '—'}`
            : formatJalaliWithWeekday(departDate)
        }
        meta={[
          passengersLabel(passengers.adults, passengers.children, passengers.infants),
          cabin === 'economy' ? 'کلاس اقتصادی' : cabin === 'comfort' ? 'کلاس کامفورت' : cabin === 'business' ? 'بیزینس' : 'فرست کلاس',
          tripType === 'round' ? 'رفت و برگشت' : tripType === 'multi' ? 'چند مقصد' : 'یک‌طرفه',
        ]}
        editContent={editForm}
      />

      {tripType === 'round' && (
        <div className="flex gap-2">
          {(
            [
              { key: 'outbound' as const, label: 'پرواز رفت', date: departDate },
              { key: 'return' as const, label: 'پرواز برگشت', date: returnDate },
            ]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-xl border px-4 py-3 text-start transition ${
                activeTab === tab.key ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'
              }`}
            >
              <span className="block text-2xs text-ink-500">{tab.label}</span>
              <span className="mt-1 block text-xs font-bold text-ink-900">
                {tab.date ? formatJalaliWithWeekday(tab.date) : 'انتخاب نشده'}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-4">
            {filters && (
              <FlightFilterPanel
                flights={flights}
                filters={filters}
                onChange={setFilters}
                priceBounds={bounds.price}
                durationBounds={bounds.duration}
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
            countLabel="پرواز یافت شد"
            onOpenFilters={() => setDrawerOpen(true)}
            filterCount={activeFilterCount}
          />

          {chips}

          {(filters?.maxDuration ?? 0) < bounds.duration[1] && (
            <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-2xs text-ink-500">
              <Icon name="clock" className="h-4 w-4 text-brand-600" />
              نمایش پروازهای با مدت سفر کمتر از {formatDuration(filters?.maxDuration ?? 0)}
            </div>
          )}

          {status === 'loading' && <ListSkeleton count={5} />}

          {status === 'error' && <ErrorState message={errorMessage} onRetry={load} />}

          {status === 'ready' && sorted.length === 0 && (
            flights.length === 0 ? (
              <StateBlock
                icon="plane"
                title="برای این مسیر و تاریخ پروازی پیدا نشد"
                description="می‌توانید تاریخ سفر را تغییر دهید یا مسیر دیگری را جستجو کنید. پشتیبانی سفربان هم می‌تواند پروازهای چارتر را برای شما بررسی کند."
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

          {status === 'ready' &&
            sorted.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                queryString={queryString}
                passengers={passengerCount}
                tripType={tripType}
              />
            ))}

          {status === 'ready' && sorted.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 text-2xs text-ink-500">
              <span className="num">
                نمایش {faDigits(sorted.length)} پرواز از {faDigits(flights.length)} نتیجه
              </span>
              <span className="num">
                کمترین قیمت: {formatNumber(sorted[0]?.price ?? 0)} تومان
              </span>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="bottom"
        title="فیلتر پروازها"
        footer={
          <Button block size="lg" onClick={() => setDrawerOpen(false)}>
            نمایش {faDigits(sorted.length)} پرواز
          </Button>
        }
      >
        {filters && (
          <FlightFilterPanel
            flights={flights}
            filters={filters}
            onChange={setFilters}
            priceBounds={bounds.price}
            durationBounds={bounds.duration}
            onReset={resetFilters}
          />
        )}
      </Drawer>
    </div>
  );
}
