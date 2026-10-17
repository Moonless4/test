import { useState } from 'react';
import { ServiceTabs } from './ServiceTabs';
import { FlightSearchForm } from './FlightSearchForm';
import { HotelSearchForm } from './HotelSearchForm';
import { TripSearchForm } from './TripSearchForm';
import { SimpleSearchForm } from './SimpleSearchForm';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface SearchBoxProps {
  defaultService?: string;
  className?: string;
  /** نمایش سرتیتر بالای پنل جستجو */
  showHeading?: boolean;
}

const HEADINGS: Record<string, { title: string; description: string }> = {
  flight: {
    title: 'بلیط هواپیما را سریع، ارزان و مطمئن رزرو کنید',
    description: 'مقایسه‌ی قیمت بیش از ۲۰ ایرلاین داخلی و خارجی، با پشتیبانی ۲۴ ساعته سفربان.',
  },
  hotel: {
    title: 'اقامت دلخواه خود را در ایران و جهان پیدا کنید',
    description: 'بیش از ۹ هزار هتل، هتل‌آپارتمان و اقامتگاه بومی با تصاویر واقعی و نظرات مسافران.',
  },
  train: {
    title: 'بلیط قطار را با بهترین صندلی رزرو کنید',
    description: 'قطارهای سریع‌السیر، درجه یک و لوکس پنج‌ستاره در تمام مسیرهای ریلی کشور.',
  },
  bus: {
    title: 'سفر جاده‌ای با اتوبوس‌های VIP',
    description: 'رزرو بلیط از تمام پایانه‌های کشور با انتخاب صندلی و لغو آسان.',
  },
  tour: {
    title: 'تورهای داخلی و خارجی با راهنمای فارسی',
    description: 'تورهای گروهی و اختصاصی با بیمه، ترانسفر و برنامه‌ی کامل سفر.',
  },
  villa: {
    title: 'ویلا و اقامتگاه بومی برای اقامت گروهی',
    description: 'اقامتگاه‌های ساحلی، جنگلی و بومی با ظرفیت‌های متفاوت.',
  },
  visa: {
    title: 'درخواست ویزا با پیگیری تا لحظه‌ی صدور',
    description: 'مشاوره، تشکیل پرونده و پیگیری ویزای توریستی، تحصیلی و کاری.',
  },
  insurance: {
    title: 'بیمه‌ی مسافرتی، صدور آنی و آنلاین',
    description: 'بیمه‌نامه‌ی معتبر برای تمام مقاصد، با پوشش درمان و حوادث.',
  },
  more: {
    title: 'سایر خدمات سفر سفربان',
    description: 'eSIM، تشریفات CIP، گشت شهری، ترانسفر فرودگاهی، اجاره خودرو و خرید ارز.',
  },
};

const TAB_SERVICE_MAP: Record<string, string> = {
  flight: 'flight',
  hotel: 'hotel',
  train: 'train',
  bus: 'bus',
  tour: 'tour',
  villa: 'villa',
  visa: 'visa',
  insurance: 'insurance',
  more: 'more',
  stays: 'villa',
  tours: 'tour',
};

export function SearchBox({ defaultService = 'flight', className, showHeading = true }: SearchBoxProps) {
  const [service, setService] = useState(TAB_SERVICE_MAP[defaultService] ?? 'flight');
  const heading = HEADINGS[service] ?? HEADINGS.flight;

  const renderForm = () => {
    switch (service) {
      case 'hotel':
        return <HotelSearchForm />;
      case 'train':
        return <TripSearchForm service="train" />;
      case 'bus':
        return <TripSearchForm service="bus" />;
      case 'tour':
        return <SimpleSearchForm service="tour" />;
      case 'villa':
        return <SimpleSearchForm service="villa" />;
      case 'visa':
        return <SimpleSearchForm service="visa" />;
      case 'insurance':
        return <SimpleSearchForm service="insurance" />;
      case 'more':
        return <SimpleSearchForm service="more" />;
      default:
        return <FlightSearchForm />;
    }
  };

  return (
    <section className={cn('relative', className)}>
      {showHeading && (
        <div className="mx-auto mb-5 max-w-2xl text-center sm:mb-6">
          <h1 className="text-balance text-xl font-bold leading-9 text-ink-900 sm:text-2xl sm:leading-10 lg:text-[1.75rem]">
            {heading.title}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-ink-500 sm:text-sm">{heading.description}</p>
        </div>
      )}

      {/* بدون overflow-hidden تا پنل‌های شناور فیلدها (تقویم، مسافر، شهر) بریده نشوند */}
      <div className="rounded-2xl border border-ink-200 bg-white shadow-panel">
        <ServiceTabs active={service} onChange={setService} badges={{ flight: 20, hotel: 15 }} />
        <div key={service} className="animate-fade-in p-4 sm:p-5 lg:p-6">
          {renderForm()}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-2xs text-ink-500 sm:text-xs">
        <span className="flex items-center gap-1.5">
          <Icon name="support" className="h-4 w-4 text-brand-600" />
          پشتیبانی ۲۴ ساعته
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="shield-check" className="h-4 w-4 text-brand-600" />
          پرداخت امن بانکی
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="refund" className="h-4 w-4 text-brand-600" />
          استرداد آنلاین بلیط
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="percent" className="h-4 w-4 text-brand-600" />
          تضمین بهترین قیمت
        </span>
      </div>
    </section>
  );
}
