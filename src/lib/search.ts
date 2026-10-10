/**
 * Search helpers that belong to the browser rather than to the API.
 *
 * Matching a term against the catalogue is the API's job (`GET /products?q=`); what is left here
 * is the Persian text normalisation the suggestion box uses to match a typed term against the
 * category names it already has, plus the curated chips the search surfaces offer.
 */

/** Normalises Persian/Arabic glyph variants so a search matches either spelling. */
export const normalise = (value: string): string =>
  value
    .replace(/[\u200c\u200f\u200e]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/** True when the text contains the term, ignoring spelling variants and spacing. */
export const matchesTerm = (text: string, term: string): boolean =>
  normalise(text).includes(normalise(term));

/** Chips shown under «جستجوهای پیشنهادی» — a starting point, not a catalogue query. */
export const POPULAR_SEARCHES = [
  'پالتو',
  'مانتو',
  'شال',
  'کیف چرم',
  'کتانی',
  'نیم‌بوت',
];
