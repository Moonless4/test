import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CityField } from '@/components/ui/CityField';
import { DateField } from '@/components/ui/DateField';
import { SelectField } from '@/components/ui/SelectField';
import { Popover } from '@/components/ui/Popover';
import { Counter } from '@/components/ui/Counter';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { buildHotelQuery } from '@/lib/searchParams';
import { addDays, faDigits, startOfDay } from '@/lib/jalali';
import { cn } from '@/lib/utils';
import { MORE_SERVICES } from '@/data/services';
import type { City } from '@/types';

type SimpleService = 'tour' | 'villa' | 'visa' | 'insurance' | 'more';

const VISA_TYPES = [
  { value: 'tourist', label: 'توریستی' },
  { value: 'student', label: 'تحصیلی' },
  { value: 'business', label: 'تجاری و کاری' },
  { value: 'medical', label: 'درمانی' },
];

const VISA_COUNTRIES = [
  { value: 'de', label: 'آلمان' },
  { value: 'it', label: 'ایتالیا' },
  { value: 'fr', label: 'فرانسه' },
  { value: 'at', label: 'اتریش' },
  { value: 'nl', label: 'هلند' },
  { value: 'tr', label: 'ترکیه' },
  { value: 'ge', label: 'گرجستان' },
  { value: 'ae', label: 'امارات' },
  { value: 'my', label: 'مالزی' },
  { value: 'ca', label: 'کانادا' },
];

const INSURANCE_TYPES = [
  { value: 'tourist', label: 'توریستی و شینگن' },
  { value: 'pilgrim', label: 'زائران (عتبات و حج)' },
  { value: 'student', label: 'دانشجویی' },
  { value: 'medical', label: 'درمانی' },
  { value: 'family', label: 'خانوادگی' },
];

const INSURANCE_DURATIONS = [
  { value: '7', label: '۷ روز' },
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: '90', label: '۹۰ روز' },
  { value: '180', label: '۶ ماه' },
  { value: '365', label: 'یک سال' },
];

const TOUR_DURATIONS = [
  { value: 'any', label: 'هر مدت' },
  { value: '2', label: '۲ روز' },
  { value: '3', label: '۳ روز' },
  { value: '4', label: '۴ روز' },
  { value: '5', label: '۵ روز' },
  { value: '7', label: '۷ روز و بیشتر' },
];

export function SimpleSearchForm({ service, className }: { service: SimpleService; className?: string }) {
  const navigate = useNavigate();
  const today = startOfDay(new Date());
  const isVilla = service === 'villa';

  const [city, setCity] = useState<City | null>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(addDays(today, 5));
  const [checkOut, setCheckOut] = useState<Date | null>(addDays(today, 7));
  const [travelDate, setTravelDate] = useState<Date | null>(addDays(today, 10));
  const [guests, setGuests] = useState(2);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [tourDuration, setTourDuration] = useState('any');
  const [visaType, setVisaType] = useState(VISA_TYPES[0].value);
  const [visaCountry, setVisaCountry] = useState(VISA_COUNTRIES[0].value);
  const [insuranceType, setInsuranceType] = useState(INSURANCE_TYPES[0].value);
  const [insuranceDuration, setInsuranceDuration] = useState('30');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const guestsField = (
    <Popover open={guestsOpen} onClose={() => setGuestsOpen(false)} className="w-full" panelClassName="w-[300px] p-4">
      <button
        type="button"
        onClick={() => setGuestsOpen((current) => !current)}
        className={cn('field-shell text-start', guestsOpen && 'border-brand-500 ring-2 ring-brand-500/15')}
      >
        <Icon name="users" className="h-5 w-5 shrink-0 text-ink-400" />
        <span className="min-w-0 flex-1">
          <span className="block text-2xs text-ink-500">تعداد نفرات</span>
          <span className="block truncate text-sm font-medium text-ink-900">{faDigits(guests)} نفر</span>
        </span>
        <Icon name="chevron-down" className={cn('h-4 w-4 shrink-0 text-ink-400 transition', guestsOpen && 'rotate-180')} />
      </button>
      <div>
        <Counter title="تعداد نفرات" value={guests} min={1} max={10} onChange={setGuests} />
        <button
          type="button"
          onClick={() => setGuestsOpen(false)}
          className="mt-3 h-10 w-full rounded-lg bg-brand-600 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          تأیید
        </button>
      </div>
    </Popover>
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};

    if (service === 'villa') {
      if (!city) next.city = 'مقصد را انتخاب کنید';
      if (!checkIn) next.checkIn = 'تاریخ ورود را انتخاب کنید';
      if (!checkOut) next.checkOut = 'تاریخ خروج را انتخاب کنید';
      else if (checkIn && checkOut <= checkIn) next.checkOut = 'تاریخ خروج باید بعد از ورود باشد';
      setErrors(next);
      if (Object.keys(next).length) return;
      navigate(
        `/stays?${buildHotelQuery({
          cityName: city!.name,
          cityCode: city!.code,
          checkIn,
          checkOut,
          rooms: 1,
          guests,
        })}`,
      );
      return;
    }

    if (service === 'tour') {
      setErrors({});
      navigate(`/tours?${city ? `dest=${encodeURIComponent(city.name)}&` : ''}duration=${tourDuration}&guests=${guests}`);
      return;
    }

    if (service === 'visa') {
      setErrors({});
      navigate(`/services/visa?type=${visaType}&country=${visaCountry}&guests=${guests}`);
      return;
    }

    if (service === 'insurance') {
      setErrors({});
      navigate(`/services/insurance?type=${insuranceType}&duration=${insuranceDuration}&guests=${guests}`);
      return;
    }
  };

  if (service === 'more') {
    return (
      <div className={cn('grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6', className)}>
        {MORE_SERVICES.map((item) => (
          <Link
            key={item.key}
            to={item.href}
            className="group flex flex-col gap-2 rounded-xl border border-ink-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-white">
              <Icon name={item.icon} className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium text-ink-800">{item.title}</span>
            <span className="text-2xs leading-5 text-ink-500">{item.description}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn('space-y-3.5', className)} noValidate>
      <div className="grid gap-3 lg:grid-cols-12">
        {service === 'tour' ? (
          <>
            <div className="lg:col-span-4">
              <CityField
                label="مقصد تور"
                placeholder="همه مقاصد — انتخاب مقصد"
                value={city}
                onChange={setCity}
              />
            </div>
            <div className="lg:col-span-3">
              <SelectField label="مدت سفر" value={tourDuration} options={TOUR_DURATIONS} onChange={setTourDuration} icon="clock" />
            </div>
            <div className="lg:col-span-3">
              <DateField label="تاریخ حرکت" value={travelDate} min={today} onChange={setTravelDate} />
            </div>
            <div className="lg:col-span-2">{guestsField}</div>
          </>
        ) : null}

        {isVilla ? (
          <>
            <div className="lg:col-span-4">
              <CityField
                label="مقصد اقامتگاه"
                placeholder="شهر یا منطقه (کیش، رامسر، مشهد …)"
                value={city}
                error={Boolean(errors.city)}
                onChange={setCity}
              />
              {errors.city && <p className="mt-1 text-2xs text-danger-600">{errors.city}</p>}
            </div>
            <div className="lg:col-span-2">
              <DateField
                label="تاریخ ورود"
                value={checkIn}
                min={today}
                error={Boolean(errors.checkIn)}
                onChange={(date) => {
                  setCheckIn(date);
                  if (checkOut && checkOut <= date) setCheckOut(addDays(date, 2));
                }}
              />
              {errors.checkIn && <p className="mt-1 text-2xs text-danger-600">{errors.checkIn}</p>}
            </div>
            <div className="lg:col-span-2">
              <DateField
                label="تاریخ خروج"
                value={checkOut}
                min={checkIn ? addDays(checkIn, 1) : today}
                error={Boolean(errors.checkOut)}
                onChange={setCheckOut}
              />
              {errors.checkOut && <p className="mt-1 text-2xs text-danger-600">{errors.checkOut}</p>}
            </div>
            <div className="lg:col-span-2">{guestsField}</div>
          </>
        ) : null}

        {service === 'visa' ? (
          <>
            <div className="lg:col-span-4">
              <SelectField label="نوع ویزا" value={visaType} options={VISA_TYPES} onChange={setVisaType} icon="passport" />
            </div>
            <div className="lg:col-span-4">
              <SelectField label="کشور مقصد" value={visaCountry} options={VISA_COUNTRIES} onChange={setVisaCountry} icon="globe" />
            </div>
            <div className="lg:col-span-2">{guestsField}</div>
          </>
        ) : null}

        {service === 'insurance' ? (
          <>
            <div className="lg:col-span-4">
              <SelectField
                label="نوع بیمه"
                value={insuranceType}
                options={INSURANCE_TYPES}
                onChange={setInsuranceType}
                icon="shield"
              />
            </div>
            <div className="lg:col-span-2">
              <SelectField
                label="مدت اعتبار"
                value={insuranceDuration}
                options={INSURANCE_DURATIONS}
                onChange={setInsuranceDuration}
                icon="clock"
              />
            </div>
            <div className="lg:col-span-2">
              <DateField label="تاریخ شروع" value={travelDate} min={today} onChange={setTravelDate} />
            </div>
            <div className="lg:col-span-2">{guestsField}</div>
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-ink-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-2xs text-ink-500">
          <Icon name="info" className="h-4 w-4 text-brand-600" />
          {service === 'visa'
            ? 'کارشناسان ویزا در کمتر از یک ساعت کاری با شما تماس می‌گیرند.'
            : service === 'insurance'
              ? 'بیمه‌نامه بلافاصله پس از پرداخت صادر و ارسال می‌شود.'
              : service === 'tour'
                ? 'تمام تورها با راهنمای فارسی و بیمه‌ی مسافرتی ارائه می‌شوند.'
                : 'برای اقامت‌های بیش از ۷ شب تخفیف ویژه اعمال می‌شود.'}
        </p>
        <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-[190px]" icon={<Icon name="search" className="h-5 w-5" />}>
          {service === 'tour'
            ? 'جستجوی تور'
            : isVilla
              ? 'جستجوی اقامتگاه'
              : service === 'visa'
                ? 'ثبت درخواست ویزا'
                : 'محاسبه و صدور بیمه'}
        </Button>
      </div>
    </form>
  );
}

export { VISA_TYPES, VISA_COUNTRIES, INSURANCE_TYPES, INSURANCE_DURATIONS, TOUR_DURATIONS };
export type { SimpleService };
