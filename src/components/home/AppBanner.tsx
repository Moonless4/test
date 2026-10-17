import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { buttonClasses } from '@/components/ui/Button';
import { SERVICE_TABS } from '@/data/services';
import { img } from '@/data/images';

/** سرویس‌های قابل دسترس در اپلیکیشن — هشت مورد، بدون «سایر خدمات» */
const APP_SERVICES = SERVICE_TABS.filter((tab) => tab.key !== 'more').slice(0, 8);

/** بنر معرفی اپلیکیشن — تصویر در یک سو، شبکه‌ی سرویس‌ها و دکمه‌های دریافت در سوی دیگر */
export function AppBanner() {
  return (
    <section className="container-page py-8 sm:py-10">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
        <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
          <img
            src={img('kish')}
            alt="سفر با اپلیکیشن سفربان"
            loading="lazy"
            className="h-36 w-full object-cover sm:h-full"
          />

          <div className="p-5 sm:p-6">
            <h2 className="text-lg font-bold sm:text-xl">اپلیکیشن سفربان</h2>
            <p className="mt-1.5 text-xs leading-6 text-ink-500 sm:text-sm">
              بلیط هواپیما، قطار و اتوبوس، رزرو هتل و اقامتگاه، تور، ویزا و بیمه — همه در یک
              اپلیکیشن، با بلیط‌های همیشه در دسترس.
            </p>

            <ul className="mt-4 grid grid-cols-4 gap-x-2 gap-y-3.5">
              {APP_SERVICES.map((service) => (
                <li key={service.key} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon name={service.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-[0.62rem] leading-4 text-ink-600">{service.short ?? service.title}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/app"
                className={buttonClasses('secondary', 'md', 'sm:flex-1')}
              >
                <Icon name="apple" className="h-5 w-5" />
                App Store
              </Link>
              <Link
                to="/app"
                className={buttonClasses('secondary', 'md', 'sm:flex-1')}
              >
                <Icon name="playstore" className="h-5 w-5" />
                Google Play
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
