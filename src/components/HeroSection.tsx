import { hero } from '@/data/site';
import { ArchOrnament, ArrowLeftIcon } from '@/components/Icons';

export default function HeroSection() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-night">
      {/* لایه‌های پس‌زمینه */}
      <div className="pointer-events-none absolute inset-0 arch-grid" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 end-[-8rem] h-[620px] w-[620px] rounded-full bg-gold/[0.08] blur-[130px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-10 start-[-10rem] h-[420px] w-[420px] rounded-full bg-moss/25 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1440px] px-5 pb-24 pt-12 lg:px-12 lg:pb-32 lg:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* متن پروژه — سمت راست */}
          <div className="animate-fade-up lg:col-span-6 xl:col-span-6">
            <div className="flex flex-wrap items-center gap-2.5">
              {hero.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-moss-300/25 bg-moss/30 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-moss-300 lg:text-xs"
                >
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="mt-7 text-[2rem] font-extrabold leading-[1.35] tracking-tight text-white sm:text-[2.5rem] lg:text-[2.75rem] xl:text-[3.25rem]">
              {hero.title}
            </h1>

            <div className="mt-7 flex items-center gap-3.5">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 via-gold to-gold-600 text-sm font-bold text-night"
                aria-hidden
              >
                {hero.person.initial}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-white lg:text-[15px]">
                  {hero.person.name}
                </span>
                <span className="text-xs font-light text-white/55 lg:text-[13px]">
                  {hero.person.role}
                </span>
              </span>
            </div>

            <p className="mt-7 max-w-xl text-[14px] font-medium leading-8 text-white/70 lg:text-[15px] lg:leading-9">
              {hero.description}
            </p>

            <a
              href="#project"
              className="mt-9 inline-flex items-center gap-3 rounded-md bg-gold px-7 py-3.5 text-sm font-bold text-night shadow-glow transition-all duration-200 hover:bg-gold-400 hover:shadow-[0_22px_70px_-18px_rgba(253,184,19,0.6)]"
            >
              <span>{hero.cta}</span>
              <ArrowLeftIcon className="h-[18px] w-[18px]" strokeWidth={2} />
            </a>
          </div>

          {/* تصویر معماری — سمت چپ */}
          <div className="relative lg:col-span-6 xl:col-span-6">
            <ArchOrnament
              className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 text-gold/20 lg:h-[560px] lg:w-[560px]"
              aria-hidden
            />
            <div className="relative animate-fade-in">
              <img
                src={hero.image.src}
                alt={hero.image.alt}
                className="photo-fade photo-tone h-[300px] w-full object-cover object-center sm:h-[380px] lg:h-[540px]"
              />
              {/* لایه‌های هم‌رنگ‌سازی: ته‌رنگ طلایی + محو شدن پایه‌ی تصویر در پس‌زمینه */}
              <div
                className="photo-fade pointer-events-none absolute inset-0 bg-gold/[0.07] mix-blend-overlay"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night via-night/45 to-transparent"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      {/* لبه‌ی روشن و قوسی‌شکل پایین هیرو */}
      <div className="relative h-16 w-full bg-white hero-curve lg:h-24" aria-hidden />
    </section>
  );
}
