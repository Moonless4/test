import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { heroImageId } from '@/data/site'
import { photo, photoSrcSet } from '@/lib/images'

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-navy">
      <img
        src={photo(heroImageId, 2000)}
        srcSet={photoSrcSet(heroImageId, [768, 1280, 1920, 2400], 80)}
        sizes="100vw"
        alt="ویلایی مدرن در ساعت آبی، با شیشه‌های تمام‌قد و فضای داخلی روشن"
        decoding="async"
        className="absolute inset-0 -z-20 h-full w-full animate-hero-zoom object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,25,47,0.62)_0%,rgba(10,25,47,0.22)_38%,rgba(10,25,47,0.72)_100%)]"
      />

      <Container className="relative z-10 pb-28 pt-32 text-center sm:pb-32">
        <p className="animate-fade-up text-[12px] font-semibold text-gold">
          املاک لوکس · از سال ۱۳۸۴
        </p>

        <h1 className="mx-auto mt-7 max-w-4xl text-[clamp(2rem,5.2vw,4rem)] font-bold leading-[1.35] text-white [animation-delay:120ms] animate-fade-up">
          خانه‌های استثنایی
          <br />
          برای زندگی و سرمایه‌گذاری
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-[15px] leading-[1.95] text-white/75 [animation-delay:260ms] animate-fade-up sm:text-base">
          املاک ممتاز در بهترین موقعیت‌ها. خانهٔ رویایی یا سرمایه‌گذاری درست خود را با اطمینان پیدا
          کنید.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:380ms] animate-fade-up">
          <Button
            to="/properties"
            size="lg"
            variant="ivory"
            icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.8} />}
          >
            مشاهدهٔ املاک
          </Button>
          <Button to="/contact" size="lg" variant="outlineLight">
            گفت‌وگو با مشاور
          </Button>
        </div>
      </Container>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <span className="flex flex-col items-center gap-2 text-[11px] font-medium text-white/60">
          اسکرول
          <ChevronDown className="h-4 w-4 animate-pulse text-gold" strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>
    </section>
  )
}
