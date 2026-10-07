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
 * four main destinations plus the brand button in the middle. It stays below `xl` (1280px), so
 * tablets keep it while a desktop keeps its own header chrome. Rendered by the app shell, so
 * every page has it.
 *
 * `sticky`, not `fixed`: a `fixed` bar fell to the end of the document in the preview on a real
 * tablet (it only showed up over the footer, where a scaled/transformed preview shell breaks
 * `position: fixed`). Sticky pins it to the viewport bottom everywhere, and its own slot at the
 * end of the shell reserves the clearance the old shell padding used to provide.
 */
export default function MobileTabBar({ onOpenCategories }: Props) {
  const { cartCount, wishlist, openCart } = useStore();
  const { pathname } = useLocation();

  const tab =
    'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10.5px] font-medium transition-colors';
  const tone = (on: boolean) => (on ? 'text-teal-800' : 'text-ink/70 hover:text-ink');

  const badge =
    'absolute top-0 end-3 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white';

  const brand = `mx-1 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-white text-[17px] font-black tracking-tight ring-1 ring-line transition-colors ${
    pathname === '/' ? 'text-teal-800' : 'text-ink'
  }`;

  return (
    <div className="sticky bottom-0 z-[60] xl:hidden">
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

          <Link to="/" aria-label="استایل‌آن" className={brand}>
            S
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
