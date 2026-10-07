import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, useStore } from '../context/StoreContext';
import { formatPrice, toFa } from '../lib/format';
import EmptyState from '../components/ui/EmptyState';
import Img from '../components/ui/Img';
import QuantitySelector from '../components/ui/QuantitySelector';

export default function CartPage() {
  const { lines, removeFromCart, updateQty, subtotal, discountTotal, shipping, total, clearCart } =
    useStore();

  if (lines.length === 0) {
    return (
      <div className="container py-10 sm:py-16">
        <h1 className="mb-6 text-xl font-bold text-ink sm:text-2xl">سبد خرید</h1>
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title="سبد خرید شما خالی است"
          text="همه‌ی کالاهای انتخابی‌ات را یک‌جا ببین و سفارش را نهایی کن."
          action={
            <Link
              to="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              مشاهده محصولات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  const remaining = FREE_SHIPPING_THRESHOLD - total;

  return (
    <div className="container py-8 sm:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <span>/</span>
        <span className="font-medium text-ink">سبد خرید</span>
      </nav>

      <header className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink sm:text-2xl">
          سبد خرید
          <span className="ms-2 text-sm font-medium text-muted">
            ({toFa(lines.length)} کالا)
          </span>
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-[12px] font-medium text-sale transition-colors hover:text-sale/80"
        >
          خالی کردن سبد
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="space-y-3.5">
          {lines.map((line) => (
            <article
              key={`${line.productId}-${line.size}-${line.color}`}
              className="flex flex-col gap-4 rounded-panel border border-line bg-white p-4 shadow-soft sm:flex-row sm:items-center"
            >
              <Link
                to={`/product/${line.productId}`}
                className="h-[120px] w-[96px] shrink-0 overflow-hidden rounded-2xl bg-cream"
              >
                <Img
                  src={line.product.images[0]}
                  alt={line.product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Link
                  to={`/product/${line.productId}`}
                  className="text-[14px] font-bold text-ink transition-colors hover:text-black"
                >
                  {line.product.name}
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
                  <span className="rounded-md bg-cream px-2 py-0.5">سایز {toFa(line.size)}</span>
                  {line.color ? (
                    <span className="rounded-md bg-cream px-2 py-0.5">{line.color}</span>
                  ) : null}
                  <span dir="ltr" className="text-[11px] uppercase tracking-wide text-black">
                    {line.product.brand}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <QuantitySelector
                  size="sm"
                  value={line.qty}
                  max={line.product.stock}
                  onChange={(q) => updateQty(line.productId, line.size, line.color, q)}
                />
                <div className="text-end">
                  <p className="text-[15px] font-bold text-black">{formatPrice(line.lineTotal)}</p>
                  {line.product.discount > 0 ? (
                    <p className="text-[11px] text-muted">
                      {toFa(line.product.discount)}٪ تخفیف اعمال شده
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(line.productId, line.size, line.color)}
                  aria-label="حذف کالا"
                  className="flex items-center gap-1.5 rounded-lg p-1.5 text-[12px] text-muted transition-colors hover:bg-sale/10 hover:text-sale sm:order-first"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </div>
            </article>
          ))}

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 pt-2 text-[13px] font-medium text-black transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            ادامه خرید
          </Link>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-panel border border-line bg-cream p-5 sm:p-6">
            <h2 className="mb-5 text-base font-bold text-ink">خلاصه سفارش</h2>

            <dl className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between text-muted">
                <dt>جمع کالاها</dt>
                <dd className="text-ink">{formatPrice(subtotal)}</dd>
              </div>
              {discountTotal > 0 ? (
                <div className="flex items-center justify-between text-sale">
                  <dt>تخفیف</dt>
                  <dd>{formatPrice(discountTotal)}−</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-muted">
                <dt>هزینه ارسال</dt>
                <dd className="text-ink">{shipping === 0 ? 'رایگان' : formatPrice(shipping)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3.5 text-[15px] font-bold text-ink">
                <dt>مبلغ قابل پرداخت</dt>
                <dd>{formatPrice(total + shipping)}</dd>
              </div>
            </dl>

            {remaining > 0 ? (
              <p className="mt-5 rounded-xl bg-white px-3.5 py-2.5 text-[12px] leading-6 text-black ring-1 ring-line">
                تنها {formatPrice(remaining)} تا ارسال رایگان باقی مانده است.
              </p>
            ) : (
              <p className="mt-5 rounded-xl bg-teal-50 px-3.5 py-2.5 text-[12px] font-medium text-black">
                ارسال این سفارش رایگان است ✓
              </p>
            )}

            <Link
              to="/checkout"
              className="mt-5 flex h-12 items-center justify-center rounded-xl bg-teal-800 text-sm font-bold text-white transition-colors hover:bg-teal-700"
            >
              ادامه فرآیند خرید
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
