export type CategoryId =
  | 'men'
  | 'women'
  | 'shoes'
  | 'accessories'
  | 'bags'
  | 'beauty';

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
