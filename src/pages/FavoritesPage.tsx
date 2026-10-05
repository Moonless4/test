import { Heart } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { PropertyCard } from '@/components/property/PropertyCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { favoritesStore, useFavorites } from '@/lib/favorites'
import { getAllProperties } from '@/lib/properties'

export default function FavoritesPage() {
  const favorites = useFavorites()
  const saved = getAllProperties().filter((property) => favorites.includes(property.id))

  return (
    <>
      <PageHero
        label="Your selection"
        title="Saved Properties"
        description="Homes you have shortlisted. Saved properties stay on this device so you can pick up where you left off."
      />

      <section className="bg-white py-16 sm:py-20">
        <Container>
          {saved.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted">
                  {saved.length} {saved.length === 1 ? 'property' : 'properties'} saved
                </p>
                <button
                  type="button"
                  onClick={() => favoritesStore.clear()}
                  className="text-xs font-medium uppercase tracking-[0.18em] text-muted transition-colors duration-300 hover:text-navy"
                >
                  Clear all
                </button>
              </div>

              <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((property, index) => (
                  <Reveal key={property.id} delay={index * 70}>
                    <PropertyCard
                      property={property}
                      sizes="(min-width: 1024px) 31vw, (min-width: 640px) 45vw, 92vw"
                    />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-card border border-line bg-mist/60 px-8 py-20 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-gold shadow-soft">
                <Heart className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-[20px] font-semibold tracking-tight text-ink">
                No saved properties yet
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                Tap the heart on any property to keep it here and compare your shortlist side by
                side.
              </p>
              <Button to="/properties" size="lg" className="mt-8">
                Browse properties
              </Button>
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
