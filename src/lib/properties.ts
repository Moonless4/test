import { properties } from '@/data/properties'
import type { Property } from '@/types'

/**
 * Read model for the property catalogue. Everything the UI needs goes through
 * these functions so the data source can move to an API without touching
 * components.
 */
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
