import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'horizon.favorites'

const read = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

let ids: string[] = read()
const listeners = new Set<() => void>()

const emit = () => {
  listeners.forEach((listener) => listener())
}

const persist = (next: string[]) => {
  ids = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable — keep the in-memory value */
  }
  emit()
}

export const favoritesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot(): string[] {
    return ids
  },
  toggle(id: string) {
    persist(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
  },
  clear() {
    persist([])
  },
}

export const useFavorites = (): string[] =>
  useSyncExternalStore(favoritesStore.subscribe, favoritesStore.getSnapshot, () => ids)
