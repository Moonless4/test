import { useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { useAccount } from '../AccountContext.jsx';
import { EmptyState, PageHead, ConfirmDialog } from '../ui.jsx';
import AddressForm from '../AddressForm.jsx';

export default function AddressesPage({ onToast }) {
  const { addresses, saveAddress, deleteAddress, setDefaultAddress, loading } = useAccount();
  const [editor, setEditor] = useState(null);
  const [removing, setRemoving] = useState(null);

  return (
    <div className="acct-page">
      <PageHead
        title="آدرس‌های من"
        text="آدرس‌های تحویل سفارش را مدیریت کنید؛ آدرس پیش‌فرض در ثبت سفارش انتخاب می‌شود."
        action={
          <button type="button" className="btn btn--primary" onClick={() => setEditor({ mode: 'new' })}>
            <Icon name="plus" size={17} />
            افزودن آدرس
          </button>
        }
      />

      {loading ? (
        <div className="acct-skeleton acct-skeleton--grid" aria-hidden="true">
          <div className="acct-skeleton__tile acct-skeleton__tile--tall" />
          <div className="acct-skeleton__tile acct-skeleton__tile--tall" />
        </div>
      ) : addresses.length ? (
        <div className="addr-grid">
          {addresses.map((address) => (
            <article key={address.id} className={`addr-card ${address.isDefault ? 'is-default' : ''}`}>
              <header className="addr-card__head">
                <span className="addr-card__icon">
                  <Icon name="pin" size={18} />
                </span>
                <div>
                  <b>{address.title}</b>
                  {address.isDefault && <span className="addr-card__badge">پیش‌فرض</span>}
                </div>
              </header>

              <p className="addr-card__full">{address.full}</p>

              <div className="addr-card__meta">
                <span>
                  <Icon name="user" size={15} />
                  {address.recipient}
                </span>
                <span dir="ltr">
                  <Icon name="phone" size={15} />
                  {address.phone}
                </span>
              </div>

              {address.notes && <p className="addr-card__note">{address.notes}</p>}

              <div className="addr-card__actions">
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setEditor(address)}>
                  <Icon name="edit" size={15} />
                  ویرایش
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      setDefaultAddress(address.id);
                      onToast(`«${address.title}» به عنوان آدرس پیش‌فرض انتخاب شد.`);
                    }}
                  >
                    پیش‌فرض
                  </button>
                )}
                <button
                  type="button"
                  className="addr-card__remove"
                  aria-label={`حذف ${address.title}`}
                  onClick={() => setRemoving(address)}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </article>
          ))}

          <button type="button" className="addr-add" onClick={() => setEditor({ mode: 'new' })}>
            <span>
              <Icon name="plus" size={22} />
            </span>
            <b>افزودن آدرس جدید</b>
            <small>خانه، محل کار یا هر جای دیگری</small>
          </button>
        </div>
      ) : (
        <EmptyState
          icon="pin"
          title="هنوز آدرسی ثبت نکرده‌اید."
          text="برای ثبت سفارش، یک آدرس تحویل اضافه کنید."
          actionLabel="افزودن آدرس"
          onAction={() => setEditor({ mode: 'new' })}
        />
      )}

      <AddressForm
        open={Boolean(editor)}
        address={editor?.mode === 'new' ? null : editor}
        onClose={() => setEditor(null)}
        onSave={(data) => {
          saveAddress(data);
          onToast(editor?.mode === 'new' ? 'آدرس جدید شما اضافه شد.' : 'تغییرات آدرس ذخیره شد.');
          setEditor(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          deleteAddress(removing.id);
          onToast('آدرس حذف شد.');
        }}
        title="آدرس حذف شود؟"
        text={removing ? `آدرس «${removing.title}» برای همیشه حذف می‌شود.` : ''}
        confirmLabel="حذف آدرس"
        cancelLabel="بازگشت"
        tone="danger"
      />
    </div>
  );
}
