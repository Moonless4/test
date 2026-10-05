import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CtaBanner } from '@/components/home/CtaBanner'
import { PageHero } from '@/components/layout/PageHero'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { services, servicesImageId } from '@/data/site'
import { photo, photoSrcSet } from '@/lib/images'

const process = [
  {
    title: 'Discovery',
    description: 'A conversation about the brief, the budget and the life the property needs to support.',
  },
  {
    title: 'Shortlist',
    description: 'A curated selection, including off-market homes that never reach a public portal.',
  },
  {
    title: 'Private viewings',
    description: 'Accompanied access at times that suit you, with honest commentary on each home.',
  },
  {
    title: 'Negotiation',
    description: 'Comparable analysis and a clear negotiation strategy handled by your advisor.',
  },
  {
    title: 'Completion',
    description: 'Coordination of legal, survey and relocation so the move itself is uneventful.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <PageHero
        imageId={servicesImageId}
        label="Services"
        title="Advisory, marketing and acquisition for prime property"
        description="A complete service for buyers, sellers and investors — delivered by one accountable advisor from first conversation to completion."
      />

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              label="What we do"
              title="Six disciplines, one team"
              description="Each engagement draws on the full capability of the practice rather than a single agent working alone."
            />
          </Reveal>

          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={index * 70}>
                <article className="flex h-full flex-col border-t border-line pt-7">
                  <span className="text-[11px] font-semibold tracking-[0.22em] text-gold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 text-[19px] font-semibold tracking-tight text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-3.5 flex-1 text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                  <Link
                    to="/contact"
                    className="group mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-navy transition-colors duration-300 hover:text-gold"
                  >
                    Discuss this service
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-500 ease-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy py-20 sm:py-24 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              tone="light"
              label="How we work"
              title="A process built around discretion"
              description="Five stages, each with a defined outcome — so you always know what happens next."
            />
          </Reveal>

          <ol className="mt-14 grid gap-x-8 gap-y-10 border-t border-white/15 pt-10 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((step, index) => (
              <Reveal key={step.title} delay={index * 70}>
                <li>
                  <span className="text-[11px] font-semibold tracking-[0.22em] text-gold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="overflow-hidden rounded-card bg-mist">
                <img
                  src={photo('photo-1600573472550-8090b5e0745e', 1200)}
                  srcSet={photoSrcSet('photo-1600573472550-8090b5e0745e', [640, 960, 1280])}
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  alt="Interior opening through a glass wall to a pool terrace"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <SectionHeading
                label="Marketing"
                title="Presentation that matches the architecture"
                description="Editorial photography, architectural film, floor plans and a targeted campaign — released privately, or to the open market, depending on the instruction."
              />
              <ul className="mt-9 grid gap-x-8 gap-y-5 border-t border-line pt-9 sm:grid-cols-2">
                {[
                  'Architectural photography',
                  'Film and drone coverage',
                  'Floor plans and 3D tours',
                  'Private buyer network',
                  'Portal and press placement',
                  'Performance reporting',
                ].map((item) => (
                  <li key={item} className="text-sm text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Not sure which service you need?"
        description="Send us the brief and we will tell you honestly what the engagement should look like."
      />
    </>
  )
}
