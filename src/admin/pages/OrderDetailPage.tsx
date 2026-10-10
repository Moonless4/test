import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard, History, MapPin, StickyNote, User } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { ApiError } from '../../lib/api/client';
import { toFa } from '../../lib/format';
import Price from '../../components/ui/Price';
import { SectionError, SectionLoading } from '../../components/ui/SectionState';
import { adminOrder, adminSetOrderStatus } from '../../services/admin';
import { useAdminAuth } from '../AdminAuthContext';
import AdminPageHeader from '../components/AdminPageHeader';
import StatusPill from '../components/StatusPill';
import { faDate, ORDER_TRANSITIONS, orderLabel, orderTone, paymentLabel, paymentTone } from '../lib/labels';
import { adminHref } from '../lib/basePath';

/**
 * One order, read in full.
 *
 * The only write on this screen is the status, and only the moves the API's own transition table
 * allows are offered. Everything else — the money, the items, the payments — is evidence: it was
 * written by the checkout and by the gateway, and the panel's job is to show it, not to rewrite it.
 */
export default function OrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const { can } = useAdminAuth();

  const state = useAsync(() => adminOrder(orderId), [orderId]);
  const order = state.data;

  const [target, setTarget] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | undefined>(undefined);

  if (state.loading && !order) {
    return <SectionLoading label="در حال دریافت سفارش…" />;
  }

  if (state.error || !order) {
    return state.error ? (
      <SectionError error={state.error} onRetry={state.reload} />
    ) : null;
  }

  const nextStates = ORDER_TRANSITIONS[order.status] ?? [];

  const saveStatus = async () => {
    if (target === '') return;

    setBusy(true);
    setMessage(undefined);

    try {
      const result = await adminSetOrderStatus(order.id, target, note || undefined);
      setMessage({ ok: true, text: result.message ?? 'وضعیت ثبت شد.' });
      setTarget('');
      setNote('');
      state.reload();
    } catch (failure) {
      setMessage({
        ok: false,
        text: failure instanceof ApiError ? failure.message : 'ثبت نشد.',
      });
    } finally {
      setBusy(false);
    }
  };

  const card = 'rounded-card border border-line bg-white p-5 shadow-soft';
  const row = 'flex items-center justify-between gap-3 py-2 text-[13px]';
  const term = 'text-muted';

  return (
    <div>
      <AdminPageHeader
        title={order.number}
        description={`ثبت‌شده در ${faDate(order.placed_at)} — ${order.customer.name}`}
        backTo={{ to: adminHref('orders'), label: 'بازگشت به فهرست سفارش‌ها' }}
        actions={
          <span className="flex flex-wrap items-center gap-2">
            <StatusPill tone={paymentTone(order.payment_status)}>
              {paymentLabel(order.payment_status)}
            </StatusPill>
            <StatusPill tone={orderTone(order.status)}>{orderLabel(order.status)}</StatusPill>
          </span>
        }
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className={card}>
            <h2 className="mb-3 text-base font-bold text-ink">اقلام سفارش</h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-start">
                <thead className="bg-cream/60 text-[12px] text-cocoa">
                  <tr>
                    <th className="px-3 py-2.5 text-start font-medium">کالا</th>
                    <th className="px-3 py-2.5 text-start font-medium">قیمت واحد</th>
                    <th className="px-3 py-2.5 text-start font-medium">تعداد</th>
                    <th className="px-3 py-2.5 text-start font-medium">جمع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {(order.items ?? []).map((item, index) => (
                    <tr key={`${item.sku ?? item.name}-${index}`}>
                      <td className="px-3 py-3 text-[13px]">
                        <span className="block">{item.name}</span>
                        <span className="block text-[11.5px] text-muted">
                          {item.sku ?? '—'}
                          {item.attributes && Object.keys(item.attributes).length > 0
                            ? ` — ${Object.entries(item.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(' · ')}`
                            : ''}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[13px]">
                        <Price value={item.unit_price} />
                      </td>
                      <td className="px-3 py-3 text-[13px]">{toFa(item.quantity)}</td>
                      <td className="px-3 py-3 text-[13px] font-medium">
                        <Price value={item.line_total} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 ms-auto max-w-xs space-y-1 border-t border-line pt-4">
              <div className={row}>
                <span className={term}>جمع کالاها</span>
                <Price value={order.subtotal} />
              </div>
              {order.discount_total > 0 ? (
                <div className={row}>
                  <span className={term}>تخفیف</span>
                  <span className="text-wine">
                    − <Price value={order.discount_total} />
                  </span>
                </div>
              ) : null}
              <div className={row}>
                <span className={term}>هزینهٔ ارسال</span>
                <Price value={order.shipping_total} />
              </div>
              {order.tax_total > 0 ? (
                <div className={row}>
                  <span className={term}>مالیات</span>
                  <Price value={order.tax_total} />
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5 text-[14px] font-bold text-ink">
                <span>مبلغ کل</span>
                <Price value={order.grand_total} />
              </div>
            </div>
          </section>

          <section className={card}>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
              <History className="h-4 w-4" />
              تاریخچهٔ وضعیت
            </h2>

            {(order.history ?? []).length === 0 ? (
              <p className="text-[12.5px] text-muted">هنوز تغییر وضعیتی ثبت نشده است.</p>
            ) : (
              <ul className="divide-y divide-line">
                {(order.history ?? []).map((entry, index) => (
                  <li key={`${entry.to}-${index}`} className="flex flex-wrap items-center gap-2 py-2.5">
                    <span className="text-[12.5px] text-muted">
                      {entry.from ? orderLabel(entry.from) : '—'} ← {orderLabel(entry.to)}
                    </span>
                    {entry.note ? (
                      <span className="text-[12px] text-cocoa">«{entry.note}»</span>
                    ) : null}
                    <span className="ms-auto text-[11.5px] text-muted">{faDate(entry.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5">
          {can('orders.update') ? (
            <section className={card}>
              <h2 className="mb-3 text-base font-bold text-ink">تغییر وضعیت</h2>

              {nextStates.length === 0 ? (
                <p className="text-[12.5px] leading-6 text-muted">
                  این سفارش به وضعیت پایانی رسیده است و مسیر دیگری ندارد.
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="order-status" className="mb-1.5 block text-[12.5px] font-medium text-cocoa">
                      وضعیت تازه
                    </label>
                    <select
                      id="order-status"
                      value={target}
                      onChange={(event) => setTarget(event.target.value)}
                      className="h-11 w-full rounded-xl border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-teal-400"
                    >
                      <option value="">— انتخاب کنید —</option>
                      {nextStates.map((status) => (
                        <option key={status} value={status}>
                          {orderLabel(status)}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-[11.5px] leading-5 text-muted">
                      فقط حرکت‌هایی که از وضعیت فعلی مجاز است نمایش داده می‌شوند؛ لغو و مرجوعی،
                      موجودی کالاها را به انبار برمی‌گرداند.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="order-note" className="mb-1.5 block text-[12.5px] font-medium text-cocoa">
                      یادداشت (اختیاری)
                    </label>
                    <input
                      id="order-note"
                      type="text"
                      value={note}
                      placeholder="مثلاً: درخواست مشتری"
                      onChange={(event) => setNote(event.target.value)}
                      className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none focus:border-teal-400"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={busy || target === ''}
                    onClick={() => void saveStatus()}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-teal-800 text-[13px] font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                  >
                    {busy ? 'در حال ثبت…' : 'ثبت وضعیت'}
                  </button>
                </div>
              )}

              {message ? (
                <p
                  role="status"
                  className={`mt-3 rounded-xl border px-3 py-2 text-[12px] ${
                    message.ok
                      ? 'border-teal-200 bg-teal-50 text-teal-900'
                      : 'border-wine/25 bg-wine/5 text-wine'
                  }`}
                >
                  {message.text}
                </p>
              ) : null}
            </section>
          ) : null}

          <section className={card}>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
              <User className="h-4 w-4" />
              مشتری
            </h2>
            <p className="text-[13px] text-ink">{order.customer.name}</p>
            <p dir="ltr" className="mt-1 text-[12.5px] text-muted">
              {order.customer.email ?? '—'}
            </p>
            <p dir="ltr" className="text-[12.5px] text-muted">
              {order.customer.phone ?? '—'}
            </p>
          </section>

          <section className={card}>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
              <MapPin className="h-4 w-4" />
              نشانی ارسال
            </h2>
            <p className="text-[12.5px] leading-6 text-cocoa">
              {[order.shipping.province, order.shipping.city].filter(Boolean).join('، ') || '—'}
            </p>
            <p className="text-[12.5px] leading-6 text-cocoa">{order.shipping.line1 ?? '—'}</p>
            {order.shipping.line2 ? (
              <p className="text-[12.5px] leading-6 text-cocoa">{order.shipping.line2}</p>
            ) : null}
            <p dir="ltr" className="mt-1 text-[12.5px] text-muted">
              {order.shipping.postal_code ?? '—'}
            </p>
          </section>

          {order.note ? (
            <section className={card}>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
                <StickyNote className="h-4 w-4" />
                یادداشت مشتری
              </h2>
              <p className="text-[12.5px] leading-6 text-cocoa">{order.note}</p>
            </section>
          ) : null}

          <section className={card}>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
              <CreditCard className="h-4 w-4" />
              پرداخت‌ها
            </h2>

            {(order.payments ?? []).length === 0 ? (
              <p className="text-[12.5px] text-muted">تراکنشی ثبت نشده است.</p>
            ) : (
              <ul className="space-y-3">
                {(order.payments ?? []).map((payment) => (
                  <li key={payment.id} className="rounded-xl border border-line p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span dir="ltr" className="text-[12.5px] font-medium text-ink">
                        {payment.gateway}
                      </span>
                      <StatusPill tone={paymentTone(payment.status)}>
                        {paymentLabel(payment.status)}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-[12.5px] text-ink">
                      <Price value={payment.amount} />
                    </p>
                    {payment.reference_id ? (
                      <p dir="ltr" className="mt-1 text-[11.5px] text-muted">
                        {payment.reference_id}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11.5px] text-muted">{faDate(payment.paid_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
