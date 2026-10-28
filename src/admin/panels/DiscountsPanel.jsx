import { useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EditorCard, EmptyNote, Select, TextInput, makeId } from '../ui.jsx';

const emptyCode = () => ({
  id: '',
  code: '',
  type: 'percent',
  amount: '',
  minTotal: '',
  expiresAt: '',
  active: true,
});

const TYPE_OPTIONS = [
  { value: 'percent', label: 'درصدی' },
  { value: 'fixed', label: 'مبلغ ثابت (تومان)' },
];

export default function DiscountsPanel() {
  const { content, update } = useSite();
  const codes = content.discountCodes || [];
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');

  const setCodes = (next) => update((prev) => ({ ...prev, discountCodes: next }));

  const patch = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    const code = draft.code.trim().toUpperCase();
    if (!code) {
      setError('کد تخفیف را وارد کنید.');
      return;
    }
    if (codes.some((item) => item.code === code && item.id !== draft.id)) {
      setError('این کد قبلاً ثبت شده است.');
      return;
    }
    if (!Number(draft.amount) || Number(draft.amount) <= 0) {
      setError('مقدار تخفیف باید بزرگ‌تر از صفر باشد.');
      return;
    }
    const saved = {
      ...draft,
      id: draft.id || makeId('off'),
      code,
      amount: Number(draft.amount),
      minTotal: Number(draft.minTotal) || 0,
    };
    setCodes(
      draft.id ? codes.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...codes]
    );
    setError('');
    setDraft(null);
  };

  const toggleActive = (item) =>
    setCodes(codes.map((entry) => (entry.id === item.id ? { ...entry, active: !entry.active } : entry)));

  const remove = (item) => {
    if (!window.confirm(`کد ${item.code} حذف شود؟`)) return;
    setCodes(codes.filter((entry) => entry.id !== item.id));
  };

  return (
    <AdminPanel
      title="کدهای تخفیف"
      description="کد تخفیف بسازید، فعال یا غیرفعال کنید و تاریخ انقضا بگذارید."
      actions={
        <button
          type="button"
          className="adm-btn adm-btn--gold"
          onClick={() => {
            setError('');
            setDraft(emptyCode());
          }}
        >
          <Icon name="plus" size={17} />
          کد تخفیف جدید
        </button>
      }
    >
      {draft ? (
        <div className="adm-editor">
          <div className="adm-editor__head">
            <h3>{draft.id ? 'ویرایش کد تخفیف' : 'کد تخفیف جدید'}</h3>
            <div className="adm-editor__actions">
              <button type="button" className="adm-btn adm-btn--gold" onClick={save}>
                <Icon name="check" size={16} />
                ذخیره
              </button>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setDraft(null)}>
                انصراف
              </button>
            </div>
          </div>

          <div className="adm-grid">
            <TextInput
              label="کد تخفیف"
              value={draft.code}
              onChange={(value) => patch('code', value)}
              dir="ltr"
              hint="مثلاً ATRIN20"
            />
            <Select
              label="نوع تخفیف"
              value={draft.type}
              onChange={(value) => patch('type', value)}
              options={TYPE_OPTIONS}
            />
            <TextInput
              label={draft.type === 'percent' ? 'درصد تخفیف' : 'مبلغ تخفیف (تومان)'}
              value={draft.amount}
              onChange={(value) => patch('amount', value)}
              dir="ltr"
              inputMode="numeric"
            />
            <TextInput
              label="حداقل مبلغ سفارش (تومان)"
              value={draft.minTotal}
              onChange={(value) => patch('minTotal', value)}
              dir="ltr"
              inputMode="numeric"
              hint="خالی یعنی بدون شرط"
            />
            <TextInput
              label="تاریخ انقضا"
              value={draft.expiresAt}
              onChange={(value) => patch('expiresAt', value)}
              dir="ltr"
              placeholder="2026-12-31"
              hint="خالی یعنی بدون انقضا"
            />
          </div>

          {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}
        </div>
      ) : null}

      {codes.length === 0 ? (
        <EmptyNote>هنوز کد تخفیفی ساخته نشده است.</EmptyNote>
      ) : (
        <div className="adm-rows">
          {codes.map((item) => (
            <div className="adm-row" key={item.id}>
              <span className={`adm-pill adm-pill--${item.active ? 'green' : 'red'}`}>
                {item.active ? 'فعال' : 'غیرفعال'}
              </span>
              <div className="adm-row__copy">
                <b dir="ltr">{item.code}</b>
                <small>
                  {item.type === 'percent'
                    ? `${item.amount}٪ تخفیف`
                    : `${Number(item.amount).toLocaleString('fa-IR')} تومان تخفیف`}
                  {item.minTotal ? ` · از ${Number(item.minTotal).toLocaleString('fa-IR')} تومان` : ''}
                  {item.expiresAt ? ` · تا ${item.expiresAt}` : ''}
                </small>
              </div>
              <div className="adm-row__tools">
                <button type="button" className="adm-btn adm-btn--ghost" onClick={() => toggleActive(item)}>
                  {item.active ? 'غیرفعال' : 'فعال'}
                </button>
                <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setDraft({ ...item })}>
                  <Icon name="edit" size={15} />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn"
                  onClick={() => remove(item)}
                  aria-label={`حذف ${item.code}`}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
