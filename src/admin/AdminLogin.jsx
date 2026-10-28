import { useState } from 'react';
import Icon from '../components/Icons.jsx';
import { formatSecret } from './totp.js';
import {
  confirmTwoFactorSetup,
  createAdminAccount,
  hasAdminAccount,
  isCryptoAvailable,
  startTwoFactorSetup,
  verifyBackupCode,
  verifyPassword,
  verifyTwoFactor,
} from './auth.js';

const emptyForm = { username: '', password: '', confirm: '' };

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '0';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.focus();
      area.select();
      area.setSelectionRange(0, text.length);
      const done = document.execCommand('copy');
      document.body.removeChild(area);
      return done;
    } catch {
      return false;
    }
  }
};

export default function AdminLogin({ siteName, onSuccess }) {
  const [step, setStep] = useState(() => (hasAdminAccount() ? 'login' : 'setup'));
  const [form, setForm] = useState(emptyForm);
  const [code, setCode] = useState('');
  const [bait, setBait] = useState('');
  const [enrollment, setEnrollment] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [codesCopied, setCodesCopied] = useState(false);
  const [backupMode, setBackupMode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const field = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const run = async (action) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch {
      setError('خطایی رخ داد؛ دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  };

  const createAccount = (event) => {
    event.preventDefault();
    run(async () => {
      const created = await createAdminAccount({
        username: form.username,
        password: form.password,
        confirm: form.confirm,
      });
      if (!created.ok) {
        setError(created.error);
        return;
      }
      const started = startTwoFactorSetup();
      if (!started.ok) {
        setError(started.error);
        return;
      }
      setEnrollment({ secret: started.secret, url: started.url });
      setStep('enroll');
    });
  };

  const completeEnrollment = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await confirmTwoFactorSetup({ secret: enrollment.secret, code });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRecoveryCodes(result.backupCodes);
      setStep('recovery');
    });
  };

  const signIn = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await verifyPassword({
        username: form.username,
        password: form.password,
        honeypot: bait,
      });
      if (!result.ok) {
        setForm((prev) => ({ ...prev, password: '' }));
        setError(result.error);
        return;
      }
      if (!result.twoFactorEnabled) {
        // Two-factor cannot be turned off, so an account without it must enroll now.
        const started = startTwoFactorSetup();
        if (!started.ok) {
          setError(started.error);
          return;
        }
        setEnrollment({ secret: started.secret, url: started.url });
        setStep('enroll');
        return;
      }
      setStep('code');
    });
  };

  const confirmCode = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await verifyTwoFactor(code);
      if (!result.ok) {
        setCode('');
        setError(result.error);
        return;
      }
      if (result.backupCodes?.length) {
        setRecoveryCodes(result.backupCodes);
        setStep('recovery');
        return;
      }
      onSuccess();
    });
  };

  const confirmBackup = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await verifyBackupCode(backupCode);
      if (!result.ok) {
        setBackupCode('');
        setError(result.error);
        return;
      }
      onSuccess();
    });
  };

  const copyRecoveryCodes = async () => {
    const copiedOk = await copyText(recoveryCodes.join('\n'));
    if (!copiedOk) {
      setError('کپی نشد؛ کدها را دستی یادداشت کنید.');
      return;
    }
    setError('');
    setCodesCopied(true);
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(enrollment.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('کپی نشد؛ کلید را دستی وارد کنید.');
    }
  };

  const baitField = (
    <div className="admin-login__bait" aria-hidden="true">
      <label>
        وب‌سایت شرکت
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={bait}
          onChange={(event) => setBait(event.target.value)}
        />
      </label>
    </div>
  );

  return (
    <div className="admin-login" dir="rtl">
      <div className="admin-login__card">
        <span className="admin-login__badge">
          <Icon name="shield" size={26} />
        </span>

        {step === 'setup' ? (
          <form onSubmit={createAccount}>
            <h1>راه‌اندازی مدیر</h1>
            <p>
              اولین ورود است؛ برای {siteName} یک نام کاربری و رمز عبور قوی بسازید. این اطلاعات فقط
              به‌صورت هش‌شده در همین مرورگر ذخیره می‌شود.
            </p>

            <label className="adm-field">
              <span className="adm-field__label">نام کاربری</span>
              <input
                className="adm-input adm-input--ltr"
                value={form.username}
                onChange={field('username')}
                autoComplete="username"
                dir="ltr"
              />
            </label>

            <label className="adm-field">
              <span className="adm-field__label">رمز عبور (حداقل ۸ کاراکتر)</span>
              <input
                className="adm-input adm-input--ltr"
                type="password"
                value={form.password}
                onChange={field('password')}
                autoComplete="new-password"
                dir="ltr"
              />
            </label>

            <label className="adm-field">
              <span className="adm-field__label">تکرار رمز عبور</span>
              <input
                className="adm-input adm-input--ltr"
                type="password"
                value={form.confirm}
                onChange={field('confirm')}
                autoComplete="new-password"
                dir="ltr"
              />
            </label>

            {baitField}
            {!isCryptoAvailable() ? (
              <p className="adm-hint adm-hint--error">
                این مرورگر از رمزنگاری امن پشتیبانی نمی‌کند؛ از مرورگر به‌روز استفاده کنید.
              </p>
            ) : null}
            {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}

            <button type="submit" className="adm-btn adm-btn--gold adm-btn--block" disabled={busy}>
              {busy ? 'در حال ساخت…' : 'ساخت حساب و ادامه'}
              <Icon name="chevronLeft" size={17} />
            </button>
          </form>
        ) : null}

        {step === 'enroll' && enrollment ? (
          <form onSubmit={completeEnrollment}>
            <h1>ورود دو مرحله‌ای گوگل</h1>
            <p>
              اپلیکیشن Google Authenticator را باز کنید، «افزودن حساب» و سپس «وارد کردن کلید
              راه‌اندازی» را بزنید و این کلید را وارد کنید:
            </p>

            <div className="admin-login__secret">
              <code dir="ltr">{formatSecret(enrollment.secret)}</code>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={copySecret}>
                <Icon name={copied ? 'check' : 'box'} size={15} />
                {copied ? 'کپی شد' : 'کپی کلید'}
              </button>
            </div>
            <p className="admin-login__hint" dir="ltr">
              {enrollment.url}
            </p>

            <label className="adm-field">
              <span className="adm-field__label">کد ۶ رقمی برنامه</span>
              <input
                className="adm-input adm-input--ltr admin-login__code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={7}
                dir="ltr"
                placeholder="123456"
              />
            </label>

            {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}

            <button type="submit" className="adm-btn adm-btn--gold adm-btn--block" disabled={busy}>
              {busy ? 'در حال بررسی…' : 'فعال‌سازی و ورود'}
              <Icon name="check" size={17} />
            </button>
          </form>
        ) : null}

        {step === 'recovery' && recoveryCodes ? (
          codesCopied ? (
            <div className="admin-login__step">
              <h1>کدهای پشتیبان ذخیره شد</h1>
              <p>
                کدهای پشتیبان کپی شدند و دیگر در هیچ صفحه‌ای نمایش داده نمی‌شوند. در صورت از دست
                دادن دسترسی برنامه، هر کد یک بار برای ورود قابل استفاده است.
              </p>
              <button type="button" className="adm-btn adm-btn--gold adm-btn--block" onClick={onSuccess}>
                ورود به پنل
                <Icon name="chevronLeft" size={17} />
              </button>
            </div>
          ) : (
            <div className="admin-login__step">
              <h1>کدهای پشتیبان ورود</h1>
              <p>
                این کدها فقط همین یک بار نمایش داده می‌شوند. هر کد یک بار برای ورود کار می‌کند؛
                آن‌ها را در جای امن نگه دارید.
              </p>

              <div className="admin-login__codes">
                {recoveryCodes.map((item) => (
                  <code key={item} dir="ltr">
                    {item}
                  </code>
                ))}
              </div>

              {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}

              <button
                type="button"
                className="adm-btn adm-btn--ghost adm-btn--block"
                onClick={copyRecoveryCodes}
              >
                <Icon name="box" size={16} />
                کپی همه کدها
              </button>
              <button type="button" className="adm-btn adm-btn--gold adm-btn--block" onClick={onSuccess}>
                ذخیره کردم، ورود به پنل
                <Icon name="chevronLeft" size={17} />
              </button>
            </div>
          )
        ) : null}

        {step === 'login' ? (
          <form onSubmit={signIn}>
            <h1>ورود به پنل مدیریت</h1>
            <p>مدیریت محتوای {siteName}</p>

            <label className="adm-field">
              <span className="adm-field__label">نام کاربری</span>
              <input
                className="adm-input adm-input--ltr"
                value={form.username}
                onChange={field('username')}
                autoComplete="username"
                dir="ltr"
              />
            </label>

            <label className="adm-field">
              <span className="adm-field__label">رمز عبور</span>
              <input
                className="adm-input adm-input--ltr"
                type="password"
                value={form.password}
                onChange={field('password')}
                autoComplete="current-password"
                dir="ltr"
              />
            </label>

            {baitField}
            {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}

            <button type="submit" className="adm-btn adm-btn--gold adm-btn--block" disabled={busy}>
              {busy ? 'در حال بررسی…' : 'ورود به پنل'}
              <Icon name="chevronLeft" size={17} />
            </button>
          </form>
        ) : null}

        {step === 'code' ? (
          <form onSubmit={backupMode ? confirmBackup : confirmCode}>
            <h1>{backupMode ? 'کد پشتیبان' : 'کد دو مرحله‌ای'}</h1>
            <p>
              {backupMode
                ? 'یکی از کدهای پشتیبان ذخیره‌شده را وارد کنید؛ هر کد فقط یک بار کار می‌کند.'
                : 'کد ۶ رقمی Google Authenticator را وارد کنید. اعتبار کد تا ۳۰ ثانیه است.'}
            </p>

            <label className="adm-field">
              <span className="adm-field__label">{backupMode ? 'کد پشتیبان' : 'کد تأیید'}</span>
              <input
                className="adm-input adm-input--ltr admin-login__code"
                value={backupMode ? backupCode : code}
                onChange={(event) =>
                  backupMode ? setBackupCode(event.target.value) : setCode(event.target.value)
                }
                inputMode={backupMode ? 'text' : 'numeric'}
                autoComplete="one-time-code"
                maxLength={backupMode ? 9 : 7}
                dir="ltr"
                placeholder={backupMode ? 'ABCD-EFGH' : '123456'}
              />
            </label>

            {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}

            <button type="submit" className="adm-btn adm-btn--gold adm-btn--block" disabled={busy}>
              {busy ? 'در حال بررسی…' : 'تأیید و ورود'}
              <Icon name="check" size={17} />
            </button>
            <button
              type="button"
              className="admin-login__back admin-login__back--button"
              onClick={() => {
                setBackupMode((prev) => !prev);
                setCode('');
                setBackupCode('');
                setError('');
              }}
            >
              {backupMode ? 'استفاده از کد برنامه' : 'استفاده از کد پشتیبان'}
            </button>
            <button
              type="button"
              className="admin-login__back admin-login__back--button"
              onClick={() => {
                setStep('login');
                setBackupMode(false);
                setCode('');
                setBackupCode('');
                setError('');
              }}
            >
              بازگشت
            </button>
          </form>
        ) : null}

        <a className="admin-login__back" href="/">
          بازگشت به سایت
        </a>
      </div>
    </div>
  );
}
