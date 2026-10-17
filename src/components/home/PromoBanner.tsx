import { IMG } from '@/data/images';

/** بنر تصویری اقامت — فقط تصویر داخل کادر */
export function PromoBanner() {
  return (
    <section className="container-page pb-8 pt-2 sm:pb-10">
      <div className="overflow-hidden rounded-2xl border border-ink-200">
        <img
          src={IMG['hotel-9']}
          alt="پیشنهاد اقامت سفربان"
          loading="lazy"
          className="h-40 w-full object-cover sm:h-56"
        />
      </div>
    </section>
  );
}
