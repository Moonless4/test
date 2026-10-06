export type CategoryId = 'men' | 'women' | 'shoes' | 'accessories';

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
};
