import { categories, products } from './data';
import type { Category, Product } from './types';

/** Shortest query that starts showing suggestions. */
export const MIN_QUERY = 2;

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
