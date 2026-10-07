import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronLeft,
  Coins,
  Heart,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from 'lucide-react';
import { COIN_TITLE, COIN_VALUE, coinsFor, getProduct, relatedProducts } from '../lib/data';
import { toFa } from '../lib/format';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, useStore } from '../context/StoreContext';
import ProductActionBar from '../components/product/ProductActionBar';
import ProductGallery from '../components/product/ProductGallery';
import ProductCarousel from '../components/product/ProductCarousel';
import ProductReviews from '../components/product/ProductReviews';
import DiscountBadge from '../components/ui/DiscountBadge';
import Price from '../components/ui/Price';
import PriceDisplay from '../components/ui/PriceDisplay';
import QuantitySelector from '../components/ui/QuantitySelector';
import Rating from '../components/ui/Rating';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const TABS = [
  { id: 'desc', label: 'توضیحات' },
  { id: 'specs', label: 'مشخصات' },
  { id: 'shipping', label: 'ارسال و مرجوعی' },
  { id: 'reviews', label: 'نظرات' },
] as const;

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id);
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('desc');

  if (!product) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title="این محصول پیدا نشد"
          text="ممکن است آدرس صفحه تغییر کرده باشد. از فروشگاه، محصول دیگری انتخاب کنید."
          action={<Button to="/shop">بازگشت به فروشگاه</Button>}
        />
      </div>
    );
  }

  const selectedSize = size ?? product.sizes[0];
  const selectedColor = color ?? product.colors[0]?.name ?? '';
  const wishlisted = isWishlisted(product.id);
  const earnedCoins = coinsFor(product.price * qty);
  const sameCategory = relatedProducts(product, 6);

  const handleAdd = () => addToCart(product, selectedSize, selectedColor, qty);
  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, qty);
    navigate('/checkout');
  };

  return (
    <div className="container py-6 sm:py-8">
      <nav aria-label="مسیر صفحه" className="mb-6 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <Link to={`/shop/${product.category}`} className="transition-colors hover:text-black">
          {product.category === 'men'
            ? 'مردانه'
            : product.category === 'women'
              ? 'زنانه'
              : product.category === 'shoes'
                ? 'کفش'
                : 'اکسسوری'}
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="font-medium text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <ProductGallery product={product} />

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium uppercase tracking-wide text-black" dir="ltr">
              {product.brand}
            </span>
            {product.discount > 0 ? <DiscountBadge value={product.discount} /> : null}
          </div>

          <h1 className="mt-3 text-xl font-bold leading-8 text-ink sm:text-2xl lg:text-[26px] lg:leading-9">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} size="md" showValue />
            <span className="text-[12px] text-muted">({toFa(product.reviewCount)} نظر)</span>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span
              className={`text-[12px] font-medium ${
                product.stock > 5 ? 'text-black' : 'text-sale'
              }`}
            >
              {product.stock > 5
                ? 'موجود در انبار'
                : `تنها ${toFa(product.stock)} عدد باقی مانده`}
            </span>
          </div>

          <div className="my-5 h-px bg-line" />

          <PriceDisplay
            price={product.price}
            originalPrice={product.originalPrice}
            size="lg"
          />
          {product.discount > 0 ? (
            <p className="mt-2 text-[12px] font-medium text-sale">
              {toFa(product.discount)}٪ تخفیف — سود شما{' '}
              <Price value={product.originalPrice - product.price} />
            </p>
          ) : null}

          <div className="my-6 h-px bg-line" />

          <div>
            <h2 className="mb-3 text-[13px] font-bold text-ink">انتخاب سایز</h2>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  aria-pressed={selectedSize === option}
                  className={`h-11 min-w-12 rounded-xl border px-3.5 text-[13px] font-medium transition-all ${
                    selectedSize === option
                      ? 'border-teal-800 bg-teal-800 text-white'
                      : 'border-line bg-white text-ink hover:border-teal-300'
                  }`}
                >
                  {toFa(option)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 text-[13px] font-bold text-ink">انتخاب رنگ</h2>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setColor(option.name)}
                  aria-pressed={selectedColor === option.name}
                  aria-label={option.name}
                  className={`flex h-11 items-center gap-2 rounded-xl border px-3 text-[12px] font-medium transition-all ${
                    selectedColor === option.name
                      ? 'border-teal-800 bg-teal-50 text-black'
                      : 'border-line bg-white text-ink hover:border-teal-300'
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: option.hex }}
                  />
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-[13px] font-bold text-ink">تعداد:</span>
            <QuantitySelector value={qty} onChange={setQty} max={product.stock} />
          </div>

          <div className="mt-7 flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
              >
                <ShoppingBag className="h-5 w-5" />
                افزودن به سبد خرید
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={wishlisted ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                aria-pressed={wishlisted}
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border transition-all ${
                  wishlisted
                    ? 'border-sale/20 bg-sale/10 text-sale'
                    : 'border-line bg-white text-black hover:border-teal-300'
                }`}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} strokeWidth={1.8} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleBuyNow}
              className="h-[52px] rounded-xl border border-teal-800/25 text-sm font-bold text-black transition-colors hover:bg-teal-800 hover:text-white"
            >
              خرید سریع
            </button>
          </div>

          <p className="mt-4 flex items-center gap-2.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-[12.5px] font-medium text-black">
            <Coins className="h-4 w-4 shrink-0" />
            <span>
              با خرید این محصول {toFa(earnedCoins)} {COIN_TITLE} می‌گیرید
              {earnedCoins > 0 ? (
                <>
                  {' '}
                  (معادل <Price value={earnedCoins * COIN_VALUE} /> تخفیف در خرید بعدی)
                </>
              ) : null}
              .
            </span>
          </p>

          <ul className="mt-7 grid gap-3 rounded-panel border border-line bg-cream p-4 text-[12px] text-ink sm:text-[13px]">
            <li className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 shrink-0 text-black" />
              ارسال سریع به سراسر کشور
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-black" />
              پرداخت امن با تمامی کارت‌های بانکی
            </li>
            <li className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 shrink-0 text-black" />
              بازگشت کالا تا ۷ روز
            </li>
            <li className="flex items-center gap-2.5">
              <BadgeCheck className="h-4 w-4 shrink-0 text-black" />
              ضمانت اصالت کالا
            </li>
          </ul>
        </aside>
      </div>

      {/* Information tabs */}
      <section className="mt-12 sm:mt-16">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-line">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-[13px] font-medium transition-colors sm:text-sm ${
                tab === item.id
                  ? 'border-teal-800 text-black'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="py-6 text-[13px] leading-8 text-ink/85 sm:text-sm">
          {tab === 'desc' ? (
            <div className="max-w-3xl space-y-4">
              <p>{product.description}</p>
              <p>
                این کالا در کارگاه‌های داخلی و با کنترل کیفیت مرحله‌ای تولید شده است. رنگ‌بندی واقعی
                کالا ممکن است بسته به تنظیمات نمایشگر، اندکی متفاوت دیده شود.
              </p>
            </div>
          ) : null}

          {tab === 'specs' ? (
            <dl className="grid max-w-3xl gap-x-8 gap-y-0 sm:grid-cols-2">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center justify-between gap-4 border-b border-line py-3.5"
                >
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="font-medium text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {tab === 'shipping' ? (
            <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
              <div className="rounded-panel border border-line p-5">
                <h3 className="mb-2 flex items-center gap-2 text-[13px] font-bold text-ink">
                  <PackageCheck className="h-4 w-4 text-black" />
                  شرایط ارسال
                </h3>
                <p className="text-[13px] leading-7 text-muted">
                  سفارش‌های ثبت‌شده تا ساعت ۱۴ در همان روز کاری ارسال می‌شوند. هزینه ارسال{' '}
                  <Price value={SHIPPING_FEE} /> است و برای سفارش‌های بالای <Price value={FREE_SHIPPING_THRESHOLD} /> رایگان محاسبه می‌شود.
                </p>
              </div>
              <div className="rounded-panel border border-line p-5">
                <h3 className="mb-2 flex items-center gap-2 text-[13px] font-bold text-ink">
                  <Zap className="h-4 w-4 text-black" />
                  بازگشت کالا
                </h3>
                <p className="text-[13px] leading-7 text-muted">
                  تا ۷ روز پس از دریافت، در صورت استفاده‌نشدن و سالم بودن بسته‌بندی، امکان بازگشت یا
                  تعویض کالا وجود دارد.
                </p>
              </div>
            </div>
          ) : null}

          {tab === 'reviews' ? (
            <div className="max-w-4xl rounded-panel border border-line bg-cream p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black text-black">{toFa(product.rating)}</span>
                <div>
                  <Rating value={product.rating} size="md" />
                  <p className="mt-1 text-[12px] text-muted">
                    از {toFa(product.reviewCount)} نظر ثبت‌شده
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-7 text-muted">
                نظرات خریداران و فرم ثبت نظر در بخش «نظرات مشتریان» پایین همین صفحه است.
              </p>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('product-reviews')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
              >
                خواندن و ثبت نظرات
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <ProductReviews product={product} />

      <section className="mt-12 sm:mt-16">
        <h2 className="mb-6 text-xl font-bold text-ink sm:text-2xl">محصولات مرتبط</h2>
        {sameCategory.length > 0 ? (
          <ProductCarousel products={sameCategory} />
        ) : (
          <p className="rounded-panel border border-line bg-cream p-5 text-[13px] text-muted">
            هنوز کالای دیگری در این دسته ثبت نشده است.
          </p>
        )}
      </section>

      {/* Phone chrome: this page's bottom bar replaces the app's tab bar. */}
      <ProductActionBar price={product.price} onAdd={handleAdd} />
    </div>
  );
}
