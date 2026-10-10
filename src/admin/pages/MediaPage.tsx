import { useEffect, useRef, useState } from 'react';
import { FileText, Images, Loader2, Search, Trash2, Upload } from 'lucide-react';
import { ApiError, type Page } from '../../lib/api/client';
import { toFa } from '../../lib/format';
import { useAsync } from '../../hooks/useAsync';
import { adminDeleteMedia, adminMedia, adminUploadMedia } from '../../services/admin';
import type { ApiAdminMedia } from '../../lib/api/types';
import EmptyState from '../../components/ui/EmptyState';
import { SectionError, SectionLoading } from '../../components/ui/SectionState';
import { useAdminAuth } from '../AdminAuthContext';
import AdminPageHeader from '../components/AdminPageHeader';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusPill from '../components/StatusPill';

/**
 * The media library.
 *
 * Pictures are what the storefront can show, so an uploaded image goes to the public disk and is
 * listed with its thumbnail; anything else (a receipt, a supplier list) is stored privately and has
 * no URL to preview. Deletion is refused by the API while a file is still attached to a product, a
 * category or a post, and that refusal is shown verbatim rather than hidden.
 */

const PER_PAGE = 24;

const ICON_BUTTON =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-wine/40 hover:text-wine';

/** A file size a person can read: `1_234_567` → «۱٫۲ مگابایت». */
const formatBytes = (bytes: number | null): string => {
  if (bytes === null || bytes <= 0) return '—';

  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  const rounded = Math.round(value * 10) / 10;

  return `${toFa(rounded)} ${units[unit]}`;
};

export default function MediaPage() {
  const { can } = useAdminAuth();
  const canWrite = can('media.manage');

  const [term, setTerm] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleting, setDeleting] = useState<ApiAdminMedia | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Typing must not fire a request per keystroke; 350ms matches the panel's other lists.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(term.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [term]);

  const state = useAsync<Page<ApiAdminMedia>>(
    () => adminMedia({ q: q === '' ? undefined : q, page, per_page: PER_PAGE }),
    [q, page],
  );

  const upload = async (file: File) => {
    setUploading(true);
    setNotice(null);

    try {
      const result = await adminUploadMedia(file);
      setNotice({ ok: true, text: result.message ?? 'فایل بارگذاری شد.' });
      setPage(1);
      state.reload();
    } catch (error) {
      setNotice({
        ok: false,
        text: error instanceof ApiError ? error.message : 'بارگذاری نشد؛ دوباره تلاش کنید.',
      });
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;

    setBusy(true);

    try {
      const result = await adminDeleteMedia(deleting.id);
      setNotice({ ok: true, text: result.message ?? 'حذف شد.' });
      setDeleting(null);
      state.reload();
    } catch (error) {
      setDeleting(null);
      setNotice({
        ok: false,
        text: error instanceof ApiError ? error.message : 'حذف نشد؛ دوباره تلاش کنید.',
      });
    } finally {
      setBusy(false);
    }
  };

  const items = state.data?.items ?? [];

  return (
    <div>
      <AdminPageHeader
        title="کتابخانهٔ رسانه"
        description="تصاویری که در پنل بارگذاری می‌کنید عمومی می‌شوند و می‌توانید آن‌ها را به محصول، دسته یا نوشته وصل کنید؛ فایل‌های غیرتصویری خصوصی ذخیره می‌شوند و آدرسی برای نمایش ندارند."
        actions={
          canWrite ? (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-4 text-[13px] font-medium text-white shadow-soft transition-colors hover:bg-teal-700 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'در حال بارگذاری…' : 'بارگذاری فایل'}
            </button>
          ) : null
        }
      />

      {canWrite ? (
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            // Reset first, so choosing the same file again still fires a change event.
            event.target.value = '';
            if (file) void upload(file);
          }}
        />
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-muted" />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="جست‌وجوی نام فایل…"
            aria-label="جست‌وجوی نام فایل"
            className="h-11 w-full rounded-xl border border-line bg-white pe-10 ps-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-teal-400"
          />
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className={`mb-4 rounded-xl border px-4 py-2.5 text-[12.5px] ${
            notice.ok ? 'border-teal-200 bg-teal-50 text-teal-900' : 'border-wine/25 bg-wine/5 text-wine'
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      {state.loading && !state.data ? (
        <SectionLoading label="در حال دریافت…" />
      ) : state.error ? (
        <SectionError error={state.error} onRetry={state.reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Images className="h-5 w-5" />}
          title="چیزی در کتابخانه نیست"
          text="با این جست‌وجو فایلی پیدا نشد؛ فایل تازه‌ای بارگذاری کنید."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-card border border-line bg-white shadow-soft"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-cream/50">
                  {item.url && item.mime_type.startsWith('image/') ? (
                    <img
                      src={item.url}
                      alt={item.alt_source ?? ''}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText className="h-6 w-6 text-muted" />
                  )}
                </div>

                <div className="space-y-1.5 p-3">
                  <p
                    dir="ltr"
                    title={item.alt_source ?? ''}
                    className="truncate text-[12.5px] font-medium text-ink"
                  >
                    {item.alt_source ?? item.mime_type}
                  </p>
                  <p className="text-[11.5px] text-muted">
                    {item.width && item.height
                      ? `${toFa(item.width)}×${toFa(item.height)} · ${formatBytes(item.size_bytes)}`
                      : formatBytes(item.size_bytes)}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <StatusPill tone={item.is_public ? 'ok' : 'muted'}>
                      {item.is_public ? 'عمومی' : 'خصوصی'}
                    </StatusPill>
                    {canWrite ? (
                      <button
                        type="button"
                        onClick={() => setDeleting(item)}
                        aria-label="حذف"
                        className={ICON_BUTTON}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination
            page={state.data?.page ?? 1}
            totalPages={state.data?.totalPages ?? 1}
            total={state.data?.total ?? items.length}
            itemLabel="فایل"
            onChange={setPage}
          />
        </>
      )}

      <Modal
        open={deleting !== null}
        title="حذف فایل"
        onClose={() => setDeleting(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-ink transition-colors hover:border-teal-300"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirmDelete()}
              className="inline-flex h-11 items-center rounded-xl bg-wine px-5 text-[13px] font-medium text-white transition-colors hover:bg-wine-dark disabled:opacity-50"
            >
              {busy ? 'در حال حذف…' : 'حذف کن'}
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-7 text-muted">
          «{deleting?.alt_source ?? ''}» حذف شود؟ اگر این فایل هنوز روی محصول، دسته یا نوشته‌ای
          استفاده شود، حذف نمی‌شود و علتش نشان داده می‌شود.
        </p>
      </Modal>
    </div>
  );
}
