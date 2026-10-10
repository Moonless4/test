import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  BadgePercent,
  Images,
  Package,
  ReceiptText,
} from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { adminCoupons, adminMedia, adminOrders, adminProducts } from '../../services/admin';
import { useAdminAuth } from '../AdminAuthContext';
import { toFa } from '../../lib/format';
import Price from '../../components/ui/Price';
import { SectionError, SectionLoading } from '../../components/ui/SectionState';
import StatusPill from '../components/StatusPill';
import { faDate, orderLabel, orderTone } from '../lib/labels';
import { adminHref } from '../lib/basePath';

/**
 * The landing screen: how much of the shop there is, and what needs attention today.
 *
 * Every number is a list endpoint's own `meta.total`, asked for one row at a time — the panel adds
 * no counting endpoint of its own, so a figure here can never disagree with the list it links to.
 */
export default function DashboardPage() {
  const { can, user } = useAdminAuth();

  /** A read the account is not allowed to make simply resolves to nothing. */
  const skip = () => Promise.resolve(undefined);

  const products = useAsync(
    () => (can('products.view') ? adminProducts({ per_page: 1 }) : skip()),
    [],
  );
  const orders = useAsync(() => (can('orders.view') ? adminOrders({ per_page: 1 }) : skip()), []);
  const coupons = useAsync(
    () => (can('coupons.manage') ? adminCoupons({ per_page: 1 }) : skip()),
    [],
  );
  const media = useAsync(() => (can('media.manage') ? adminMedia({ per_page: 1 }) : skip()), []);

  const recent = useAsync(
    () => (can('orders.view') ? adminOrders({ per_page: 6 }) : skip()),
    [],
  );
  const lowStock = useAsync(
    () => (can('products.view') ? adminProducts({ status: 'out_of_stock', per_page: 5 }) : skip()),
    [],
  );

  const cards = [
    {
      key: 'products',
      label: 'محصولات',
      icon: Package,
      to: adminHref('products'),
      total: products.data?.total,
      loading: products.loading,
      ready: can('products.view'),
    },
    {
      key: 'orders',
      label: 'سفارش‌ها',
      icon: ReceiptText,
      to: adminHref('orders'),
      total: orders.data?.total,
      loading: orders.loading,
      ready: can('orders.view'),
    },
    {
      key: 'coupons',
      label: 'کدهای تخفیف',
      icon: BadgePercent,
      to: adminHref('coupons'),
      total: coupons.data?.total,
      loading: coupons.loading,
      ready: can('coupons.manage'),
    },
    {
      key: 'media',
      label: 'فایل‌های رسانه',
      icon: Images,
      to: adminHref('media'),
      total: media.data?.total,
      loading: media.loading,
      ready: can('media.manage'),
    },
  ].filter((card) => card.ready);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink sm:text-2xl">
          سلام {user?.name ?? ''}
        </h1>
        <p className="mt-1.5 text-[13px] leading-6 text-muted">
          نمای کلی فروشگاه مدورا. هر عدد از همان فهرستی می‌آید که با کلیک روی آن باز می‌شود.
        </p>
      </div>

      {cards.length > 0 ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.key}
              to={card.to}
              className="group rounded-card border border-line bg-white p-4 shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                  <card.icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-3 text-[12.5px] text-muted">{card.label}</p>
              <p className="mt-1 text-xl font-bold text-ink">
                {card.loading && card.total === undefined ? '…' : toFa(card.total ?? 0)}
              </p>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-3">
        {can('orders.view') ? (
          <section className="xl:col-span-2">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-base font-bold text-ink">آخرین سفارش‌ها</h2>
              <Link to={adminHref('orders')} className="text-[12.5px] text-teal-700 hover:underline">
                همهٔ سفارش‌ها
              </Link>
            </div>

            {recent.loading && !recent.data ? (
              <SectionLoading label="در حال دریافت سفارش‌ها…" />
            ) : recent.error ? (
              <SectionError error={recent.error} onRetry={recent.reload} />
            ) : (recent.data?.items ?? []).length === 0 ? (
              <p className="rounded-card border border-dashed border-line bg-white px-4 py-8 text-center text-[13px] text-muted">
                هنوز سفارشی ثبت نشده است.
              </p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white shadow-soft">
                {(recent.data?.items ?? []).map((order) => (
                  <li key={order.id}>
                    <Link
                      to={adminHref(`orders/${order.id}`)}
                      className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-cream/50"
                    >
                      <span className="font-medium text-ink" dir="ltr">
                        {order.number}
                      </span>
                      <span className="text-[12.5px] text-muted">{order.customer.name}</span>
                      <span className="ms-auto flex items-center gap-3">
                        <span className="text-[12.5px] text-ink">
                          <Price value={order.grand_total} />
                        </span>
                        <StatusPill tone={orderTone(order.status)}>
                          {orderLabel(order.status)}
                        </StatusPill>
                        <span className="hidden text-[11.5px] text-muted sm:block">
                          {faDate(order.placed_at)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {can('products.view') ? (
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-base font-bold text-ink">ناموجودها</h2>
              <Link to={adminHref('products')} className="text-[12.5px] text-teal-700 hover:underline">
                محصولات
              </Link>
            </div>

            {lowStock.loading && !lowStock.data ? (
              <SectionLoading label="در حال دریافت…" />
            ) : lowStock.error ? (
              <SectionError error={lowStock.error} onRetry={lowStock.reload} />
            ) : (lowStock.data?.items ?? []).length === 0 ? (
              <p className="flex items-center gap-2 rounded-card border border-dashed border-line bg-white px-4 py-6 text-[12.5px] text-muted">
                همهٔ محصولات موجودند.
              </p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white shadow-soft">
                {(lowStock.data?.items ?? []).map((product) => (
                  <li key={product.id}>
                    <Link
                      to={adminHref(`products/${product.id}`)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-cream/50"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                        {product.name}
                      </span>
                      <span className="text-[12px] text-muted">
                        {toFa(product.stock_quantity ?? 0)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
