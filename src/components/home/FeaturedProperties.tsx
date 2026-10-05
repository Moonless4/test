import { ArrowRight } from 'lucide-react'
import { PropertyCarousel } from '@/components/property/PropertyCarousel'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getFeaturedProperties } from '@/lib/properties'

export function FeaturedProperties() {
  const featured = getFeaturedProperties()

  return (
    <section className="bg-mist py-20 sm:py-24 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            align="center"
            label="Featured"
            title="Featured Properties"
            description="A considered selection from our portfolio of architecturally significant homes and prime investment addresses."
            className="max-w-3xl"
          />
        </Reveal>

        <div className="mt-14 lg:mt-16">
          <PropertyCarousel properties={featured} eagerFirst />
        </div>

        <Reveal className="mt-14 flex justify-center">
          <Button
            to="/properties"
            variant="outlineDark"
            size="lg"
            icon={<ArrowRight className="h-4 w-4" strokeWidth={1.8} />}
          >
            View all properties
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
