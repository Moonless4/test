import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { COIN_MIN_REDEEM, COIN_VALUE, coinsFor, coupons } from '../lib/data';
import type { CartLine, Coupon, Product } from '../lib/types';

const CART_KEY = 'styleon.cart';
const WISH_KEY = 'styleon.wishlist';
const COUPON_KEY = 'styleon.coupon';
const COINS_KEY = 'styleon.coins';
export const FREE_SHIPPING_THRESHOLD = 3000000;
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
  /** Discount code applied to the basket and what it saves. */
  coupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { ok: boolean; error?: string };
  removeCoupon: () => void;
  /** «مدورا کوین» balance and how much of it this order spends. */
  coins: number;
  canUseCoins: boolean;
  useCoins: boolean;
  setUseCoins: (on: boolean) => void;
  coinCount: number;
  coinDiscount: number;
  /** Order amount after the code and the coins; shipping is added by the caller. */
  due: number;
  /** Credits earned coins and debits the spent ones; returns the coins earned. */
  settleOrder: (paidAmount: number) => number;
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
  const [couponCode, setCouponCode] = useState<string | null>(() =>
    readStorage<string | null>(COUPON_KEY, null),
  );
  const [coins, setCoins] = useState<number>(() => readStorage<number>(COINS_KEY, 0));
  const [useCoins, setUseCoins] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    window.localStorage.setItem(COUPON_KEY, JSON.stringify(couponCode));
  }, [couponCode]);

  useEffect(() => {
    window.localStorage.setItem(COINS_KEY, JSON.stringify(coins));
  }, [coins]);

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
        return [
          ...prev,
          { productId: product.id, product, size: lineSize, color: lineColor, qty },
        ];
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

  const removeCoupon = useCallback(() => setCouponCode(null), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const value = useMemo<StoreValue>(() => {
    const lines: DetailedLine[] = cart
      .map((line) => {
        const product = line.product;
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

    const coupon = coupons.find((item) => item.code === couponCode) ?? null;
    const couponDiscount =
      coupon && (!coupon.minSpend || total >= coupon.minSpend)
        ? Math.min(
            coupon.percent ? Math.round((total * coupon.percent) / 100) : coupon.amount ?? 0,
            total,
          )
        : 0;

    const remaining = Math.max(0, total - couponDiscount);
    const canUseCoins = coins >= COIN_MIN_REDEEM;
    // Coins are whole: a fraction of one is never cashed in.
    const coinCount =
      useCoins && canUseCoins ? Math.min(coins, Math.floor(remaining / COIN_VALUE)) : 0;
    const coinDiscount = coinCount * COIN_VALUE;
    const due = remaining - coinDiscount;

    const applyCoupon = (raw: string) => {
      const code = raw.trim().toUpperCase();
      if (!code) return { ok: false, error: 'کد تخفیف را وارد کنید.' };
      const found = coupons.find((item) => item.code === code);
      if (!found) return { ok: false, error: 'این کد تخفیف معتبر نیست.' };
      if (found.minSpend && total < found.minSpend) {
        return {
          ok: false,
          error: 'این کد برای سبد فعلی فعال نیست؛ مبلغ سبد کمتر از حد لازم است.',
        };
      }
      setCouponCode(code);
      return { ok: true };
    };

    const settleOrder = (paidAmount: number) => {
      const earned = coinsFor(paidAmount);
      setCoins((prev) => Math.max(0, prev - coinCount) + earned);
      setCouponCode(null);
      setUseCoins(false);
      return earned;
    };

    return {
      lines,
      wishlist,
      cartCount: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal,
      discountTotal,
      shipping,
      total,
      isCartOpen,
      coupon,
      couponDiscount,
      applyCoupon,
      removeCoupon,
      coins,
      canUseCoins,
      useCoins,
      setUseCoins,
      coinCount,
      coinDiscount,
      due,
      settleOrder,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
    };
  }, [
    cart,
    wishlist,
    isCartOpen,
    couponCode,
    coins,
    useCoins,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    toggleWishlist,
    removeCoupon,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
