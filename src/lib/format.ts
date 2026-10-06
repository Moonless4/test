const faNumber = new Intl.NumberFormat('fa-IR')

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/** Converts every Latin digit inside a string to its Persian counterpart. */
export const toPersianDigits = (value: string | number): string =>
  String(value).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)])

/** Converts Persian digits back to Latin — needed for `tel:` links and inputs. */
export const toLatinDigits = (value: string): string =>
  value.replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))

/** Builds a dial-safe `tel:` link from a Persian-formatted number. */
export const telHref = (phone: string): string => {
  const digits = toLatinDigits(phone).replace(/[^\d+]/g, '')
  // National Iranian mobile (09xxxxxxxxx) → international form for reliable dialling.
  if (/^09\d{9}$/.test(digits)) return `tel:+98${digits.slice(1)}`
  return `tel:${digits}`
}

/** 1250 → «۱٬۲۵۰» using Persian digits and thousands separators. */
export const formatNumber = (value: number): string => faNumber.format(value)

/** Years are displayed without thousands separators: 1398 → «۱۳۹۸». */
export const formatYear = (value: number): string => toPersianDigits(value)

const compactBillions = (value: number): string => {
  const billions = value / 1_000_000_000
  return Number.isInteger(billions) ? billions.toFixed(0) : billions.toFixed(1)
}

/** Prices are stored in Toman: 85_000_000_000 → «۸۵ میلیارد تومان». */
export const formatPrice = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${toPersianDigits(compactBillions(value))} میلیارد تومان`
  }
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    const rounded = Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)
    return `${toPersianDigits(rounded)} میلیون تومان`
  }
  return `${formatNumber(value)} تومان`
}

/** Compact price for filter dropdowns — «۸۵ میلیارد» or «۹۰۰ میلیون». */
export const formatPriceShort = (value: number): string =>
  value >= 1_000_000_000
    ? `${toPersianDigits(compactBillions(value))} میلیارد`
    : `${toPersianDigits(Math.round(value / 1_000_000))} میلیون`

/** Persian-friendly slug that keeps letters and digits from any script. */
export const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/(^-|-$)/g, '')
