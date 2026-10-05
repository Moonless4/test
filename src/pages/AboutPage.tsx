import { CtaBanner } from '@/components/home/CtaBanner'
import { TeamSection } from '@/components/home/TeamSection'
import { WhyChooseSection } from '@/components/home/WhyChooseSection'
import { PageHero } from '@/components/layout/PageHero'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { aboutImageIds, stats } from '@/data/site'
import { photo, photoSrcSet } from '@/lib/images'

export default function AboutPage() {
  return (
    <>
      <PageHero
        imageId={aboutImageIds.main}
        label="About us"
        title="A boutique agency for architecturally significant homes"
        description="Horizon Properties advises a small number of clients each year on the purchase, sale and stewardship of exceptional residential property."
      />

      <section className="bg-white py-20 sm:py-24 lg:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
                Who we are
              </p>
              <h2 className="mt-5 text-[clamp(1.8rem,3.6vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-ink">
                Quietly connecting people with extraordinary homes
              </h2>
              <div className="mt-7 space-y-5 text-[15px] leading-relaxed text-muted">
                <p>
                  Horizon Properties was founded on a simple belief: the best homes are not sold,
                  they are placed. Our role is to understand a building, the street it sits on and
                  the life it is being bought for — then to find the buyer who will value it most.
                </p>
                <p>
                  We deliberately represent a compact portfolio. Every instruction is handled by a
                  senior advisor who knows the market, the comparables and the negotiation history
                  rather than passing work down a chain.
                </p>
                <p>
                  For buyers, that same discipline works in reverse: patient, well-informed advice
                  on where value sits, what a property will cost to own, and when to walk away.
                </p>
              </div>

              <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-10 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dd className="text-[26px] font-semibold tracking-tight text-navy">
                      {stat.value}
                    </dd>
                    <dt className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={120}>
              <div className="grid gap-4 sm:gap-5">
                <div className="overflow-hidden rounded-card bg-mist">
                  <img
                    src={photo(aboutImageIds.main, 1200)}
                    srcSet={photoSrcSet(aboutImageIds.main, [640, 960, 1280])}
                    sizes="(min-width: 1024px) 42vw, 90vw"
                    alt="A modern residence with timber cladding and landscaped garden"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/11] w-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  <div className="overflow-hidden rounded-card bg-mist">
                    <img
                      src={photo(aboutImageIds.secondary, 800)}
                      srcSet={photoSrcSet(aboutImageIds.secondary, [420, 640, 900])}
                      sizes="(min-width: 1024px) 20vw, 45vw"
                      alt="Dark panelled facade lit from within at dusk"
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden rounded-card bg-mist">
                    <img
                      src={photo('photo-1600585154340-be6161a56a0c', 800)}
                      srcSet={photoSrcSet('photo-1600585154340-be6161a56a0c', [420, 640, 900])}
                      sizes="(min-width: 1024px) 20vw, 45vw"
                      alt="A modern home at blue hour with floor-to-ceiling glazing"
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <WhyChooseSection />
      <TeamSection />
      <CtaBanner />
    </>
  )
}
