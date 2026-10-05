import { ArrowRight, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { agents } from '@/data/team'
import { photo, portraitSrcSet } from '@/lib/images'

export function TeamSection() {
  return (
    <section className="bg-ivory py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHeading
              label="Our team"
              title="The people behind Horizon"
              description="Advisors who know each street, each architect and each transaction history in the markets we serve."
              className="max-w-xl"
            />
          </Reveal>
          <Reveal delay={100}>
            <Button
              to="/team"
              variant="outlineDark"
              size="md"
              icon={<ArrowRight className="h-4 w-4" strokeWidth={1.8} />}
            >
              Meet the full team
            </Button>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent, index) => (
            <Reveal key={agent.id} delay={index * 80}>
              <article className="group">
                <div className="relative overflow-hidden rounded-card bg-mist">
                  <img
                    src={photo(agent.photoId, 640)}
                    srcSet={portraitSrcSet(agent.photoId)}
                    sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
                    alt={`${agent.name}, ${agent.role} at Horizon Properties`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent p-4 opacity-0 transition-all duration-500 ease-premium group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${agent.phone.replace(/[^\d+]/g, '')}`}
                        aria-label={`Call ${agent.name}`}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy transition-colors duration-300 hover:bg-gold hover:text-white"
                      >
                        <Phone className="h-3.5 w-3.5" strokeWidth={1.8} />
                      </a>
                      <a
                        href={`mailto:${agent.email}`}
                        aria-label={`Email ${agent.name}`}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy transition-colors duration-300 hover:bg-gold hover:text-white"
                      >
                        <Mail className="h-3.5 w-3.5" strokeWidth={1.8} />
                      </a>
                    </div>
                  </div>
                </div>

                <h3 className="mt-5 text-[16px] font-semibold tracking-tight text-ink">
                  {agent.name}
                </h3>
                <p className="mt-1 text-[13px] text-muted">{agent.role}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
