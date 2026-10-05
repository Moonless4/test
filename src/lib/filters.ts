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
  { value: 'all', label: 'هر قیمتی' },
  { value: '0-60000000000', label: 'زیر ۶۰ میلیارد تومان' },
  { value: '60000000000-120000000000', label: '۶۰ تا ۱۲۰ میلیارد تومان' },
  { value: '120000000000-200000000000', label: '۱۲۰ تا ۲۰۰ میلیارد تومان' },
  { value: '200000000000-999999999999', label: 'بیش از ۲۰۰ میلیارد تومان' },
]

export const bedOptions = [
  { value: 'all', label: 'همه' },
  { value: '3', label: '۳ خواب و بیشتر' },
  { value: '4', label: '۴ خواب و بیشتر' },
  { value: '5', label: '۵ خواب و بیشتر' },
  { value: '6', label: '۶ خواب و بیشتر' },
]

export const bathOptions = [
  { value: 'all', label: 'همه' },
  { value: '3', label: '۳ سرویس و بیشتر' },
  { value: '4', label: '۴ سرویس و بیشتر' },
  { value: '5', label: '۵ سرویس و بیشتر' },
  { value: '6', label: '۶ سرویس و بیشتر' },
]

export const sortOptions = [
  { value: 'featured', label: 'پیشنهادهای ویژه در ابتدا' },
  { value: 'price-asc', label: 'ارزان‌ترین به گران‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین به ارزان‌ترین' },
  { value: 'size-desc', label: 'بزرگ‌ترین متراژ' },
  { value: 'newest', label: 'جدیدترین سال ساخت' },
]

export const uniqueLocations = (properties: Property[]): string[] =>
  Array.from(new Set(properties.map((property) => `${property.city}، ${property.region}`))).sort()

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

    if (filters.location !== 'all' && `${property.city}، ${property.region}` !== filters.location) {
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
      sorted.sort((a, b) => b.area - a.area)
      break
    case 'newest':
      sorted.sort((a, b) => b.year - a.year)
      break
    default:
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price)
  }

  return sorted
}
