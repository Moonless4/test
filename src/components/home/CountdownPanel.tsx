import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Zap } from 'lucide-react';
import { toFa } from '../../lib/format';

const pad = (value: number) => toFa(String(value).padStart(2, '0'));

/** Seconds left until the end of the current day (local time). */
function secondsToMidnight(): number {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

/** "Off-time" promo panel: lightning badge, live countdown and a shop-all button. */
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
    <div className="flex w-full shrink-0 flex-col items-center justify-center gap-4 rounded-panel bg-gradient-to-b from-wine to-wine-dark px-4 py-6 text-center text-white sm:w-[210px] xl:w-[230px]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
        <Zap className="h-6 w-6 fill-gold text-gold" />
      </span>

      <div>
        <h3 className="text-lg font-black sm:text-xl">آفرتایم</h3>
        <p className="mt-1 text-[11px] text-white/75 sm:text-xs">
          تخفیف‌های ویژه در استایل آن
        </p>
      </div>

      <div className="flex items-start gap-1.5">
        {units.map((unit) => (
          <div key={unit.label} className="flex flex-col items-center gap-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-bold text-wine sm:h-11 sm:w-11 sm:text-lg">
              {unit.value}
            </span>
            <span className="text-[10px] text-white/80 sm:text-[11px]">{unit.label}</span>
          </div>
        ))}
      </div>

      <Link
        to="/shop?discount=true"
        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white text-[13px] font-bold text-wine transition-colors hover:bg-cream"
      >
        مشاهده همه
        <ChevronLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}
