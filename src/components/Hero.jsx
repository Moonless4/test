import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { heroSlides } from '../data/site'

function CarouselArrow({ direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'قبلی' : 'بعدی'}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-brand bg-white text-brand shadow-sm transition hover:bg-brand hover:text-white md:h-12 md:w-12"
    >
      {direction === 'prev' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
    </button>
  )
}

function HeroCarousel() {
  const [start, setStart] = useState(0)
  const total = heroSlides.length
  const visible = [0, 1, 2].map((offset) => heroSlides[(start + offset) % total])
  const move = (step) => setStart((value) => (value + step + total) % total)

  return (
    <div className="container-page relative flex items-center justify-between gap-2 pb-8 pt-2 md:pb-10 md:pt-4">
      <CarouselArrow direction="prev" onClick={() => move(-1)} />

      <div className="flex flex-1 items-center justify-center gap-4 md:gap-10">
        {visible.map((item, index) => {
          const isCenter = index === 1
          return (
            <div
              key={`${item.id}-${index}`}
              className={`relative shrink-0 ${isCenter ? '' : 'hidden sm:block'}`}
            >
              <div
                className={`relative overflow-hidden rounded-full bg-white ring-4 ring-white shadow-[0_22px_45px_-22px_rgba(43,27,20,0.55)] transition duration-300 hover:-translate-y-1 ${
                  isCenter
                    ? 'h-[118px] w-[118px] md:h-[168px] md:w-[168px]'
                    : 'h-[92px] w-[92px] opacity-90 md:h-[128px] md:w-[128px]'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span
                className={`absolute grid place-items-center rounded-full bg-gold font-black text-ink shadow-md ${
                  isCenter
                    ? '-top-2 right-1 h-12 w-12 text-sm md:h-14 md:w-14'
                    : '-top-1 right-0 h-10 w-10 text-[11px]'
                }`}
              >
                ٪۵۰
              </span>
            </div>
          )
        })}
      </div>

      <CarouselArrow direction="next" onClick={() => move(1)} />
    </div>
  )
}

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-cream">
      <div className="pointer-events-none absolute -left-20 top-6 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />

      <div className="container-page relative grid items-center gap-6 pt-6 md:grid-cols-[0.95fr_1.05fr] md:pt-9">
        <div className="relative order-2 mx-auto w-full max-w-[340px] md:order-1 md:max-w-[368px]">
          <div className="absolute inset-x-4 bottom-4 top-8 rounded-[220px_220px_40px_40px] border border-brand/10 bg-white/50" />
          <img
            src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=900&q=80"
            alt="سرآشپز رستوران نوال"
            className="relative aspect-[4/5] w-full rounded-[220px_220px_40px_40px] object-cover shadow-[0_35px_70px_-40px_rgba(43,27,20,0.75)] ring-8 ring-white/70"
          />
          <div className="absolute -right-2 bottom-10 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg md:-right-6 md:px-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-brand">
              <Star size={16} className="fill-brand" />
            </span>
            <div className="text-right leading-tight">
              <p className="text-sm font-extrabold">۴.۹ از ۵</p>
              <p className="text-[11px] text-ink-soft">امتیاز مشتریان</p>
            </div>
          </div>
        </div>

        <div className="order-1 text-right md:order-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-brand shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            طعم اصیل ایرانی، از سال ۱۳۷۸
          </span>

          <h1 className="mt-5 text-[30px] font-black leading-[1.5] text-ink sm:text-[38px] md:text-[46px] md:leading-[1.45]">
            جایی که <span className="text-brand">طعم</span> و{' '}
            <span className="text-brand">کیفیت</span> کنار هم کامل می‌شوند
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft md:text-base md:leading-8">
            در رستوران نوال هر بشقاب با مواد اولیه تازه، دستور پخت اصیل و عشق سرآشپزهای ما
            آماده می‌شود؛ تجربه‌ای که یادش برایتان می‌ماند.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-white shadow-[0_16px_30px_-16px_rgba(184,0,31,0.9)] transition hover:bg-brand-dark"
            >
              مشاهده منو
              <ArrowLeft size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-6 py-3 text-sm font-medium text-ink transition hover:border-brand hover:text-brand"
            >
              رزرو میز
            </a>
          </div>
        </div>
      </div>

      <HeroCarousel />
    </section>
  )
}
