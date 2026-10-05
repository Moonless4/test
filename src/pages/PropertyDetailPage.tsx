import {
  ArrowLeft,
  Bath,
  BedDouble,
  Calendar,
  CalendarCheck,
  Check,
  ChevronLeft,
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
import { formatNumber, formatPrice, telHref } from '@/lib/format'
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
    { label: 'اتاق خواب', value: formatNumber(property.beds), icon: BedDouble },
    { label: 'سرویس بهداشتی', value: formatNumber(property.baths), icon: Bath },
    { label: 'متراژ', value: `${formatNumber(property.area)} متر مربع`, icon: Ruler },
    { label: 'سال ساخت', value: formatNumber(property.year), icon: Calendar },
    ...(property.land > 0
      ? [{ label: 'زمین', value: `${formatNumber(property.land)} متر مربع`, icon: Trees }]
      : []),
    { label: 'نوع ملک', value: property.type, icon: Layers },
  ]

  return (
    <>
      <section className="bg-white pb-16 pt-28 sm:pt-32">
        <Container>
          <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <Link to="/" className="transition-colors duration-300 hover:text-navy">
              خانه
            </Link>
            <ChevronLeft className="h-3 w-3 text-muted/50" strokeWidth={2} aria-hidden="true" />
            <Link to="/properties" className="transition-colors duration-300 hover:text-navy">
              املاک
            </Link>
            <ChevronLeft className="h-3 w-3 text-muted/50" strokeWidth={2} aria-hidden="true" />
            <span className="text-ink">{property.name}</span>
          </nav>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-mist px-3 py-1.5 text-[12px] font-semibold text-gold-dark">
                  {property.status}
                </span>
                <span className="text-[12px] text-muted">{property.type}</span>
              </div>
              <h1 className="mt-5 text-[clamp(1.7rem,4vw,2.8rem)] font-bold leading-[1.4] text-ink">
                {property.name}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                <MapPin className="h-4 w-4 text-gold" strokeWidth={1.8} aria-hidden="true" />
                {property.city}، {property.region}، {property.country}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <p className="text-[clamp(1.25rem,2.4vw,1.75rem)] font-bold text-navy">
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
                <h2 className="eyebrow">دربارهٔ این خانه</h2>
                <div className="mt-6 space-y-5 text-[15px] leading-[1.95] text-muted">
                  {property.description.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="mt-14">
                <h2 className="eyebrow">ویژگی‌های کلیدی</h2>
                <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                  {property.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-ink">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={2} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-14">
                <h2 className="eyebrow">امکانات</h2>
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
                <p className="eyebrow">قیمت درخواستی</p>
                <p className="mt-3 text-[24px] font-bold text-navy">{formatPrice(property.price)}</p>

                <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-6 border-t border-line pt-7">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="flex items-center gap-2 text-[12px] text-muted">
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
                    تعیین وقت بازدید
                  </Button>
                  <Button
                    size="lg"
                    variant="outlineDark"
                    className="w-full"
                    onClick={() => setModal('agent')}
                    icon={<MessageSquare className="h-4 w-4" strokeWidth={1.8} />}
                  >
                    تماس با مشاور
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
                      <p className="text-[15px] font-bold text-ink">{agent.name}</p>
                      <p className="text-[13px] text-muted">{agent.role}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-2 text-[13px]">
                    <a
                      href={telHref(agent.phone)}
                      className="flex items-center gap-2.5 text-muted transition-colors duration-300 hover:text-navy"
                      dir="ltr"
                    >
                      <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                      {agent.phone}
                    </a>
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2.5 text-muted transition-colors duration-300 hover:text-navy"
                      dir="ltr"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                      {agent.email}
                    </a>
                  </div>
                </div>
              </div>

              <p className="mt-5 px-1 text-[13px] leading-[1.9] text-muted/80">
                بازدیدهای خصوصی ظرف ۲۴ ساعت هماهنگ می‌شوند. جزئیات را برای ما بفرستید تا بروشور کامل و
                نقشه‌های طبقات را ارسال کنیم.
              </p>
            </aside>
          </div>
        </Container>
      </section>

      <Reveal>
        <SimilarProperties property={property} />
      </Reveal>

      <CtaBanner
        title="به بازدیدی خصوصی فکر می‌کنید؟"
        description="مشاوران ما می‌توانند ظرف ۲۴ ساعت دسترسی به این خانه و خانه‌های مشابه آن را هماهنگ کنند."
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
            تعیین بازدید
          </Button>
          <Button
            size="md"
            variant="outlineDark"
            className="flex-1"
            onClick={() => setModal('agent')}
          >
            تماس با مشاور
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
