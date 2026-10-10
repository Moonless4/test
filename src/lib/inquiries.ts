import { inquiryApi } from '@/lib/api'
import type { Inquiry } from '@/types'

const STORAGE_KEY = 'horizon.inquiries'

const read = (): Inquiry[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? (parsed as Inquiry[]) : []
  } catch {
    return []
  }
}

/**
 * Records a lead. Tries the API first; falls back to localStorage so a
 * failed network request doesn't lose the submission.
 */
export async function submitInquiry(input: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry> {
  const inquiry: Inquiry = {
    ...input,
    id: `inq_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  }

  // Try the API; if it fails, store locally as a fallback.
  try {
    await inquiryApi.store({
      kind: input.kind,
      name: input.name,
      email: input.email,
      phone: input.phone ?? '',
      message: input.message,
      property_slug: input.propertySlug,
      preferred_date: input.preferredDate,
      preferred_time: input.preferredTime,
    })
  } catch {
    // Fallback: store locally.
    const all = [...read(), inquiry]
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    } catch {
      /* storage unavailable */
    }
  }

  return inquiry
}
