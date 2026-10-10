import { useAdminAuth } from '../AdminAuthContext';
import CrudPanel from '../components/CrudPanel';
import StatusPill from '../components/StatusPill';
import type { FieldSpec, FormValues } from '../components/Field';
import { COUPON_TYPE, faDate, toDateTimeInput } from '../lib/labels';
import { toFa } from '../../lib/format';
import Price from '../../components/ui/Price';
import {
  adminCoupons,
  adminCreateCoupon,
  adminDeleteCoupon,
  adminUpdateCoupon,
} from '../../services/admin';
import type { ApiAdminCoupon } from '../../lib/api/types';

/**
 * Discount codes.
 *
 * `value` means percent or Toman depending on `type`, exactly as the column does, so the panel
 * never invents a second reading of the number. A code that has been redeemed is refused by the
 * API instead of deleted, which is why the screen also offers deactivation.
 */
export default function CouponsPage() {
  const { can } = useAdminAuth();

  const fields: FieldSpec[] = [
    {
      name: 'code',
      label: 'کد',
      required: true,
      placeholder: 'WINTER20',
      hint: 'حروف بزرگ انگلیسی، عدد، خط تیره یا زیرخط.',
    },
    {
      name: 'type',
      label: 'نوع تخفیف',
      type: 'select',
      required: true,
      defaultValue: 'percent',
      options: [
        { value: 'percent', label: 'درصدی' },
        { value: 'fixed', label: 'مبلغ ثابت (تومان)' },
      ],
    },
    {
      name: 'value',
      label: 'مقدار',
      type: 'number',
      min: 1,
      required: true,
      hint: 'درصدی: بین ۱ تا ۹۰. مبلغ ثابت: به تومان.',
    },
    {
      name: 'max_discount',
      label: 'سقف تخفیف (تومان)',
      type: 'number',
      min: 0,
      nullable: true,
      hint: 'برای کد درصدی الزامی است؛ سقف مبلغی که تخفیف می‌تواند بدهد.',
    },
    {
      name: 'min_subtotal',
      label: 'حداقل مبلغ سبد (تومان)',
      type: 'number',
      min: 0,
      hint: 'کاربر باید این مبلغ را در سبد داشته باشد.',
    },
    { name: 'usage_limit', label: 'سقف کل استفاده', type: 'number', min: 1, nullable: true },
    {
      name: 'usage_limit_per_user',
      label: 'سقف استفادهٔ هر کاربر',
      type: 'number',
      min: 1,
      nullable: true,
    },
    { name: 'starts_at', label: 'شروع اعتبار', type: 'datetime' },
    { name: 'ends_at', label: 'پایان اعتبار', type: 'datetime' },
    { name: 'is_active', label: 'فعال باشد', type: 'checkbox', defaultValue: true },
  ];

  const toForm = (row: ApiAdminCoupon): FormValues => ({
    code: row.code,
    type: row.type,
    value: row.value,
    max_discount: row.max_discount ?? '',
    min_subtotal: row.min_subtotal ?? '',
    usage_limit: row.usage_limit ?? '',
    usage_limit_per_user: row.usage_limit_per_user ?? '',
    starts_at: toDateTimeInput(row.starts_at),
    ends_at: toDateTimeInput(row.ends_at),
    is_active: row.is_active,
  });

  return (
    <CrudPanel<ApiAdminCoupon>
      listTitle="کدهای تخفیف"
      description="کدهایی که در سبد خرید پذیرفته می‌شوند. کدی که استفاده شده باشد حذف نمی‌شود — غیرفعالش کنید تا تاریخچهٔ استفاده باقی بماند."
      searchPlaceholder="جست‌وجوی کد…"
      addLabel="کد جدید"
      itemLabel="کد"
      columns={[
        {
          key: 'code',
          header: 'کد',
          render: (row) => <span className="font-medium" dir="ltr">{row.code}</span>,
        },
        {
          key: 'value',
          header: 'تخفیف',
          render: (row) => (
            <span>
              {row.type === 'percent' ? `${toFa(row.value)}٪` : <Price value={row.value} />}
              <span className="ms-1.5 text-[11.5px] text-muted">{COUPON_TYPE[row.type]}</span>
            </span>
          ),
        },
        {
          key: 'max_discount',
          header: 'سقف',
          render: (row) =>
            row.max_discount === null ? (
              <span className="text-muted">—</span>
            ) : (
              <Price value={row.max_discount} />
            ),
        },
        {
          key: 'min_subtotal',
          header: 'حداقل سبد',
          render: (row) =>
            row.min_subtotal === null ? (
              <span className="text-muted">—</span>
            ) : (
              <Price value={row.min_subtotal} />
            ),
        },
        {
          key: 'used',
          header: 'استفاده',
          render: (row) => (
            <span>
              {toFa(row.used_count)}
              {row.usage_limit === null ? '' : ` / ${toFa(row.usage_limit)}`}
            </span>
          ),
        },
        {
          key: 'window',
          header: 'اعتبار',
          render: (row) => (
            <span className="text-[12px] text-muted">
              {faDate(row.starts_at)} — {faDate(row.ends_at)}
            </span>
          ),
        },
        {
          key: 'status',
          header: 'وضعیت',
          render: (row) => (
            <StatusPill tone={row.is_active ? 'ok' : 'muted'}>
              {row.is_active ? 'فعال' : 'غیرفعال'}
            </StatusPill>
          ),
        },
      ]}
      fields={fields}
      toForm={toForm}
      idOf={(row) => row.id}
      labelOf={(row) => row.code}
      list={adminCoupons}
      create={adminCreateCoupon}
      update={adminUpdateCoupon}
      remove={adminDeleteCoupon}
      filters={[
        {
          name: 'status',
          label: 'همهٔ وضعیت‌ها',
          options: [
            { value: 'active', label: 'فعال' },
            { value: 'inactive', label: 'غیرفعال' },
          ],
        },
      ]}
      canCreate={can('coupons.manage')}
      canUpdate={can('coupons.manage')}
      canDelete={can('coupons.manage')}
    />
  );
}
