import { BadgeCheck, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { promises } from '../../lib/data';
import Reveal from '../ui/Reveal';

const ICONS: Record<string, typeof Truck> = {
  truck: Truck,
  shield: ShieldCheck,
  badge: BadgeCheck,
  refresh: RefreshCw,
};

export default function Benefits() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="مزایای خرید">
      <Reveal>
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 rounded-panel border border-line bg-cream px-5 py-8 sm:px-8 lg:grid-cols-4 lg:gap-6">
          {promises.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div key={item.title} className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-soft">
                  <Icon className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="text-[13px] font-bold text-ink sm:text-[15px]">{item.title}</h3>
                  <p className="mt-1 text-[11px] text-muted sm:text-[13px]">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
