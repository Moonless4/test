import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';

const STATS: Array<{ icon: string; label: string }> = [
  { icon: 'hotel', label: '۱۲ هزار اقامتگاه' },
  { icon: 'globe', label: '۱۹۰ کشور جهان' },
  { icon: 'support', label: 'پشتیبانی شبانه‌روزی' },
];

/** بنر تیره‌ی رزرو اقامت — تنها بلوک تیره‌ی صفحه‌ی خانه */
export function PromoBanner() {
  return (
    <section className="container-page pb-8 pt-2 sm:pb-10">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-ink-900 via-brand-900 to-brand-700 px-5 py-7 text-white sm:px-8 sm:py-9">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-20 -top-24 h-60 w-60 rounded-full border border-white/10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -start-10 h-48 w-48 rounded-full bg-white/5"
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <span className="chip border-white/25 bg-white/10 text-white/90">
              <Icon name="bed" className="h-3.5 w-3.5" />
              رزرو اقامت
            </span>
            <h2 className="mt-3 text-lg font-bold leading-8 text-white sm:text-xl sm:leading-9">
              اقامت بعدی‌ات را از میان هزاران هتل و اقامتگاه انتخاب کن
            </h2>
            <p className="mt-2 text-xs leading-6 text-white/75 sm:text-sm">
              از هتل‌های پنج‌ستاره‌ی شهری تا ویلاهای ساحلی و اقامتگاه‌های بومی؛ با تضمین بهترین
              قیمت، تصاویر واقعی و لغو آنلاین رزرو.
            </p>

            <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {STATS.map((stat) => (
                <li key={stat.label} className="flex items-center gap-1.5 text-2xs text-white/85">
                  <Icon name={stat.icon} className="h-4 w-4 text-white/70" />
                  <span className="num">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <Link
              to="/hotels"
              className="inline-flex h-[52px] select-none items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-medium text-brand-800 transition-colors hover:bg-white/90"
            >
              جستجوی هتل
              <Icon name="chevron-left" className="h-4 w-4" />
            </Link>
            <Link
              to="/stays"
              className="inline-flex h-[52px] select-none items-center justify-center gap-2 rounded-lg border border-white/35 px-6 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10"
            >
              ویلا و اقامتگاه
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
