const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert every Latin digit in a value to its Persian counterpart. */
export const toFa = (input: string | number): string =>
  String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

/** 1980000 -> "۱,۹۸۰,۰۰۰" */
export const formatNumber = (value: number): string =>
  toFa(value.toLocaleString('en-US'));

/** 1980000 -> "۱,۹۸۰,۰۰۰ تومان" */
export const formatPrice = (value: number): string => `${formatNumber(value)} تومان`;
