import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, Loader2, Trash2, Boxes } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { ApiError } from '../../lib/api/client';
import { toFa } from '../../lib/format';
import {
  adminAttachProductImage,
  adminCategories,
  adminCreateProduct,
  adminProduct,
  adminRemoveProductImage,
  adminUpdateProduct,
  adminUpdateStock,
  adminUploadProductImage,
  adminMedia,
} from '../../services/admin';
import { useAdminAuth } from '../AdminAuthContext';
import AdminPageHeader from '../components/AdminPageHeader';
import {
  AdminField,
  buildPayload,
  initialValues,
  type FieldErrors,
  type FieldSpec,
  type FormValues,
} from '../components/Field';
import { SectionError, SectionLoading } from '../../components/ui/SectionState';
import StatusPill from '../components/StatusPill';
import { toDateTimeInput } from '../lib/labels';
import { adminHref } from '../lib/basePath';

/** The columns a product payload can carry. */
const FIELDS: FieldSpec[] = [
  { name: 'name', label: 'نام محصول', required: true, full: true },
  {
    name: 'sku',
    label: 'کد کالا (SKU)',
    required: true,
    placeholder: 'MED-COAT-01',
    hint: 'یکتا؛ در سفارش‌ها و دفتر انبار همین کد ثبت می‌شود.',
  },
  {
    name: 'slug',
    label: 'نشانی محصول (slug)',
    placeholder: 'beauty-perfume',
    hint: 'خالی بگذارید تا خودکار ساخته شود.',
  },
  { name: 'brand', label: 'برند', nullable: true },
  {
    name: 'price',
    label: 'قیمت فروش (تومان)',
    type: 'number',
    min: 0,
    required: true,
  },
  {
    name: 'compare_at_price',
    label: 'قیمت پیش از تخفیف (تومان)',
    type: 'number',
    min: 1,
    nullable: true,
    hint: 'باید بیشتر از قیمت فروش باشد؛ نشان تخفیف از همین دو عدد ساخته می‌شود.',
  },
  {
    name: 'rating',
    label: 'امتیاز (۰ تا ۵)',
    type: 'number',
    min: 0,
    max: 5,
    nullable: true,
    hint: 'خالی یعنی هنوز امتیازی ثبت نشده و سایت «بدون امتیاز» نشان می‌دهد.',
  },
  {
    name: 'low_stock_threshold',
    label: 'آستانهٔ هشدار موجودی',
    type: 'number',
    min: 0,
    defaultValue: 0,
    hint: 'وقتی موجودی به این عدد برسد، در فهرست محصولات هشدار می‌گیرد.',
  },
  { name: 'category_id', label: 'دسته', type: 'select', nullable: true },
  {
    name: 'published_at',
    label: 'تاریخ انتشار',
    type: 'datetime',
    hint: 'خالی یعنی محصول پیش‌نویس است و در فروشگاه دیده نمی‌شود.',
  },
  { name: 'is_active', label: 'فعال (نمایش در فروشگاه)', type: 'checkbox', defaultValue: true },
  { name: 'is_featured', label: 'محصول ویژه', type: 'checkbox', defaultValue: false },
  {
    name: 'short_description',
    label: 'توضیح کوتاه',
    type: 'textarea',
    rows: 2,
    full: true,
    nullable: true,
  },
  {
    name: 'description',
    label: 'توضیح کامل',
    type: 'textarea',
    rows: 8,
    full: true,
    nullable: true,
    hint: 'متن ساده؛ HTML ذخیره نمی‌شود.',
  },
];

/**
 * The two attribute lists that carry a product through the filter rail. They travel nested inside
 * `attributes`, so they are collected apart from the flat payload and folded in at submit.
 */
const ATTRIBUTE_FIELDS: FieldSpec[] = [
  { name: 'attr_size', label: 'اندازه‌ها', type: 'tags', hint: 'مثل S, M, L — با کاما جدا کنید.' },
  { name: 'attr_color', label: 'رنگ‌ها', type: 'tags', hint: 'مثل مشکی, سرمه‌ای — با کاما جدا کنید.' },
];

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-white p-5 shadow-soft">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {description ? <p className="mt-1.5 text-[12.5px] leading-6 text-muted">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * One product, in full.
 *
 * A dialog is the wrong shape for this: a product carries a price pair the API validates against
 * each other, a category, an attribute set the filter rail is built from, a photo list and a stock
 * ledger. Photos and stock are written through their own endpoints (each with its own audit row),
 * so this page saves the product's own columns and nothing else.
 */
export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAdminAuth();

  const productId = id && id !== 'new' ? Number(id) : undefined;
  const isEditing = productId !== undefined && Number.isFinite(productId);

  const state = useAsync(
    () => (isEditing ? adminProduct(productId) : Promise.resolve(undefined)),
    [productId],
  );
  const product = state.data;

  const categories = useAsync(() => adminCategories(), []);
  const categoryOptions = (categories.data ?? []).map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  const [values, setValues] = useState<FormValues>(initialValues([...FIELDS, ...ATTRIBUTE_FIELDS]));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | undefined>(undefined);

  // The form is filled once per product. A reload after a photo or a stock change must not throw
  // away what the operator has typed since.
  const filledFor = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!product || filledFor.current === product.id) return;

    filledFor.current = product.id;

    setValues({
      name: product.name,
      sku: product.sku ?? '',
      slug: product.slug,
      brand: product.brand ?? '',
      price: product.price,
      compare_at_price: product.compare_at_price ?? '',
      rating: product.rating ?? '',
      low_stock_threshold: product.low_stock_threshold ?? 0,
      category_id: product.category_id === null ? '' : String(product.category_id),
      published_at: toDateTimeInput(product.published_at),
      is_active: product.is_active,
      is_featured: product.is_featured,
      short_description: product.short_description ?? '',
      description: product.description ?? '',
      attr_size: product.attributes?.size ?? [],
      attr_color: product.attributes?.color ?? [],
    });
  }, [product]);

  const fields: FieldSpec[] = FIELDS.map((field) =>
    field.name === 'category_id' ? { ...field, options: categoryOptions } : field,
  );

  const handleFailure = (failure: unknown) => {
    if (failure instanceof ApiError && Object.keys(failure.errors).length > 0) {
      setErrors(
        Object.fromEntries(
          Object.entries(failure.errors).map(([key, messages]) => [
            key.startsWith('attributes') ? `attr_${key.split('.').pop()}` : key,
            messages[0],
          ]),
        ),
      );
      setNotice({ ok: false, text: 'برخی فیلدها درست نیستند.' });
      return;
    }

    setNotice({
      ok: false,
      text: failure instanceof ApiError ? failure.message : 'ذخیره نشد؛ دوباره تلاش کنید.',
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});

    const payload = buildPayload(fields, values);

    // The two lists travel nested; every other attribute key the catalogue carries is preserved.
    delete payload.attr_size;
    delete payload.attr_color;

    const attributes: Record<string, string[]> = { ...(product?.attributes ?? {}) };
    delete attributes.size;
    delete attributes.color;

    const sizes = Array.isArray(values.attr_size) ? values.attr_size : [];
    const colors = Array.isArray(values.attr_color) ? values.attr_color : [];

    if (sizes.length > 0) attributes.size = sizes;
    if (colors.length > 0) attributes.color = colors;

    payload.attributes = attributes;

    try {
      if (isEditing) {
        const result = await adminUpdateProduct(productId, payload);
        setNotice({ ok: true, text: result.message ?? 'محصول ذخیره شد.' });
        state.reload();
      } else {
        const result = await adminCreateProduct(payload);
        const created = result.data?.product;

        if (created) {
          navigate(adminHref(`products/${created.id}`), { replace: true });
          return;
        }

        setNotice({ ok: true, text: result.message ?? 'محصول ایجاد شد.' });
      }
    } catch (failure) {
      handleFailure(failure);
    } finally {
      setBusy(false);
    }
  };

  if (isEditing && state.loading && !product) {
    return <SectionLoading label="در حال دریافت محصول…" />;
  }

  if (isEditing && state.error) {
    return <SectionError error={state.error} onRetry={state.reload} />;
  }

  return (
    <div>
      <AdminPageHeader
        title={isEditing ? (product?.name ?? 'ویرایش محصول') : 'محصول جدید'}
        description="قیمت‌ها به تومان و از سمت سرور اعتبارسنجی می‌شوند؛ تخفیف از اختلاف دو قیمت ساخته می‌شود."
        backTo={{ to: adminHref('products'), label: 'بازگشت به فهرست محصولات' }}
      />

      {notice ? (
        <p
          role="status"
          className={`mb-4 rounded-xl border px-4 py-2.5 text-[12.5px] ${
            notice.ok
              ? 'border-teal-200 bg-teal-50 text-teal-900'
              : 'border-wine/25 bg-wine/5 text-wine'
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-3">
        <form onSubmit={(event) => void submit(event)} className="xl:col-span-2">
          <Panel title="مشخصات محصول">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <AdminField
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  error={errors[field.name]}
                  onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
                />
              ))}
            </div>
          </Panel>

          <div className="mt-5">
            <Panel
              title="ویژگی‌ها"
              description="اندازه‌ها و رنگ‌ها همان چیزی هستند که ریل فیلتر فروشگاه از آن ساخته می‌شود."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {ATTRIBUTE_FIELDS.map((field) => (
                  <AdminField
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    error={errors[field.name]}
                    onChange={(value) =>
                      setValues((current) => ({ ...current, [field.name]: value }))
                    }
                  />
                ))}
              </div>
            </Panel>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-teal-800 px-6 text-[13.5px] font-medium text-white shadow-soft transition-colors hover:bg-teal-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy ? 'در حال ذخیره…' : isEditing ? 'ذخیرهٔ تغییرات' : 'ایجاد محصول'}
            </button>
            <button
              type="button"
              onClick={() => navigate(adminHref('products'))}
              className="inline-flex h-12 items-center rounded-xl border border-line bg-white px-5 text-[13.5px] font-medium text-ink transition-colors hover:border-teal-300"
            >
              بازگشت
            </button>
          </div>
        </form>

        <div className="space-y-5">
          {isEditing && product ? (
            <>
              <PhotosPanel
                productId={product.id}
                images={product.images ?? []}
                onChanged={state.reload}
                canWrite={can('products.update')}
              />
              <StockPanel product={product} onChanged={state.reload} canWrite={can('products.update')} />
            </>
          ) : (
            <Panel title="عکس‌ها و موجودی">
              <p className="text-[12.5px] leading-6 text-muted">
                پس از ایجاد محصول، در همین صفحه می‌توانید عکس‌ها را بارگذاری و موجودی را ثبت کنید.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

/** The product's photo list: upload a new file, or attach one already in the library. */
function PhotosPanel({
  productId,
  images,
  onChanged,
  canWrite,
}: {
  productId: number;
  images: Array<{ id: number; url: string | null; alt: string | null }>;
  onChanged: () => void;
  canWrite: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [libraryId, setLibraryId] = useState('');
  const library = useAsync(() => adminMedia({ per_page: 100 }), []);
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(undefined);

    try {
      await adminUploadProductImage(productId, file);
      onChanged();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'بارگذاری نشد.');
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const attach = async () => {
    if (libraryId === '') return;

    setBusy(true);
    setError(undefined);

    try {
      await adminAttachProductImage(productId, Number(libraryId));
      setLibraryId('');
      onChanged();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'افزوده نشد.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (imageId: number) => {
    setBusy(true);
    setError(undefined);

    try {
      await adminRemoveProductImage(productId, imageId);
      onChanged();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'حذف نشد.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="عکس‌های محصول"
      description="اولین عکس، عکس اصلی کارت محصول است."
    >
      {images.length === 0 ? (
        <p className="mb-4 rounded-xl border border-dashed border-line px-3 py-4 text-center text-[12.5px] text-muted">
          هنوز عکسی ثبت نشده است.
        </p>
      ) : (
        <ul className="mb-4 grid grid-cols-3 gap-2">
          {images.map((image) => (
            <li key={image.id} className="group relative">
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.alt ?? ''}
                  loading="lazy"
                  className="aspect-[4/5] w-full rounded-xl object-cover"
                />
              ) : (
                <span className="block aspect-[4/5] w-full rounded-xl bg-cream" />
              )}
              {canWrite ? (
                <button
                  type="button"
                  onClick={() => void remove(image.id)}
                  disabled={busy}
                  aria-label="حذف عکس"
                  className="absolute end-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-wine shadow-soft transition-opacity hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canWrite ? (
        <div className="space-y-3">
          <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-cream/40 text-[12.5px] text-cocoa transition-colors hover:border-teal-300">
            <ImagePlus className="h-4 w-4" />
            {busy ? 'در حال بارگذاری…' : 'بارگذاری عکس تازه'}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>

          <div className="flex items-center gap-2">
            <select
              value={libraryId}
              onChange={(event) => setLibraryId(event.target.value)}
              aria-label="انتخاب از کتابخانهٔ رسانه"
              className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-[12.5px] text-ink outline-none focus:border-teal-400"
            >
              <option value="">انتخاب از کتابخانه…</option>
              {(library.data?.items ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.alt_source ?? item.mime_type}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || libraryId === ''}
              onClick={() => void attach()}
              className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[12.5px] font-medium text-ink transition-colors hover:border-teal-300 disabled:opacity-50"
            >
              افزودن
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 rounded-xl border border-wine/25 bg-wine/5 px-3 py-2 text-[12px] text-wine">
          {error}
        </p>
      ) : null}
    </Panel>
  );
}

/** Stock is written through its own endpoint, so the ledger explains every number. */
function StockPanel({
  product,
  onChanged,
  canWrite,
}: {
  product: { id: number; stock_quantity: number | null; is_low_on_stock: boolean };
  onChanged: () => void;
  canWrite: boolean;
}) {
  const [quantity, setQuantity] = useState(String(product.stock_quantity ?? 0));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | undefined>(undefined);

  const save = async () => {
    setBusy(true);
    setMessage(undefined);

    try {
      const result = await adminUpdateStock(product.id, Number(quantity), note || undefined);
      setMessage({ ok: true, text: result.message ?? 'موجودی ثبت شد.' });
      setNote('');
      onChanged();
    } catch (failure) {
      setMessage({
        ok: false,
        text: failure instanceof ApiError ? failure.message : 'ثبت نشد.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="موجودی انبار" description="هر تغییر در دفتر موجودی ثبت می‌شود.">
      <div className="mb-4 flex items-center justify-between rounded-xl bg-cream/60 px-3.5 py-3">
        <span className="flex items-center gap-2 text-[12.5px] text-cocoa">
          <Boxes className="h-4 w-4" />
          موجودی فعلی
        </span>
        <span className="flex items-center gap-2">
          <span className="font-bold text-ink">{toFa(product.stock_quantity ?? 0)}</span>
          {product.is_low_on_stock ? <StatusPill tone="warn">کم</StatusPill> : null}
        </span>
      </div>

      {canWrite ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="form-stock" className="mb-1.5 block text-[12.5px] font-medium text-cocoa">
              تعداد جدید
            </label>
            <input
              id="form-stock"
              type="number"
              min={0}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label htmlFor="form-stock-note" className="mb-1.5 block text-[12.5px] font-medium text-cocoa">
              یادداشت
            </label>
            <input
              id="form-stock-note"
              type="text"
              value={note}
              placeholder="مثلاً: ورود محمولهٔ جدید"
              onChange={(event) => setNote(event.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none focus:border-teal-400"
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-teal-800/25 text-[12.5px] font-medium text-teal-800 transition-colors hover:bg-teal-800 hover:text-white disabled:opacity-50"
          >
            {busy ? 'در حال ثبت…' : 'ثبت موجودی'}
          </button>
        </div>
      ) : null}

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

    </Panel>
  );
}
