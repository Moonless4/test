import clsx from 'clsx'
import { SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHero } from '@/components/layout/PageHero'
import { PropertyCard } from '@/components/property/PropertyCard'
import { PropertyFilters } from '@/components/property/PropertyFilters'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import {
  applyFilters,
  countActiveFilters,
  defaultFilters,
  uniqueLocations,
  uniqueTypes,
  type FilterState,
} from '@/lib/filters'
import { toPersianDigits } from '@/lib/format'
import { getAllProperties } from '@/lib/properties'

export default function PropertiesPage() {
  const [params, setParams] = useSearchParams()
  const [panelOpen, setPanelOpen] = useState(false)
  const all = getAllProperties()

  const filters: FilterState = {
    search: params.get('search') ?? '',
    location: params.get('location') ?? 'all',
    type: params.get('type') ?? 'all',
    price: params.get('price') ?? 'all',
    beds: params.get('beds') ?? 'all',
    baths: params.get('baths') ?? 'all',
    sort: params.get('sort') ?? 'featured',
  }
  const featuredOnly = params.get('featured') === '1'

  const update = (patch: Partial<FilterState>) => {
    const next = { ...filters, ...patch }
    const search = new URLSearchParams()
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === 'all') return
      if (key === 'sort' && value === defaultFilters.sort) return
      search.set(key, value)
    })
    if (featuredOnly) search.set('featured', '1')
    setParams(search, { replace: true })
  }

  const reset = () => setParams(new URLSearchParams(), { replace: true })

  const toggleFeaturedOnly = () => {
    const search = new URLSearchParams(params)
    if (featuredOnly) search.delete('featured')
    else search.set('featured', '1')
    setParams(search, { replace: true })
  }

  const results = useMemo(() => {
    const filtered = applyFilters(all, filters)
    return featuredOnly ? filtered.filter((property) => property.featured) : filtered
  }, [all, filters, featuredOnly])

  const activeCount = countActiveFilters(filters)
  const locations = useMemo(() => uniqueLocations(all), [all])
  const types = useMemo(() => uniqueTypes(all), [all])

  return (
    <>
      <PageHero
        label="پرتفوی"
        title="املاک"
        description="مجموعهٔ کنونی ما از ویلاها، عمارت‌ها و اقامتگاه‌ها را مرور کنید — بر پایهٔ موقعیت، نوع، قیمت و متراژ جست‌وجو را دقیق‌تر کنید."
      />

      <section className="bg-white py-14 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
            <div>
              <button
                type="button"
                onClick={() => setPanelOpen((open) => !open)}
                aria-expanded={panelOpen}
                aria-controls="filters-panel"
                className="flex w-full items-center justify-between gap-3 rounded-card border border-line bg-white px-5 py-4 text-sm font-medium text-ink shadow-soft lg:hidden"
              >
                <span className="flex items-center gap-2.5">
                  <SlidersHorizontal className="h-4 w-4 text-gold" strokeWidth={1.8} aria-hidden="true" />
                  فیلترها{activeCount ? ` (${toPersianDigits(activeCount)})` : ''}
                </span>
                {panelOpen ? (
                  <X className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <span className="text-xs text-muted">نمایش</span>
                )}
              </button>

              <div
                id="filters-panel"
                className={clsx('mt-4 lg:mt-0 lg:block lg:sticky lg:top-28', panelOpen ? 'block' : 'hidden')}
              >
                <PropertyFilters
                  filters={filters}
                  onChange={update}
                  onReset={reset}
                  locations={locations}
                  types={types}
                  resultCount={results.length}
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {[
                    { label: 'همهٔ خانه‌ها', active: !featuredOnly, onClick: () => featuredOnly && toggleFeaturedOnly() },
                    { label: 'فقط ویژه', active: featuredOnly, onClick: () => !featuredOnly && toggleFeaturedOnly() },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={chip.onClick}
                      aria-pressed={chip.active}
                      className={clsx(
                        'rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-500 ease-premium',
                        chip.active
                          ? 'bg-navy text-white'
                          : 'border border-line text-muted hover:border-navy hover:text-navy',
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-muted">
                  {toPersianDigits(results.length)} ملک در دسترس
                </p>
              </div>

              {results.length > 0 ? (
                <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((property, index) => (
                    <Reveal key={property.id} delay={Math.min(index, 5) * 70}>
                      <PropertyCard
                        property={property}
                        sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 92vw"
                      />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="mt-10 rounded-card border border-line bg-mist/60 px-8 py-16 text-center">
                  <h2 className="text-[19px] font-bold text-ink">
                    هیچ ملکی با این فیلترها همخوانی ندارد
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-[1.95] text-muted">
                    بازهٔ قیمت را گسترده‌تر کنید یا فیلتری را بردارید — یا بگذارید یکی از مشاوران
                    ما به‌جای شما در فهرست‌های خارج از نمایش عمومی جست‌وجو کند.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button onClick={reset} variant="primary" size="md">
                      پاک کردن فیلترها
                    </Button>
                    <Button to="/contact" variant="outlineDark" size="md">
                      گفت‌وگو با مشاور
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
