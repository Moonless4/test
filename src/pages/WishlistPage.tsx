import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { products } from '../lib/data';
import { useStore } from '../context/StoreContext';
import { formatPrice, toFa } from '../lib/format';
import { toFa as persian } from '../lib/format';
import EmptyState from '../components/ui/EmptyState';
import Img from '../components/ui/Img';
import Rating from '../components/ui/Rating';
import DiscountBadge from '../components/ui/DiscountBadge';
import PriceDisplay from '../components/ui/PriceDisplay';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="container py-10 sm:py-16">
        <h1 className="mb-6 text-xl font-bold text-ink sm:text-2xl">علاقه‌مندی‌ها</h1>
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
      </div>
    );
  }

  return (
    <div className="container py-8 sm:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <span>/</span>
        <span className="font-medium text-ink">علاقه‌مندی‌ها</span>
      </nav>

      <h1 className="mb-7 text-xl font-bold text-ink sm:text-2xl">
        علاقه‌مندی‌ها
        <span className="ms-2 text-sm font-medium text-muted">({persian(items.length)} کالا)</span>
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((product) => (
          <article
            key={product.id}
            className="flex gap-4 rounded-panel border border-line bg-white p-4 shadow-soft"
          >
            <Link
              to={`/product/${product.id}`}
              className="relative h-[132px] w-[104px] shrink-0 overflow-hidden rounded-2xl bg-cream"
            >
              <Img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/product/${product.id}`}
                  className="text-[14px] font-bold leading-6 text-ink transition-colors hover:text-black"
                >
                  {product.name}
                </Link>
                {product.discount > 0 ? <DiscountBadge value={product.discount} /> : null}
              </div>

              <Rating value={product.rating} count={product.reviewCount} />

              <PriceDisplay
                price={product.price}
                originalPrice={product.originalPrice}
                size="sm"
              />

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
                  className="flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-[12px] font-medium text-muted transition-colors hover:border-sale/30 hover:text-sale"
                >
                  حذف
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 text-[12px] text-muted">
        جمع مبلغ کالاهای ذخیره‌شده:{' '}
        <span className="font-bold text-black">
          {formatPrice(items.reduce((sum, p) => sum + p.price, 0))}
        </span>{' '}
        ({toFa(items.length)} کالا)
      </p>
    </div>
  );
}
