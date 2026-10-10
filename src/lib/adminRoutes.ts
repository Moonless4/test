import { useEffect, useState } from 'react'

const STORAGE_KEY = 'horizon.adminRoutes'

export interface AdminRouteConfig {
  loginPath: string
  adminPath: string
}

const DEFAULTS: AdminRouteConfig = {
  loginPath: '/secret-login',
  adminPath: '/admin',
}

function normalize(path: string): string {
  let p = path.trim().toLowerCase()
  if (!p) return '/'
  if (!p.startsWith('/')) p = '/' + p
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

export function getAdminRoutes(): AdminRouteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<AdminRouteConfig>
    return {
      loginPath: normalize(parsed.loginPath ?? DEFAULTS.loginPath),
      adminPath: normalize(parsed.adminPath ?? DEFAULTS.adminPath),
    }
  } catch {
    return DEFAULTS
  }
}

export function saveAdminRoutes(config: Partial<AdminRouteConfig>): AdminRouteConfig {
  const current = getAdminRoutes()
  const next: AdminRouteConfig = {
    loginPath: normalize(config.loginPath ?? current.loginPath),
    adminPath: normalize(config.adminPath ?? current.adminPath),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('adminRoutesChanged'))
  return next
}

export function resetAdminRoutes(): AdminRouteConfig {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('adminRoutesChanged'))
  return DEFAULTS
}

export function useAdminRoutes(): [AdminRouteConfig, (c: Partial<AdminRouteConfig>) => AdminRouteConfig, () => AdminRouteConfig] {
  const [config, setConfig] = useState<AdminRouteConfig>(() => getAdminRoutes())

  useEffect(() => {
    const handler = () => setConfig(getAdminRoutes())
    window.addEventListener('adminRoutesChanged', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('adminRoutesChanged', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const update = (c: Partial<AdminRouteConfig>): AdminRouteConfig => {
    const next = saveAdminRoutes(c)
    setConfig(next)
    return next
  }
  const reset = (): AdminRouteConfig => {
    const next = resetAdminRoutes()
    setConfig(next)
    return next
  }

  return [config, update, reset]
}
