import { useRef, useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, TextInput } from '../ui.jsx';
import { getSecurityState, updateCredentials } from '../auth.js';

export default function SettingsPanel() {
  const { content, update, reset } = useSite();
  const fileRef = useRef(null);
  const [security, setSecurity] = useState(getSecurityState);
  const [creds, setCreds] = useState({ currentPassword: '', username: '', password: '', confirm: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const setCred = (key) => (value) => setCreds((prev) => ({ ...prev, [key]: value }));

  const saveCredentials = async () => {
    const result = await updateCredentials(creds);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    setStatus('نام کاربری و رمز عبور به‌روزرسانی شد.');
    setCreds({ currentPassword: '', username: '', password: '', confirm: '' });
    setSecurity(getSecurityState());
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atrin-site-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('فایل پشتیبان دانلود شد.');
  };

  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid');
      update((prev) => ({ ...prev, ...parsed }));
      setStatus('پشتیبان با موفقیت بازیابی شد.');
      setError('');
    } catch {
      setError('فایل انتخاب‌شده یک پشتیبان معتبر نیست.');
    }
  };

  const resetAll = () => {
    if (!window.confirm('همه ویرایش‌ها پاک و سایت به حالت اولیه برگردد؟')) return;
    reset();
    setStatus('سایت به حالت اولیه بازگردانده شد.');
  };

  return (
    <AdminPanel title="تنظیمات" description="امنیت ورود مدیر، پشتیبان‌گیری و بازنشانی محتوا.">
      <h3 className="adm-subtitle">امنیت حساب مدیر</h3>
      <div className="adm-inline">
        <span className="adm-pill adm-pill--green">ورود دو مرحله‌ای: فعال (اجباری)</span>
        {security.username ? (
          <span className="adm-pill" dir="ltr">
            {security.username}
          </span>
        ) : null}
      </div>
      <p className="adm-text">
        رمز عبور فقط به‌صورت هش ذخیره می‌شود و نه رمز عبور و نه هش آن هیچ‌جا در پنل یا فایل پشتیبان
        نمایش داده نمی‌شود. برای تغییر دسترسی، رمز فعلی را وارد کنید.
      </p>

      <div className="adm-grid">
        <TextInput
          label="رمز عبور فعلی"
          value={creds.currentPassword}
          onChange={setCred('currentPassword')}
          type="password"
          dir="ltr"
        />
        <TextInput
          label="نام کاربری جدید"
          value={creds.username}
          onChange={setCred('username')}
          dir="ltr"
        />
        <TextInput
          label="رمز عبور جدید (حداقل ۸ کاراکتر)"
          value={creds.password}
          onChange={setCred('password')}
          type="password"
          dir="ltr"
        />
        <TextInput
          label="تکرار رمز عبور جدید"
          value={creds.confirm}
          onChange={setCred('confirm')}
          type="password"
          dir="ltr"
        />
      </div>
      <div>
        <button type="button" className="adm-btn adm-btn--gold" onClick={saveCredentials}>
          <Icon name="check" size={16} />
          ذخیره دسترسی جدید
        </button>
      </div>

      <h3 className="adm-subtitle">ورود دو مرحله‌ای گوگل</h3>
      <p className="adm-text">
        برای حفظ امنیت پنل، ورود دو مرحله‌ای همیشه فعال است و امکان غیرفعال‌کردن آن وجود ندارد.
        کدهای پشتیبان فقط یک بار هنگام فعال‌سازی نمایش داده می‌شوند و پس از کپی‌شدن دیگر در پنل
        دیده نمی‌شوند.
      </p>

      <h3 className="adm-subtitle">پشتیبان‌گیری</h3>
      <p className="adm-text">
        تمام محتوای سایت در همین مرورگر ذخیره می‌شود. برای انتقال به مرورگر یا دستگاه دیگر، فایل
        پشتیبان بگیرید.
      </p>
      <div className="adm-inline">
        <button type="button" className="adm-btn adm-btn--ghost" onClick={exportBackup}>
          <Icon name="box" size={16} />
          دانلود پشتیبان
        </button>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={() => fileRef.current?.click()}>
          <Icon name="repeat" size={16} />
          بازیابی پشتیبان
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={importBackup} />
      </div>

      <h3 className="adm-subtitle">بازنشانی</h3>
      <button type="button" className="adm-btn adm-btn--danger" onClick={resetAll}>
        <Icon name="trash" size={16} />
        بازگرداندن سایت به حالت اولیه
      </button>

      {status ? <p className="adm-hint adm-hint--success">{status}</p> : null}
      {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}
    </AdminPanel>
  );
}
