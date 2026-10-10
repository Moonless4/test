/**
 * A WooCommerce product-category slug. It used to be a closed union of the six demo
 * categories; with a real store the taxonomy belongs to WordPress, so this is whatever the
 * owner creates there and nothing in the app may assume a fixed list.
 */
export type CategoryId = string;

export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductReview = {
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  isNew: boolean;
  description: string;
  specs: { label: string; value: string }[];
  reviews: ProductReview[];
};

/** One sub-link of the header mega menu: what it reads and what it searches for. */
export type MegaMenuLink = {
  label: string;
  q: string;
};

/** One sub-section of the mega menu: its rail entry plus the links its panel shows. */
export type MegaMenuSection = {
  id: string;
  title: string;
  image: string;
  /** Catalog query run by the rail entry and the "view all" link. */
  q: string;
  links: MegaMenuLink[];
};

export type Category = {
  id: CategoryId;
  title: string;
  subtitle: string;
  image: string;
  itemCount: number;
};

export type CartLine = {
  productId: string;
  size: string;
  color: string;
  qty: number;
  /**
   * The product as it was when the shopper put it in the basket. The catalogue is the API's now, so
   * a line cannot be looked up in a local list any more — the basket carries what was picked, and
   * that is also what survives a reload (`StoreContext` persists the line as it is).
   *
   * Optional only for lines saved before this change: they name a product the current catalogue
   * does not have, so they are dropped instead of being priced from a stale local catalogue.
   */
  product?: Product;
};

/** A discount code the shopper can type in the cart. Percent OR amount, never both. */
export type Coupon = {
  code: string;
  percent?: number;
  amount?: number;
  /** The code only works once the cart total reaches this amount. */
  minSpend?: number;
  label: string;
};

export type Testimonial = {
  name: string;
  avatar: string;
  rating: number;
  text: string;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  readTime: string;
  /** Article paragraphs, rendered in order. */
  body: string[];
};
