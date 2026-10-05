import clsx from 'clsx'
import { BedDouble, Bath, Ruler, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  bathOptions,
  bedOptions,
  priceRanges,
  sortOptions,
  type FilterState,
} from '@/lib/filters'

interface PropertyFiltersProps {
  filters: FilterState
  onChange: (patch: Partial<FilterState>) => void
  onReset: () => void
  locations: string[]
  types: string[]
  resultCount: number
  className?: string
}

const labelClasses = 'mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-muted'
const controlClasses =
  'w-full appearance-none rounded-[12px] border border-line bg-white px-4 py-3 text-sm text-ink transition-colors duration-300 focus:border-navy focus:outline-none'

export function PropertyFilters({
  filters,
  onChange,
  onReset,
  locations,
  types,
  resultCount,
  className,
}: PropertyFiltersProps) {
  return (
    <div className={clsx('rounded-card border border-line bg-white p-6 shadow-soft sm:p-7', className)}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
          <SlidersHorizontal className="h-4 w-4 text-gold" strokeWidth={1.8} aria-hidden="true" />
          Refine search
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-medium text-muted transition-colors duration-300 hover:text-navy"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="filter-search" className={labelClasses}>
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <input
              id="filter-search"
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Name, city or keyword"
              className={`${controlClasses} pl-11`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="filter-location" className={labelClasses}>
            Location
          </label>
          <select
            id="filter-location"
            value={filters.location}
            onChange={(event) => onChange({ location: event.target.value })}
            className={controlClasses}
          >
            <option value="all">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-type" className={labelClasses}>
            Property type
          </label>
          <select
            id="filter-type"
            value={filters.type}
            onChange={(event) => onChange({ type: event.target.value })}
            className={controlClasses}
          >
            <option value="all">All types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-price" className={labelClasses}>
            Price range
          </label>
          <select
            id="filter-price"
            value={filters.price}
            onChange={(event) => onChange({ price: event.target.value })}
            className={controlClasses}
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="filter-beds" className={labelClasses}>
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                Beds
              </span>
            </label>
            <select
              id="filter-beds"
              value={filters.beds}
              onChange={(event) => onChange({ beds: event.target.value })}
              className={controlClasses}
            >
              {bedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-baths" className={labelClasses}>
              <span className="inline-flex items-center gap-1.5">
                <Bath className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
                Baths
              </span>
            </label>
            <select
              id="filter-baths"
              value={filters.baths}
              onChange={(event) => onChange({ baths: event.target.value })}
              className={controlClasses}
            >
              {bathOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-7 border-t border-line pt-6">
        <label htmlFor="filter-sort" className={labelClasses}>
          Sort by
        </label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value })}
          className={controlClasses}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <p
        aria-live="polite"
        className="mt-6 flex items-center gap-2 text-xs text-muted"
      >
        <Ruler className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} aria-hidden="true" />
        {resultCount} {resultCount === 1 ? 'property' : 'properties'} match your search
      </p>
    </div>
  )
}
