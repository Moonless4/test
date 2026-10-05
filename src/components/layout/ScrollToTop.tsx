import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets scroll position on navigation (browser default keeps the old offset). */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
