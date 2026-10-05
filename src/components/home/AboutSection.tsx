import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { aboutImageIds, stats } from '@/data/site'
import { photo, photoSrcSet } from '@/lib/images'

export function AboutSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
              About us
            </p>
            <h2 className="mt-5 text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-ink">
              Who We Are
            </h2>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
              At Horizon Properties, we connect people with extraordinary homes and smart
              investments. Integrity, transparency, and client satisfaction are at the heart of
              everything we do.
            </p>

            <Button
              to="/about"
              variant="primary"
              size="lg"
              className="mt-9"
              icon={<ArrowRight className="h-4 w-4" strokeWidth={1.8} />}
            >
              Learn More
            </Button>

            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-line pt-9 sm:grid-cols-4 lg:grid-cols-2">
              {stats.slice(0, 4).map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-muted">{stat.label}</dt>
                  <dd className="mt-2 text-[22px] font-semibold tracking-tight text-navy">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={120}>
            <div className="group relative grid grid-cols-5 gap-4 sm:gap-5">
              <div className="col-span-3 overflow-hidden rounded-card bg-mist">
                <img
                  src={photo(aboutImageIds.main, 1200)}
                  srcSet={photoSrcSet(aboutImageIds.main, [640, 960, 1280])}
                  sizes="(min-width: 1024px) 32vw, 58vw"
                  alt="A modern two-storey residence with timber cladding and landscaped garden"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] h-full w-full object-cover transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.04]"
                />
              </div>

              <div className="col-span-2 mt-12 self-start overflow-hidden rounded-card bg-mist sm:mt-16">
                <img
                  src={photo(aboutImageIds.secondary, 800)}
                  srcSet={photoSrcSet(aboutImageIds.secondary, [420, 640, 900])}
                  sizes="(min-width: 1024px) 20vw, 36vw"
                  alt="Detail of a dark panelled facade lit from within at dusk"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[2/3] h-full w-full object-cover transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.04]"
                />
              </div>

              <Link
                to="/about"
                aria-label="More about Horizon Properties"
                className="absolute left-[60%] top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-navy text-white shadow-lift transition-all duration-500 ease-premium hover:scale-105 hover:bg-gold sm:h-16 sm:w-16"
              >
                <ArrowUpRight className="h-5 w-5" strokeWidth={1.7} />
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
