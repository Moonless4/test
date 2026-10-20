import { Cookie, CupSoda, Drumstick, Pizza, Salad, Sandwich } from 'lucide-react'
import { categories } from '../data/site'

const icons = { CupSoda, Drumstick, Cookie, Sandwich, Salad, Pizza }

export default function Categories() {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="container-page">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-5">
          {categories.map((category) => {
            const Icon = icons[category.icon]
            return (
              <a
                key={category.id}
                href="#menu"
                className="group flex flex-col items-center gap-3 rounded-[20px] border border-black/5 bg-canvas/70 px-2 py-5 text-center transition hover:-translate-y-1 hover:border-brand/20 hover:bg-brand-soft/60 hover:shadow-[0_18px_35px_-25px_rgba(43,27,20,0.6)] md:py-6"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-brand shadow-sm transition group-hover:bg-brand group-hover:text-white md:h-14 md:w-14">
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <span className="text-xs font-medium text-ink/80 md:text-sm">{category.label}</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
