import { useAsync } from '../../hooks/useAsync';
import { toFa } from '../../lib/format';
import type { Query } from '../../lib/api/client';
import { adminCategories, adminCreateCategory, adminDeleteCategory, adminUpdateCategory } from '../../services/admin';
import type { ApiAdminCategory } from '../../lib/api/types';
import { useAdminAuth } from '../AdminAuthContext';
import CrudPanel from '../components/CrudPanel';
import StatusPill from '../components/StatusPill';
import type { FieldSpec, FormValues } from '../components/Field';

/**
 * The category tree, flat.
 *
 * The API answers with every category in one response (a paginated tree is unusable), so paging is
 * switched off here; search and the active/inactive filter are the API's own.
 */
export default function CategoriesPage() {
  const { can } = useAdminAuth();

  const all = useAsync(() => adminCategories(), []);
  const categories = all.data ?? [];
  const nameById = new Map(categories.map((category) => [category.id, category.name]));

  const fields: FieldSpec[] = [
    { name: 'name', label: 'نام دسته', required: true },
    {
      name: 'slug',
      label: 'نامک (slug)',
      placeholder: 'outerwear',
      hint: 'فقط حروف کوچک انگلیسی و خط تیره. خالی بگذارید تا از نام ساخته شود.',
    },
    {
      name: 'parent_id',
      label: 'دستهٔ مادر',
      type: 'select',
      nullable: true,
      options: categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
      hint: 'خالی بگذارید تا دستهٔ اصلی شود.',
    },
    { name: 'position', label: 'ترتیب نمایش', type: 'number', min: 0, defaultValue: 0 },
    { name: 'image_media_id', label: 'تصویر دسته', type: 'media', full: true },
    { name: 'description', label: 'توضیح', type: 'textarea', rows: 3, full: true },
    { name: 'is_active', label: 'فعال باشد', type: 'checkbox', defaultValue: true },
  ];

  const toForm = (row: ApiAdminCategory): FormValues => ({
    name: row.name,
    slug: row.slug,
    parent_id: row.parent_id === null ? '' : String(row.parent_id),
    position: row.position ?? 0,
    image_media_id: row.image_media_id ?? '',
    description: row.description ?? '',
    is_active: row.is_active,
  });

  /** The one non-paginated list: everything in one answer, so the caller wraps it as a page. */
  const list = async (query: Query) => {
    const items = await adminCategories(query);

    return { items, page: 1, total: items.length, totalPages: 1 };
  };

  return (
    <CrudPanel<ApiAdminCategory>
      listTitle="دسته‌بندی‌ها"
      description="دسته‌های فروشگاه، با ترتیب نمایششان. دسته‌ای که محصول یا زیردسته دارد حذف نمی‌شود؛ به‌جایش غیرفعالش کنید."
      searchPlaceholder="جست‌وجوی نام دسته…"
      addLabel="دستهٔ جدید"
      itemLabel="دسته"
      columns={[
        { key: 'name', header: 'نام', render: (row) => <span className="font-medium">{row.name}</span> },
        {
          key: 'parent',
          header: 'دستهٔ مادر',
          render: (row) =>
            row.parent_id === null ? (
              <span className="text-muted">—</span>
            ) : (
              <span>{nameById.get(row.parent_id) ?? '—'}</span>
            ),
        },
        {
          key: 'slug',
          header: 'نامک',
          render: (row) => (
            <span dir="ltr" className="text-[12px] text-muted">
              {row.slug}
            </span>
          ),
        },
        {
          key: 'products',
          header: 'محصولات',
          render: (row) => (
            <span>
              {toFa(row.active_products_count ?? 0)}
              <span className="text-muted"> / {toFa(row.products_count ?? 0)}</span>
            </span>
          ),
        },
        {
          key: 'position',
          header: 'ترتیب',
          render: (row) => <span>{toFa(row.position ?? 0)}</span>,
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
      labelOf={(row) => row.name}
      list={list}
      create={adminCreateCategory}
      update={adminUpdateCategory}
      remove={adminDeleteCategory}
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
      canCreate={can('categories.manage')}
      canUpdate={can('categories.manage')}
      canDelete={can('categories.manage')}
    />
  );
}
