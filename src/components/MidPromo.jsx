import {
  ArrowLeft,
  BadgeCheck,
  ChefHat,
  Clock3,
  Leaf,
  Phone,
  ShoppingBasket,
  Truck,
} from 'lucide-react'
import { features } from '../data/site'

const featureIcons = { Leaf, ChefHat, Truck, BadgeCheck }

export default function MidPromo() {
  return (
    <section id="about" className="bg-canvas/60 py-14 md:py-20">
      <div className="container-page grid gap-5 md:grid-cols-[0.95fr_1.15fr_0.95fr] md:gap-6">
        <div className="flex flex-col gap-5">
          <div className="relative flex-1 overflow-hidden rounded-[24px] bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-[0_25px_50px_-30px_rgba(184,0,31,0.9)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-ink">
              <ChefHat size={13} />
              پیشنهاد ویژه
            </span>
            <h3 className="mt-4 text-xl font-extrabold md:text-2xl">پیشنهاد ویژه سرآشپز</h3>
            <p className="mt-2 text-xs leading-6 text-white/80 md:text-sm">
              هر شب یک غذای ویژه با تخفیف اختصاصی؛ امشب استیک ریب‌آی با ۳۰٪ تخفیف.
            </p>
            <a
              href="#menu"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-brand transition hover:bg-gold hover:text-ink"
            >
              سفارش بدهید
              <ArrowLeft size={14} />
            </a>
            <span className="pointer-events-none absolute -left-10 -bottom-12 h-40 w-40 rounded-full bg-white/10" />
          </div>

          <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_20px_40px_-34px_rgba(43,27,20,0.7)]">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-[#8a6100]">
              <ShoppingBasket size={20} strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-ink md:text-xl">رزرو یا سفارش آنلاین</h3>
            <p className="mt-2 text-xs leading-6 text-ink-soft md:text-sm">
              سفارش آنلاین یا رزرو میز با یک تماس؛ ما همه‌چیز را برایتان آماده می‌کنیم.
            </p>
            <a
              href="tel:+982122345678"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark"
            >
              <Phone size={14} />
              ۰۲۱ - ۲۲ ۳۴ ۵۶ ۷۸
            </a>
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-[26px] md:min-h-[430px]">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=900&q=80"
            alt="سرآشپز در حال آماده‌سازی غذا"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock3 size={16} className="text-gold" />
              آشپزخانه ما هر روز از ۸ صبح باز است
            </p>
          </div>
        </div>

        <ul className="flex flex-col justify-center gap-5 rounded-[24px] bg-white p-5 shadow-[0_20px_40px_-34px_rgba(43,27,20,0.7)] md:p-6">
          {features.map((feature) => {
            const Icon = featureIcons[feature.icon]
            return (
              <li key={feature.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{feature.title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-ink-soft md:text-xs">
                    {feature.text}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
