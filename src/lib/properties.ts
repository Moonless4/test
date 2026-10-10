import { properties } from '@/data/properties'
import { propertyApi, type ApiProperty } from '@/lib/api'
import type { Property } from '@/types'

/**
 * Maps an API property to the frontend Property type.
 */
function mapApiProperty(api: ApiProperty): Property {
  return {
    id: `p-${String(api.id).padStart(3, '0')}`,
    slug: api.slug,
    name: api.name,
    city: api.city,
    region: api.region,
    country: api.country,
    price: api.price,
    type: api.type as Property['type'],
    status: api.status as Property['status'],
    beds: api.beds,
    baths: api.baths,
    area: api.area,
    land: api.land,
    year: api.year,
    featured: api.featured,
    summary: api.summary,
    description: api.description,
    features: api.features,
    amenities: api.amenities,
    imageId: api.imageId,
    gallery: api.gallery ?? [],
    agentId: api.agent?.id ?? 'arash-rostegar',
  }
}

/**
 * Read model for the property catalogue. Tries the API first, falls back to
 * local data so the UI works even when the backend is offline.
 */
export async function fetchAllProperties(): Promise<Property[]> {
  try {
    const res = await propertyApi.list({ per_page: 50 })
    return res.data.map(mapApiProperty)
  } catch {
    return properties
  }
}

export async function fetchFeaturedProperties(): Promise<Property[]> {
  try {
    const res = await propertyApi.featured()
    return (Array.isArray(res) ? res : []).map(mapApiProperty)
  } catch {
    return properties.filter((p) => p.featured)
  }
}

export async function fetchPropertyBySlug(slug: string): Promise<Property | undefined> {
  try {
    const res = await propertyApi.show(slug)
    return mapApiProperty(res)
  } catch {
    return properties.find((property) => property.slug === slug)
  }
}

export async function fetchSimilarProperties(property: Property, limit = 3): Promise<Property[]> {
  try {
    const res = await propertyApi.list({ per_page: 50 })
    const all = res.data.map(mapApiProperty)
    return all
      .filter((candidate) => candidate.id !== property.id)
      .sort((a, b) => {
        const score = (item: Property) =>
          (item.city === property.city ? 2 : 0) +
          (item.region === property.region ? 1 : 0) +
          (item.type === property.type ? 1 : 0)
        return (
          score(b) - score(a) ||
          Math.abs(a.price - property.price) - Math.abs(b.price - property.price)
        )
      })
      .slice(0, limit)
  } catch {
    return properties
      .filter((candidate) => candidate.id !== property.id)
      .sort((a, b) => {
        const score = (item: Property) =>
          (item.city === property.city ? 2 : 0) +
          (item.region === property.region ? 1 : 0) +
          (item.type === property.type ? 1 : 0)
        return (
          score(b) - score(a) ||
          Math.abs(a.price - property.price) - Math.abs(b.price - property.price)
        )
      })
      .slice(0, limit)
  }
}

// Synchronous fallbacks for components that haven't been converted to async yet.
export const getAllProperties = (): Property[] => properties
export const getFeaturedProperties = (): Property[] => properties.filter((p) => p.featured)
export const getPropertyBySlug = (slug: string): Property | undefined =>
  properties.find((property) => property.slug === slug)
export const getSimilarProperties = (property: Property, limit = 3): Property[] =>
  properties
    .filter((candidate) => candidate.id !== property.id)
    .sort((a, b) => {
      const score = (item: Property) =>
        (item.city === property.city ? 2 : 0) +
        (item.region === property.region ? 1 : 0) +
        (item.type === property.type ? 1 : 0)
      return score(b) - score(a) || Math.abs(a.price - property.price) - Math.abs(b.price - property.price)
    })
    .slice(0, limit)

export const getPropertyImageAlt = (property: Property): string =>
  `${property.name} در ${property.city}، ${property.region}`
