import { useAsync } from '../../hooks/useAsync';
import {
  adminCreateSetting,
  adminDeleteSetting,
  adminSettings,
  adminUpdateSetting,
} from '../../services/admin';
import type { ApiAdminSetting } from '../../lib/api/types';
import { useAdminAuth } from '../AdminAuthContext';
import CrudPanel from '../components/CrudPanel';
import StatusPill from '../components/StatusPill';
import type { FieldSpec, FormValues } from '../components/Field';
import { SETTING_TYPE } from '../lib/labels';

/**
 * Site settings.
 *
 * A setting is a key the storefront reads by name plus the value it reads, so the key is the row's
 * identity: it is immutable once created (`SettingRequest` prohibits it on update) and the panel
 * sends it only when a row is new. `type` is what turns the stored string back into a number or a
 * boolean, which is why it is edited beside the value rather than inferred.
 */

/** The types `SettingRequest` accepts — `float` is not one of them. */
const TYPE_OPTIONS = ['string', 'int', 'bool', 'json'].map((value) => ({
  value,
  label: SETTING_TYPE[value] ?? value,
}));

/** The API hands the value back already typed; the form edits it as one line of text. */
const toText = (value: ApiAdminSetting['value']): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value);

  return String(value);
};

export default function SettingsPage() {
  const { can } = useAdminAuth();

  // The group filter offers the groups that actually exist, not a hardcoded list.
  const all = useAsync(() => adminSettings({ per_page: 100 }), []);
  const groups = Array.from(new Set((all.data?.items ?? []).map((item) => item.group))).sort();

  const fields: FieldSpec[] = [
    {
      name: 'key',
      label: 'کلید',
      required: true,
      placeholder: 'store.phone',
      hint: 'شناسه‌ای که فروشگاه با آن مقدار را می‌خواند؛ پس از ساخت تغییر نمی‌کند و روی ویرایش نادیده گرفته می‌شود.',
    },
    { name: 'group', label: 'گروه', defaultValue: 'general', placeholder: 'general' },
    {
      name: 'value',
      label: 'مقدار',
      full: true,
      hint: 'برای بله/خیر همان true یا false را بنویسید؛ JSON باید معتبر باشد.',
    },
    { name: 'type', label: 'نوع', type: 'select', options: TYPE_OPTIONS, defaultValue: 'string' },
    {
      name: 'is_public',
      label: 'نمایش به فروشگاه',
      type: 'checkbox',
      hint: 'کلیدی که عمومی نباشد هرگز به مرورگر نمی‌رسد.',
    },
  ];

  const toForm = (row: ApiAdminSetting): FormValues => ({
    key: row.key,
    group: row.group,
    value: toText(row.value),
    type: row.type,
    is_public: row.is_public,
  });

  // `key` is prohibited on update, so it is dropped from the PATCH body and only sent on create.
  const update = (id: number, body: Record<string, unknown>) => {
    const payload = { ...body };
    delete payload.key;

    return adminUpdateSetting(id, payload);
  };

  return (
    <CrudPanel<ApiAdminSetting>
      listTitle="تنظیمات"
      description="کلید/مقدارهایی که صفحه‌های فروشگاه با آن‌ها خوانده می‌شوند — مثل نام فروشگاه، تلفن و آستانهٔ ارسال رایگان. کلید یک تنظیم پس از ساخت تغییر نمی‌کند؛ برای تغییر نام، تنظیم تازه بسازید و کلید قدیمی را بازنشسته کنید."
      searchPlaceholder="جست‌وجوی کلید یا گروه…"
      addLabel="تنظیم جدید"
      itemLabel="تنظیم"
      columns={[
        {
          key: 'key',
          header: 'کلید',
          render: (row) => <span dir="ltr" className="font-medium">{row.key}</span>,
        },
        {
          key: 'value',
          header: 'مقدار',
          render: (row) => (
            <span dir="ltr" className="text-muted">
              {toText(row.value) || '—'}
            </span>
          ),
        },
        {
          key: 'type',
          header: 'نوع',
          render: (row) => <span>{SETTING_TYPE[row.type] ?? row.type}</span>,
        },
        {
          key: 'group',
          header: 'گروه',
          render: (row) => <span dir="ltr" className="text-muted">{row.group}</span>,
        },
        {
          key: 'visibility',
          header: 'دسترسی',
          render: (row) => (
            <StatusPill tone={row.is_public ? 'ok' : 'muted'}>
              {row.is_public ? 'عمومی' : 'داخلی'}
            </StatusPill>
          ),
        },
      ]}
      fields={fields}
      toForm={toForm}
      idOf={(row) => row.id}
      labelOf={(row) => row.key}
      list={adminSettings}
      create={adminCreateSetting}
      update={update}
      remove={adminDeleteSetting}
      filters={[
        {
          name: 'category',
          label: 'همهٔ گروه‌ها',
          options: groups.map((group) => ({ value: group, label: group })),
        },
      ]}
      canCreate={can('settings.manage')}
      canUpdate={can('settings.manage')}
      canDelete={can('settings.manage')}
    />
  );
}
