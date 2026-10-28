import { useRef, useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, TextInput } from '../ui.jsx';

export default function SettingsPanel() {
  const { content, update, reset } = useSite();
  const fileRef = useRef(null);
  const [username, setUsername] = useState(content.settings.adminUsername);
  const [password, setPassword] = useState(content.settings.adminPassword);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const saveCredentials = () => {
    if (!username.trim() || password.length < 4) {
      setError('نام کاربری را وارد کنید و رمز عبور حداقل ۴ کاراکتر باشد.');
      return;
    }
    setError('');
    update((prev) => ({
      ...prev,
      settings: { ...prev.settings, adminUsername: username.trim(), adminPassword: password },
    }));
    setStatus('نام کاربری و رمز عبور ذخیره شد.');
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
    setUsername('admin');
    setPassword('1234');
    setStatus('سایت به حالت اولیه بازگردانده شد.');
  };

  return (
    <AdminPanel title="تنظیمات" description="دسترسی مدیر، پشتیبان‌گیری و بازنشانی محتوا.">
      <h3 className="adm-subtitle">نام کاربری و رمز ورود</h3>
      <div className="adm-grid">
        <TextInput label="نام کاربری" value={username} onChange={setUsername} dir="ltr" />
        <TextInput label="رمز عبور" value={password} onChange={setPassword} dir="ltr" />
      </div>
      <button type="button" className="adm-btn adm-btn--gold" onClick={saveCredentials}>
        <Icon name="check" size={16} />
        ذخیره دسترسی
      </button>

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
