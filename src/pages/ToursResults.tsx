import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SortBar } from '@/components/results/SortBar';
import { TourCard } from '@/components/cards/TourCard';
import { StateBlock, ErrorState } from '@/components/ui/StateBlocks';
import { HotelCardSkeleton } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { searchTours } from '@/services/api';
import { readRequestOptions } from '@/lib/searchParams';
import { TOURS } from '@/data/tours';
import { faDigits } from '@/lib/jalali';
import { cn, formatNumber } from '@/lib/utils';
import type { Tour } from '@/types';

type SortKey = 'cheapest' | 'rating' | 'longest';

const SORT_OPTIONS: Array<{ key: SortKey; label: string; icon: string }> = [
  { key: 'cheapest', label: 'ارزان‌ترین', icon: 'tag' },
  { key: 'rating', label: 'بهترین امتیاز', icon: 'star' },
  { key: 'longest', label: 'طولانی‌ترین تور', icon: 'clock' },
];

export default function ToursResults() {
  const [searchParams] = useSearchParams();
  const destination = searchParams.get('dest') ?? '';
  const duration = searchParams.get('duration') ?? 'any';
  const guests = Number(searchParams.get('guests') ?? 2);
  const requestOptions = readRequestOptions(searchParams);

  const [tours, setTours] = useState<Tour[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [sort, setSort] = useState<SortKey>('cheapest');
  const [tag, setTag] = useState<string>('همه');

  useEffect(() => {
    setStatus('loading');
    searchTours(destination, { fail: requestOptions.fail })
      .then((result) => {
        setTours(result);
        setStatus('ready');
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setStatus('error');
      });
  }, [destination, requestOptions.fail]);

  const tags = useMemo(() => ['همه', ...Array.from(new Set(TOURS.flatMap((tour) => tour.tags)))], []);

  const list = useMemo(() => {
    let items = [...tours];
    if (duration !== 'any') {
      const days = Number(duration);
      items = items.filter((tour) => (days >= 7 ? tour.days >= 7 : tour.days === days));
    }
    if (tag !== 'همه') items = items.filter((tour) => tour.tags.includes(tag));
    if (sort === 'rating') items.sort((a, b) => b.rating - a.rating);
    else if (sort === 'longest') items.sort((a, b) => b.days - a.days);
    else items.sort((a, b) => a.price - b.price);
    return items;
  }, [tours, sort, tag, duration]);

  return (
    <div className="container-page space-y-4 py-5 sm:py-6">
      <Breadcrumbs items={[{ label: 'تور', href: '/tours' }, { label: destination || 'همه مقاصد' }]} />

      <div className="card p-4 sm:p-5">
        <h1 className="text-base font-bold text-ink-900 sm:text-lg">
          {destination ? `تورهای ${destination}` : 'تورهای داخلی و خارجی سفربان'}
        </h1>
        <p className="mt-1.5 text-2xs leading-6 text-ink-500 sm:text-xs">
          تمام تورها شامل بیمه‌ی مسافرتی، راهنمای فارسی و پشتیبانی سفربان در طول سفر هستند.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-2xs">
          <span className="chip border-ink-200 bg-ink-50 text-ink-600">
            <Icon name="users" className="h-3.5 w-3.5" />
            <span className="num">{faDigits(guests)}</span> مسافر
          </span>
          <span className="chip border-ink-200 bg-ink-50 text-ink-600">
            <Icon name="clock" className="h-3.5 w-3.5" />
            {duration === 'any' ? 'هر مدت' : duration === '7' ? '۷ روز و بیشتر' : `${faDigits(duration)} روز`}
          </span>
          <span className="chip border-ink-200 bg-ink-50 text-ink-600">
            <Icon name="calendar" className="h-3.5 w-3.5" />
            تاریخ حرکت قابل انتخاب
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTag(item)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-2xs font-medium transition',
              tag === item ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <SortBar
        options={SORT_OPTIONS}
        value={sort}
        onChange={setSort}
        resultCount={list.length}
        countLabel="تور یافت شد"
      />

      {status === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <HotelCardSkeleton key={index} />
          ))}
        </div>
      )}

      {status === 'error' && <ErrorState message={errorMessage} />}

      {status === 'ready' && list.length === 0 && (
        <StateBlock
          icon="compass"
          title="توری با این فیلترها پیدا نشد"
          description={`در حال حاضر توری برای «${destination || 'این مقصد'}» با شرایط انتخابی موجود نیست. می‌توانید همه‌ی تورها را ببینید یا درخواست تور اختصاصی ثبت کنید.`}
        />
      )}

      {status === 'ready' && list.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
          <p className="num rounded-xl border border-ink-200 bg-white px-4 py-3 text-2xs text-ink-500">
            کمترین قیمت: {formatNumber(Math.min(...list.map((tour) => tour.price)))} تومان · قیمت‌ها بر اساس اقامت دو نفره محاسبه شده است
          </p>
        </>
      )}
    </div>
  );
}
