import { useEffect, useRef, useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, TextInput } from '../ui.jsx';
import ReauthForm from '../ReauthForm.jsx';
import {
  changeCredentials,
  fetchSession,
  regenerateBackupCodes,
} from '../api.js';

const emptyCreds = { username: '', password: '', confirm: '' };

export default function SettingsPanel() {
  const { content, update, reset } = useSite();
  const fileRef = useRef(null);
  const [security, setSecurity] = useState(null);
  const [reauthToken, setReauthToken] = useState('');
  const [creds, setCreds] = useState(emptyCreds);
  const [freshCodes, setFreshCodes] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    fetchSession().then((result) => {
      if (alive && result.authenticated) setSecurity(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setCred = (key) => (value) => setCreds((prev) => ({ ...prev, [key]: value }));

  const useToken = (token) => {
    setReauthToken(token);
    setError('');
    setStatus('احراز هویت مجدد انجام شد؛ اکنون عملیات را تکمیل کنید.');
  };

  const saveCredentials = async () => {
    setError('');
    setStatus('');
    const result = await changeCredentials({ ...creds, reauthToken });
    if (!result.ok) {
      setError(result.error);
      if (result.reauthRequired) setReauthToken('');
      return;
    }
    setCreds(emptyCreds);
    setReauthToken('');
    setStatus('اطلاعات ورود تغییر کرد؛ برای ادامه دوباره وارد شوید…');
    // Every session was invalidated on the server.
    window.location.assign('/admin');
  };

  const regenerateCodes = async () => {
    setError('');
    setStatus('');
    const result = await regenerateBackupCodes({ reauthToken });
    if (!result.ok) {
      setError(result.error);
      if (result.reauthRequired) setReauthToken('');
      return;
    }
    setReauthToken('');
    setFreshCodes(result.backupCodes);
    setSecurity((prev) => (prev ? { ...prev, backupCodesRemaining: result.backupCodes.length } : prev));
    setStatus('کدهای پشتیبان جدید ساخته شد؛ کدهای قبلی دیگر کار نمی‌کنند.');
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
      <h3 className="adm-subtitle">وضعیت امنیت حساب مدیر</h3>
      <div className="adm-inline">
        <span className="adm-pill adm-pill--green">Google Authenticator + کد پشتیبان</span>
        {security?.username ? (
          <span className="adm-pill" dir="ltr">
            {security.username}
          </span>
        ) : null}
        {security ? (
          <span className="adm-pill">کد پشتیبان باقی‌مانده: {security.backupCodesRemaining}</span>
        ) : null}
      </div>
      <p className="adm-text">
        رمز عبور فقط به‌صورت هش در سرور ذخیره می‌شود و هیچ‌جا در پنل نمایش داده نمی‌شود. برای هر
        تغییر حساس باید نام کاربری، رمز عبور، کد Google Authenticator و یک کد پشتیبان را دوباره
        وارد کنید.
      </p>

      <h3 className="adm-subtitle">تغییر نام کاربری و رمز عبور</h3>
      {reauthToken ? (
        <>
          <div className="adm-grid">
            <TextInput
              label="نام کاربری جدید"
              value={creds.username}
              onChange={setCred('username')}
              dir="ltr"
            />
            <TextInput
              label="رمز عبور جدید"
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
              ذخیره و خروج از همه نشست‌ها
            </button>
          </div>
        </>
      ) : (
        <ReauthForm actionLabel="تأیید هویت برای تغییر اطلاعات ورود" onToken={useToken} />
      )}

      <h3 className="adm-subtitle">کدهای پشتیبان</h3>
      {freshCodes ? (
        <div className="admin-login__codes">
          {freshCodes.map((item) => (
            <code key={item} dir="ltr">
              {item}
            </code>
          ))}
        </div>
      ) : null}
      {freshCodes ? (
        <p className="adm-hint">این کدها فقط همین یک بار نمایش داده شدند؛ همین حالا ذخیره کنید.</p>
      ) : null}
      {reauthToken ? (
        <div>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={regenerateCodes}>
            <Icon name="repeat" size={16} />
            ساخت کدهای پشتیبان جدید
          </button>
        </div>
      ) : (
        <ReauthForm
          actionLabel="تأیید هویت برای ساخت کدهای پشتیبان"
          onToken={useToken}
        />
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
