import { categories, megaMenu, products } from './data';
import type { Category, Product } from './types';

/** Shortest query that starts showing suggestions. */
export const MIN_QUERY = 2;

/** Candidate chips for "popular searches"; only the ones with real results are offered. */
const POPULAR_SEARCH_CANDIDATES = [
  'کت جین',
  'مانتو کتان',
  'کتانی کلاسیک',
  'کیف دستی',
  'عینک آفتابی',
  'هودی',
];

/** Normalises Persian/Arabic glyph variants so search matches either spelling. */
export const normalise = (value: string): string =>
  value
    .replace(/[\u200c\u200f\u200e]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export type SearchMatches = {
  products: Product[];
  categories: Category[];
};

/** Every word of the query must appear in the product's text or the category title. */
function matches(haystack: string, words: string[]) {
  const plain = normalise(haystack);
  return words.every((word) => plain.includes(word));
}

/** Products and categories matching the query, used by the results page and the live suggestions. */
export function searchCatalog(query: string): SearchMatches {
  const term = normalise(query);
  if (!term) return { products: [], categories: [] };
  const words = term.split(' ');

  return {
    products: products.filter((product) => {
      const categoryTitle =
        categories.find((c) => c.id === product.category)?.title ?? '';
      return matches(
        [product.name, product.brand, product.description, categoryTitle].join(' '),
        words,
      );
    }),
    categories: categories.filter((category) => matches(category.title, words)),
  };
}

/** True when searching the phrase actually returns products or categories. */
export function hasMatches(phrase: string): boolean {
  const { products: hits, categories: matched } = searchCatalog(phrase);
  return hits.length + matched.length > 0;
}

/** Chips shown under "popular searches" in the search overlay and on the results page. */
export const POPULAR_SEARCHES = POPULAR_SEARCH_CANDIDATES.filter(hasMatches);

/**
 * Search phrases containing what has been typed so far: the curated mega menu labels
 * first, then categories and product names. Each one is a query of its own.
 */
export function searchTerms(query: string, limit = 6): string[] {
  const term = normalise(query);
  if (term.length < MIN_QUERY) return [];

  const pool = [
    ...Object.values(megaMenu)
      .flat()
      .flatMap((group) => group.links.map((link) => link.label)),
    ...categories.map((category) => category.title),
    ...products.map((product) => product.name),
  ];

  const seen = new Set<string>();
  const hits: string[] = [];
  for (const phrase of pool) {
    const plain = normalise(phrase);
    // Never suggest a phrase that leads to an empty result page.
    if (seen.has(plain) || !plain.includes(term) || !hasMatches(phrase)) continue;
    seen.add(plain);
    hits.push(phrase);
    if (hits.length >= limit) break;
  }
  return hits;
}
