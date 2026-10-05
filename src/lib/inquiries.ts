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
 * Records a lead locally. This is the single seam where a real backend
 * (REST endpoint, CRM webhook or database insert) would be wired in —
 * every form in the app goes through this function.
 */
export async function submitInquiry(input: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry> {
  const inquiry: Inquiry = {
    ...input,
    id: `inq_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  }

  const all = [...read(), inquiry]
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable — the confirmation still resolves */
  }

  return inquiry
}
