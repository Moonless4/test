const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert every Latin digit in a value to its Persian counterpart. */
export const toFa = (input: string | number): string =>
  String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

/** 1980000 -> "۱,۹۸۰,۰۰۰" */
export const formatNumber = (value: number): string =>
  toFa(value.toLocaleString('en-US'));

/**
 * Amounts are rendered with the Toman glyph instead of the word "تومان":
 * use `<Price value={…} />` from `src/components/ui/Price.tsx`.
 */
