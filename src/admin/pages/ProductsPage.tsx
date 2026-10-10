import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Plus } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { toFa } from '../../lib/format';
import {
  adminCategories,
  adminDeleteProduct,
  adminProducts,
  adminUpdateStock,
} from '../../services/admin';
import type { ApiAdminCategory, ApiAdminProduct } from '../../lib/api/types';
import { useAdminAuth } from '../AdminAuthContext';
import CrudPanel from '../components/CrudPanel';
import Modal from '../components/Modal';
import StatusPill from '../components/StatusPill';

/** One stock correction, in the modal the list opens. */
function StockModal({
  product,
  onClose,
  onSaved,
}: {
  product: ApiAdminProduct | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // The box starts on the current shelf count, so a correction is a small edit rather than a guess.
  useEffect(() => {
    setQuantity(product ? String(product.stock_quantity ?? 0) : '');
    setNote('');
    setError(undefined);
  }, [product]);

  const save = async () => {
    if (!product) return;

    setBusy(true);
    setError(undefined);

    try {
      const result = await adminUpdateStock(product.id, Number(quantity), note || undefined);
      onSaved(result.message ?? 'موجودی ثبت شد.');
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'ثبت نشد.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={product !== null}
      title={product ? `موجودی «${product.name}»` : 'موجودی'}
      description="موجودی از مسیر انبار ثبت می‌شود، پس هر تغییر در دفتر موجودی هم ثبت می‌ماند."
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-ink transition-colors hover:border-teal-300"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="inline-flex h-11 items-center rounded-xl bg-teal-800 px-5 text-[13px] font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {busy ? 'در حال ثبت…' : 'ثبت موجودی'}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="stock-quantity" className="mb-1.5 block text-[12.5px] font-medium text-cocoa">
            تعداد روی قفسه
          </label>
          <input
            id="stock-quantity"
            type="number"
            min={0}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none focus:border-teal-400"
          />
        </div>
        <div>
          <label htmlFor="stock-note" className="mb-1.5 block text-[12.5px] font-medium text-cocoa">
            یادداشت (اختیاری)
          </label>
          <input
            id="stock-note"
            type="text"
            value={note}
            placeholder="مثلاً: اصلاح شمارش انبار"
            onChange={(event) => setNote(event.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-wine/25 bg-wine/5 px-4 py-2.5 text-[12.5px] text-wine">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}

/**
 * The catalogue list.
 *
 * Editing a product happens on its own page (prices, attributes, photos and stock are too much for
 * a dialog), so this screen owns the list, the stock correction and the link into that page.
 */
export default function ProductsPage() {
  const { can } = useAdminAuth();
  const [stockFor, setStockFor] = useState<ApiAdminProduct | null>(null);
  const [notice, setNotice] = useState<string | undefined>(undefined);
  // The list's reload belongs to the panel, so the stock dialog borrows it: a corrected shelf
  // count has to be visible in the row it was changed from.
  const reloadList = useRef<() => void>(() => {});

  const categories = useAsync(() => adminCategories(), []);
  const categoryOptions = (categories.data ?? []).map((category: ApiAdminCategory) => ({
    value: String(category.id),
    label: category.name,
  }));

  const canUpdate = can('products.update');

  return (
    <>
      <CrudPanel<ApiAdminProduct>
        listTitle="محصولات"
        description="کاتالوگ فروشگاه. قیمت، ویژگی‌ها و عکس‌ها در صفحهٔ خود محصول ویرایش می‌شوند و موجودی از مسیر انبار ثبت می‌شود."
        searchPlaceholder="جست‌وجوی نام، کد کالا…"
        addLabel="محصول جدید"
        itemLabel="محصول"
        headerAction={
          can('products.create') ? (
            <Link
              to="/admin/products/new"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-4 text-[13px] font-medium text-white shadow-soft transition-colors hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              محصول جدید
            </Link>
          ) : null
        }
        columns={[
          {
            key: 'product',
            header: 'محصول',
            render: (row) => (
              <div className="flex items-center gap-3">
                {row.images?.[0]?.url ? (
                  <img
                    src={row.images[0].url}
                    alt=""
                    loading="lazy"
                    className="h-12 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <span className="block h-12 w-10 rounded-lg bg-cream" />
                )}
                <span className="min-w-0">
                  <span className="block max-w-[220px] truncate font-medium">{row.name}</span>
                  <span dir="ltr" className="block text-[11.5px] text-muted">
                    {row.sku ?? '—'}
                  </span>
                </span>
              </div>
            ),
          },
          {
            key: 'category',
            header: 'دسته',
            render: (row) =>
              row.category ? <span>{row.category.name}</span> : <span className="text-muted">—</span>,
          },
          {
            key: 'price',
            header: 'قیمت',
            render: (row) => (
              <span className="text-[13px]">
                {toFa(row.price)}
                {row.discount_percent > 0 ? (
                  <span className="ms-1.5 text-[11.5px] text-wine">
                    {toFa(row.discount_percent)}٪
                  </span>
                ) : null}
              </span>
            ),
          },
          {
            key: 'stock',
            header: 'موجودی',
            render: (row) => (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={row.is_in_stock ? 'text-ink' : 'font-medium text-wine'}
                >
                  {toFa(row.stock_quantity ?? 0)}
                </span>
                {row.is_low_on_stock ? <span className="text-[11px] text-gold">کم</span> : null}
              </span>
            ),
          },
          {
            key: 'flags',
            header: 'وضعیت',
            render: (row) => (
              <span className="flex flex-wrap gap-1.5">
                <StatusPill tone={row.is_active ? 'ok' : 'muted'}>
                  {row.is_active ? 'فعال' : 'غیرفعال'}
                </StatusPill>
                {row.is_featured ? <StatusPill tone="info">ویژه</StatusPill> : null}
                {row.published_at === null ? <StatusPill tone="warn">پیش‌نویس</StatusPill> : null}
              </span>
            ),
          },
        ]}
        fields={[]}
        idOf={(row) => row.id}
        labelOf={(row) => row.name}
        list={adminProducts}
        editHref={(row) => `/admin/products/${row.id}`}
        remove={can('products.delete') ? adminDeleteProduct : undefined}
        rowActions={
          canUpdate
            ? (row, reload) => (
                <button
                  type="button"
                  onClick={() => {
                    reloadList.current = reload;
                    setStockFor(row);
                  }}
                  aria-label="ثبت موجودی"
                  title="ثبت موجودی"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-teal-300 hover:text-teal-700"
                >
                  <Boxes className="h-3.5 w-3.5" />
                </button>
              )
            : undefined
        }
        filters={[
          {
            name: 'status',
            label: 'همهٔ وضعیت‌ها',
            options: [
              { value: 'active', label: 'فعال' },
              { value: 'inactive', label: 'غیرفعال' },
              { value: 'draft', label: 'پیش‌نویس' },
              { value: 'featured', label: 'ویژه' },
              { value: 'out_of_stock', label: 'ناموجود' },
            ],
          },
          { name: 'category', label: 'همهٔ دسته‌ها', options: categoryOptions },
          {
            name: 'sort',
            label: 'تازه‌ترین',
            options: [
              { value: 'newest', label: 'تازه‌ترین' },
              { value: 'oldest', label: 'قدیمی‌ترین' },
              { value: 'name', label: 'نام (الفبا)' },
              { value: 'price_asc', label: 'ارزان‌ترین' },
              { value: 'price_desc', label: 'گران‌ترین' },
            ],
          },
        ]}
        canCreate={false}
        canUpdate={canUpdate}
        canDelete={can('products.delete')}
      />

      {notice ? (
        <p role="status" className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-[12.5px] text-teal-900">
          {notice}
        </p>
      ) : null}

      <StockModal
        product={stockFor}
        onClose={() => setStockFor(null)}
        onSaved={(message) => {
          setNotice(message);
          reloadList.current();
        }}
      />
    </>
  );
}
