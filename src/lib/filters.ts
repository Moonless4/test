import type { Property } from '@/types'

export interface FilterState {
  search: string
  location: string
  type: string
  price: string
  beds: string
  baths: string
  sort: string
}

export const defaultFilters: FilterState = {
  search: '',
  location: 'all',
  type: 'all',
  price: 'all',
  beds: 'all',
  baths: 'all',
  sort: 'featured',
}

export const priceRanges = [
  { value: 'all', label: 'Any price' },
  { value: '0-2000000', label: 'Under $2M' },
  { value: '2000000-4000000', label: '$2M – $4M' },
  { value: '4000000-6000000', label: '$4M – $6M' },
  { value: '6000000-99999999', label: '$6M and above' },
]

export const bedOptions = [
  { value: 'all', label: 'Any' },
  { value: '3', label: '3+ bedrooms' },
  { value: '4', label: '4+ bedrooms' },
  { value: '5', label: '5+ bedrooms' },
  { value: '6', label: '6+ bedrooms' },
]

export const bathOptions = [
  { value: 'all', label: 'Any' },
  { value: '3', label: '3+ bathrooms' },
  { value: '4', label: '4+ bathrooms' },
  { value: '5', label: '5+ bathrooms' },
  { value: '6', label: '6+ bathrooms' },
]

export const sortOptions = [
  { value: 'featured', label: 'Featured first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'size-desc', label: 'Largest first' },
  { value: 'newest', label: 'Newest built' },
]

export const uniqueLocations = (properties: Property[]): string[] =>
  Array.from(new Set(properties.map((property) => `${property.city}, ${property.region}`))).sort()

export const uniqueTypes = (properties: Property[]): string[] =>
  Array.from(new Set(properties.map((property) => property.type))).sort()

export const countActiveFilters = (filters: FilterState): number =>
  (['location', 'type', 'price', 'beds', 'baths'] as const).filter(
    (key) => filters[key] !== 'all',
  ).length + (filters.search.trim() ? 1 : 0)

export function applyFilters(properties: Property[], filters: FilterState): Property[] {
  const term = filters.search.trim().toLowerCase()

  const filtered = properties.filter((property) => {
    if (term) {
      const haystack = [
        property.name,
        property.city,
        property.region,
        property.type,
        property.summary,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(term)) return false
    }

    if (filters.location !== 'all' && `${property.city}, ${property.region}` !== filters.location) {
      return false
    }

    if (filters.type !== 'all' && property.type !== filters.type) return false

    if (filters.price !== 'all') {
      const [min, max] = filters.price.split('-').map(Number)
      if (property.price < min || property.price > max) return false
    }

    if (filters.beds !== 'all' && property.beds < Number(filters.beds)) return false
    if (filters.baths !== 'all' && property.baths < Number(filters.baths)) return false

    return true
  })

  const sorted = [...filtered]
  switch (filters.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'size-desc':
      sorted.sort((a, b) => b.sqft - a.sqft)
      break
    case 'newest':
      sorted.sort((a, b) => b.year - a.year)
      break
    default:
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price)
  }

  return sorted
}
