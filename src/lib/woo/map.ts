/**
 * WooCommerce data → the app's own models.
 *
 * The components keep consuming the shapes in `src/lib/types.ts`; this module is the only
 * place that knows how a WooCommerce product, category or post becomes one. Everything the
 * UI shows therefore comes from the store, while the UI itself stays untouched.
 *
 * Prices arrive as strings in the store's *minor* unit (with `currency_minor_unit`) plus a
 * currency code. Iranian stores are commonly configured in Rial, so a Rial store is
 * converted to Toman — the unit the whole app renders — on the way in, once, here.
 */
import type { BlogPost, Category, Product, ProductColor, ProductReview } from '../types';
import type {
  WooAttribute,
  WooCategory,
  WooPrices,
  WooProduct,
  WooReview,
  WooTerm,
  WpPost,
} from './types';

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
  '&hellip;': '…',
  '&mdash;': '—',
  '&ndash;': '–',
  '&times;': '×',
  '&laquo;': '«',
  '&raquo;': '»',
};

/** WordPress sends HTML; the app renders text, so tags are stripped, never injected. */
export const stripHtml = (html?: string): string =>
  (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();

const FA_DATE = new Intl.DateTimeFormat('fa-IR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** A real publication date, in the Persian calendar the rest of the UI speaks. */
export const formatPersianDate = (iso?: string): string => {
  const date = new Date(iso ?? '');
  return Number.isNaN(date.getTime()) ? '' : FA_DATE.format(date);
};

const RIAL_PER_TOMAN = 10;

/** One WooCommerce money string, in Toman, as an integer. */
export const toman = (prices: WooPrices | undefined, value?: string): number => {
  if (!prices || !value) return 0;
  const minor = Number(value);
  if (!Number.isFinite(minor)) return 0;
  const major = minor / 10 ** (prices.currency_minor_unit ?? 0);
  const divisor = prices.currency_code === 'IRR' ? RIAL_PER_TOMAN : 1;
  return Math.round(major / divisor);
};

export const discountPercent = (price: number, originalPrice: number): number =>
  originalPrice > price && originalPrice > 0
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

/**
 * Swatch colours. WooCommerce terms carry no colour: the hex has to come from term meta,
 * which the Store API does not expose — so a hex written into the term description is
 * honoured, and otherwise the term is matched against the names Iranian storefronts use.
 */
const COLOR_HEX: Record<string, string> = {
  'مشکی': '#1C1C1C',
  black: '#1C1C1C',
  'سفید': '#FFFFFF',
  white: '#FFFFFF',
  'کرم': '#E9DED0',
  cream: '#E9DED0',
  beige: '#E9DED0',
  'سرمه‌ای': '#123F50',
  navy: '#123F50',
  'آبی': '#6FA5B8',
  blue: '#6FA5B8',
  'قهوه‌ای': '#6B4A32',
  brown: '#6B4A32',
  'زیتونی': '#4E5B3A',
  olive: '#4E5B3A',
  'شرابی': '#7B2D3B',
  wine: '#7B2D3B',
  'طوسی': '#8A8F94',
  grey: '#8A8F94',
  gray: '#8A8F94',
  'صورتی': '#E8B4B8',
  pink: '#E8B4B8',
  'عسلی': '#C9A227',
  tan: '#C9A227',
  'زرد': '#C9A227',
  yellow: '#C9A227',
  'سبز': '#4E5B3A',
  green: '#4E5B3A',
  'قرمز': '#B3243B',
  red: '#B3243B',
};

const colorOf = (term: WooTerm): ProductColor => {
  const explicit = /#(?:[0-9a-f]{6}|[0-9a-f]{3})/i.exec(term.description ?? '');
  if (explicit) return { name: term.name, hex: explicit[0].toUpperCase() };
  const name = term.name.trim().toLowerCase();
  return { name: term.name, hex: COLOR_HEX[name] ?? COLOR_HEX[term.slug.toLowerCase()] ?? '#C9C5BE' };
};

/* ------------------------------------------------------------------ *
 * Attribute classification
 * ------------------------------------------------------------------ */

const matches = (attribute: WooAttribute, pattern: RegExp) =>
  pattern.test(`${attribute.taxonomy ?? ''} ${attribute.name}`);

const isSize = (attribute: WooAttribute) => matches(attribute, /size|سایز/i);
const isColor = (attribute: WooAttribute) => matches(attribute, /colou?r|رنگ/i);
const isBrand = (attribute: WooAttribute) => matches(attribute, /brand|برند/i);

/* ------------------------------------------------------------------ *
 * Mappers
 * ------------------------------------------------------------------ */

export const toProduct = (raw: WooProduct): Product => {
  const attributes = raw.attributes ?? [];
  const price = toman(raw.prices, raw.prices?.price);
  const regular = toman(raw.prices, raw.prices?.regular_price) || price;
  const sizeAttribute = attributes.find(isSize);
  const colorAttribute = attributes.find(isColor);
  const brandAttribute = attributes.find(isBrand);

  return {
    id: String(raw.id),
    name: raw.name,
    category: raw.categories?.[0]?.slug ?? '',
    brand: brandAttribute?.terms?.[0]?.name || 'MEDORA',
    price,
    originalPrice: regular,
    discount: discountPercent(price, regular),
    rating: Number(raw.average_rating ?? 0) || 0,
    reviewCount: raw.review_count ?? 0,
    images: (raw.images ?? []).map((image) => image.src).filter(Boolean),
    sizes: (sizeAttribute?.terms ?? []).map((term) => term.name),
    colors: (colorAttribute?.terms ?? []).map(colorOf),
    // The Store API only publishes an exact quantity while stock is low; a product that is
    // in stock otherwise reports a positive floor rather than its real warehouse number.
    stock: raw.low_stock_remaining ?? (raw.is_in_stock ? 1 : 0),
    isNew: (raw.tags ?? []).some((tag) => /new|جدید/i.test(`${tag.slug} ${tag.name}`)),
    description: stripHtml(raw.description) || stripHtml(raw.short_description),
    specs: attributes.map((attribute) => ({
      label: attribute.name,
      value: attribute.terms.map((term) => term.name).join('، '),
    })),
    // Reviews are their own collection; the product page loads them on demand.
    reviews: [],
  };
};

export const toProductReview = (raw: WooReview): ProductReview => ({
  name: raw.reviewer,
  avatar: raw.avatar_urls?.['96'] ?? raw.avatar_urls?.['48'] ?? '',
  rating: raw.rating,
  date: formatPersianDate(raw.date_created),
  text: stripHtml(raw.review),
});

export const toCategory = (raw: WooCategory): Category => ({
  id: raw.slug,
  title: raw.name,
  subtitle: stripHtml(raw.description).slice(0, 90),
  image: raw.image?.src ?? '',
  itemCount: raw.count ?? 0,
});

/** A WordPress post, with its featured image, author and terms already embedded. */
export const toBlogPost = (raw: WpPost): BlogPost => {
  const embedded = raw._embedded ?? {};
  const media = embedded['wp:featuredmedia']?.[0];
  const author = embedded.author?.[0]?.name;

  const body = stripHtml(raw.content?.rendered ?? '')
    .split(/\s*\|\|\|\s*|\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const words = body.join(' ').split(/\s+/).filter(Boolean).length;

  return {
    id: String(raw.id),
    title: stripHtml(raw.title?.rendered ?? ''),
    excerpt: stripHtml(raw.excerpt?.rendered ?? '').slice(0, 180),
    image: media?.source_url ?? '',
    date: formatPersianDate(raw.date),
    author: author || 'تیم مدورا',
    readTime: `${Math.max(1, Math.round(words / 200))} دقیقه مطالعه`,
    body: body.length ? body : [stripHtml(raw.content?.rendered ?? '')],
  };
};
