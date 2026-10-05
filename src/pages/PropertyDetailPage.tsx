import {
  ArrowRight,
  Bath,
  BedDouble,
  Calendar,
  CalendarCheck,
  Check,
  ChevronRight,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  Ruler,
  Trees,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CtaBanner } from '@/components/home/CtaBanner'
import { ContactModal } from '@/components/property/ContactModal'
import { FavoriteButton } from '@/components/property/FavoriteButton'
import { PropertyGallery } from '@/components/property/PropertyGallery'
import { SimilarProperties } from '@/components/property/SimilarProperties'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { getAgent } from '@/data/team'
import { formatNumber, formatPrice } from '@/lib/format'
import { photo } from '@/lib/images'
import { getPropertyBySlug } from '@/lib/properties'
import NotFoundPage from '@/pages/NotFoundPage'

export default function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const property = slug ? getPropertyBySlug(slug) : undefined
  const [modal, setModal] = useState<'agent' | 'viewing' | null>(null)

  if (!property) return <NotFoundPage />

  const agent = getAgent(property.agentId)

  const facts = [
    { label: 'Bedrooms', value: `${property.beds}`, icon: BedDouble },
    { label: 'Bathrooms', value: `${property.baths}`, icon: Bath },
    { label: 'Interior', value: `${formatNumber(property.sqft)} sq ft`, icon: Ruler },
    { label: 'Built', value: `${property.year}`, icon: Calendar },
    ...(property.lotAcres > 0
      ? [{ label: 'Grounds', value: `${property.lotAcres} acres`, icon: Trees }]
      : []),
    { label: 'Type', value: property.type, icon: Layers },
  ]

  return (
    <>
      <section className="bg-white pb-16 pt-28 sm:pt-32">
        <Container>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <Link to="/" className="transition-colors duration-300 hover:text-navy">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-muted/50" strokeWidth={2} aria-hidden="true" />
            <Link to="/properties" className="transition-colors duration-300 hover:text-navy">
              Properties
            </Link>
            <ChevronRight className="h-3 w-3 text-muted/50" strokeWidth={2} aria-hidden="true" />
            <span className="text-ink">{property.name}</span>
          </nav>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-mist px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  {property.status}
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  {property.type}
                </span>
              </div>
              <h1 className="mt-5 text-[clamp(1.9rem,4.4vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-ink">
                {property.name}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                <MapPin className="h-4 w-4 text-gold" strokeWidth={1.8} aria-hidden="true" />
                {property.city}, {property.region}, {property.country}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <p className="text-[clamp(1.4rem,2.6vw,1.9rem)] font-semibold tracking-tight text-navy">
                {formatPrice(property.price)}
              </p>
              <FavoriteButton
                propertyId={property.id}
                propertyName={property.name}
                tone="plain"
                className="h-11 w-11"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-14 lg:grid-cols-[1.55fr_1fr] lg:gap-16">
            <div>
              <PropertyGallery images={property.gallery} />

              <div className="mt-14">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                  About this home
                </h2>
                <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-muted">
                  {property.description.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="mt-14">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                  Key features
                </h2>
                <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                  {property.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-14">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                  Amenities
                </h2>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {property.amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="rounded-full border border-line px-4 py-2 text-[13px] text-muted"
                    >
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-card border border-line bg-white p-7 shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
                  Asking price
                </p>
                <p className="mt-3 text-[26px] font-semibold tracking-tight text-navy">
                  {formatPrice(property.price)}
                </p>

                <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-6 border-t border-line pt-7">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                        <fact.icon className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                        {fact.label}
                      </dt>
                      <dd className="mt-2 text-[15px] font-medium text-ink">{fact.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 space-y-3 border-t border-line pt-7">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setModal('viewing')}
                    icon={<CalendarCheck className="h-4 w-4" strokeWidth={1.8} />}
                  >
                    Schedule a viewing
                  </Button>
                  <Button
                    size="lg"
                    variant="outlineDark"
                    className="w-full"
                    onClick={() => setModal('agent')}
                    icon={<MessageSquare className="h-4 w-4" strokeWidth={1.8} />}
                  >
                    Contact agent
                  </Button>
                </div>

                <div className="mt-7 border-t border-line pt-7">
                  <div className="flex items-center gap-4">
                    <img
                      src={photo(agent.photoId, 200)}
                      alt={agent.name}
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-ink">{agent.name}</p>
                      <p className="text-[12px] text-muted">{agent.role}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-2 text-[13px]">
                    <a
                      href={`tel:${agent.phone.replace(/[^\d+]/g, '')}`}
                      className="flex items-center gap-2.5 text-muted transition-colors duration-300 hover:text-navy"
                    >
                      <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                      {agent.phone}
                    </a>
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2.5 text-muted transition-colors duration-300 hover:text-navy"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                      {agent.email}
                    </a>
                  </div>
                </div>
              </div>

              <p className="mt-5 px-1 text-xs leading-relaxed text-muted/80">
                Private viewings are arranged within 24 hours. Request details and we will send the
                full brochure and floor plans.
              </p>
            </aside>
          </div>
        </Container>
      </section>

      <Reveal>
        <SimilarProperties property={property} />
      </Reveal>

      <CtaBanner
        title="Considering a private viewing?"
        description="Our advisors can arrange access to this home and others like it within 24 hours."
      />

      <div className="h-24 lg:hidden" aria-hidden="true" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <Button
            size="md"
            className="flex-1"
            onClick={() => setModal('viewing')}
            icon={<CalendarCheck className="h-4 w-4" strokeWidth={1.8} />}
          >
            Schedule viewing
          </Button>
          <Button
            size="md"
            variant="outlineDark"
            className="flex-1"
            onClick={() => setModal('agent')}
          >
            Contact agent
          </Button>
        </div>
      </div>

      <ContactModal
        open={modal !== null}
        onClose={() => setModal(null)}
        kind={modal === 'viewing' ? 'viewing' : 'agent'}
        property={property}
        agent={agent}
      />
    </>
  )
}
