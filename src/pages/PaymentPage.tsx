import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import {
  STATUS_LABEL,
  activeGateway,
  readPayment,
  savePayment,
  type VerifyInput,
} from '../lib/payment';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { toFa } from '../lib/format';
import Price from '../components/ui/Price';
import EmptyState from '../components/ui/EmptyState';

const backLinkClass =
  'inline-flex h-11 items-center rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700';

/**
 * The stand-in bank page `sandboxGateway` hands the shopper off to. A real PSP would
 * host this screen itself and call us back on the order's return URL; the buttons here
 * stand in for the card form, and `verify` is where a real gateway would ask the server.
 */
export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateOrderStatus } = useAuth();
  const { settleOrder, clearCart } = useStore();
  const [busy, setBusy] = useState(false);
  const order = useMemo(() => readPayment(id ?? ''), [id]);

  if (!order) {
    return (
      <div className="container py-12 sm:py-16">
        <EmptyState
          icon={<CreditCard className="h-7 w-7" />}
          title="این تراکنش پیدا نشد"
          text="ممکن است لینک پرداخت ناتمام مانده باشد. برای پیگیری به سبد خرید برگردید."
          action={
            <Link to="/cart" className={backLinkClass}>
              بازگشت به سبد خرید
            </Link>
          }
        />
      </div>
    );
  }

  const finish = (outcome: VerifyInput['outcome']) => {
    if (busy || order.status !== 'pending') return;
    setBusy(true);

    const result = activeGateway.verify(order, { outcome });
    // Coins and the discount code are settled only once the money is really in, and the
    // basket is left untouched whenever the shopper walks away from the gateway.
    const coinsEarned = result.ok ? settleOrder(order.amount) : 0;

    savePayment({
      ...order,
      status: result.status,
      refId: result.refId,
      paidAt: result.ok ? new Date().toISOString() : undefined,
      coinsEarned,
    });
    updateOrderStatus(order.id, STATUS_LABEL[result.status]);
    if (result.ok) clearCart();

    navigate(`/checkout?payment=${result.status}&order=${order.id}`);
  };

  if (order.status !== 'pending') {
    return (
      <div className="container py-12 sm:py-16">
        <div className="mx-auto max-w-lg rounded-panel border border-line bg-cream p-6 text-center sm:p-8">
          <h1 className="text-lg font-black text-ink">این تراکنش قبلاً پردازش شده است</h1>
          <p className="mt-3 text-[13px] leading-7 text-muted">
            وضعیت سفارش{' '}
            <span dir="ltr" className="font-bold text-black">
              {toFa(order.id)}
            </span>{' '}
            در حال حاضر «{STATUS_LABEL[order.status]}» است.
          </p>
          <Link
            to={`/checkout?payment=${order.status}&order=${order.id}`}
            className={`${backLinkClass} mt-6`}
          >
            مشاهده‌ی نتیجه‌ی سفارش
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 sm:py-14">
      <div className="mx-auto max-w-lg">
        <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
          <Link to="/cart" className="transition-colors hover:text-black">
            سبد خرید
          </Link>
          <span>/</span>
          <Link to="/checkout" className="transition-colors hover:text-black">
            تکمیل خرید
          </Link>
          <span>/</span>
          <span className="font-medium text-ink">پرداخت</span>
        </nav>

        <div className="overflow-hidden rounded-panel border border-line bg-white shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-cream px-5 py-4 sm:px-6">
            <span className="flex items-center gap-2 text-[13px] font-bold text-ink">
              <CreditCard className="h-4 w-4" />
              پرداخت اینترنتی
            </span>
            <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-muted">
              {activeGateway.title}
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <dl className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">پذیرنده</dt>
                <dd className="font-medium text-ink">فروشگاه مدورا</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">شماره سفارش</dt>
                <dd className="font-medium text-ink">{toFa(order.id)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">روش پرداخت</dt>
                <dd className="font-medium text-ink">{order.methodTitle}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                <dt className="text-muted">مبلغ قابل پرداخت</dt>
                <dd className="text-[15px] font-bold text-ink">
                  <Price value={order.amount} />
                </dd>
              </div>
            </dl>

            <p className="mt-5 flex gap-2 rounded-panel bg-cream p-3.5 text-[12px] leading-6 text-muted">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-black" />
              این صفحه جایگزین صفحه‌ی بانک است و در حالت آزمایشی هیچ مبلغی از حساب شما کسر نمی‌شود.
              برای پرداخت واقعی، کلید درگاه باید روی سرور فروشگاه تنظیم شود.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => finish('success')}
                disabled={busy}
                className="h-12 w-full rounded-xl bg-teal-800 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
              >
                پرداخت مبلغ
              </button>
              <button
                type="button"
                onClick={() => finish('canceled')}
                disabled={busy}
                className="h-12 w-full rounded-xl border border-line text-sm font-medium text-ink transition-colors hover:border-teal-300 disabled:opacity-60"
              >
                انصراف از پرداخت
              </button>
              <button
                type="button"
                onClick={() => finish('failed')}
                disabled={busy}
                className="w-full pt-1 text-center text-[12px] text-muted transition-colors hover:text-black disabled:opacity-60"
              >
                شبیه‌سازی پرداخت ناموفق
              </button>
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 border-t border-line bg-cream px-5 py-3 text-[11px] text-muted">
            <ShieldCheck className="h-3.5 w-3.5" />
            شماره سفارش و مبلغ پرداختی در فروشگاه ثبت می‌شود
          </p>
        </div>
      </div>
    </div>
  );
}
