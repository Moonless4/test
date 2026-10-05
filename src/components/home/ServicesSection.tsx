import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { services, servicesImageId } from '@/data/site'
import { photo, photoSrcSet } from '@/lib/images'

export function ServicesSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              label="Services"
              title="A complete advisory service for prime property"
              description="From first viewing to final signature, one team handles valuation, negotiation, marketing and relocation."
              className="max-w-xl"
            />
            <div className="mt-10 overflow-hidden rounded-card bg-mist">
              <img
                src={photo(servicesImageId, 1200)}
                srcSet={photoSrcSet(servicesImageId, [640, 960, 1280])}
                sizes="(min-width: 1024px) 42vw, 90vw"
                alt="Interior opening through a glass wall to a pool terrace"
                loading="lazy"
                decoding="async"
                className="aspect-[16/11] w-full object-cover"
              />
            </div>
          </Reveal>

          <div>
            <ul className="divide-y divide-line border-y border-line">
              {services.map((service, index) => (
                <li key={service.title}>
                  <Link
                    to="/services"
                    className="group flex items-start gap-6 py-7 transition-colors duration-500 sm:gap-8"
                  >
                    <span className="pt-1 text-[11px] font-semibold tracking-[0.2em] text-gold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-3">
                        <span className="text-[17px] font-semibold tracking-tight text-ink transition-colors duration-500 group-hover:text-navy-700">
                          {service.title}
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 -translate-x-1 text-gold opacity-0 transition-all duration-500 ease-premium group-hover:translate-x-0 group-hover:opacity-100"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="mt-2.5 block max-w-md text-sm leading-relaxed text-muted">
                        {service.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
