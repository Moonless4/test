import { SearchBox } from '@/components/search/SearchBox';
import { Icon } from '@/components/ui/Icon';

/** بخش اصلی صفحه‌ی خانه: پنل جستجو روی پس‌زمینه‌ی روشن برند */
export function Hero() {
  // بدون overflow-hidden تا پنل‌های شناور جستجو (تقویم، مسافر، شهر) بریده نشوند
  return (
    <section className="relative border-b border-ink-200 bg-white">
      <div className="container-page relative py-7 sm:py-9 lg:py-11">
        <SearchBox />
      </div>

      <div className="border-t border-ink-100 bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 text-2xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <Icon name="bolt" className="h-4 w-4 text-accent-500" />
            تخفیف‌های امروز تا <span className="num">۲۰٪</span> روی پروازهای داخلی
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="globe" className="h-4 w-4 text-brand-600" />
            رزرو از <span className="num">۱۹۰</span> کشور جهان
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="users" className="h-4 w-4 text-brand-600" />
            بیش از <span className="num">۲ میلیون</span> مسافر در سال گذشته
          </span>
        </div>
      </div>
    </section>
  );
}
