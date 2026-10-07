const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert every Latin digit in a value to its Persian counterpart. */
export const toFa = (input: string | number): string =>
  String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

/** 1980000 -> "۱,۹۸۰,۰۰۰" */
export const formatNumber = (value: number): string =>
  toFa(value.toLocaleString('en-US'));

/** Strip everything but Latin digits — for number-only inputs such as the mobile field. */
export const onlyDigits = (input: string): string => input.replace(/\D/g, '');

/**
 * Amounts are rendered with the Toman glyph instead of the word "تومان":
 * use `<Price value={…} />` from `src/components/ui/Price.tsx`.
 */
