import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { products } from '../../lib/data';
import { useStore } from '../../context/StoreContext';
import { toFa } from '../../lib/format';
import EmptyState from '../ui/EmptyState';
import Price from '../ui/Price';
import PriceDisplay from '../ui/PriceDisplay';
import Img from '../ui/Img';

/** Compact wishlist list for the account area; the full page lives at /wishlist. */
export default function WishlistPanel() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const items = products.filter((product) => wishlist.includes(product.id));

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-7 w-7" />}
        title="لیست علاقه‌مندی‌های شما خالی است"
        text="از صفحه‌ی هر کالا آیکون قلب را بزنید تا آن را برای بررسی بعدی اینجا ذخیره کنید."
        action={
          <Link
            to="/shop"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            مشاهده محصولات
            <ShoppingBag className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((product) => (
        <article
          key={product.id}
          className="flex gap-4 rounded-panel border border-line bg-white p-4"
        >
          <Link
            to={`/product/${product.id}`}
            className="h-[104px] w-[84px] shrink-0 overflow-hidden rounded-2xl bg-cream"
          >
            <Img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Link
              to={`/product/${product.id}`}
              className="text-[13.5px] font-bold leading-6 text-ink transition-colors hover:text-black"
            >
              {product.name}
            </Link>

            <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="sm" />

            <div className="mt-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => addToCart(product)}
                className="flex h-10 items-center gap-2 rounded-xl bg-teal-800 px-4 text-[12px] font-bold text-white transition-colors hover:bg-teal-700"
              >
                <ShoppingBag className="h-4 w-4" />
                افزودن به سبد
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="flex h-10 items-center rounded-xl border border-line px-4 text-[12px] font-medium text-muted transition-colors hover:border-sale/30 hover:text-sale"
              >
                حذف
              </button>
            </div>
          </div>
        </article>
      ))}

      <p className="text-[12px] text-muted">
        جمع مبلغ کالاهای ذخیره‌شده:{' '}
        <span className="font-bold text-black">
          <Price value={items.reduce((sum, product) => sum + product.price, 0)} />
        </span>{' '}
        ({toFa(items.length)} کالا)
      </p>
    </div>
  );
}
