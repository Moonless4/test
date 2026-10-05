export type PropertyType =
  | 'Villa'
  | 'Estate'
  | 'Residence'
  | 'Penthouse'
  | 'Retreat'
  | 'Lake House'

export interface PropertyImage {
  id: string
  alt: string
}

export interface Agent {
  id: string
  name: string
  role: string
  photoId: string
  phone: string
  email: string
}

export interface Property {
  id: string
  slug: string
  name: string
  city: string
  region: string
  country: string
  /** Price in US dollars. */
  price: number
  type: PropertyType
  status: 'For Sale' | 'New Listing' | 'Exclusive' | 'Featured'
  beds: number
  baths: number
  sqft: number
  year: number
  lotAcres: number
  featured: boolean
  summary: string
  description: string[]
  features: string[]
  amenities: string[]
  imageId: string
  gallery: PropertyImage[]
  agentId: string
}

export interface ServiceItem {
  title: string
  description: string
}

export interface ValueItem {
  title: string
  description: string
}

export interface Inquiry {
  id: string
  kind: 'contact' | 'agent' | 'viewing'
  name: string
  email: string
  phone?: string
  message: string
  propertySlug?: string
  createdAt: string
}
