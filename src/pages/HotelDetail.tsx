import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { HotelCard } from '@/components/cards/HotelCard';
import { Button } from '@/components/ui/Button';
import { Icon, FACILITY_ICONS } from '@/components/ui/Icon';
import { ScoreBadge, Stars, scoreLabel } from '@/components/ui/Rating';
import { StateBlock, ErrorState } from '@/components/ui/StateBlocks';
import { SkeletonBox, SkeletonLine } from '@/components/ui/Skeleton';
import { HOTEL_FACILITIES } from '@/data/hotels';
import { searchHotels } from '@/services/api';
import { parseHotelQuery } from '@/lib/searchParams';
import { diffDays, faDigits } from '@/lib/jalali';
import { cn, formatNumber, formatToman } from '@/lib/utils';
import type { Hotel } from '@/types';

export default function HotelDetail() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const query = parseHotelQuery(searchParams);

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [nearby, setNearby] = useState<Hotel[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string>('');

  const nights = query.checkIn && query.checkOut ? Math.max(diffDays(query.checkOut, query.checkIn), 1) : 1;

  const load = useCallback(() => {
    setStatus('loading');
    const cityName = query.cityName || '';
    searchHotels({ cityName, cityCode: query.cityCode }, { latency: 420 })
      .then((result) => {
        const found = result.find((item) => item.id === hotelId) ?? null;
        setHotel(found);
        setSelectedRoom(found?.rooms[0]?.id ?? '');
        setNearby(result.filter((item) => item.id !== hotelId).slice(0, 3));
        setStatus('ready');
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setStatus('error');
      });
  }, [hotelId, query.cityCode, query.cityName]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="container-page space-y-4 py-6">
        <div className="card overflow-hidden">
          <SkeletonBox className="h-64 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <SkeletonLine className="w-56" />
            <SkeletonLine className="w-32" />
            <SkeletonLine className="w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container-page py-6">
        <ErrorState message={errorMessage} onRetry={load} />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container-page py-6">
        <StateBlock
          icon="hotel"
          title="اطلاعات این اقامتگاه در دسترس نیست"
          description="ممکن است این اقامتگاه دیگر در دسترس نباشد. لطفاً جستجوی خود را تکرار کنید."
          action={
            <Link to="/hotels">
              <Button>جستجوی مجدد هتل</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const room = hotel.rooms.find((item) => item.id === selectedRoom) ?? hotel.rooms[0];
  const pricePerNight = room?.price ?? hotel.pricePerNight;
  const total = pricePerNight * nights * query.rooms;
  const queryString = searchParams.toString();

  return (
    <div className="container-page space-y-4 py-5 sm:py-6">
      <Breadcrumbs
        items={[
          { label: 'هتل', href: '/hotels' },
          { label: hotel.cityName, href: `/hotels?${queryString}` },
          { label: hotel.name },
        ]}
      />

      {/* گالری */}
      <section className="card overflow-hidden">
        <div className="grid gap-1.5 sm:grid-cols-[2fr_1fr]">
          <div className="relative h-56 overflow-hidden sm:h-80">
            <img src={hotel.images[activeImage]} alt={hotel.name} className="h-full w-full object-cover" />
            <span className="absolute end-3 top-3 rounded-md bg-ink-900/60 px-2 py-1 text-2xs text-white backdrop-blur-sm">
              <span className="num">{faDigits(activeImage + 1)}</span> از <span className="num">{faDigits(hotel.images.length)}</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1.5 sm:grid-cols-1 sm:content-start">
            {hotel.images.map((image, index) => (
              <button
                key={image + index}
                type="button"
                onClick={() => setActiveImage(index)}
                className={cn(
                  'h-20 overflow-hidden rounded-lg border-2 transition sm:h-[calc(50%-0.2rem)]',
                  activeImage === index ? 'border-brand-500' : 'border-transparent hover:border-ink-300',
                )}
              >
                <img src={image} alt={`${hotel.name} ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-ink-900">{hotel.name}</h1>
                  <Stars count={hotel.stars} size={14} />
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Icon name="map-pin" className="h-3.5 w-3.5" />
                    {hotel.cityName} · {hotel.district}
                  </span>
                  <span className="num">
                    فاصله از مرکز شهر: {faDigits(hotel.distanceToCenterKm)} کیلومتر
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-ink-200 p-3">
                <ScoreBadge score={hotel.score} />
                <div>
                  <p className="text-xs font-bold text-ink-900">{scoreLabel(hotel.score)}</p>
                  <p className="num mt-0.5 text-2xs text-ink-500">
                    از {faDigits(hotel.reviewCount)} نظر مسافران
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-7 text-ink-600">{hotel.description}</p>

            {hotel.freeCancel && (
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-2xs text-success-700">
                <Icon name="check" className="h-4 w-4" />
                این اقامتگاه امکان لغو رایگان تا ۴۸ ساعت قبل از ورود را دارد.
              </p>
            )}
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-sm font-bold text-ink-900">امکانات اقامتگاه</h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {hotel.facilities.map((facility) => (
                <span key={facility} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2.5 text-2xs text-ink-700">
                  <Icon name={FACILITY_ICONS[facility] ?? 'check'} className="h-4 w-4 text-brand-600" />
                  {HOTEL_FACILITIES[facility] ?? facility}
                </span>
              ))}
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-sm font-bold text-ink-900">اتاق‌ها و قیمت‌ها</h2>
            <p className="mt-1 text-2xs text-ink-500">
              قیمت‌ها برای <span className="num">{faDigits(nights)}</span> شب اقامت و{' '}
              <span className="num">{faDigits(query.rooms)}</span> اتاق محاسبه می‌شود.
            </p>
            <div className="mt-3 space-y-2.5">
              {hotel.rooms.map((roomItem) => (
                <label
                  key={roomItem.id}
                  className={cn(
                    'flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition',
                    selectedRoom === roomItem.id ? 'border-brand-400 bg-brand-50/60' : 'border-ink-200 hover:border-ink-300',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="room"
                      checked={selectedRoom === roomItem.id}
                      onChange={() => setSelectedRoom(roomItem.id)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    <span>
                      <span className="block text-xs font-medium text-ink-800">{roomItem.name}</span>
                      <span className="mt-0.5 block text-2xs text-ink-500">
                        ظرفیت {faDigits(roomItem.capacity)} نفر
                        {roomItem.breakfast ? ' · با صبحانه' : ' · بدون صبحانه'}
                      </span>
                    </span>
                  </span>
                  <span className="text-end">
                    <span className="num block text-sm font-bold text-ink-900">
                      {formatNumber(roomItem.price)}
                      <span className="ms-1 text-2xs font-normal text-ink-500">تومان / شب</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-sm font-bold text-ink-900">قوانین و مقررات اقامتگاه</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-ink-200 p-3">
                <p className="text-2xs text-ink-500">ساعت ورود (Check-in)</p>
                <p className="num mt-1 text-xs font-medium text-ink-800">از ساعت ۱۴:۰۰</p>
              </div>
              <div className="rounded-lg border border-ink-200 p-3">
                <p className="text-2xs text-ink-500">ساعت خروج (Check-out)</p>
                <p className="num mt-1 text-xs font-medium text-ink-800">تا ساعت ۱۲:۰۰</p>
              </div>
              <div className="rounded-lg border border-ink-200 p-3">
                <p className="text-2xs text-ink-500">مدارک لازم</p>
                <p className="mt-1 text-xs font-medium text-ink-800">
                  {hotel.isDomestic ? 'کارت ملی تمام مسافران' : 'گذرنامه و ویزا'}
                </p>
              </div>
              <div className="rounded-lg border border-ink-200 p-3">
                <p className="text-2xs text-ink-500">شرایط استرداد</p>
                <p className="mt-1 text-xs font-medium text-ink-800">
                  {hotel.freeCancel ? 'لغو رایگان تا ۴۸ ساعت قبل' : 'طبق قوانین اقامتگاه'}
                </p>
              </div>
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-900">موقعیت مکانی</h2>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(`${hotel.name} ${hotel.cityName}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-2xs font-medium text-brand-700"
              >
                مشاهده روی نقشه
                <Icon name="chevron-left" className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="mt-3 flex h-40 items-center justify-center rounded-xl border border-ink-200 bg-ink-50">
              <div className="text-center">
                <Icon name="map-pin" className="mx-auto h-6 w-6 text-brand-600" />
                <p className="mt-2 text-xs font-medium text-ink-700">
                  {hotel.cityName}، {hotel.district}
                </p>
                <p className="num mt-1 text-2xs text-ink-500">
                  {faDigits(hotel.distanceToCenterKm)} کیلومتر از مرکز شهر
                </p>
              </div>
            </div>
          </section>

          {nearby.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-ink-900">اقامتگاه‌های مشابه در {hotel.cityName}</h2>
              <div className="space-y-3">
                {nearby.map((item) => (
                  <HotelCard key={item.id} hotel={item} nights={nights} queryString={queryString} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <div className="card sticky top-20 p-4 sm:p-5">
            <p className="text-xs text-ink-500">قیمت نهایی اقامت</p>
            <p className="num mt-1 text-xl font-bold text-ink-900">{formatToman(total)}</p>
            <p className="num mt-1 text-2xs text-ink-500">
              {formatNumber(pricePerNight)} تومان × {faDigits(nights)} شب × {faDigits(query.rooms)} اتاق
            </p>

            <div className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-2xs text-ink-600">
              <div className="flex items-center justify-between">
                <span>اتاق انتخابی</span>
                <span className="font-medium text-ink-800">{room?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>تعداد شب</span>
                <span className="num font-medium text-ink-800">{faDigits(nights)} شب</span>
              </div>
              <div className="flex items-center justify-between">
                <span>مسافران</span>
                <span className="num font-medium text-ink-800">{faDigits(query.guests)} نفر</span>
              </div>
            </div>

            <Link to={`/booking/hotel/${hotel.id}?${queryString}&room=${room?.id ?? ''}`} className="mt-4 block">
              <Button block size="lg">
                رزرو و ادامه
              </Button>
            </Link>
            <Link
              to={`/hotels?${queryString}`}
              className="mt-2 flex items-center justify-center gap-1 text-2xs font-medium text-brand-700"
            >
              بازگشت به فهرست اقامتگاه‌ها
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
