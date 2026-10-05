import { Mail, Phone } from 'lucide-react'
import { CtaBanner } from '@/components/home/CtaBanner'
import { PageHero } from '@/components/layout/PageHero'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { agents } from '@/data/team'
import { photo, portraitSrcSet } from '@/lib/images'

const specialties: Record<string, string> = {
  'daniel-morgan': 'Prime residential, off-market sales, international buyers',
  'olivia-carter': 'Luxury homes, architectural resales, private viewings',
  'james-wilson': 'Investment acquisitions, yield analysis, portfolio strategy',
  'sophia-bennett': 'Family homes, relocation, neighbourhood advisory',
}

export default function TeamPage() {
  return (
    <>
      <PageHero
        label="Our team"
        title="Advisors who know the streets they sell"
        description="Four senior specialists, each accountable for every stage of a transaction — no call centres, no handovers."
      />

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              label="Leadership"
              title="Meet the team"
              description="Reach any advisor directly — their numbers are answered by them, not a desk."
            />
          </Reveal>

          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent, index) => (
              <Reveal key={agent.id} delay={index * 80}>
                <article className="group">
                  <div className="overflow-hidden rounded-card bg-mist">
                    <img
                      src={photo(agent.photoId, 640)}
                      srcSet={portraitSrcSet(agent.photoId)}
                      sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
                      alt={`${agent.name}, ${agent.role} at Horizon Properties`}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.04]"
                    />
                  </div>

                  <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-ink">
                    {agent.name}
                  </h3>
                  <p className="mt-1 text-[13px] uppercase tracking-[0.14em] text-gold">
                    {agent.role}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {specialties[agent.id]}
                  </p>

                  <div className="mt-5 flex flex-col gap-2 border-t border-line pt-5 text-[13px]">
                    <a
                      href={`tel:${agent.phone.replace(/[^\d+]/g, '')}`}
                      className="flex items-center gap-2.5 text-muted transition-colors duration-300 hover:text-navy"
                    >
                      <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                      {agent.phone}
                    </a>
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2.5 break-all text-muted transition-colors duration-300 hover:text-navy"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.8} aria-hidden="true" />
                      {agent.email}
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Speak with the advisor for your area"
        description="Tell us what you are looking for and we will introduce the right specialist."
      />
    </>
  )
}
