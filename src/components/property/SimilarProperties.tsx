import { PropertyCard } from '@/components/property/PropertyCard'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Property } from '@/types'
import { getSimilarProperties } from '@/lib/properties'

export function SimilarProperties({ property }: { property: Property }) {
  const similar = getSimilarProperties(property, 3)
  if (similar.length === 0) return null

  return (
    <section className="border-t border-line bg-mist/60 py-20 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            label="شاید بپسندید"
            title="املاک مشابه"
            description="خانه‌های قابل مقایسه در پرتفوی کنونی ما، بر پایهٔ موقعیت، نوع و قیمت."
          />
        </Reveal>
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((item, index) => (
            <Reveal key={item.id} delay={index * 90}>
              <PropertyCard property={item} sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 92vw" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
