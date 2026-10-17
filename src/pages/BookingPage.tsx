import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { DateField } from '@/components/ui/DateField';
import { SelectField } from '@/components/ui/SelectField';
import { StateBlock, ErrorState } from '@/components/ui/StateBlocks';
import { SkeletonBox } from '@/components/ui/Skeleton';
import { AirlineBadge } from '@/components/cards/FlightCard';
import { useApp } from '@/context/AppContext';
import { searchFlights, searchBuses, searchHotels, searchTrains } from '@/services/api';
import { parseFlightQuery, parseHotelQuery, parseTripQuery } from '@/lib/searchParams';
import { TOURS } from '@/data/tours';
import { addDays, diffDays, faDigits, startOfDay } from '@/lib/jalali';
import { cn, formatNumber, formatToman } from '@/lib/utils';

interface BookingItem {
  kind: 'flight' | 'hotel' | 'train' | 'bus' | 'tour';
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  unitLabel: string;
  meta: Array<{ label: string; value: string }>;
  airline?: { code: string; name: string; short: string; color: string };
}

interface PassengerInput {
  firstName: string;
  lastName: string;
  nationalId: string;
  gender: string;
  birthDate: Date | null;
}

const STEPS = ['اطلاعات مسافران', 'خدمات و امکانات', 'پرداخت', 'تأیید نهایی'];

export default function BookingPage() {
  const { kind, itemId } = useParams();
  const [searchParams] = useSearchParams();

  const [item, setItem] = useState<BookingItem | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'notfound'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const [step, setStep] = useState(0);
  const [passengers, setPassengers] = useState<PassengerInput[]>([]);
  const [contact, setContact] = useState({ mobile: '', email: '' });
  const [services, setServices] = useState({ seat: 'window', extraBaggage: false, insurance: true, meal: true });
  const [hotelServices, setHotelServices] = useState({ breakfast: true, extraBed: false, transfer: false });
  const [paymentMethod, setPaymentMethod] = useState('gateway');
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);

  const { addOrder } = useApp();

  const buildItem = useCallback(() => {
    if (kind === 'flight') {
      const query = parseFlightQuery(searchParams);
      if (!query.origin || !query.destination || !query.departDate) {
        setStatus('notfound');
        return;
      }
      const passengerCount = query.passengers.adults + query.passengers.children;
      searchFlights({
        origin: query.origin,
        destination: query.destination,
        date: query.departDate,
        tripType: query.tripType,
        cabin: query.cabin,
        passengers: passengerCount,
      })
        .then((result) => {
          const flight = result.find((entry) => entry.id === itemId);
          if (!flight) {
            setStatus('notfound');
            return;
          }
          setItem({
            kind: 'flight',
            id: flight.id,
            title: `${flight.from.name} به ${flight.to.name}`,
            subtitle: `${flight.airline.name} · پرواز ${flight.segments[0].flightNumber}`,
            unitPrice: flight.price,
            quantity: Math.max(passengerCount, 1),
            unitLabel: 'هر مسافر',
            airline: flight.airline,
            meta: [
              { label: 'ساعت پرواز', value: flight.segments[0].departTime },
              { label: 'ساعت ورود', value: flight.segments[0].arriveTime },
              { label: 'بار مجاز', value: flight.baggage },
              {
                label: 'کلاس',
                value:
                  flight.cabin === 'economy'
                    ? 'اقتصادی'
                    : flight.cabin === 'comfort'
                      ? 'کامفورت'
                      : flight.cabin === 'business'
                        ? 'بیزینس'
                        : 'فرست کلاس',
              },
            ],
          });
          setPassengers(
            Array.from({ length: Math.max(passengerCount, 1) }).map(() => ({
              firstName: '',
              lastName: '',
              nationalId: '',
              gender: 'male',
              birthDate: null,
            })),
          );
          setStatus('ready');
        })
        .catch((error: Error) => {
          setErrorMessage(error.message);
          setStatus('error');
        });
      return;
    }

    if (kind === 'hotel') {
      const query = parseHotelQuery(searchParams);
      searchHotels({ cityName: query.cityName, cityCode: query.cityCode })
        .then((result) => {
          const hotel = result.find((entry) => entry.id === itemId);
          if (!hotel) {
            setStatus('notfound');
            return;
          }
          const nights = query.checkIn && query.checkOut ? Math.max(diffDays(query.checkOut, query.checkIn), 1) : 1;
          const roomId = searchParams.get('room');
          const room = hotel.rooms.find((entry) => entry.id === roomId) ?? hotel.rooms[0];
          setItem({
            kind: 'hotel',
            id: hotel.id,
            title: hotel.name,
            subtitle: `${hotel.cityName} · ${hotel.district}`,
            image: hotel.images[0],
            unitPrice: room.price * nights * query.rooms,
            quantity: 1,
            unitLabel: 'کل اقامت',
            meta: [
              { label: 'اتاق', value: room.name },
              { label: 'شب', value: `${faDigits(nights)} شب` },
              { label: 'اتاق', value: `${faDigits(query.rooms)} اتاق` },
              { label: 'مسافران', value: `${faDigits(query.guests)} نفر` },
            ],
          });
          setPassengers([{ firstName: '', lastName: '', nationalId: '', gender: 'male', birthDate: null }]);
          setStatus('ready');
        })
        .catch((error: Error) => {
          setErrorMessage(error.message);
          setStatus('error');
        });
      return;
    }

    if (kind === 'train' || kind === 'bus') {
      const query = parseTripQuery(searchParams);
      if (!query.origin || !query.destination || !query.departDate) {
        setStatus('notfound');
        return;
      }
      const request =
        kind === 'train'
          ? searchTrains({ origin: query.origin, destination: query.destination, date: query.departDate, passengers: query.passengers })
          : searchBuses({ origin: query.origin, destination: query.destination, date: query.departDate, passengers: query.passengers });

      request
        .then((result) => {
          const trip = result.find((entry) => entry.id === itemId);
          if (!trip) {
            setStatus('notfound');
            return;
          }
          setItem({
            kind: kind as 'train' | 'bus',
            id: trip.id,
            title: `${trip.from.name} به ${trip.to.name}`,
            subtitle: `${trip.operator} · ${kind === 'train' ? (trip as typeof trip & { wagonClassName: string }).wagonClassName : 'اتوبوس'}`,
            unitPrice: trip.price,
            quantity: Math.max(query.passengers, 1),
            unitLabel: 'هر نفر',
            meta: [
              { label: 'ساعت حرکت', value: `${Math.floor(trip.departMinutes / 60)}:${String(trip.departMinutes % 60).padStart(2, '0') }` },
              { label: 'مدت سفر', value: `${faDigits(Math.round(trip.durationMinutes / 60))} ساعت` },
              { label: kind === 'train' ? 'شرکت ریلی' : 'شرکت', value: trip.operator },
              { label: 'صندلی خالی', value: `${faDigits(trip.seatsLeft)}` },
            ],
          });
          setPassengers(
            Array.from({ length: Math.max(query.passengers, 1) }).map(() => ({
              firstName: '',
              lastName: '',
              nationalId: '',
              gender: 'male',
              birthDate: null,
            })),
          );
          setStatus('ready');
        })
        .catch((error: Error) => {
          setErrorMessage(error.message);
          setStatus('error');
        });
      return;
    }

    if (kind === 'tour') {
      const tour = TOURS.find((entry) => entry.id === itemId);
      if (!tour) {
        setStatus('notfound');
        return;
      }
      setItem({
        kind: 'tour',
        id: tour.id,
        title: tour.title,
        subtitle: `${tour.destination} · ${faDigits(tour.days)} روز و ${faDigits(tour.nights)} شب`,
        image: tour.image,
        unitPrice: tour.price,
        quantity: 2,
        unitLabel: 'هر نفر',
        meta: [
          { label: 'تاریخ حرکت', value: tour.travelDate },
          { label: 'مدت', value: `${faDigits(tour.days)} روز` },
          { label: 'شامل', value: tour.includes.slice(0, 2).join('، ') },
        ],
      });
      setPassengers([
        { firstName: '', lastName: '', nationalId: '', gender: 'male', birthDate: null },
        { firstName: '', lastName: '', nationalId: '', gender: 'male', birthDate: null },
      ]);
      setStatus('ready');
    }
  }, [kind, itemId, searchParams]);

  useEffect(() => {
    setStatus('loading');
    setOrderId(null);
    setStep(0);
    buildItem();
  }, [buildItem]);

  const servicesPrice = useMemo(() => {
    if (!item) return 0;
    if (item.kind === 'flight') {
      let total = 0;
      if (services.extraBaggage) total += 850000 * item.quantity;
      if (services.insurance) total += 285000 * item.quantity;
      return total;
    }
    if (item.kind === 'hotel') {
      let total = 0;
      if (hotelServices.extraBed) total += 480000;
      if (hotelServices.transfer) total += 650000;
      return total;
    }
    if (services.insurance && item.kind !== 'tour') return 285000 * item.quantity;
    return 0;
  }, [item, services, hotelServices]);

  const basePrice = (item?.unitPrice ?? 0) * (item?.quantity ?? 1);
  const tax = Math.round((basePrice + servicesPrice) * 0.09);
  const total = basePrice + servicesPrice + tax;

  const validateStep = () => {
    const next: Record<string, string> = {};
    if (step === 0) {
      passengers.forEach((passenger, index) => {
        if (passenger.firstName.trim().length < 3) next[`p${index}-firstName`] = 'نام را کامل وارد کنید';
        if (passenger.lastName.trim().length < 3) next[`p${index}-lastName`] = 'نام خانوادگی را کامل وارد کنید';
        if (!/^\d{10}$/.test(passenger.nationalId)) next[`p${index}-nationalId`] = 'کد ملی باید ۱۰ رقم باشد';
        if (!passenger.birthDate) next[`p${index}-birthDate`] = 'تاریخ تولد را انتخاب کنید';
      });
      if (!/^09\d{9}$/.test(contact.mobile)) next.mobile = 'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)';
      if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) next.email = 'ایمیل معتبر وارد کنید';
    }
    if (step === 2 && !acceptedRules) next.rules = 'برای ادامه، قوانین و مقررات را بپذیرید';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step === 2 && item) {
      const order = addOrder({
        kind: item.kind,
        title: item.title,
        subtitle: item.subtitle,
        price: total,
        status: 'issued',
      });
      setOrderId(order.id);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (status === 'loading') {
    return (
      <div className="container-page space-y-4 py-6">
        <SkeletonBox className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <SkeletonBox className="h-72 w-full rounded-xl" />
          <SkeletonBox className="h-56 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container-page py-6">
        <ErrorState message={errorMessage} onRetry={buildItem} />
      </div>
    );
  }

  if (status === 'notfound' || !item) {
    return (
      <div className="container-page py-6">
        <StateBlock
          icon="briefcase"
          title="اطلاعات این رزرو در دسترس نیست"
          description="ممکن است این مورد فروخته شده یا جستجوی شما منقضی شده باشد. لطفاً از ابتدا جستجو کنید."
          action={
            <Link to="/">
              <Button>بازگشت به صفحه‌ی اصلی</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const today = startOfDay(new Date());

  return (
    <div className="container-page space-y-4 py-5 sm:py-6">
      <Breadcrumbs
        items={[
          { label: item.kind === 'flight' ? 'پرواز' : item.kind === 'hotel' ? 'هتل' : item.kind === 'tour' ? 'تور' : 'سفر', href: '/account' },
          { label: 'تکمیل رزرو' },
        ]}
      />

      {/* مراحل */}
      <ol className="card flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-0">
        {STEPS.map((label, index) => {
          const state = index === step ? 'active' : index < step ? 'done' : 'todo';
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  'num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-2xs font-bold',
                  state === 'active' && 'bg-brand-600 text-white',
                  state === 'done' && 'bg-success-500 text-white',
                  state === 'todo' && 'bg-ink-100 text-ink-400',
                )}
              >
                {state === 'done' ? <Icon name="check" className="h-3.5 w-3.5" /> : faDigits(index + 1)}
              </span>
              <span className={cn('text-2xs font-medium', state === 'todo' ? 'text-ink-400' : 'text-ink-800')}>
                {label}
              </span>
              {index < STEPS.length - 1 && <span className="hidden h-px flex-1 bg-ink-200 sm:block" />}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {/* اطلاعات اقلام */}
          <section className="card p-4 sm:p-5">
            <div className="flex items-start gap-3">
              {item.airline && <AirlineBadge airline={item.airline} />}
              {item.image && !item.airline && (
                <img src={item.image} alt={item.title} className="h-14 w-20 shrink-0 rounded-lg object-cover" />
              )}
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-ink-900">{item.title}</h1>
                <p className="mt-1 text-2xs text-ink-500">{item.subtitle}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {item.meta.map((meta) => (
                <div key={meta.label} className="rounded-lg border border-ink-200 p-2.5">
                  <p className="text-2xs text-ink-500">{meta.label}</p>
                  <p className="num mt-0.5 text-xs font-medium text-ink-800">{meta.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* مرحله ۱ */}
          {step === 0 && (
            <section className="space-y-3">
              {passengers.map((passenger, index) => (
                <div key={index} className="card p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xs font-bold text-ink-900">
                      {item.kind === 'hotel' ? 'مسافر اصلی' : `مسافر ${faDigits(index + 1)}`}
                    </h2>
                    <span className="text-2xs text-ink-400">
                      {index === 0 ? 'بزرگسال' : item.kind === 'hotel' ? 'همراه' : 'بزرگسال'}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="field-label">نام (لاتین یا فارسی)</label>
                      <div className={cn('field-shell', errors[`p${index}-firstName`] && 'field-shell-error')}>
                        <input
                          value={passenger.firstName}
                          onChange={(event) =>
                            setPassengers((current) =>
                              current.map((entry, i) => (i === index ? { ...entry, firstName: event.target.value } : entry)),
                            )
                          }
                          placeholder="مثال: امیرحسین"
                          className="input-base"
                        />
                      </div>
                      {errors[`p${index}-firstName`] && (
                        <p className="mt-1 text-2xs text-danger-600">{errors[`p${index}-firstName`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="field-label">نام خانوادگی</label>
                      <div className={cn('field-shell', errors[`p${index}-lastName`] && 'field-shell-error')}>
                        <input
                          value={passenger.lastName}
                          onChange={(event) =>
                            setPassengers((current) =>
                              current.map((entry, i) => (i === index ? { ...entry, lastName: event.target.value } : entry)),
                            )
                          }
                          placeholder="مثال: رضایی"
                          className="input-base"
                        />
                      </div>
                      {errors[`p${index}-lastName`] && (
                        <p className="mt-1 text-2xs text-danger-600">{errors[`p${index}-lastName`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="field-label">کد ملی</label>
                      <div className={cn('field-shell', errors[`p${index}-nationalId`] && 'field-shell-error')}>
                        <input
                          value={passenger.nationalId}
                          onChange={(event) =>
                            setPassengers((current) =>
                              current.map((entry, i) =>
                                i === index ? { ...entry, nationalId: event.target.value.replace(/\D/g, '').slice(0, 10) } : entry,
                              ),
                            )
                          }
                          placeholder="۱۰ رقم"
                          inputMode="numeric"
                          className="input-base num dir-ltr"
                        />
                      </div>
                      {errors[`p${index}-nationalId`] && (
                        <p className="mt-1 text-2xs text-danger-600">{errors[`p${index}-nationalId`]}</p>
                      )}
                    </div>

                    <div>
                      <SelectField
                        label="جنسیت"
                        value={passenger.gender}
                        onChange={(value) =>
                          setPassengers((current) => current.map((entry, i) => (i === index ? { ...entry, gender: value } : entry)))
                        }
                        options={[
                          { value: 'male', label: 'آقا' },
                          { value: 'female', label: 'خانم' },
                        ]}
                        icon="user"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <DateField
                        label="تاریخ تولد"
                        value={passenger.birthDate}
                        min={new Date(1930, 0, 1)}
                        hideQuickAction
                        placeholder="انتخاب تاریخ تولد"
                        error={Boolean(errors[`p${index}-birthDate`])}
                        onChange={(date) =>
                          setPassengers((current) => current.map((entry, i) => (i === index ? { ...entry, birthDate: date } : entry)))
                        }
                      />
                      {errors[`p${index}-birthDate`] && (
                        <p className="mt-1 text-2xs text-danger-600">{errors[`p${index}-birthDate`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="card p-4 sm:p-5">
                <h2 className="mb-3 text-xs font-bold text-ink-900">اطلاعات تماس</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="field-label">شماره موبایل</label>
                    <div className={cn('field-shell', errors.mobile && 'field-shell-error')}>
                      <input
                        value={contact.mobile}
                        onChange={(event) => setContact({ ...contact, mobile: event.target.value.replace(/\D/g, '').slice(0, 11) })}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        inputMode="numeric"
                        className="input-base num dir-ltr"
                      />
                    </div>
                    {errors.mobile && <p className="mt-1 text-2xs text-danger-600">{errors.mobile}</p>}
                  </div>
                  <div>
                    <label className="field-label">ایمیل (اختیاری)</label>
                    <div className={cn('field-shell', errors.email && 'field-shell-error')}>
                      <input
                        value={contact.email}
                        onChange={(event) => setContact({ ...contact, email: event.target.value })}
                        placeholder="you@example.com"
                        className="input-base dir-ltr"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-2xs text-danger-600">{errors.email}</p>}
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-2 text-2xs leading-5 text-ink-500">
                  <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  بلیط و پیامک تأیید رزرو به شماره موبایل وارد شده ارسال می‌شود.
                </p>
              </div>
            </section>
          )}

          {/* مرحله ۲ */}
          {step === 1 && (
            <section className="card p-4 sm:p-5">
              <h2 className="mb-3 text-xs font-bold text-ink-900">انتخاب خدمات</h2>

              {item.kind === 'flight' && (
                <div className="space-y-4">
                  <div>
                    <p className="field-label">اولویت صندلی</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'window', label: 'کنار پنجره' },
                        { key: 'aisle', label: 'کنار راهرو' },
                        { key: 'any', label: 'بدون اولویت' },
                      ].map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setServices({ ...services, seat: option.key })}
                          className={cn(
                            'rounded-lg border px-3 py-2.5 text-2xs font-medium transition',
                            services.seat === option.key
                              ? 'border-brand-400 bg-brand-50 text-brand-700'
                              : 'border-ink-200 text-ink-600 hover:border-ink-300',
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-ink-100 pt-4">
                    <ServiceRow
                      title="بار اضافه (۱۲ کیلوگرم)"
                      description="افزودن ۱۲ کیلوگرم بار به مجاز بار هر مسافر"
                      price={850000}
                      unit={`${faDigits(item.quantity)} مسافر`}
                      checked={services.extraBaggage}
                      onChange={(checked) => setServices({ ...services, extraBaggage: checked })}
                    />
                    <ServiceRow
                      title="بیمه مسافرتی"
                      description="پوشش حوادث و درمان تا سقف ۱۰۰ میلیون تومان"
                      price={285000}
                      unit={`${faDigits(item.quantity)} مسافر`}
                      checked={services.insurance}
                      onChange={(checked) => setServices({ ...services, insurance: checked })}
                    />
                  </div>
                </div>
              )}

              {item.kind === 'hotel' && (
                <div className="space-y-1">
                  <ServiceRow
                    title="صبحانه بوفه"
                    description="صبحانه برای تمام مسافران اتاق"
                    price={240000}
                    unit="هر شب"
                    checked={hotelServices.breakfast}
                    onChange={(checked) => setHotelServices({ ...hotelServices, breakfast: checked })}
                  />
                  <ServiceRow
                    title="تخت اضافه"
                    description="مناسب اتاق سه‌نفره"
                    price={480000}
                    unit="یک‌بار"
                    checked={hotelServices.extraBed}
                    onChange={(checked) => setHotelServices({ ...hotelServices, extraBed: checked })}
                  />
                  <ServiceRow
                    title="ترانسفر فرودگاهی"
                    description="سرویس اختصاصی رفت و برگشت"
                    price={650000}
                    unit="یک‌بار"
                    checked={hotelServices.transfer}
                    onChange={(checked) => setHotelServices({ ...hotelServices, transfer: checked })}
                  />
                </div>
              )}

              {(item.kind === 'train' || item.kind === 'bus') && (
                <div className="space-y-1">
                  <ServiceRow
                    title="بیمه مسافرتی"
                    description="پوشش حوادث سفر"
                    price={285000}
                    unit={`${faDigits(item.quantity)} نفر`}
                    checked={services.insurance}
                    onChange={(checked) => setServices({ ...services, insurance: checked })}
                  />
                  <ServiceRow
                    title="پذیرایی میان‌راه"
                    description="شام و صبحانه در طول مسیر"
                    price={195000}
                    unit={`${faDigits(item.quantity)} نفر`}
                    checked={services.meal}
                    onChange={(checked) => setServices({ ...services, meal: checked })}
                  />
                </div>
              )}

              {item.kind === 'tour' && (
                <div className="space-y-1">
                  <ServiceRow
                    title="بیمه مسافرتی تکمیلی"
                    description="پوشش کامل درمان و حوادث در مقصد"
                    price={420000}
                    unit={`${faDigits(item.quantity)} نفر`}
                    checked={services.insurance}
                    onChange={(checked) => setServices({ ...services, insurance: checked })}
                  />
                  <ServiceRow
                    title="تور یک‌روزه اضافه"
                    description="گشت اختصاصی در روز آزاد"
                    price={1250000}
                    unit="یک‌بار"
                    checked={services.meal}
                    onChange={(checked) => setServices({ ...services, meal: checked })}
                  />
                </div>
              )}
            </section>
          )}

          {/* مرحله ۳ */}
          {step === 2 && (
            <section className="card p-4 sm:p-5">
              <h2 className="mb-3 text-xs font-bold text-ink-900">روش پرداخت</h2>
              <div className="space-y-2">
                {[
                  { key: 'gateway', title: 'پرداخت اینترنتی', description: 'درگاه امن بانکی — بلافاصله پس از پرداخت بلیط صادر می‌شود.' },
                  { key: 'credit', title: 'پرداخت اعتباری', description: 'اقساط ۴ تا ۱۲ ماهه برای سفارش‌های بالای ۲۰ میلیون تومان.' },
                  { key: 'wallet', title: 'کیف پول سفربان', description: 'استفاده از موجودی و اعتبار باشگاه مشتریان.' },
                ].map((option) => (
                  <label
                    key={option.key}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition',
                      paymentMethod === option.key ? 'border-brand-400 bg-brand-50/60' : 'border-ink-200 hover:border-ink-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === option.key}
                      onChange={() => setPaymentMethod(option.key)}
                      className="mt-0.5 h-4 w-4 accent-brand-600"
                    />
                    <span>
                      <span className="block text-xs font-medium text-ink-800">{option.title}</span>
                      <span className="mt-0.5 block text-2xs leading-5 text-ink-500">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-2.5 border-t border-ink-100 pt-4">
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(event) => setAcceptedRules(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-brand-600"
                />
                <span className="text-2xs leading-6 text-ink-600">
                  قوانین و مقررات سفربان و شرایط کنسلی این رزرو را مطالعه کرده و می‌پذیرم.
                </span>
              </label>
              {errors.rules && <p className="mt-1 text-2xs text-danger-600">{errors.rules}</p>}
            </section>
          )}

          {/* مرحله ۴ */}
          {step === 3 && orderId && (
            <section className="card p-5 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-success-600">
                <Icon name="check" className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-base font-bold text-ink-900">رزرو شما با موفقیت ثبت شد</h2>
              <p className="mt-2 text-xs leading-6 text-ink-500">
                شماره سفارش شما <span className="num font-bold text-ink-900">{orderId}</span> است. بلیط و
                اطلاعات سفر به شماره موبایل و ایمیل شما ارسال شد.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link to="/account">
                  <Button>مشاهده در سفرهای من</Button>
                </Link>
                <Button variant="secondary" onClick={() => window.print()} icon={<Icon name="download" className="h-4 w-4" />}>
                  چاپ رسید رزرو
                </Button>
              </div>
            </section>
          )}

          {step < 3 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="secondary"
                onClick={() => setStep((current) => Math.max(current - 1, 0))}
                disabled={step === 0}
                icon={<Icon name="chevron-right" className="h-4 w-4" />}
              >
                مرحله قبل
              </Button>
              <Button size="lg" onClick={next} className="sm:min-w-[200px]">
                {step === 2 ? `پرداخت و صدور (${formatToman(total)})` : 'مرحله بعد'}
              </Button>
            </div>
          )}
        </div>

        {/* خلاصه سفارش */}
        <aside>
          <div className="card sticky top-20 p-4 sm:p-5">
            <h2 className="text-xs font-bold text-ink-900">خلاصه سفارش</h2>
            <div className="mt-3 space-y-2 text-2xs text-ink-600">
              <div className="flex items-center justify-between">
                <span className="num">
                  {item.unitLabel} × {faDigits(item.quantity)}
                </span>
                <span className="num">{formatNumber(basePrice)}</span>
              </div>
              {servicesPrice > 0 && (
                <div className="flex items-center justify-between">
                  <span>خدمات اضافه</span>
                  <span className="num">{formatNumber(servicesPrice)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>مالیات بر ارزش افزوده (۹٪)</span>
                <span className="num">{formatNumber(tax)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
              <span className="text-xs font-medium text-ink-700">مبلغ قابل پرداخت</span>
              <span className="num text-base font-bold text-ink-900">{formatToman(total)}</span>
            </div>

            <ul className="mt-4 space-y-2 text-2xs text-ink-500">
              <li className="flex items-start gap-1.5">
                <Icon name="shield-check" className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                پرداخت از طریق درگاه رسمی و امن بانکی
              </li>
              <li className="flex items-start gap-1.5">
                <Icon name="refund" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                استرداد آنلاین و بدون تماس تلفنی
              </li>
              <li className="flex items-start gap-1.5">
                <Icon name="support" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                پشتیبانی ۲۴ ساعته سفربان
              </li>
            </ul>

            <p className="num mt-4 rounded-lg bg-ink-50 px-3 py-2 text-[0.6rem] text-ink-500">
              اعتبار این قیمت تا {faDigits(diffDays(addDays(today, 1), today) * 24)} ساعت آینده حفظ می‌شود.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ServiceRow({
  title,
  description,
  price,
  unit,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  price: number;
  unit: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl p-3 transition hover:bg-ink-50">
      <span className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-brand-600"
        />
        <span>
          <span className="block text-xs font-medium text-ink-800">{title}</span>
          <span className="mt-0.5 block text-2xs text-ink-500">{description}</span>
        </span>
      </span>
      <span className="shrink-0 text-end">
        <span className="num block text-xs font-bold text-ink-900">{formatNumber(price)}</span>
        <span className="block text-[0.6rem] text-ink-400">{unit}</span>
      </span>
    </label>
  );
}
