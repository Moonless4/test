import {
  adminCreatePage,
  adminDeletePage,
  adminPages,
  adminUpdatePage,
} from '../../../services/admin';
import type { ApiAdminPage } from '../../../lib/api/types';
import CrudPanel from '../../components/CrudPanel';
import StatusPill from '../../components/StatusPill';
import type { FieldSpec, FormValues } from '../../components/Field';
import { contentLabel, contentTone, faDate, toDateTimeInput } from '../../lib/labels';

const FIELDS: FieldSpec[] = [
  { name: 'title', label: 'عنوان', required: true },
  {
    name: 'slug',
    label: 'نشانی صفحه (slug)',
    required: true,
    placeholder: 'about-us',
    hint: 'آدرس عمومی صفحه؛ فقط حروف کوچک انگلیسی و خط تیره. تغییرش لینک‌های قبلی را می‌شکند.',
  },
  {
    name: 'status',
    label: 'وضعیت',
    type: 'select',
    defaultValue: 'draft',
    options: [
      { value: 'draft', label: 'پیش‌نویس' },
      { value: 'published', label: 'منتشرشده' },
    ],
  },
  {
    name: 'published_at',
    label: 'تاریخ انتشار',
    type: 'datetime',
    hint: 'برای دیده‌شدن، وضعیت باید «منتشرشده» و این تاریخ گذشته باشد.',
  },
  {
    name: 'body',
    label: 'متن صفحه',
    type: 'textarea',
    rows: 12,
    full: true,
    required: true,
    hint: 'متن ساده؛ HTML ذخیره نمی‌شود.',
  },
];

/**
 * Static content pages (about, contact, terms…).
 *
 * A draft is visible here and nowhere else: the public endpoint filters on the API's `published`
 * scope, so publishing is a data change rather than a deployment.
 */
export default function PagesPanel({ canWrite }: { canWrite: boolean }) {
  const toForm = (row: ApiAdminPage): FormValues => ({
    title: row.title,
    slug: row.slug,
    status: row.status,
    published_at: toDateTimeInput(row.published_at),
    body: row.body,
  });

  /**
   * Publishing without a date would leave the page invisible — the API wants both — so the panel
   * fills in "now" when the operator says "published" and leaves the date alone.
   */
  const prepare = (payload: Record<string, unknown>) => {
    if (payload.status === 'published' && !payload.published_at) {
      return { ...payload, published_at: new Date().toISOString() };
    }

    return payload;
  };

  return (
    <CrudPanel<ApiAdminPage>
      listTitle="برگه‌های سایت"
      description="صفحه‌های ثابت مثل «درباره ما» و «تماس با ما». پیش‌نویس‌ها فقط در همین پنل دیده می‌شوند."
      searchPlaceholder="جست‌وجوی عنوان یا نشانی…"
      addLabel="برگهٔ جدید"
      itemLabel="برگه"
      columns={[
        {
          key: 'title',
          header: 'عنوان',
          render: (row) => <span className="font-medium">{row.title}</span>,
        },
        {
          key: 'slug',
          header: 'نشانی',
          render: (row) => (
            <span dir="ltr" className="text-[12px] text-muted">
              /{row.slug}
            </span>
          ),
        },
        {
          key: 'published_at',
          header: 'انتشار',
          render: (row) => <span className="text-[12.5px] text-muted">{faDate(row.published_at)}</span>,
        },
        {
          key: 'status',
          header: 'وضعیت',
          render: (row) => (
            <StatusPill tone={contentTone(row.status)}>{contentLabel(row.status)}</StatusPill>
          ),
        },
      ]}
      fields={FIELDS}
      toForm={toForm}
      prepare={prepare}
      idOf={(row) => row.id}
      labelOf={(row) => row.title}
      list={adminPages}
      create={adminCreatePage}
      update={adminUpdatePage}
      remove={adminDeletePage}
      filters={[
        {
          name: 'status',
          label: 'همهٔ وضعیت‌ها',
          options: [
            { value: 'published', label: 'منتشرشده' },
            { value: 'draft', label: 'پیش‌نویس' },
          ],
        },
      ]}
      canCreate={canWrite}
      canUpdate={canWrite}
      canDelete={canWrite}
    />
  );
}
