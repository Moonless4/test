export type PropertyType =
  | 'ویلا'
  | 'عمارت'
  | 'خانه'
  | 'پنت‌هاوس'
  | 'اقامتگاه'
  | 'ویلای ساحلی'

export type PropertyStatus = 'برای فروش' | 'لیستینگ جدید' | 'اختصاصی' | 'ویژه'

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
  /** Price in Iranian Toman. */
  price: number
  type: PropertyType
  status: PropertyStatus
  beds: number
  baths: number
  /** Interior area in square metres. */
  area: number
  /** Plot / land area in square metres (0 for apartments). */
  land: number
  /** Construction year in the Jalali (Shamsi) calendar. */
  year: number
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
  /** Preferred visit date — only for 'viewing' kind. */
  preferredDate?: string
  /** Preferred visit time slot — only for 'viewing' kind. */
  preferredTime?: string
  createdAt: string
}
