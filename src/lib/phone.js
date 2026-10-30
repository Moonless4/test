/* One canonical mobile number for every form and account key:
   Persian/Arabic digits → Latin, +98 / 0098 / 98 prefixes → 0, non-digits dropped. */

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export const normalizePhone = (value = '') => {
  let digits = String(value)
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/\D/g, '');

  if (digits.startsWith('0098')) digits = digits.slice(4);
  else if (digits.startsWith('98') && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith('9') && digits.length === 10) digits = `0${digits}`;

  return digits.slice(0, 11);
};

/* Iranian mobile numbers: 09 + 9 digits */
export const isValidPhone = (value = '') => /^09\d{9}$/.test(normalizePhone(value));
