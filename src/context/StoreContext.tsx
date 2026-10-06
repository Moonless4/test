import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { products } from '../lib/data';
import type { CartLine, Product } from '../lib/types';

const CART_KEY = 'styleon.cart';
const WISH_KEY = 'styleon.wishlist';
export const FREE_SHIPPING_THRESHOLD = 5000000;
export const SHIPPING_FEE = 45000;

export type DetailedLine = CartLine & { product: Product; lineTotal: number };

type StoreValue = {
  lines: DetailedLine[];
  wishlist: string[];
  cartCount: number;
  subtotal: number;
  discountTotal: number;
  shipping: number;
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size?: string, color?: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const StoreContext = createContext<StoreValue | null>(null);

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => readStorage<CartLine[]>(CART_KEY, []));
  const [wishlist, setWishlist] = useState<string[]>(() =>
    readStorage<string[]>(WISH_KEY, []),
  );
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // Freeze background scrolling while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const addToCart = useCallback(
    (product: Product, size?: string, color?: string, qty = 1) => {
      const lineSize = size ?? product.sizes[0];
      const lineColor = color ?? product.colors[0]?.name ?? '';
      setCart((prev) => {
        const found = prev.find(
          (l) => l.productId === product.id && l.size === lineSize && l.color === lineColor,
        );
        if (found) {
          return prev.map((l) =>
            l === found ? { ...l, qty: Math.min(l.qty + qty, product.stock) } : l,
          );
        }
        return [...prev, { productId: product.id, size: lineSize, color: lineColor, qty }];
      });
      setCartOpen(true);
    },
    [],
  );

  const removeFromCart = useCallback((productId: string, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (l) => !(l.productId === productId && l.size === size && l.color === color),
      ),
    );
  }, []);

  const updateQty = useCallback(
    (productId: string, size: string, color: string, qty: number) => {
      setCart((prev) =>
        prev
          .map((l) =>
            l.productId === productId && l.size === size && l.color === color
              ? { ...l, qty: Math.max(0, qty) }
              : l,
          )
          .filter((l) => l.qty > 0),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const value = useMemo<StoreValue>(() => {
    const lines: DetailedLine[] = cart
      .map((line) => {
        const product = products.find((p) => p.id === line.productId);
        if (!product) return null;
        return { ...line, product, lineTotal: product.price * line.qty };
      })
      .filter((l): l is DetailedLine => l !== null);

    const subtotal = lines.reduce((sum, l) => sum + l.product.originalPrice * l.qty, 0);
    const discountTotal = lines.reduce(
      (sum, l) => sum + (l.product.originalPrice - l.product.price) * l.qty,
      0,
    );
    const total = subtotal - discountTotal;
    const shipping =
      lines.length === 0 || total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    return {
      lines,
      wishlist,
      cartCount: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal,
      discountTotal,
      shipping,
      total,
      isCartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
    };
  }, [cart, wishlist, isCartOpen, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
