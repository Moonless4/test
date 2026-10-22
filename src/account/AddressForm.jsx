import { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import Icon from '../components/Icons.jsx';
import { Field } from './ui.jsx';

const EMPTY = {
  title: '',
  recipient: '',
  phone: '',
  full: '',
  notes: '',
  isDefault: false,
};

const toLatinDigits = (value) =>
  String(value || '')
    .replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit));

export default function AddressForm({ open, address, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setForm(address ? { ...EMPTY, ...address } : EMPTY);
    setErrors({});
  }, [open, address]);

  const update = (key) => (event) => {
    const value = key === 'isDefault' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'عنوان آدرس را وارد کنید.';
    if (!form.recipient.trim()) next.recipient = 'نام تحویل‌گیرنده را وارد کنید.';
    const phone = toLatinDigits(form.phone).trim();
    if (!/^09\d{9}$/.test(phone)) next.phone = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
    if (form.full.trim().length < 15) next.full = 'آدرس کامل را با جزئیات (خیابان، پلاک، واحد) بنویسید.';

    setErrors(next);
    if (Object.keys(next).length) return;

    onSave({ ...form, phone });
  };

  return (
    <Modal open={open} onClose={onClose} className="modal--account" label="فرم آدرس">
      <div className="acct-modal">
        <header className="acct-modal__head">
          <span className="acct-modal__icon">
            <Icon name="pin" size={20} />
          </span>
          <div>
            <h2>{address ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}</h2>
            <p>آدرس دقیق باعث می‌شود سفارش سریع‌تر به دست شما برسد.</p>
          </div>
        </header>

        <form className="acct-form" onSubmit={submit} noValidate>
          <div className="acct-form__grid">
            <Field label="عنوان آدرس" error={errors.title}>
              <input value={form.title} onChange={update('title')} placeholder="خانه، محل کار، ..." />
            </Field>
            <Field label="نام تحویل‌گیرنده" error={errors.recipient}>
              <input value={form.recipient} onChange={update('recipient')} placeholder="نام و نام خانوادگی" />
            </Field>
          </div>

          <Field label="شماره تماس" error={errors.phone} hint="برای هماهنگی پیک استفاده می‌شود.">
            <input
              value={form.phone}
              onChange={update('phone')}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              inputMode="tel"
              dir="ltr"
            />
          </Field>

          <Field label="آدرس کامل" error={errors.full}>
            <textarea
              value={form.full}
              onChange={update('full')}
              placeholder="تهران، خیابان، کوچه، پلاک و واحد"
              rows={3}
            />
          </Field>

          <Field label="یادداشت برای پیک" hint="اختیاری — مثلاً زنگ واحد یا تحویل به نگهبان.">
            <input value={form.notes} onChange={update('notes')} placeholder="یادداشت تحویل" />
          </Field>

          <label className="checkline checkline--account">
            <input type="checkbox" checked={form.isDefault} onChange={update('isDefault')} />
            این آدرس پیش‌فرض من باشد
          </label>

          <div className="acct-form__actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              انصراف
            </button>
            <button type="submit" className="btn btn--primary">
              {address ? 'ذخیره تغییرات' : 'افزودن آدرس'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
