import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SERVICES } from '@/data/services';
import { POPULAR_CITIES } from '@/data/cities';

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-14 text-center">
      <span className="num flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-2xl font-bold text-brand-600">
        ۴۰۴
      </span>
      <h1 className="mt-5 text-lg font-bold text-ink-900 sm:text-2xl">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
      <p className="mt-3 max-w-lg text-xs leading-7 text-ink-500 sm:text-sm">
        ممکن است نشانی تغییر کرده باشد یا این صفحه حذف شده باشد. از میان سرویس‌های زیر، سفر خود را
        ادامه دهید.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/">
          <Button icon={<Icon name="home" className="h-4 w-4" />}>بازگشت به صفحه‌ی اصلی</Button>
        </Link>
        <Link to="/contact">
          <Button variant="secondary">تماس با پشتیبانی</Button>
        </Link>
      </div>

      <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SERVICES.slice(0, 5).map((service) => (
          <Link
            key={service.key}
            to={service.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-ink-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-card"
          >
            <Icon name={service.icon} className="h-5 w-5 text-brand-600" />
            <span className="text-2xs font-medium text-ink-700">{service.title}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-1.5">
        <span className="text-2xs text-ink-500">مقصدهای پرطرفدار:</span>
        {POPULAR_CITIES.slice(0, 8).map((city) => (
          <Link
            key={city.code}
            to={`/hotels?city=${city.code}&name=${encodeURIComponent(city.name)}`}
            className="rounded-md border border-ink-200 px-2 py-1 text-2xs text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
          >
            {city.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
