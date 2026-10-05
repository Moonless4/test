import { ArrowRight, ChevronDown } from 'lucide-react'
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
        alt="Modern villa at blue hour with floor-to-ceiling glazing and lit interiors"
        decoding="async"
        className="absolute inset-0 -z-20 h-full w-full animate-hero-zoom object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,25,47,0.62)_0%,rgba(10,25,47,0.22)_38%,rgba(10,25,47,0.72)_100%)]"
      />

      <Container className="relative z-10 pb-28 pt-32 text-center sm:pb-32">
        <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.34em] text-gold">
          Luxury real estate · Est. 2005
        </p>

        <h1 className="mx-auto mt-7 max-w-4xl text-[clamp(2.3rem,6.2vw,4.75rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-white [animation-delay:120ms] animate-fade-up">
          Discover Exceptional
          <br />
          Homes &amp; Investments
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-white/75 [animation-delay:260ms] animate-fade-up sm:text-base">
          Premium properties in prime locations. Find your dream home or the perfect investment
          with confidence.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:380ms] animate-fade-up">
          <Button
            to="/properties"
            size="lg"
            variant="ivory"
            icon={<ArrowRight className="h-4 w-4" strokeWidth={1.8} />}
          >
            Browse properties
          </Button>
          <Button to="/contact" size="lg" variant="outlineLight">
            Speak to an advisor
          </Button>
        </div>
      </Container>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <span className="flex flex-col items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-white/60">
          Scroll
          <ChevronDown className="h-4 w-4 animate-pulse text-gold" strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>
    </section>
  )
}
