import { Link } from 'react-router-dom';
import { toFa } from '../../lib/format';
import Price from '../../components/ui/Price';
import { adminOrders } from '../../services/admin';
import type { ApiAdminOrder } from '../../lib/api/types';
import { useAdminAuth } from '../AdminAuthContext';
import CrudPanel from '../components/CrudPanel';
import StatusPill from '../components/StatusPill';
import { faDate, ORDER_STATUS, orderLabel, orderTone, paymentLabel, paymentTone } from '../lib/labels';
import { adminHref } from '../lib/basePath';

/**
 * Orders.
 *
 * Nothing is edited from the list: the money on an order was computed by the checkout and the only
 * writable field is the status, which needs the order's own history on screen to be changed
 * sensibly. So the list is a way in, and the detail page is where a move is made.
 */
export default function OrdersPage() {
  const { can } = useAdminAuth();

  return (
    <CrudPanel<ApiAdminOrder>
      listTitle="سفارش‌ها"
      description="سفارش‌های ثبت‌شده در فروشگاه. برای تغییر وضعیت یا دیدن اقلام، روی هر سفارش کلیک کنید."
      searchPlaceholder="شمارهٔ سفارش، نام، ایمیل یا تلفن…"
      addLabel="سفارش جدید"
      itemLabel="سفارش"
      columns={[
        {
          key: 'number',
          header: 'شماره',
          render: (row) => (
            <Link
              to={adminHref(`orders/${row.id}`)}
              dir="ltr"
              className="font-medium text-teal-800 hover:underline"
            >
              {row.number}
            </Link>
          ),
        },
        {
          key: 'customer',
          header: 'مشتری',
          render: (row) => (
            <span className="block">
              <span className="block">{row.customer.name}</span>
              <span dir="ltr" className="block text-[11.5px] text-muted">
                {row.customer.phone ?? row.customer.email ?? '—'}
              </span>
            </span>
          ),
        },
        {
          key: 'items',
          header: 'اقلام',
          render: (row) => <span>{toFa(row.items_count)}</span>,
        },
        {
          key: 'total',
          header: 'مبلغ',
          render: (row) => <Price value={row.grand_total} />,
        },
        {
          key: 'payment',
          header: 'پرداخت',
          render: (row) => (
            <StatusPill tone={paymentTone(row.payment_status)}>
              {paymentLabel(row.payment_status)}
            </StatusPill>
          ),
        },
        {
          key: 'status',
          header: 'وضعیت',
          render: (row) => (
            <StatusPill tone={orderTone(row.status)}>{orderLabel(row.status)}</StatusPill>
          ),
        },
        {
          key: 'placed_at',
          header: 'تاریخ',
          render: (row) => (
            <span className="text-[12.5px] text-muted">{faDate(row.placed_at)}</span>
          ),
        },
      ]}
      fields={[]}
      idOf={(row) => row.id}
      labelOf={(row) => row.number}
      list={adminOrders}
      editHref={(row) => adminHref(`orders/${row.id}`)}
      filters={[
        {
          name: 'status',
          label: 'همهٔ وضعیت‌ها',
          options: Object.entries(ORDER_STATUS).map(([value, meta]) => ({
            value,
            label: meta.label,
          })),
        },
      ]}
      canCreate={false}
      canUpdate={can('orders.view')}
      canDelete={false}
    />
  );
}
