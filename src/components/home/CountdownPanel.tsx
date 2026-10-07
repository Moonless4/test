import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Percent } from 'lucide-react';
import { toFa } from '../../lib/format';

const pad = (value: number) => toFa(String(value).padStart(2, '0'));

/** Seconds left until the end of the current day (local time). */
function secondsToMidnight(): number {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

/**
 * "Amazing discount" promo panel: a wide countdown banner on phones and a side card
 * from `sm` up. Both lead to the discounted catalog.
 */
export default function CountdownPanel() {
  const [left, setLeft] = useState(secondsToMidnight);

  useEffect(() => {
    const timer = window.setInterval(() => setLeft(secondsToMidnight()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    { value: pad(Math.floor(left / 3600)), label: 'ساعت' },
    { value: pad(Math.floor((left % 3600) / 60)), label: 'دقیقه' },
    { value: pad(left % 60), label: 'ثانیه' },
  ];

  return (
    <div className="flex w-full shrink-0 flex-col lg:w-[210px] xl:w-[230px]">
      {/* Phones and tablets: the full-width banner. */}
      <Link
        to="/shop?discount=true"
        className="flex items-center justify-between gap-1.5 rounded-panel bg-gradient-to-l from-teal-950 to-teal-800 px-2.5 py-3 text-white lg:hidden"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <Percent className="h-4 w-4 shrink-0" />
          <span className="truncate text-[12px] font-black">تخفیف شگفت‌انگیز</span>
        </span>

        {/* Countdown and arrow travel together at the end of the strip. */}
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="flex shrink-0 items-center gap-1">
            {units.map((unit, index) => (
              <Fragment key={unit.label}>
                {index > 0 ? (
                  <span aria-hidden className="text-[12px] font-bold text-white/60">
                    :
                  </span>
                ) : null}
                <span className="flex flex-col items-center rounded-lg bg-white px-2 py-1.5 text-teal-950">
                  <span className="text-[15px] font-black leading-5">{unit.value}</span>
                  <span className="text-[9px] leading-3 text-teal-950/70">{unit.label}</span>
                </span>
              </Fragment>
            ))}
          </span>

          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-teal-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </span>
        </span>
      </Link>

      {/* Desktop: the side card. */}
      <div className="hidden flex-1 flex-col items-center justify-center gap-4 rounded-panel bg-gradient-to-b from-teal-800 to-teal-950 px-4 py-6 text-center text-white lg:flex">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
          <Percent className="h-6 w-6 text-gold" />
        </span>

        <div>
          <h3 className="text-lg font-black sm:text-xl">تخفیف شگفت‌انگیز</h3>
          <p className="mt-1 text-[11px] text-white/75 sm:text-xs">
            تخفیف‌های ویژه در مدورا
          </p>
        </div>

        <div className="flex items-start gap-1.5">
          {units.map((unit) => (
            <div key={unit.label} className="flex flex-col items-center gap-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-bold text-teal-900 sm:h-11 sm:w-11 sm:text-lg">
                {unit.value}
              </span>
              <span className="text-[10px] text-white/80 sm:text-[11px]">{unit.label}</span>
            </div>
          ))}
        </div>

        <Link
          to="/shop?discount=true"
          className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white text-[13px] font-bold text-teal-900 transition-colors hover:bg-cream"
        >
          مشاهده همه
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
