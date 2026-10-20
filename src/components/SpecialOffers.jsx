import { Flame } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { formatPrice, specialOffers } from '../data/site'

export default function SpecialOffers() {
  return (
    <section className="bg-white pb-14 md:pb-20">
      <div className="container-page">
        <SectionHeading title="منوی محبوب امروز" action="مشاهده همه" />

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {specialOffers.map((offer) => (
            <article
              key={offer.id}
              className="group flex overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_18px_40px_-32px_rgba(43,27,20,0.7)] transition hover:-translate-y-1 hover:shadow-[0_26px_45px_-30px_rgba(43,27,20,0.6)]"
            >
              <div className="relative w-[38%] shrink-0 overflow-hidden bg-canvas">
                <img
                  src={offer.image}
                  alt={offer.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-1 flex-col justify-center gap-2 p-4 md:p-5">
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-bold text-[#8a6100] md:text-[11px]">
                  <Flame size={12} className="text-gold" />
                  پیشنهاد شگفت انگیز
                </span>

                <h3 className="text-[15px] font-bold text-ink md:text-base">{offer.name}</h3>
                <p className="line-clamp-2 text-[11px] leading-5 text-ink-soft md:text-xs">
                  {offer.description}
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-brand md:text-base">
                    {formatPrice(offer.price)}
                  </span>
                  <span className="text-[11px] text-ink-soft">تومان</span>
                  <span className="text-[11px] text-ink-soft/60 line-through">
                    {formatPrice(offer.oldPrice)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
