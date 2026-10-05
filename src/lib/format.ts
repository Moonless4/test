/** Formats 2350000 as "$2.35 Million" — matching the editorial price style. */
export const formatPrice = (value: number): string => {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    const rounded = Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(2)
    return `$${rounded} Million`
  }
  return `$${value.toLocaleString('en-US')}`
}

/** Compact price used inside filter dropdowns. */
export const formatPriceShort = (value: number): string =>
  value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1)}M` : `$${Math.round(value / 1000)}K`

export const formatNumber = (value: number): string => value.toLocaleString('en-US')

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
