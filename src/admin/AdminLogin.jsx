import { useState } from 'react';
import Icon from '../components/Icons.jsx';
import {
  confirmTwoFactorSetup,
  signIn,
  startTwoFactorSetup,
  verifyBackupCode,
  verifyTotp,
} from './api.js';

const emptyCredentials = { username: '', password: '' };

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
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const done = document.execCommand('copy');
      document.body.removeChild(area);
      return done;
    } catch {
      return false;
    }
  }
};

export default function AdminLogin({ siteName, onSuccess }) {
  const [step, setStep] = useState('login');
  const [credentials, setCredentials] = useState(emptyCredentials);
  const [code, setCode] = useState('');
  const [bait, setBait] = useState('');
  const [enrollment, setEnrollment] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState('');
  const [busy, setBusy] = useState(false);

  const field = (key) => (event) =>
    setCredentials((prev) => ({ ...prev, [key]: event.target.value }));

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

  const handleFailure = (result, fallback) => {
    if (result.locked) {
      setLocked(result.error || 'تلاش‌های ناموفق زیاد بود؛ بعداً دوباره تلاش کنید.');
      return;
    }
    setError(result.error || fallback);
  };

  const submitCredentials = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await signIn({ ...credentials, honeypot: bait });
      if (!result.ok) {
        setCredentials((prev) => ({ ...prev, password: '' }));
        handleFailure(result, 'نام کاربری یا رمز عبور درست نیست.');
        return;
      }
      if (result.next === 'enroll') {
        const started = await startTwoFactorSetup();
        if (!started.ok) {
          handleFailure(started, 'راه‌اندازی ورود دو مرحله‌ای ممکن نشد.');
          return;
        }
        setEnrollment(started);
        setStep('enroll');
        return;
      }
      setStep('totp');
    });
  };

  const completeEnrollment = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await confirmTwoFactorSetup({ code });
      if (!result.ok) {
        setCode('');
        handleFailure(result, 'کد تأیید درست نیست.');
        return;
      }
      setRecoveryCodes(result.backupCodes);
      setCode('');
      setStep('recovery');
    });
  };

  const submitTotp = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await verifyTotp({ code });
      if (!result.ok) {
        setCode('');
        handleFailure(result, 'کد دو مرحله‌ای درست نیست.');
        return;
      }
      setStep('backup');
    });
  };

  const submitBackup = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await verifyBackupCode({ code });
      if (!result.ok) {
        setCode('');
        handleFailure(result, 'کد پشتیبان درست نیست.');
        return;
      }
      onSuccess();
    });
  };

  const copyCodes = async () => {
    const done = await copyText(recoveryCodes.join('\n'));
    if (!done) {
      setError('کپی نشد؛ کدها را دستی یادداشت کنید.');
      return;
    }
    setError('');
    setCopiedCodes(true);
  };

  const restart = () => {
    setStep('login');
    setCredentials(emptyCredentials);
    setCode('');
    setError('');
    setEnrollment(null);
    setRecoveryCodes(null);
    setCopiedCodes(false);
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

  const codeField = (label, placeholder, maxLength) => (
    <label className="adm-field">
      <span className="adm-field__label">{label}</span>
      <input
        className="adm-input adm-input--ltr admin-login__code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        inputMode={maxLength === 7 ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        maxLength={maxLength}
        dir="ltr"
        placeholder={placeholder}
        autoFocus
      />
    </label>
  );

  const stepLabel = { login: '۱ از ۳', totp: '۲ از ۳', backup: '۳ از ۳' }[step];

  return (
    <div className="admin-login" dir="rtl">
      <div className="admin-login__card">
        <span className="admin-login__badge">
          <Icon name="shield" size={26} />
        </span>

        {stepLabel ? <span className="admin-login__progress">مرحله {stepLabel}</span> : null}

        {step === 'login' ? (
          <form onSubmit={submitCredentials}>
            <h1>ورود به پنل مدیریت</h1>
            <p>مدیریت محتوای {siteName} — نام کاربری و رمز عبور خود را وارد کنید.</p>

            <label className="adm-field">
              <span className="adm-field__label">نام کاربری</span>
              <input
                className="adm-input adm-input--ltr"
                value={credentials.username}
                onChange={field('username')}
                autoComplete="username"
                dir="ltr"
                required
              />
            </label>

            <label className="adm-field">
              <span className="adm-field__label">رمز عبور</span>
              <input
                className="adm-input adm-input--ltr"
                type="password"
                value={credentials.password}
                onChange={field('password')}
                autoComplete="current-password"
                dir="ltr"
                required
              />
            </label>

            {baitField}
            {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}
            {locked ? <p className="adm-hint adm-hint--error">{locked}</p> : null}

            <button type="submit" className="adm-btn adm-btn--gold adm-btn--block" disabled={busy || Boolean(locked)}>
              {busy ? 'در حال بررسی…' : 'ادامه'}
              <Icon name="chevronLeft" size={17} />
            </button>
          </form>
        ) : null}

        {step === 'enroll' && enrollment ? (
          <form onSubmit={completeEnrollment}>
            <h1>راه‌اندازی Google Authenticator</h1>
            <p>
              بارکد زیر را با اپلیکیشن Google Authenticator اسکن کنید، سپس کد ۶ رقمی ساخته‌شده را
              وارد کنید.
            </p>

            <img className="admin-login__qr" src={enrollment.qr} alt="بارکد ورود دو مرحله‌ای" width="200" height="200" />
            <p className="admin-login__hint">اگر اسکن نشد، این کلید را دستی وارد کنید:</p>
            <div className="admin-login__secret">
              <code dir="ltr">{enrollment.formatted}</code>
            </div>

            {codeField('کد ۶ رقمی برنامه', '123456', 7)}
            {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}
            {locked ? <p className="adm-hint adm-hint--error">{locked}</p> : null}

            <button type="submit" className="adm-btn adm-btn--gold adm-btn--block" disabled={busy}>
              {busy ? 'در حال بررسی…' : 'تأیید و ادامه'}
              <Icon name="check" size={17} />
            </button>
          </form>
        ) : null}

        {step === 'recovery' && recoveryCodes ? (
          <div className="admin-login__step">
            <h1>کدهای پشتیبان ورود</h1>
            <p>
              این کدها فقط همین یک بار نمایش داده می‌شوند و هر کد تنها یک بار قابل استفاده است.
              آن‌ها را در جای امن نگه دارید؛ برای ورود بعدی به یکی از آن‌ها نیاز دارید.
            </p>

            <div className="admin-login__codes">
              {recoveryCodes.map((item) => (
                <code key={item} dir="ltr">
                  {item}
                </code>
              ))}
            </div>

            {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}

            <button type="button" className="adm-btn adm-btn--ghost adm-btn--block" onClick={copyCodes}>
              <Icon name="box" size={16} />
              {copiedCodes ? 'کپی شد' : 'کپی همه کدها'}
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--gold adm-btn--block"
              onClick={() => {
                setCopiedCodes(false);
                setRecoveryCodes(null);
                setStep('backup');
              }}
            >
              ذخیره کردم، ادامه
              <Icon name="chevronLeft" size={17} />
            </button>
          </div>
        ) : null}

        {step === 'totp' ? (
          <form onSubmit={submitTotp}>
            <h1>کد دو مرحله‌ای</h1>
            <p>کد ۶ رقمی برنامه Google Authenticator را وارد کنید.</p>

            {codeField('کد تأیید', '123456', 7)}
            {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}
            {locked ? <p className="adm-hint adm-hint--error">{locked}</p> : null}

            <button type="submit" className="adm-btn adm-btn--gold adm-btn--block" disabled={busy}>
              {busy ? 'در حال بررسی…' : 'تأیید کد'}
              <Icon name="check" size={17} />
            </button>
            <button type="button" className="admin-login__back admin-login__back--button" onClick={restart}>
              بازگشت
            </button>
          </form>
        ) : null}

        {step === 'backup' ? (
          <form onSubmit={submitBackup}>
            <h1>کد پشتیبان</h1>
            <p>یکی از کدهای پشتیبان ذخیره‌شده را وارد کنید؛ هر کد فقط یک بار کار می‌کند.</p>

            {codeField('کد پشتیبان', 'ABCD-EFGH', 9)}
            {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}
            {locked ? <p className="adm-hint adm-hint--error">{locked}</p> : null}

            <button type="submit" className="adm-btn adm-btn--gold adm-btn--block" disabled={busy}>
              {busy ? 'در حال بررسی…' : 'ورود به پنل'}
              <Icon name="check" size={17} />
            </button>
            <button type="button" className="admin-login__back admin-login__back--button" onClick={restart}>
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
