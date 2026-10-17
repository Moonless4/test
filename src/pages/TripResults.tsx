import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SearchSummaryBar, passengersLabel } from '@/components/results/SearchSummaryBar';
import { SortBar } from '@/components/results/SortBar';
import { FilterSection, ActiveFilterChip } from '@/components/results/FilterSection';
import { TripCard } from '@/components/cards/TripCard';
import { TripSearchForm } from '@/components/search/TripSearchForm';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { RangeSlider, CheckboxRow } from '@/components/ui/RangeSlider';
import { StateBlock, EmptyResults, ErrorState } from '@/components/ui/StateBlocks';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { searchBuses, searchTrains } from '@/services/api';
import { parseTripQuery, readRequestOptions } from '@/lib/searchParams';
import { faDigits, formatJalaliLong } from '@/lib/jalali';
import { formatClock, formatDuration } from '@/lib/utils';
import type { BusTrip, TrainTrip } from '@/types';

type SortKey = 'cheapest' | 'earliest' | 'fastest';
type Trip = TrainTrip | BusTrip;

const SORT_OPTIONS: Array<{ key: SortKey; label: string; icon: string }> = [
  { key: 'cheapest', label: 'ارزان‌ترین', icon: 'tag' },
  { key: 'earliest', label: 'زودترین حرکت', icon: 'clock' },
  { key: 'fastest', label: 'کوتاه‌ترین مسیر', icon: 'bolt' },
];

const SLOTS = [
  { key: 'dawn', label: 'بامداد', from: 0, to: 360 },
  { key: 'morning', label: 'صبح', from: 360, to: 720 },
  { key: 'afternoon', label: 'بعدازظهر', from: 720, to: 1080 },
  { key: 'evening', label: 'شب', from: 1080, to: 1440 },
];

export default function TripResults({ kind }: { kind: 'train' | 'bus' }) {
  const [searchParams] = useSearchParams();
  const query = useMemo(() => parseTripQuery(searchParams), [searchParams]);
  const requestOptions = readRequestOptions(searchParams);
  const { origin, destination, departDate, passengers } = query;
  const isTrain = kind === 'train';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [sort, setSort] = useState<SortKey>('cheapest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [slots, setSlots] = useState<string[]>([]);
  const [operators, setOperators] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bounds = useMemo(() => {
    if (!trips.length) return [0, 0] as [number, number];
    const prices = trips.map((trip) => trip.price);
    return [Math.min(...prices), Math.max(...prices)] as [number, number];
  }, [trips]);

  const operatorList = useMemo(
    () => Array.from(new Set(trips.map((trip) => trip.operator))),
    [trips],
  );

  const load = useCallback(() => {
    if (!origin || !destination || !departDate) {
      setStatus('ready');
      setTrips([]);
      return;
    }
    setStatus('loading');
    const request = isTrain
      ? searchTrains({ origin, destination, date: departDate, passengers }, { fail: requestOptions.fail })
      : searchBuses({ origin, destination, date: departDate, passengers }, { fail: requestOptions.fail });

    request
      .then((result) => {
        setTrips(result);
        const prices = result.map((trip) => trip.price);
        setPriceRange([Math.min(...prices), Math.max(...prices)]);
        setStatus('ready');
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setStatus('error');
      });
  }, [origin, destination, departDate, passengers, isTrain, requestOptions.fail]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      trips.filter((trip) => {
        if (trip.price < priceRange[0] || trip.price > priceRange[1]) return false;
        if (slots.length) {
          const slot = SLOTS.find((item) => trip.departMinutes >= item.from && trip.departMinutes < item.to);
          if (!slot || !slots.includes(slot.key)) return false;
        }
        if (operators.length && !operators.includes(trip.operator)) return false;
        return true;
      }),
    [trips, priceRange, slots, operators],
  );

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === 'earliest') return list.sort((a, b) => a.departMinutes - b.departMinutes);
    if (sort === 'fastest') return list.sort((a, b) => a.durationMinutes - b.durationMinutes);
    return list.sort((a, b) => a.price - b.price);
  }, [filtered, sort]);

  const resetFilters = () => {
    setPriceRange(bounds);
    setSlots([]);
    setOperators([]);
  };

  const activeFilterCount =
    slots.length + operators.length + (priceRange[0] > bounds[0] || priceRange[1] < bounds[1] ? 1 : 0);

  const filterContent = (
    <div>
      <div className="flex items-center justify-between pb-2">
        <p className="flex items-center gap-1.5 text-xs font-bold text-ink-800">
          <Icon name="filter" className="h-4 w-4 text-brand-600" />
          فیلترها
        </p>
        <button type="button" onClick={resetFilters} className="text-2xs font-medium text-brand-700">
          حذف همه
        </button>
      </div>
      <FilterSection title="محدوده قیمت">
        <RangeSlider min={bounds[0]} max={bounds[1]} step={50000} value={priceRange} onChange={setPriceRange} />
      </FilterSection>
      <FilterSection title="ساعت حرکت">
        <div className="grid grid-cols-2 gap-2">
          {SLOTS.map((slot) => {
            const active = slots.includes(slot.key);
            return (
              <button
                key={slot.key}
                type="button"
                onClick={() =>
                  setSlots((current) =>
                    current.includes(slot.key) ? current.filter((item) => item !== slot.key) : [...current, slot.key],
                  )
                }
                className={`rounded-lg border px-2.5 py-2 text-start transition ${
                  active ? 'border-brand-400 bg-brand-50' : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <span className={`block text-2xs font-medium ${active ? 'text-brand-700' : 'text-ink-700'}`}>
                  {slot.label}
                </span>
                <span className="num mt-0.5 block text-[0.6rem] text-ink-400">
                  {formatClock(slot.from)} تا {formatClock(slot.to)}
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>
      <FilterSection title={isTrain ? 'شرکت ریلی' : 'شرکت اتوبوسرانی'}>
        {operatorList.map((operator) => (
          <CheckboxRow
            key={operator}
            label={operator}
            checked={operators.includes(operator)}
            onChange={() =>
              setOperators((current) =>
                current.includes(operator) ? current.filter((item) => item !== operator) : [...current, operator],
              )
            }
          />
        ))}
      </FilterSection>
    </div>
  );

  if (!origin || !destination || !departDate) {
    return (
      <div className="container-page space-y-4 py-6">
        <Breadcrumbs items={[{ label: isTrain ? 'قطار' : 'اتوبوس', href: `/${isTrain ? 'trains' : 'buses'}` }, { label: 'نتایج' }]} />
        <StateBlock
          icon={isTrain ? 'train' : 'bus'}
          title="مبدا، مقصد و تاریخ حرکت را انتخاب کنید"
          description="پس از انتخاب مسیر و تاریخ، لیست حرکت‌ها با قیمت، ساعت و کلاس صندلی نمایش داده می‌شود."
        />
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
          <div className="border-b border-ink-200 px-4 py-3">
            <p className="text-sm font-bold text-ink-900">{isTrain ? 'جستجوی قطار' : 'جستجوی اتوبوس'}</p>
          </div>
          <div className="p-4 sm:p-5">
            <TripSearchForm service={kind} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page space-y-4 py-5 sm:py-6">
      <Breadcrumbs
        items={[
          { label: isTrain ? 'قطار' : 'اتوبوس', href: `/${isTrain ? 'trains' : 'buses'}` },
          { label: `${origin.name} به ${destination.name}` },
        ]}
      />

      <SearchSummaryBar
        title={`${isTrain ? 'قطار' : 'اتوبوس'} ${origin.name} به ${destination.name}`}
        subtitle={`${formatJalaliLong(departDate)} · ${passengersLabel(passengers, 0, 0)}`}
        meta={[
          isTrain ? 'بلیط قطارهای سریع‌السیر' : 'بلیط اتوبوس‌های VIP و معمولی',
          'امکان انتخاب صندلی',
          'پرداخت امن و استرداد آنلاین',
        ]}
        editContent={<TripSearchForm service={kind} />}
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-4">{filterContent}</div>
        </aside>

        <div className="space-y-3">
          <SortBar
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
            resultCount={sorted.length}
            countLabel="حرکت یافت شد"
            onOpenFilters={() => setDrawerOpen(true)}
            filterCount={activeFilterCount}
          />

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {slots.map((slot) => (
                <ActiveFilterChip
                  key={slot}
                  label={SLOTS.find((item) => item.key === slot)?.label ?? slot}
                  onRemove={() => setSlots((current) => current.filter((item) => item !== slot))}
                />
              ))}
              {operators.map((operator) => (
                <ActiveFilterChip
                  key={operator}
                  label={operator}
                  onRemove={() => setOperators((current) => current.filter((item) => item !== operator))}
                />
              ))}
            </div>
          )}

          {status === 'loading' && <ListSkeleton count={5} />}
          {status === 'error' && <ErrorState message={errorMessage} onRetry={load} />}

          {status === 'ready' && sorted.length === 0 && (
            trips.length === 0 ? (
              <StateBlock
                icon={isTrain ? 'train' : 'bus'}
                title={isTrain ? 'برای این مسیر قطاری یافت نشد' : 'برای این مسیر اتوبوسی یافت نشد'}
                description="تاریخ حرکت را تغییر دهید یا مسیر دیگری را جستجو کنید."
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
            sorted.map((trip) => (
              <div key={trip.id} className="space-y-1">
                <TripCard trip={trip} kind={kind} queryString={searchParams.toString()} passengers={passengers} />
                <p className="num px-2 text-2xs text-ink-400">
                  مدت سفر: {formatDuration(trip.durationMinutes)} · حرکت {formatClock(trip.departMinutes)} · ورود{' '}
                  {formatClock(trip.arriveMinutes)}
                </p>
              </div>
            ))}

          {status === 'ready' && sorted.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-2xs text-ink-500">
              <span className="num">
                نمایش {faDigits(sorted.length)} {isTrain ? 'قطار' : 'اتوبوس'} از {faDigits(trips.length)} حرکت
              </span>
              <span className="num">زودترین حرکت: {formatClock(sorted[0]?.departMinutes ?? 0)}</span>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="bottom"
        title="فیلتر حرکت‌ها"
        footer={
          <Button block size="lg" onClick={() => setDrawerOpen(false)}>
            نمایش {faDigits(sorted.length)} حرکت
          </Button>
        }
      >
        {filterContent}
      </Drawer>
    </div>
  );
}


