import { useRef, useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, TextInput } from '../ui.jsx';
import { formatSecret } from '../totp.js';
import {
  confirmTwoFactorSetup,
  disableTwoFactor,
  getSecurityState,
  startTwoFactorSetup,
  updateCredentials,
} from '../auth.js';

export default function SettingsPanel() {
  const { content, update, reset } = useSite();
  const fileRef = useRef(null);
  const [security, setSecurity] = useState(getSecurityState);
  const [creds, setCreds] = useState({ currentPassword: '', username: '', password: '', confirm: '' });
  const [twoFactor, setTwoFactor] = useState(null);
  const [code, setCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
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

  const beginTwoFactor = () => {
    const started = startTwoFactorSetup();
    if (!started.ok) {
      setError(started.error);
      return;
    }
    setError('');
    setTwoFactor({ secret: started.secret, url: started.url });
  };

  const enableTwoFactor = async () => {
    const result = await confirmTwoFactorSetup({ secret: twoFactor.secret, code });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    setStatus('ورود دو مرحله‌ای فعال شد.');
    setTwoFactor(null);
    setCode('');
    setSecurity(getSecurityState());
  };

  const stopTwoFactor = async () => {
    const result = await disableTwoFactor(disablePassword);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    setStatus('ورود دو مرحله‌ای غیرفعال شد.');
    setDisablePassword('');
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
        <span className={`adm-pill adm-pill--${security.twoFactorEnabled ? 'green' : 'gold'}`}>
          ورود دو مرحله‌ای: {security.twoFactorEnabled ? 'فعال' : 'غیرفعال'}
        </span>
        <span className="adm-pill">رمز عبور هش‌شده (PBKDF2)</span>
        {security.username ? (
          <span className="adm-pill" dir="ltr">
            {security.username}
          </span>
        ) : null}
      </div>
      <p className="adm-text">
        نام کاربری و رمز عبور فقط به‌صورت هش ذخیره می‌شوند و در محتوای سایت یا فایل پشتیبان قرار
        نمی‌گیرند. برای تغییر، رمز فعلی را وارد کنید.
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
      {security.twoFactorEnabled ? (
        <div className="adm-grid">
          <TextInput
            label="برای غیرفعال کردن، رمز عبور را وارد کنید"
            value={disablePassword}
            onChange={setDisablePassword}
            type="password"
            dir="ltr"
          />
          <div className="adm-field">
            <span className="adm-field__label">وضعیت</span>
            <button type="button" className="adm-btn adm-btn--danger" onClick={stopTwoFactor}>
              <Icon name="shield" size={16} />
              غیرفعال کردن ورود دو مرحله‌ای
            </button>
          </div>
        </div>
      ) : twoFactor ? (
        <div className="adm-editor">
          <p className="adm-text">
            در Google Authenticator گزینه «وارد کردن کلید راه‌اندازی» را انتخاب کنید و این کلید را
            وارد کنید:
          </p>
          <code className="admin-login__secret-code" dir="ltr">
            {formatSecret(twoFactor.secret)}
          </code>
          <TextInput label="کد ۶ رقمی برنامه" value={code} onChange={setCode} dir="ltr" inputMode="numeric" />
          <div className="adm-inline">
            <button type="button" className="adm-btn adm-btn--gold" onClick={enableTwoFactor}>
              <Icon name="check" size={16} />
              تأیید و فعال‌سازی
            </button>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setTwoFactor(null)}>
              انصراف
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={beginTwoFactor}>
            <Icon name="shield" size={16} />
            فعال‌سازی با Google Authenticator
          </button>
        </div>
      )}

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
