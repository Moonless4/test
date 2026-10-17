import { SearchBox } from '@/components/search/SearchBox';

/** بخش اصلی صفحه‌ی خانه: پنل جستجو روی پس‌زمینه‌ی روشن برند */
export function Hero() {
  // بدون overflow-hidden تا پنل‌های شناور جستجو (تقویم، مسافر، شهر) بریده نشوند
  return (
    <section className="relative border-b border-ink-200 bg-white">
      <div className="container-page relative py-7 sm:py-9 lg:py-11">
        <SearchBox />
      </div>

    </section>
  );
}
