import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { AirlineBadge } from '@/components/cards/FlightCard';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StateBlock, ErrorState } from '@/components/ui/StateBlocks';
import { SkeletonBox, SkeletonLine } from '@/components/ui/Skeleton';
import { searchFlights } from '@/services/api';
import { parseFlightQuery } from '@/lib/searchParams';
import { formatJalaliWithWeekday, faDigits } from '@/lib/jalali';
import { formatClock, formatDuration, formatNumber, formatToman } from '@/lib/utils';
import type { Flight } from '@/types';

export default function FlightDetail() {
  const { flightId } = useParams();
  const [searchParams] = useSearchParams();
  const query = useMemo(() => parseFlightQuery(searchParams), [searchParams]);
  const { origin, destination, departDate, returnDate, tripType, passengers, cabin } = query;
  const passengerCount = passengers.adults + passengers.children;

  const [flight, setFlight] = useState<Flight | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(() => {
    if (!origin || !destination || !departDate) {
      setStatus('ready');
      return;
    }
    setStatus('loading');
    searchFlights({ origin, destination, date: departDate, tripType, cabin, passengers: passengerCount })
      .then((result) => {
        setFlight(result.find((item) => item.id === flightId) ?? null);
        setStatus('ready');
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setStatus('error');
      });
  }, [origin, destination, departDate, tripType, cabin, passengerCount, flightId]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="container-page space-y-4 py-6">
        <div className="card space-y-3 p-5">
          <SkeletonLine className="w-48" />
          <SkeletonBox className="h-28 w-full" />
          <SkeletonLine className="w-64" />
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

  if (!flight) {
    return (
      <div className="container-page py-6">
        <StateBlock
          icon="plane"
          title="اطلاعات این پرواز در دسترس نیست"
          description="ممکن است این پرواز فروخته شده یا جستجوی شما منقضی شده باشد. لطفاً دوباره جستجو کنید."
          action={
            <Link to="/flights">
              <Button>جستجوی مجدد پرواز</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const totalPrice = flight.price * Math.max(passengerCount, 1);

  return (
    <div className="container-page space-y-4 py-5 sm:py-6">
      <Breadcrumbs
        items={[
          { label: 'پرواز', href: '/flights' },
          { label: `${origin?.name} به ${destination?.name}`, href: `/flights?${searchParams.toString()}` },
          { label: 'جزئیات پرواز' },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <AirlineBadge airline={flight.airline} size="lg" />
              <div>
                <p className="text-sm font-bold text-ink-900">{flight.airline.name}</p>
                <p className="num mt-0.5 text-2xs text-ink-500">
                  پرواز {flight.segments[0].flightNumber} · {flight.segments[0].aircraft}
                </p>
              </div>
              <span className="num ms-auto rounded-lg bg-brand-50 px-3 py-1.5 text-2xs font-medium text-brand-700">
                {tripType === 'round' ? 'رفت و برگشت' : tripType === 'multi' ? 'چند مقصد' : 'یک‌طرفه'}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {flight.segments.map((segment, index) => (
                <div key={index} className="rounded-xl border border-ink-200 p-4">
                  {flight.segments.length > 1 && (
                    <p className="mb-3 text-2xs font-medium text-ink-500">
                      {index === 0 ? 'پرواز رفت' : 'پرواز برگشت'}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="num text-lg font-bold text-ink-900">{segment.departTime}</p>
                      <p className="mt-0.5 text-2xs text-ink-500">{segment.from.name}</p>
                    </div>
                    <div className="flex-1 px-2">
                      <p className="mb-1 text-center text-2xs text-ink-500">
                        {formatDuration(segment.durationMinutes)}
                      </p>
                      <div className="route-line" />
                      <p className="mt-1 text-center text-2xs text-ink-500">
                        {flight.stops === 0 ? 'پرواز مستقیم' : `${faDigits(flight.stops)} توقف`}
                        {flight.stopCities.length > 0 && ` · توقف در ${flight.stopCities.map((c) => c.name).join('، ')}`}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="num text-lg font-bold text-ink-900">{segment.arriveTime}</p>
                      <p className="mt-0.5 text-2xs text-ink-500">{segment.to.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoTile icon="suitcase" label="بار مجاز" value={flight.baggage} />
              <InfoTile icon="briefcase" label="بار دستی" value={flight.cabinBaggage} />
              <InfoTile icon="ticket" label="نوع بلیط" value={flight.fareType === 'charter' ? 'چارتر' : 'سیستمی'} />
              <InfoTile
                icon="users"
                label="کلاس پروازی"
                value={
                  flight.cabin === 'economy'
                    ? 'اقتصادی'
                    : flight.cabin === 'comfort'
                      ? 'کامفورت'
                      : flight.cabin === 'business'
                        ? 'بیزینس'
                        : 'فرست کلاس'
                }
              />
            </div>
            {flight.seatsLeft <= 5 && (
              <p className="num mt-3 flex items-center gap-2 rounded-lg bg-danger-50 px-3 py-2 text-2xs text-danger-700">
                <Icon name="alert" className="h-4 w-4" />
                تنها {faDigits(flight.seatsLeft)} صندلی در این پرواز باقی مانده است.
              </p>
            )}
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-sm font-bold text-ink-900">قوانین کنسلی و استرداد</h2>
            <ul className="mt-3 space-y-2.5 text-xs text-ink-600">
              <li className="flex items-start gap-2">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                استرداد بلیط {flight.fareType === 'charter' ? 'با کسر ۳۰٪ جریمه تا ۴۸ ساعت قبل از پرواز' : 'تا ۲۴ ساعت قبل از پرواز با کسر ۱۰٪ جریمه'} امکان‌پذیر است.
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                تغییر نام و تاریخ پرواز با پرداخت تفاوت نرخ و جریمه‌ی ایرلاین انجام می‌شود.
              </li>
              <li className="flex items-start gap-2">
                <Icon name={flight.refundable ? 'check' : 'close'} className={`mt-0.5 h-4 w-4 shrink-0 ${flight.refundable ? 'text-success-600' : 'text-danger-500'}`} />
                {flight.refundable
                  ? 'این بلیط امکان استرداد آنلاین از پنل کاربری سفربان را دارد.'
                  : 'برای این نرخ، استرداد آنلاین فعال نیست و درخواست باید از طریق پشتیبانی ثبت شود.'}
              </li>
              <li className="flex items-start gap-2">
                <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                مبلغ استرداد حداکثر تا ۷۲ ساعت کاری پس از تأیید ایرلاین به حساب شما بازمی‌گردد.
              </li>
            </ul>
          </section>
        </div>

        <aside>
          <div className="card sticky top-20 p-4 sm:p-5">
            <p className="text-xs font-medium text-ink-500">قیمت نهایی</p>
            <p className="num mt-1 text-xl font-bold text-ink-900">{formatToman(totalPrice)}</p>
            <p className="num mt-1 text-2xs text-ink-500">
              {formatNumber(flight.price)} تومان × {faDigits(Math.max(passengerCount, 1))} مسافر
            </p>

            <div className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-2xs text-ink-600">
              <div className="flex items-center justify-between">
                <span>تاریخ رفت</span>
                <span className="num font-medium text-ink-800">{departDate ? formatJalaliWithWeekday(departDate) : '—'}</span>
              </div>
              {tripType === 'round' && (
                <div className="flex items-center justify-between">
                  <span>تاریخ برگشت</span>
                  <span className="num font-medium text-ink-800">{returnDate ? formatJalaliWithWeekday(returnDate) : '—'}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>ساعت پرواز</span>
                <span className="num font-medium text-ink-800">{formatClock(flight.departMinutes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>مدت سفر</span>
                <span className="font-medium text-ink-800">{formatDuration(flight.durationMinutes)}</span>
              </div>
            </div>

            <Link to={`/booking/flight/${flight.id}?${searchParams.toString()}`} className="mt-4 block">
              <Button block size="lg">
                ادامه و رزرو
              </Button>
            </Link>
            <Link
              to={`/flights?${searchParams.toString()}`}
              className="mt-2 flex items-center justify-center gap-1 text-2xs font-medium text-brand-700"
            >
              بازگشت به فهرست پروازها
            </Link>
            <p className="mt-3 flex items-start gap-1.5 text-2xs leading-5 text-ink-400">
              <Icon name="shield-check" className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
              پرداخت از طریق درگاه امن بانکی انجام می‌شود و بلیط بلافاصله به ایمیل و پیامک شما ارسال می‌گردد.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-200 p-3">
      <span className="flex items-center gap-1.5 text-2xs text-ink-500">
        <Icon name={icon} className="h-3.5 w-3.5 text-brand-600" />
        {label}
      </span>
      <p className="num mt-1 text-xs font-medium text-ink-800">{value}</p>
    </div>
  );
}
