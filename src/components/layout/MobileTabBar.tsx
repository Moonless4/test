import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { toFa } from '../../lib/format';

type Props = {
  /** Opens the category drawer — the "دسته‌بندی" tab is the phone's way into the catalog. */
  onOpenCategories: () => void;
};

/**
 * Phone and tablet bottom bar: a full-width bar anchored to the bottom edge that carries the
 * four main destinations plus the brand button in the middle. It is hidden from 769px up, where
 * the header takes over with its own menu, wishlist and account entries. Rendered by the app
 * shell, so every page has it.
 *
 * `fixed`, so the bar is anchored to the viewport instead of a document slot. The footer reserves
 * the space it needs with a matching `pb-[69px] min-[769px]:pb-0`, which keeps the bar over the
 * footer rather than in a strip of its own underneath it.
 */
export default function MobileTabBar({ onOpenCategories }: Props) {
  const { cartCount, wishlist, openCart } = useStore();
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  /**
   * Browsers with a dynamic toolbar resolve `bottom: 0` against the taller layout viewport, so a
   * bottom bar can start below the visible area and only jump into place after the first scroll.
   * Lifting it by the strip the user cannot see keeps it on screen from the first paint; where the
   * two viewports agree the offset is 0 and this does nothing.
   */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      const hidden = document.documentElement.clientHeight - vv.height - vv.offsetTop;
      ref.current?.style.setProperty('transform', `translateY(${-Math.max(0, hidden)}px)`);
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, []);

  const tab =
    'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10.5px] font-medium transition-colors';
  const tone = (on: boolean) => (on ? 'text-teal-800' : 'text-ink/70 hover:text-ink');

  const badge =
    'absolute top-0 end-3 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white';

  // The brand button carries the standalone mark, not the lockup: at 46px the wordmark is
  // illegible. The mark is black ink on transparency, so it sits straight on the white chip.
  const brand = `mx-1 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-white ring-1 transition-colors ${
    pathname === '/' ? 'ring-teal-800' : 'ring-line'
  }`;

  return (
    <div ref={ref} className="fixed inset-x-0 bottom-0 z-[60] min-[769px]:hidden">
      <nav
        aria-label="ناوبری موبایل"
        className="border-t border-line bg-cream pb-[max(6px,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto flex h-[62px] max-w-[640px] items-center px-2">
          {/* First child renders on the right in RTL: cart, categories, brand, wishlist, profile. */}
          <button
            type="button"
            onClick={openCart}
            aria-label="سبد خرید"
            className={`${tab} ${tone(false)}`}
          >
            <ShoppingBag className="h-5 w-5" />
            سبد خرید
            {cartCount > 0 ? (
              <span className={`${badge} bg-sale`}>{toFa(cartCount)}</span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={onOpenCategories}
            aria-label="دسته‌بندی‌ها"
            className={`${tab} ${tone(pathname.startsWith('/shop'))}`}
          >
            <LayoutGrid className="h-5 w-5" />
            دسته‌بندی
          </button>

          <Link to="/" aria-label="مدورا" className={brand}>
            <img src="/medora-mark.webp" alt="" width={96} height={72} className="h-6 w-auto" />
          </Link>

          <Link to="/wishlist" className={`${tab} ${tone(pathname === '/wishlist')}`}>
            <Heart className="h-5 w-5" />
            علاقه‌مندی
            {wishlist.length > 0 ? (
              <span className={`${badge} bg-teal-800`}>{toFa(wishlist.length)}</span>
            ) : null}
          </Link>

          <Link to="/account" className={`${tab} ${tone(pathname === '/account')}`}>
            <User className="h-5 w-5" />
            پروفایل
          </Link>
        </div>
      </nav>
    </div>
  );
}
