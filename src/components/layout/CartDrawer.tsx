import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Trash2, X } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, useStore } from '../../context/StoreContext';
import { formatPrice, toFa } from '../../lib/format';
import EmptyState from '../ui/EmptyState';
import Img from '../ui/Img';
import QuantitySelector from '../ui/QuantitySelector';

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    lines,
    removeFromCart,
    updateQty,
    subtotal,
    discountTotal,
    shipping,
    total,
    cartCount,
  } = useStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeCart]);

  if (!isCartOpen) return null;

  const remaining = FREE_SHIPPING_THRESHOLD - total;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="سبد خرید">
      <button
        type="button"
        aria-label="بستن سبد خرید"
        onClick={closeCart}
        className="absolute inset-0 h-full w-full bg-teal-950/50 backdrop-blur-sm motion-safe:animate-fade-in"
      />

      <aside className="absolute inset-y-0 left-0 flex w-full max-w-[400px] flex-col bg-white shadow-2xl motion-safe:animate-drawer-left">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <ShoppingBag className="h-5 w-5 text-teal-700" />
            سبد خرید
            {cartCount > 0 ? (
              <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-medium text-teal-800">
                {toFa(cartCount)} کالا
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="بستن"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<ShoppingBag className="h-7 w-7" />}
              title="سبد خرید شما خالی است"
              text="محصولات مورد علاقه‌تان را به سبد اضافه کنید تا اینجا نمایش داده شوند."
              action={
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                >
                  مشاهده محصولات
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {lines.map((line) => (
                <article
                  key={`${line.productId}-${line.size}-${line.color}`}
                  className="flex gap-3 rounded-card border border-line bg-white p-3"
                >
                  <Link
                    to={`/product/${line.productId}`}
                    onClick={closeCart}
                    className="h-[88px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-cream"
                  >
                    <Img
                      src={line.product.images[0]}
                      alt={line.product.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${line.productId}`}
                        onClick={closeCart}
                        className="line-clamp-2 text-[13px] font-medium leading-6 text-ink hover:text-teal-700"
                      >
                        {line.product.name}
                      </Link>
                      <button
                        type="button"
                        aria-label="حذف از سبد"
                        onClick={() => removeFromCart(line.productId, line.size, line.color)}
                        className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-sale/10 hover:text-sale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px] text-muted">
                      <span className="rounded-md bg-cream px-2 py-0.5">سایز {line.size}</span>
                      {line.color ? (
                        <span className="rounded-md bg-cream px-2 py-0.5">{line.color}</span>
                      ) : null}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2">
                      <QuantitySelector
                        size="sm"
                        value={line.qty}
                        max={line.product.stock}
                        onChange={(q) => updateQty(line.productId, line.size, line.color, q)}
                      />
                      <span className="text-sm font-bold text-teal-800">
                        {formatPrice(line.lineTotal)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <footer className="border-t border-line bg-cream/60 p-4">
              {remaining > 0 ? (
                <p className="mb-3 rounded-xl bg-white px-3 py-2 text-[12px] leading-6 text-teal-800 ring-1 ring-line">
                  تنها {formatPrice(remaining)} تا ارسال رایگان باقی مانده است.
                </p>
              ) : (
                <p className="mb-3 rounded-xl bg-teal-50 px-3 py-2 text-[12px] font-medium text-teal-800">
                  ارسال این سفارش رایگان است ✓
                </p>
              )}

              <dl className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between text-muted">
                  <dt>جمع کالاها</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                {discountTotal > 0 ? (
                  <div className="flex items-center justify-between text-sale">
                    <dt>تخفیف</dt>
                    <dd>{formatPrice(discountTotal)}−</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-muted">
                  <dt>هزینه ارسال</dt>
                  <dd>{shipping === 0 ? 'رایگان' : formatPrice(shipping)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2.5 text-[15px] font-bold text-ink">
                  <dt>مبلغ قابل پرداخت</dt>
                  <dd>{formatPrice(total + shipping)}</dd>
                </div>
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="flex h-12 items-center justify-center rounded-xl border border-teal-800/20 text-sm font-medium text-teal-800 transition-colors hover:bg-white"
                >
                  مشاهده سبد
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex h-12 items-center justify-center rounded-xl bg-teal-800 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                >
                  تکمیل خرید
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
