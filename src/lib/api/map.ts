/**
 * Laravel resource → the app's own models.
 *
 * This is the only place that knows both vocabularies, and the only place a value is converted.
 * Components keep consuming `Product` / `Category` / `BlogPost` from `src/lib/types.ts`, so a
 * screen cannot tell whether a product came from the API or from the old static catalogue.
 *
 * The API is leaner than the old demo data, and the mapping is honest about it rather than
 * inventing numbers:
 *  - **money** is already Toman — `compare_at_price` is the original, `price` is what is paid, and
 *    `originalPrice` collapses to `price` when there is no discount (the rule the whole UI rests
 *    on: a struck-through price is only shown when there is a real one),
 *  - **sizes and colours** come from the product's own `attributes` (the admin panel edits them),
 *    so a product with no attributes simply offers no choice,
 *  - **rating** is the product's own score, and the number the rail's «امتیاز» group filters on;
 *    review texts still have no endpoint, so a screen hides what has no data behind it rather than
 *    printing «۰ نظر»,
 *  - **brand** is the product's own label, and a product the catalogue left without one falls back
 *    to its category name instead of showing a blank line.
 */
import type { FilterOptions } from '../filters';
import type { BlogPost, Category, Product, ProductColor } from '../types';
import type {
  ApiCategory,
  ApiFaq,
  ApiPost,
  ApiProduct,
  ApiProductFacets,
  ApiProductSummary,
} from './types';

/** A product published within this window carries the «جدید» badge. */
const NEW_WINDOW_DAYS = 14;

/** Color names the store uses, with the ink the swatch renders. */
const COLOR_HEX: Record<string, string> = {
  'مشکی': '#1C1C1C',
  'سفید': '#FFFFFF',
  'کرم': '#E9DED0',
  'بژ': '#E3D3BE',
  'سرمه‌ای': '#123F50',
  'آبی': '#6FA5B8',
  'آبی روشن': '#6FA5B8',
  'قهوه‌ای': '#6B4A32',
  'عسلی': '#C9A227',
  'زیتونی': '#4E5B3A',
  'سبز': '#4E5B3A',
  'شرابی': '#7B2D3B',
  'قرمز': '#B23A48',
  'صورتی': '#E8B4B8',
  'طوسی': '#8A8F94',
  'خاکستری': '#8A8F94',
  'نقره‌ای': '#C9CCD1',
  'طلایی': '#C9A227',
};

/** A colour the catalogue names but the swatch table does not know still gets a neutral ink. */
const FALLBACK_HEX = '#D8D3CB';

export const colorHex = (name: string): string =>
  COLOR_HEX[name.trim()] ?? COLOR_HEX[name.replace(/‌/g, '').trim()] ?? FALLBACK_HEX;

const toColors = (attributes: Record<string, string[]> | null | undefined): ProductColor[] =>
  (attributes?.color ?? attributes?.رنگ ?? []).map((name) => ({ name, hex: colorHex(name) }));

const toSizes = (attributes: Record<string, string[]> | null | undefined): string[] =>
  attributes?.size ?? attributes?.سایز ?? [];

const isNew = (publishedAt: string | null | undefined): boolean => {
  if (!publishedAt) return false;
  const age = Date.now() - new Date(publishedAt).getTime();
  return age >= 0 && age < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
};

const imageUrls = (images: ApiProductSummary['images']): string[] =>
  (images ?? []).map((image) => image.url).filter((url): url is string => Boolean(url));

/**
 * The specification rows the product page's «مشخصات» tab lists: whatever the catalogue holds,
 * never an invented value.
 */
const toSpecs = (product: ApiProduct) => {
  const specs: { label: string; value: string }[] = [];
  const attributes = product.attributes ?? {};

  for (const [key, values] of Object.entries(attributes)) {
    if (!Array.isArray(values) || values.length === 0) continue;
    const label = key === 'size' || key === 'سایز' ? 'سایز' : key === 'color' || key === 'رنگ' ? 'رنگ' : key;
    specs.push({ label, value: values.join('، ') });
  }

  if (product.sku) specs.push({ label: 'کد کالا', value: product.sku });
  if (product.category?.name) specs.push({ label: 'دسته‌بندی', value: product.category.name });

  return specs;
};

/** A list payload and a detail payload map to the same model; the detail one is simply fuller. */
export const toProduct = (product: ApiProductSummary | ApiProduct): Product => {
  const detail = product as ApiProduct;
  const compareAt = product.compare_at_price;
  const originalPrice =
    compareAt !== null && compareAt !== undefined && compareAt > product.price
      ? compareAt
      : product.price;

  return {
    id: product.slug,
    name: product.name,
    category: product.category?.slug ?? '',
    brand: product.brand ?? product.category?.name ?? '',
    price: product.price,
    originalPrice,
    discount: product.discount_percent ?? 0,
    // The catalogue's own score; a product nobody has scored stays at zero and the screens hide it.
    rating: product.rating ?? 0,
    reviewCount: 0,
    images: imageUrls(product.images),
    sizes: toSizes(detail.attributes),
    colors: toColors(detail.attributes),
    stock: detail.stock_quantity ?? (product.is_in_stock ? 1 : 0),
    isNew: isNew(detail.published_at),
    description: detail.description ?? detail.short_description ?? '',
    specs: toSpecs(detail),
    reviews: [],
  };
};

/**
 * The rail's option lists, as the API publishes them. A colour arrives as a name only — the swatch
 * ink is presentation and stays here, beside the one table that decides it.
 */
export const toFilterFacets = (facets: ApiProductFacets): FilterOptions => ({
  sizes: facets.sizes,
  colors: facets.colors.map((name) => ({ name, hex: colorHex(name) })),
  brands: facets.brands,
});

export const toCategory = (category: ApiCategory): Category => ({
  id: category.slug,
  title: category.name,
  subtitle: category.description ?? '',
  image: category.image?.url ?? '',
  itemCount: category.products_count ?? 0,
});

/** The FAQ groups the API publishes, keyed exactly as the admin panel names them. */
const FAQ_GROUP_LABELS: Record<string, string> = {
  orders: 'ثبت سفارش و پیگیری',
  shipping: 'ارسال و تحویل',
  returns: 'بازگشت و تعویض کالا',
  payment: 'پرداخت',
  account: 'حساب کاربری',
  products: 'کالاها و موجودی',
};

export type FaqItem = { q: string; a: string };
export type FaqGroup = { id: string; label: string; items: FaqItem[] };

/**
 * FAQ entries arrive as one flat list with a `group` key on every row; the page renders one
 * accordion per group, so the grouping happens here and the order is the API's own.
 */
export const groupFaqs = (entries: ApiFaq[]): FaqGroup[] => {
  const groups = new Map<string, FaqGroup>();

  for (const entry of entries) {
    const key = entry.group || 'general';
    const existing = groups.get(key) ?? {
      id: key,
      label: FAQ_GROUP_LABELS[key] ?? 'پرسش‌های عمومی',
      items: [],
    };
    existing.items.push({ q: entry.question, a: entry.answer });
    groups.set(key, existing);
  }

  return [...groups.values()];
};

const faDate = (iso: string | null): string => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fa-IR');
  } catch {
    return '';
  }
};

/** WordPress-era posts carried an author and a reading time; the API has neither, so neither is
 *  invented — the page hides whichever one is blank. */
export const toBlogPost = (post: ApiPost): BlogPost => ({
  id: post.slug,
  title: post.title,
  excerpt: post.excerpt ?? '',
  image: post.cover?.url ?? '',
  date: faDate(post.published_at),
  author: '',
  readTime: '',
  body: (post.body ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean),
});

export type { ApiProduct, ApiProductSummary };
