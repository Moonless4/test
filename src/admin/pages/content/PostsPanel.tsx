import {
  adminCreatePost,
  adminDeletePost,
  adminPosts,
  adminUpdatePost,
} from '../../../services/admin';
import type { ApiAdminPost } from '../../../lib/api/types';
import CrudPanel from '../../components/CrudPanel';
import StatusPill from '../../components/StatusPill';
import type { FieldSpec, FormValues } from '../../components/Field';
import { contentLabel, contentTone, faDate, toDateTimeInput } from '../../lib/labels';

const FIELDS: FieldSpec[] = [
  { name: 'title', label: 'عنوان', required: true },
  {
    name: 'slug',
    label: 'نشانی نوشته (slug)',
    required: true,
    placeholder: 'winter-looks',
    hint: 'آدرس عمومی نوشته؛ فقط حروف کوچک انگلیسی و خط تیره.',
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
    name: 'cover_media_id',
    label: 'تصویر شاخص',
    type: 'media',
    hint: 'از کتابخانهٔ رسانه انتخاب می‌شود؛ برای بارگذاری فایل تازه، اول از بخش «کتابخانهٔ رسانه» آپلود کنید.',
  },
  { name: 'tags', label: 'برچسب‌ها', type: 'tags', full: true, hint: 'با کاما جدا کنید.' },
  {
    name: 'excerpt',
    label: 'خلاصه',
    type: 'textarea',
    rows: 2,
    full: true,
    nullable: true,
  },
  {
    name: 'body',
    label: 'متن نوشته',
    type: 'textarea',
    rows: 12,
    full: true,
    required: true,
    hint: 'متن ساده؛ HTML ذخیره نمی‌شود.',
  },
];

/**
 * Blog administration. Same draft/published model as pages; the byline is taken from the session
 * on the server, so nothing here has to name an author.
 */
export default function PostsPanel({ canWrite }: { canWrite: boolean }) {
  const toForm = (row: ApiAdminPost): FormValues => ({
    title: row.title,
    slug: row.slug,
    status: row.status,
    published_at: toDateTimeInput(row.published_at),
    cover_media_id: row.cover?.id ?? '',
    tags: row.tags ?? [],
    excerpt: row.excerpt ?? '',
    body: row.body,
  });

  const prepare = (payload: Record<string, unknown>) => {
    if (payload.status === 'published' && !payload.published_at) {
      return { ...payload, published_at: new Date().toISOString() };
    }

    return payload;
  };

  return (
    <CrudPanel<ApiAdminPost>
      listTitle="نوشته‌های وبلاگ"
      description="نوشته‌های وبلاگ فروشگاه. نوشتهٔ پیش‌نویس فقط در همین پنل دیده می‌شود."
      searchPlaceholder="جست‌وجوی عنوان یا نشانی…"
      addLabel="نوشتهٔ جدید"
      itemLabel="نوشته"
      columns={[
        {
          key: 'cover',
          header: '',
          className: 'w-16',
          render: (row) =>
            row.cover?.url ? (
              <img
                src={row.cover.url}
                alt=""
                className="h-12 w-10 rounded-lg object-cover"
                loading="lazy"
              />
            ) : (
              <span className="block h-12 w-10 rounded-lg bg-cream" />
            ),
        },
        {
          key: 'title',
          header: 'عنوان',
          render: (row) => <span className="font-medium">{row.title}</span>,
        },
        {
          key: 'published_at',
          header: 'انتشار',
          render: (row) => (
            <span className="text-[12.5px] text-muted">{faDate(row.published_at)}</span>
          ),
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
      list={adminPosts}
      create={adminCreatePost}
      update={adminUpdatePost}
      remove={adminDeletePost}
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
