import { Plus, Star } from 'lucide-react'
import { formatPrice } from '../data/site'

export default function FoodCard({ food, onAdd }) {
  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_18px_40px_-34px_rgba(43,27,20,0.8)] transition hover:-translate-y-1 hover:shadow-[0_26px_45px_-30px_rgba(43,27,20,0.55)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
        <img
          src={food.image}
          alt={food.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {food.discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-brand px-2 py-1 text-[11px] font-bold text-white">
            ٪{food.discount.toLocaleString('fa-IR')}
          </span>
        )}
        <button
          type="button"
          onClick={() => onAdd?.(food)}
          aria-label={`افزودن ${food.name} به سبد خرید`}
          className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-white text-brand shadow-md transition hover:bg-brand hover:text-white"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-ink md:text-[15px]">{food.name}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-ink-soft">
            <Star size={12} className="fill-gold text-gold" />
            {food.rating}
          </span>
        </div>

        <p className="mt-1.5 line-clamp-1 text-[11px] text-ink-soft md:text-xs">
          {food.description}
        </p>

        <div className="mt-3 flex items-baseline gap-2 border-t border-dashed border-black/10 pt-3">
          <span className="text-sm font-extrabold text-brand">
            {formatPrice(food.price)}
          </span>
          <span className="text-[11px] text-ink-soft">تومان</span>
          {food.oldPrice && (
            <span className="mr-auto text-[11px] text-ink-soft/60 line-through">
              {formatPrice(food.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
