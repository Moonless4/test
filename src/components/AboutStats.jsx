import { ChefHat, Soup, Users, UtensilsCrossed } from 'lucide-react'
import { stats } from '../data/site'

const iconMap = { ChefHat, Users, UtensilsCrossed, Soup }

export default function AboutStats() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 text-xs font-medium text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            درباره رستوران نوال
          </span>
          <h2 className="mt-4 text-[22px] font-extrabold text-ink md:text-[30px]">هدف اصلی ما</h2>
          <p className="mt-4 text-sm leading-7 text-ink-soft md:text-base md:leading-8">
            هدف ما این است که هر مهمان، طعم واقعی غذای خانگی و اصیل ایرانی را در فضایی گرم و
            صمیمی تجربه کند. از انتخاب مواد اولیه تازه تا لحظه سرو، همه‌چیز با دقت و وسواس
            انجام می‌شود تا کیفیت همیشه ثابت بماند.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 rounded-[26px] bg-canvas/70 p-4 md:grid-cols-4 md:gap-5 md:p-6">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon]
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-3 py-6 text-center shadow-[0_16px_34px_-30px_rgba(43,27,20,0.9)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <span className="text-xl font-black text-brand md:text-2xl">{stat.value}</span>
                <span className="text-[11px] text-ink-soft md:text-xs">{stat.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
