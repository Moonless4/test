/**
 * API client for the Ofogh Laravel backend.
 * Handles auth tokens, request/response shaping, and error normalisation.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'ofogh_token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* storage unavailable */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = data.message || `خطای سرور (${res.status})`
    throw new ApiError(message, res.status, data.errors)
  }

  return data as T
}

// ---- Types ----
export interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'admin' | 'agent' | 'user'
}

export interface ApiProperty {
  id: number
  slug: string
  name: string
  city: string
  region: string
  country: string
  price: number
  type: string
  status: string
  beds: number
  baths: number
  area: number
  land: number
  year: number
  featured: boolean
  summary: string
  description: string[]
  features: string[]
  amenities: string[]
  imageId: string
  gallery?: { id: string; alt: string }[]
  agent?: { id: string; name: string; role: string; photoId: string; phone: string; email: string; specialty?: string }
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number }
}

// ---- Auth API ----
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, phone: string, password: string) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    }),
  me: () => request<{ user: User }>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
}

// ---- Property API ----
export const propertyApi = {
  list: (params?: Record<string, string | number | boolean>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return request<PaginatedResponse<ApiProperty>>(`/properties${qs}`)
  },
  featured: () => request<ApiProperty[]>('/properties/featured'),
  show: (slug: string) => request<ApiProperty>(`/properties/${slug}`),
}

// ---- Inquiry API ----
export const inquiryApi = {
  store: (data: {
    kind: 'contact' | 'agent' | 'viewing'
    name: string
    email: string
    phone: string
    message?: string
    property_slug?: string
    preferred_date?: string
    preferred_time?: string
  }) => request<{ message: string; id: number }>('/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}

// ---- Admin API ----
export const adminApi = {
  dashboard: () =>
    request<{
      properties_count: number
      featured_count: number
      inquiries_count: number
      new_inquiries: number
      agents_count: number
      users_count: number
      total_value: string
      recent_inquiries: Array<{
        id: number
        kind: string
        name: string
        phone: string
        status: string
        property_name: string | null
        created_at: string
      }>
    }>('/admin/dashboard'),

  properties: (page = 1) =>
    request<PaginatedResponse<ApiProperty>>(`/admin/properties?page=${page}`),

  storeProperty: (data: Record<string, unknown>) =>
    request<ApiProperty>('/admin/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProperty: (id: number, data: Record<string, unknown>) =>
    request<ApiProperty>(`/admin/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProperty: (id: number) =>
    request<{ message: string }>(`/admin/properties/${id}`, { method: 'DELETE' }),

  inquiries: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<PaginatedResponse<unknown>>(`/admin/inquiries${qs}`)
  },

  updateInquiry: (id: number, status: string) =>
    request<unknown>(`/admin/inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteInquiry: (id: number) =>
    request<{ message: string }>(`/admin/inquiries/${id}`, { method: 'DELETE' }),
}
