import { useAsync } from '../../hooks/useAsync';
import { toFa } from '../../lib/format';
import { adminCreateFaq, adminDeleteFaq, adminFaqs, adminUpdateFaq } from '../../services/admin';
import type { ApiAdminFaq } from '../../lib/api/types';
import { useAdminAuth } from '../AdminAuthContext';
import CrudPanel from '../components/CrudPanel';
import StatusPill from '../components/StatusPill';
import type { FieldSpec, FormValues } from '../components/Field';

/**
 * Frequently asked questions.
 *
 * Every entry is listed, including retired ones: the public endpoint serves only active questions,
 * so switching one off is how it disappears from the site without losing the wording customers
 * were answering against.
 */
export default function FaqsPage() {
  const { can } = useAdminAuth();

  // The group filter's options are the groups that actually exist, not a hardcoded list.
  const all = useAsync(() => adminFaqs({ per_page: 100 }), []);
  const groups = Array.from(new Set((all.data?.items ?? []).map((item) => item.group))).sort();

  const fields: FieldSpec[] = [
    {
      name: 'group',
      label: 'گروه',
      defaultValue: 'general',
      placeholder: 'general',
      hint: 'پرسش‌ها در صفحهٔ سوالات متداول بر اساس همین گروه دسته می‌شوند.',
    },
    { name: 'position', label: 'ترتیب در گروه', type: 'number', min: 0, defaultValue: 0 },
    { name: 'question', label: 'پرسش', required: true, full: true },
    { name: 'answer', label: 'پاسخ', type: 'textarea', rows: 6, required: true, full: true },
    { name: 'is_active', label: 'نمایش در سایت', type: 'checkbox', defaultValue: true },
  ];

  const toForm = (row: ApiAdminFaq): FormValues => ({
    group: row.group,
    position: row.position,
    question: row.question,
    answer: row.answer,
    is_active: row.is_active,
  });

  return (
    <CrudPanel<ApiAdminFaq>
      listTitle="سوالات متداول"
      description="پرسش‌ها به‌ترتیب گروه و شمارهٔ هر گروه روی صفحهٔ «سوالات متداول» نمایش داده می‌شوند. پرسشی که نمایشش را خاموش کنید روی سایت دیده نمی‌شود."
      searchPlaceholder="جست‌وجوی متن پرسش…"
      addLabel="پرسش جدید"
      itemLabel="پرسش"
      columns={[
        {
          key: 'question',
          header: 'پرسش',
          render: (row) => <span className="font-medium">{row.question}</span>,
        },
        { key: 'group', header: 'گروه', render: (row) => <span dir="ltr">{row.group}</span> },
        {
          key: 'position',
          header: 'ترتیب',
          render: (row) => <span>{toFa(row.position)}</span>,
        },
        {
          key: 'status',
          header: 'وضعیت',
          render: (row) => (
            <StatusPill tone={row.is_active ? 'ok' : 'muted'}>
              {row.is_active ? 'نمایش' : 'پنهان'}
            </StatusPill>
          ),
        },
      ]}
      fields={fields}
      toForm={toForm}
      idOf={(row) => row.id}
      labelOf={(row) => row.question}
      list={adminFaqs}
      create={adminCreateFaq}
      update={adminUpdateFaq}
      remove={adminDeleteFaq}
      filters={[
        {
          name: 'status',
          label: 'همهٔ وضعیت‌ها',
          options: [
            { value: 'active', label: 'در حال نمایش' },
            { value: 'inactive', label: 'پنهان' },
          ],
        },
        {
          name: 'category',
          label: 'همهٔ گروه‌ها',
          options: groups.map((group) => ({ value: group, label: group })),
        },
      ]}
      canCreate={can('content.manage')}
      canUpdate={can('content.manage')}
      canDelete={can('content.manage')}
    />
  );
}
